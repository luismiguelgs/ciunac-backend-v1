import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { google } from 'googleapis'
import * as stream from 'stream'

@Injectable()
export class UploadService {
    private driveClient:any

    constructor() {
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
            default:
                throw new BadRequestException(`Carpeta no válida: ${folder}`)
        }
    }

    async uploadToDrive(file: Express.Multer.File, folder: string,nombre:string) {
        try{
            const folderId = this.getFolderId(folder)
            const bufferStream = new stream.PassThrough()
            bufferStream.end(file.buffer)

            // 🔠 Obtenemos la extensión original
            const extension = file.originalname.split('.').pop()

            // 📁 Definimos el nombre final del archivo
            const nombreFinal = nombre
                ? `${nombre}.${extension}`
                : file.originalname

            const { data } = await this.driveClient.files.create({
                requestBody: {
                    name: nombreFinal, // 👈 usamos el nuevo nombre aquí
                    parents: [folderId],
                },
                media: {
                    mimeType: file.mimetype,
                    body: bufferStream,
                },
                fields: 'id, name, webViewLink, webContentLink',
            })

            // 🔓 Hacer público el archivo
            await this.driveClient.permissions.create({
                fileId: data.id!,
                requestBody: { role: 'reader', type: 'anyone' },
            })

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
}
