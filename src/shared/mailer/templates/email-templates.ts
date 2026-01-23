import { SendMailDto } from '../dto/send-mail.dto';
import { FOOTER } from './footer';
import { HEAD } from './header';

export function getTemplate(body: SendMailDto) {
  const templates = {
    RANDOM: {
      subject: 'CIUNAC - COMPROBACIÓN DE CORREO',
      text: `Ingrese el siguiente número para verificar su correo: ${body.number}`,
      html: `
        <!DOCTYPE html><html>${HEAD}<body>
          <img src="https://ciunac.unac.edu.pe/wp-content/uploads/2024/04/cropped-WhatsApp-Image-2024-04-19-at-2.48.00-PM-2.jpeg" alt="logo" width="200px"/>
          <h1>COMPROBACIÓN DE CORREO</h1>
          <p>Ingrese el siguiente número para verificar su correo:</p>
          <h1 style="color:blue">${body.number}</h1>
          <p>Este código expirará en 5 minutos.</p>
          <hr>${FOOTER}
        </body></html>`,
    },
    REGISTER: {
      subject: 'CIUNAC - REGISTRO EXITOSO',
      text: `Registro exitoso. Usuario: ${body.user} Contraseña: ${body.user}`,
      html: `
        <!DOCTYPE html><html>${HEAD}<body>
          <h1>REGISTRO EXITOSO</h1>
          <p>Usted ha sido registrado exitosamente.</p>
          <h2>Datos de inicio de sesión 🔐</h2>
          <a href="https://ciunac.q10.com/">Acceso al sistema</a>
          <p><b>Usuario:</b> ${body.user}</p>
          <p><b>Contraseña:</b> ${body.user}</p>
          <hr>${FOOTER}
        </body></html>`,
    },
    BECA: {
      subject: 'CIUNAC - CONFIRMACIÓN DE REGISTRO PARA SOLICITUD DE BECA',
      text: `Este es el código de su transacción: ${body.user}`,
      html: `
        <!DOCTYPE html><html>${HEAD}<body>
          <img src="https://ciunac.unac.edu.pe/wp-content/uploads/2024/04/cropped-WhatsApp-Image-2024-04-19-at-2.48.00-PM-2.jpeg" alt="logo" width="200px"/>
          <h1>CONFIRMACIÓN DE REGISTRO PARA BECA CIUNAC</h1>
          <p>Hemos recibido correctamente su solicitud de beca.</p>
          <p>Su código es: <b>${body.user}</b></p>
          <hr>${FOOTER}
        </body></html>`,
    },
    CERTIFICADO: {
      subject: 'CIUNAC - CONFIRMACIÓN DE REGISTRO PARA SOLICITUD DE CERTIFICADO/CONSTANCIA',
      text: `Código de transacción: ${body.user}`,
      html: `
        <!DOCTYPE html><html>${HEAD}<body>
          <img src="https://ciunac.unac.edu.pe/wp-content/uploads/2024/04/cropped-WhatsApp-Image-2024-04-19-at-2.48.00-PM-2.jpeg" alt="logo" width="200px"/>
          <h1>CONFIRMACIÓN DE REGISTRO SOLICITUD DE CERTIFICADO/CONSTANCIA</h1>
          <p>Su código de transacción es: <b>${body.user}</b></p>
          <a href="https://ciunac.unac.edu.pe/reporte-certificado-virtual/">Consulta de Solicitud</a>
          <hr>${FOOTER}
        </body></html>`,
    },
    UBICACION: {
      subject: 'CIUNAC - CONFIRMACIÓN DE REGISTRO PARA EXAMEN DE UBICACIÓN',
      text: `Código de transacción: ${body.user}`,
      html: `
        <!DOCTYPE html><html>${HEAD}<body>
          <img src="https://ciunac.unac.edu.pe/wp-content/uploads/2024/04/cropped-WhatsApp-Image-2024-04-19-at-2.48.00-PM-2.jpeg" alt="logo" width="200px"/>
          <h1>CONFIRMACIÓN DE REGISTRO SOLICITUD DE EXAMEN DE UBICACIÓN</h1>
          <p>Su código de transacción es: <b>${body.user}</b></p>
          <a href="https://ciunac.unac.edu.pe/reporte-ubicacion-virtual/">Constancia y Resultados</a>
          <hr>${FOOTER}
        </body></html>`,
    },
  };

  return templates[body.type];
}
