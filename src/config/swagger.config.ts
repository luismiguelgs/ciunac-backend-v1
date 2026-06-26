import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { decorateOpenApiDocument } from './openapi-metadata';

export const SWAGGER_UI_PATH = 'api/docs';
export const SWAGGER_JSON_PATH = 'api/docs-json';

export const isSwaggerEnabled = (
	nodeEnv: string | undefined = process.env.NODE_ENV,
): boolean => nodeEnv !== 'production';

export const createSwaggerDocument = (
	app: INestApplication,
): OpenAPIObject => {
	const config = new DocumentBuilder()
		.setTitle('CIUNAC Backend API')
		.setDescription(
			'Contrato OpenAPI del backend CIUNAC. Incluye dominios academicos, administrativos, autenticacion, seguimiento docente, Q10, cargas y correo.',
		)
		.setVersion(process.env.npm_package_version ?? '1.2.4')
		.addApiKey(
			{
				type: 'apiKey',
				name: 'x-api-key',
				in: 'header',
				description: 'API key requerida por endpoints protegidos con ApiKeyGuard.',
			},
			'api-key',
		)
		.addBearerAuth(
			{
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				description: 'JWT emitido por el modulo de autenticacion.',
			},
			'jwt',
		)
		.build();

	const document = SwaggerModule.createDocument(app, config, {
		deepScanRoutes: true,
		operationIdFactory: (controllerKey: string, methodKey: string) =>
			`${controllerKey}_${methodKey}`,
	});

	return decorateOpenApiDocument(document);
};

export const setupSwagger = (app: INestApplication): void => {
	if (!isSwaggerEnabled()) {
		return;
	}

	const document = createSwaggerDocument(app);

	SwaggerModule.setup(SWAGGER_UI_PATH, app, document, {
		jsonDocumentUrl: `/${SWAGGER_JSON_PATH}`,
		customSiteTitle: 'CIUNAC API Docs',
		swaggerOptions: {
			displayRequestDuration: true,
			persistAuthorization: true,
			tagsSorter: 'alpha',
			operationsSorter: 'method',
		},
	});
};
