import { Injectable, BadRequestException, InternalServerErrorException, Inject, forwardRef } from '@nestjs/common'
import { google } from 'googleapis'
import { ConstanciasService } from 'src/modules/administrativas/constancias/constancias.service'
import * as stream from 'stream'

@Injectable()
export class UploadService {
    private driveClient: any

    constructor(
        @Inject(forwardRef(() => ConstanciasService))
        private readonly constanciasService: ConstanciasService,
    ) {
        // 1. Configuramos el cliente OAuth2
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            'https://developers.google.com/oauthplayground' // Esta URL debe coincidir con la que pusiste en la consola
        );

        // 2. Establecemos el Refresh Token para que se autentique automáticamente
        oauth2Client.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        });

        // 3. Creamos el cliente de Drive usando la autenticación OAuth2
        this.driveClient = google.drive({
            version: 'v3',
            auth: oauth2Client, // Usamos el cliente OAuth2 en lugar de 'GoogleAuth'
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
                throw new BadRequestException(`Carpeta no válida: ${folder}`)
        }
    }

    async uploadToDrive(file: Express.Multer.File, folder: string, nombre: string, fileId?: string) {
        try {
            const folderId = this.getFolderId(folder)
            const bufferStream = new stream.PassThrough()
            bufferStream.end(file.buffer)

            // 🔠 Obtenemos la extensión original
            const extension = file.originalname.split('.').pop()

            // 📁 Definimos el nombre final del archivo
            const nombreFinal = nombre
                ? `${nombre}.${extension}`
                : file.originalname

            let data;

            if (fileId) {
                // 🔄 Si existe fileId, actualizamos el archivo
                const response = await this.driveClient.files.update({
                    fileId,
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
                // 🆕 Si no existe fileId, creamos uno nuevo
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

            // 🔓 Hacer público el archivo (siempre por si acaso, o para nuevos)
            await this.driveClient.permissions.create({
                fileId: data.id!,
                requestBody: { role: 'reader', type: 'anyone' },
            })

            // 💾 Si es CONSTANCIAS, guardamos el driveId en la DB si es nuevo o cambió
            if (folder.toUpperCase() === 'CONSTANCIAS' && nombre && data.id) {
                await this.updateConstancia(nombre, data.id);
            }

            return {
                id: data.id,
                name: data.name,
                folder,
                viewLink: data.webViewLink,
                downloadLink: data.webContentLink,
            }
        } catch (error) {
            throw new InternalServerErrorException(`Error al subir el archivo a Google Drive: ${error.message}`)
        }
    }

    async updateConstancia(nombre: string, fileId?: string) {
        const id = nombre.split('-')[0];
        await this.constanciasService.update(id, { driveId: fileId });
    }

    async moveFileToRepository(fileId: string) {
        try {
            const repositoryFolderId = process.env.GOOGLE_DRIVE_FOLDER_CONSTANCIAS_REPOSITORIO;

            // 1. Obtener los padres actuales del archivo
            const file = await this.driveClient.files.get({
                fileId,
                fields: 'parents',
            });
            const previousParents = file.data.parents ? file.data.parents.join(',') : '';

            // 2. Mover el archivo: añadir el nuevo padre y quitar los antiguos
            const { data } = await this.driveClient.files.update({
                fileId,
                addParents: repositoryFolderId,
                removeParents: previousParents,
                fields: 'id, name, webViewLink, webContentLink',
            });

            return {
                id: data.id,
                name: data.name,
                viewLink: data.webViewLink,
                downloadLink: data.webContentLink,
            };
        } catch (error) {
            throw new InternalServerErrorException(`Error al mover el archivo en Google Drive: ${error.message}`);
        }
    }
}
