import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SendMailDto } from './dto/send-mail.dto';
import { getTemplate } from './templates/email-templates';

@Injectable()
export class MailerService {

    private transporters: Record<string, nodemailer.Transporter>;
    
    constructor() {
    // 🔹 Creamos varios transporters con distintas credenciales
    this.transporters = {
        alumnos: nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
            user: process.env.ALUMNOS_EMAIL_USER,
            pass: process.env.ALUMNOS_EMAIL_PASSWORD,
            },
        }),
        certificados: nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
            user: process.env.CERT_EMAIL_USER,
            pass: process.env.CERT_EMAIL_PASSWORD,
            },
        }),
        };
    }

    private getTransporterByType(type: string): nodemailer.Transporter {
        // 🔹 Según el tipo de correo, seleccionamos la cuenta
        const gruposAlumnos = ['RANDOM', 'BECA', 'REGISTER', 'UBICACION'];
        if (gruposAlumnos.includes(type)) return this.transporters.alumnos;
        if (type === 'CERTIFICADO') return this.transporters.certificados;

        throw new Error(`No hay configuración de remitente para el tipo: ${type}`);
    }

    async sendMail(data: SendMailDto) {
        const template = getTemplate(data);
        const transporter = this.getTransporterByType(data.type);

        const from = data.type === 'CERTIFICADO' ? process.env.CERT_EMAIL_USER : process.env.ALUMNOS_EMAIL_USER;

        const mailData = {
            from,
            to: data.email,
            subject: template.subject,
            text: template.text,
            html: template.html,
        };

        await transporter.sendMail(mailData);
    }
}
