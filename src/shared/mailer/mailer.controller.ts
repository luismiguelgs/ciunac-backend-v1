import { Body, Controller, InternalServerErrorException, Post, UseGuards } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { SendMailDto } from './dto/send-mail.dto';
import { ApiKeyGuard } from 'src/modules/usuarios/auth/guards/api-key.guard';

@UseGuards(ApiKeyGuard)
@Controller('mailer')
export class MailerController {
	constructor(private readonly mailerService: MailerService) { }

	@Post()
	async sendMail(@Body() mailDto: SendMailDto) {
		try {
			await this.mailerService.sendMail(mailDto);
			return { message: 'success' };
		}
		catch (error) {
			console.error(error);
			throw new InternalServerErrorException('Error al enviar el correo');
		}
	}
}
