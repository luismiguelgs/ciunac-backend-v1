import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.enableCors({
		origin: [
			'http://localhost:3000',      // Para cuando desarrollas en tu PC
        	'https://ciunac.site',        // Tu dominio principal (Frontend)
        	'https://api.ciunac.site',    // Tu subdominio (por si acaso)
			'https://ciunac-admin-1-3.vercel.app',
			'https://ciunac-sol-1-3.vercel.app'
		],
		credentials: true,
		methods: ['GET', 'POST', 'PATCH', 'DELETE'],
		allowedHeaders: ['Content-Type', 'Authorization','x-api-key'],
	});

	app.useGlobalPipes(new ValidationPipe({
		whitelist: true,
		forbidNonWhitelisted: true,
		transform: true,
		transformOptions: {
			enableImplicitConversion: true,
		},
	}));

	app.use(helmet());

	// 🔊 Escucha al final
	const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0'); 
        
    console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
