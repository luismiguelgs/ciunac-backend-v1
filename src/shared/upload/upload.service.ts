import { Injectable, BadRequestException, InternalServerErrorException, Inject, forwardRef, NotFoundException } from '@nestjs/common'
import { drive_v3, google } from 'googleapis'
import { ConstanciasService } from 'src/modules/administrativas/constancias/constancias.service'
import type {} from 'multer'
import * as stream from 'stream'

export interface DriveFileInfo {
    id: string;
    name: string;
    viewLink: string;
    downloadLink: string;
    modifiedTime?: string;
}

export interface SignedFileResolution {
    originalFile: DriveFileInfo;
    signedFile: DriveFileInfo;
}

@Injectable()
export class UploadService {
    private driveClient: drive_v3.Drive

    constructor(
        @Inject(forwardRef(() => ConstanciasService))
        private readonly constanciasService: ConstanciasService,
    ) {
        // 1. Configuramos el cliente OAuth2
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            'https://developers.google.com/oauthplayground'
        );

        // 2. Establecemos el Refresh Token para que se autentique automaticamente
        oauth2Client.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        });

        // 3. Creamos el cliente de Drive usando la autenticacion OAuth2
        this.driveClient = google.drive({
            version: 'v3',
            auth: oauth2Client,
        });
    }

    private getFolderId(folder: string): string {
        switch (folder.toUpperCase()) {
            case 'DNIS':
                return process.env.GOOGLE_DRIVE_FOLDER_DNIS ?? ''
            case 'VOUCHERS':
                return process.env.GOOGLE_DRIVE_FOLDER_VOUCHERS ?? ''
            case 'BECAS':
                return process.env.GOOGLE_DRIVE_FOLDER_BECAS ?? ''
            case 'CVS':
                return process.env.GOOGLE_DRIVE_FOLDER_CVS ?? ''
            case 'CONSTANCIAS':
                return process.env.GOOGLE_DRIVE_FOLDER_CONSTANCIAS ?? ''
            case 'REPO_CONSTANCIAS':
                return process.env.GOOGLE_DRIVE_FOLDER_CONSTANCIAS_REPOSITORIO ?? ''
            default:
                throw new BadRequestException(`Carpeta no valida: ${folder}`)
        }
    }

    async uploadToDrive(file: Express.Multer.File, folder: string, nombre: string, fileId?: string) {
        try {
            const folderId = this.getFolderId(folder)
            const bufferStream = new stream.PassThrough()
            bufferStream.end(file.buffer)

            const extension = file.originalname.split('.').pop()
            const nombreFinal = nombre
                ? `${nombre}.${extension}`
                : file.originalname

            let data: drive_v3.Schema$File;
            const sanitizedFileId = fileId && fileId !== 'null' && fileId !== 'undefined' && fileId.trim() !== ''
                ? fileId
                : undefined;

            if (sanitizedFileId) {
                const response = await this.driveClient.files.update({
                    fileId: sanitizedFileId,
                    requestBody: {
                        name: nombreFinal,
                    },
                    media: {
                        mimeType: file.mimetype,
                        body: bufferStream,
                    },
                    fields: 'id, name, webViewLink, webContentLink',
                })
                data = response.data
            } else {
                const response = await this.driveClient.files.create({
                    requestBody: {
                        name: nombreFinal,
                        parents: [folderId],
                    },
                    media: {
                        mimeType: file.mimetype,
                        body: bufferStream,
                    },
                    fields: 'id, name, webViewLink, webContentLink',
                })
                data = response.data
            }

            const uploadedFile = this.mapDriveFile(data)
            await this.driveClient.permissions.create({
                fileId: uploadedFile.id,
                requestBody: { role: 'reader', type: 'anyone' },
            })

            if (folder.toUpperCase() === 'CONSTANCIAS' && nombre) {
                await this.updateConstancia(nombre, uploadedFile.id);
            }

            return {
                id: uploadedFile.id,
                name: uploadedFile.name,
                folder,
                viewLink: uploadedFile.viewLink,
                downloadLink: uploadedFile.downloadLink,
            }
        } catch (error) {
            throw new InternalServerErrorException(`Error al subir el archivo a Google Drive: ${this.getErrorMessage(error)}`)
        }
    }

    async updateConstancia(nombre: string, fileId?: string): Promise<void> {
        const id = nombre.split('-')[0];
        await this.constanciasService.update(id, { driveId: fileId });
    }

    async findSignedVersion(originalFileId: string): Promise<SignedFileResolution> {
        let originalData: drive_v3.Schema$File;

        try {
            const response = await this.driveClient.files.get({
                fileId: originalFileId,
                fields: 'id, name, parents, modifiedTime, webViewLink, webContentLink, trashed',
            });
            originalData = response.data;
        } catch (error) {
            throw new InternalServerErrorException(
                `Error al consultar el archivo original en Google Drive: ${this.getErrorMessage(error)}`,
            );
        }

        const originalFile = this.mapDriveFile(originalData);
        if (this.isSignedFileName(originalFile.name)) {
            return { originalFile, signedFile: originalFile };
        }

        const repositoryFolderId = this.getRepositoryFolderId();
        const folderIds = new Set<string>(originalData.parents ?? []);
        folderIds.add(repositoryFolderId);

        let files: drive_v3.Schema$File[] = [];
        try {
            for (const folderId of folderIds) {
                files = files.concat(await this.listFilesInFolder(folderId));
            }
        } catch (error) {
            throw new InternalServerErrorException(
                `Error al buscar la constancia firmada en Google Drive: ${this.getErrorMessage(error)}`,
            );
        }

        const normalizedOriginalName = this.normalizeConstanciaFileName(originalFile.name);
        const candidatesById = new Map<string, drive_v3.Schema$File>();

        for (const file of files) {
            if (
                file.id &&
                file.id !== originalFile.id &&
                file.name &&
                this.isSignedFileName(file.name) &&
                this.normalizeConstanciaFileName(file.name) === normalizedOriginalName
            ) {
                candidatesById.set(file.id, file);
            }
        }

        const candidates = [...candidatesById.values()].sort((left, right) => {
            const rightTime = right.modifiedTime ? new Date(right.modifiedTime).getTime() : 0;
            const leftTime = left.modifiedTime ? new Date(left.modifiedTime).getTime() : 0;
            return rightTime - leftTime;
        });

        if (candidates.length === 0) {
            throw new NotFoundException(
                `No se encontro una version [FIRMADO] para el archivo ${originalFile.name}`,
            );
        }

        return {
            originalFile,
            signedFile: this.mapDriveFile(candidates[0]),
        };
    }

    async moveFileToRepository(fileId: string): Promise<DriveFileInfo> {
        try {
            const repositoryFolderId = this.getRepositoryFolderId();
            const file = await this.driveClient.files.get({
                fileId,
                fields: 'id, name, parents, modifiedTime, webViewLink, webContentLink',
            });
            const parents: string[] = file.data.parents ?? [];

            if (parents.includes(repositoryFolderId)) {
                return this.mapDriveFile(file.data);
            }

            const updateParams: drive_v3.Params$Resource$Files$Update = {
                fileId,
                addParents: repositoryFolderId,
                fields: 'id, name, modifiedTime, webViewLink, webContentLink',
            };
            if (parents.length > 0) {
                updateParams.removeParents = parents.join(',');
            }

            const { data } = await this.driveClient.files.update(updateParams);
            return this.mapDriveFile(data);
        } catch (error) {
            throw new InternalServerErrorException(`Error al mover el archivo en Google Drive: ${this.getErrorMessage(error)}`);
        }
    }

    async trashFile(fileId: string): Promise<void> {
        try {
            await this.driveClient.files.update({
                fileId,
                requestBody: { trashed: true },
                fields: 'id, trashed',
            });
        } catch (error) {
            throw new InternalServerErrorException(
                `Error al enviar el archivo original a la papelera: ${this.getErrorMessage(error)}`,
            );
        }
    }

    private async listFilesInFolder(folderId: string): Promise<drive_v3.Schema$File[]> {
        const files: drive_v3.Schema$File[] = [];
        let pageToken: string | undefined;

        do {
            const response = await this.driveClient.files.list({
                q: `'${folderId}' in parents and trashed = false`,
                fields: 'nextPageToken, files(id, name, parents, modifiedTime, webViewLink, webContentLink)',
                orderBy: 'modifiedTime desc',
                pageSize: 1000,
                pageToken,
            });

            files.push(...(response.data.files ?? []));
            pageToken = response.data.nextPageToken ?? undefined;
        } while (pageToken);

        return files;
    }

    private isSignedFileName(name: string): boolean {
        return /\[\s*FIRMADO\s*\]/i.test(name);
    }

    private normalizeConstanciaFileName(name: string): string {
        return name
            .normalize('NFKC')
            .replace(/(?:[\s_-]*)\[\s*FIRMADO\s*\](?:[\s_-]*)/gi, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLocaleLowerCase('es');
    }

    private mapDriveFile(file: drive_v3.Schema$File): DriveFileInfo {
        if (!file.id || !file.name) {
            throw new InternalServerErrorException('Google Drive devolvio un archivo sin id o nombre');
        }

        return {
            id: file.id,
            name: file.name,
            viewLink: file.webViewLink ?? '',
            downloadLink: file.webContentLink ?? '',
            modifiedTime: file.modifiedTime ?? undefined,
        };
    }

    private getRepositoryFolderId(): string {
        const folderId = this.getFolderId('REPO_CONSTANCIAS');
        if (!folderId) {
            throw new InternalServerErrorException(
                'No se ha configurado GOOGLE_DRIVE_FOLDER_CONSTANCIAS_REPOSITORIO',
            );
        }
        return folderId;
    }

    private getErrorMessage(error: unknown): string {
        return error instanceof Error ? error.message : String(error);
    }
}
