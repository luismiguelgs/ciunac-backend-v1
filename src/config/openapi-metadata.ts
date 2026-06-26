import { OpenAPIObject } from '@nestjs/swagger';

type SwaggerOperation = {
	tags?: string[];
	summary?: string;
	description?: string;
	deprecated?: boolean;
	security?: Record<string, string[]>[];
	responses?: Record<string, unknown>;
	requestBody?: unknown;
};

type SwaggerPathItem = Record<string, SwaggerOperation | unknown>;

const HTTP_METHODS = new Set([
	'get',
	'post',
	'put',
	'patch',
	'delete',
	'options',
	'head',
]);

const API_TAGS = [
	{
		name: 'Sistema',
		description: 'Endpoints raiz y utilitarios del backend.',
	},
	{
		name: 'Authentication',
		description: 'Registro, login, perfil, usuarios y permisos por rol.',
	},
	{
		name: 'Administrativas',
		description: 'Solicitudes, constancias, certificados, becas, pagos y tipos de solicitud.',
	},
	{
		name: 'Auxiliares',
		description: 'Catalogos de escuelas, facultades, estados y textos.',
	},
	{
		name: 'Calificaciones',
		description: 'Evaluaciones, notas, notas finales y actas.',
	},
	{
		name: 'Estructura',
		description: 'Idiomas, niveles, ciclos, modulos, grupos y aulas.',
	},
	{
		name: 'Examen de ubicacion',
		description: 'Examenes, detalles, calificaciones, cronograma y actas de ubicacion.',
	},
	{
		name: 'Principales',
		description: 'Estudiantes y docentes.',
	},
	{
		name: 'Seguimiento docente',
		description: 'Perfil docente, documentos, encuestas, metricas, resultados y dashboard.',
	},
	{
		name: 'Q10',
		description: 'Integracion con Q10 para estudiantes y horarios.',
	},
	{
		name: 'Servicios compartidos',
		description: 'Carga de archivos y envio de correos.',
	},
];

const PATH_TAGS: Record<string, string> = {
	auth: 'Authentication',
	usuarios: 'Authentication',
	'rol-permisos': 'Authentication',
	solicitudes: 'Administrativas',
	certificados: 'Administrativas',
	constancias: 'Administrativas',
	solicitudbecas: 'Administrativas',
	tipossolicitud: 'Administrativas',
	'pagos-banco': 'Administrativas',
	escuelas: 'Auxiliares',
	facultades: 'Auxiliares',
	estados: 'Auxiliares',
	textos: 'Auxiliares',
	evaluaciones: 'Calificaciones',
	notas: 'Calificaciones',
	notasfinal: 'Calificaciones',
	actanotas: 'Calificaciones',
	idiomas: 'Estructura',
	niveles: 'Estructura',
	ciclos: 'Estructura',
	modulos: 'Estructura',
	grupos: 'Estructura',
	aulas: 'Estructura',
	examenesubicacion: 'Examen de ubicacion',
	detallesubicacion: 'Examen de ubicacion',
	calificacionesubicacion: 'Examen de ubicacion',
	cronogramaubicacion: 'Examen de ubicacion',
	actasexamenubicacion: 'Examen de ubicacion',
	estudiantes: 'Principales',
	docentes: 'Principales',
	'academico-administrativo': 'Seguimiento docente',
	'tipos-documento-perfil': 'Seguimiento docente',
	'perfil-docente': 'Seguimiento docente',
	'documentos-docente': 'Seguimiento docente',
	'encuesta-respuestas': 'Seguimiento docente',
	'encuesta-respuestas-detalle': 'Seguimiento docente',
	'encuesta-preguntas': 'Seguimiento docente',
	'encuesta-metricas-docente': 'Seguimiento docente',
	'puntaje-academico-administrativo': 'Seguimiento docente',
	'dashboard-docentes': 'Seguimiento docente',
	'cumplimiento-docente': 'Seguimiento docente',
	'perfil-docente-resultados': 'Seguimiento docente',
	q10: 'Q10',
	upload: 'Servicios compartidos',
	mailer: 'Servicios compartidos',
};

const API_KEY_PREFIXES = new Set([
	'upload',
	'mailer',
	'q10',
	'tipos-documento-perfil',
	'textos',
	'perfil-docente',
	'facultades',
	'estados',
	'escuelas',
	'academico-administrativo',
	'rol-permisos',
	'examenesubicacion',
	'documentos-docente',
	'niveles',
	'encuesta-respuestas',
	'grupos',
	'ciclos',
	'tipossolicitud',
	'estudiantes',
	'notasfinal',
	'idiomas',
	'detallesubicacion',
	'solicitudbecas',
	'aulas',
	'modulos',
	'calificacionesubicacion',
	'pagos-banco',
	'docentes',
	'actasexamenubicacion',
	'notas',
	'evaluaciones',
	'solicitudes',
	'cronogramaubicacion',
	'actanotas',
	'certificados',
	'constancias',
]);

const API_KEY_AND_JWT_PREFIXES = new Set(['usuarios', 'rol-permisos']);

const API_KEY_AND_JWT_OPERATIONS = new Set([
	'post /auth/logout',
	'get /auth/profile',
	'delete /actanotas/{id}',
	'delete /certificados/{id}',
	'delete /constancias/{id}',
]);

const JWT_ONLY_OPERATIONS = new Set(['get /profile']);

const DEPRECATED_OPERATIONS = new Map([
	[
		'delete /solicitudes/{id}',
		'Endpoint legado para rechazo de solicitudes. Usar PATCH /solicitudes/{id}/rechazo.',
	],
]);

const MULTIPART_REQUEST_BODIES: Record<string, unknown> = {
	'post /upload/{folder}': {
		required: true,
		content: {
			'multipart/form-data': {
				schema: {
					type: 'object',
					required: ['file', 'nombre'],
					properties: {
						file: {
							type: 'string',
							format: 'binary',
							description: 'Archivo que sera cargado a Google Drive.',
						},
						nombre: {
							type: 'string',
							description: 'Nombre logico con el que se guardara el archivo.',
						},
						fileId: {
							type: 'string',
							description: 'ID opcional para reemplazar/mover un archivo existente.',
						},
					},
				},
			},
		},
	},
	'post /pagos-banco/upload': {
		required: true,
		content: {
			'multipart/form-data': {
				schema: {
					type: 'object',
					required: ['file'],
					properties: {
						file: {
							type: 'string',
							format: 'binary',
							description: 'CSV bancario a cargar y procesar.',
						},
					},
				},
			},
		},
	},
	'post /encuesta-respuestas/upload': {
		required: true,
		content: {
			'multipart/form-data': {
				schema: {
					type: 'object',
					required: ['file'],
					properties: {
						file: {
							type: 'string',
							format: 'binary',
							description: 'CSV de respuestas de encuesta docente.',
						},
					},
				},
			},
		},
	},
};

const getFirstPathSegment = (path: string): string => {
	const [firstSegment] = path.split('/').filter(Boolean);
	return firstSegment ?? '';
};

const getOperationKey = (method: string, path: string): string =>
	`${method.toLowerCase()} ${path}`;

const getTagForPath = (path: string): string => {
	const firstSegment = getFirstPathSegment(path);
	return PATH_TAGS[firstSegment] ?? 'Sistema';
};

const buildSummary = (method: string, path: string): string =>
	`${method.toUpperCase()} ${path}`;

const getSecurityForOperation = (
	method: string,
	path: string,
): Record<string, string[]>[] | undefined => {
	const key = getOperationKey(method, path);

	if (API_KEY_AND_JWT_OPERATIONS.has(key)) {
		return [{ 'api-key': [], jwt: [] }];
	}

	if (JWT_ONLY_OPERATIONS.has(key)) {
		return [{ jwt: [] }];
	}

	const firstSegment = getFirstPathSegment(path);

	if (API_KEY_AND_JWT_PREFIXES.has(firstSegment)) {
		return [{ 'api-key': [], jwt: [] }];
	}

	if (API_KEY_PREFIXES.has(firstSegment)) {
		return [{ 'api-key': [] }];
	}

	return undefined;
};

const ensureResponse = (
	operation: SwaggerOperation,
	statusCode: string,
	description: string,
): void => {
	operation.responses ??= {};

	if (!operation.responses[statusCode]) {
		operation.responses[statusCode] = { description };
	}
};

const addStandardResponses = (
	operation: SwaggerOperation,
	path: string,
	security: Record<string, string[]>[] | undefined,
): void => {
	ensureResponse(operation, '200', 'Operacion realizada correctamente.');
	ensureResponse(operation, '400', 'Solicitud invalida o datos no validos.');

	if (path.includes('{id}')) {
		ensureResponse(operation, '404', 'Recurso no encontrado.');
	}

	if (security?.length) {
		ensureResponse(operation, '401', 'Credenciales ausentes o invalidas.');
		ensureResponse(operation, '403', 'Acceso denegado por permisos o API key invalida.');
	}
};

const decorateOperation = (
	method: string,
	path: string,
	operation: SwaggerOperation,
): void => {
	const key = getOperationKey(method, path);
	const deprecatedDescription = DEPRECATED_OPERATIONS.get(key);
	const security = getSecurityForOperation(method, path);

	operation.tags = [getTagForPath(path)];
	operation.summary ??= buildSummary(method, path);
	operation.description ??= deprecatedDescription ?? buildSummary(method, path);
	operation.security = security ?? [];

	if (deprecatedDescription) {
		operation.deprecated = true;
	}

	if (MULTIPART_REQUEST_BODIES[key]) {
		operation.requestBody = MULTIPART_REQUEST_BODIES[key];
	}

	addStandardResponses(operation, path, security);
};

export const decorateOpenApiDocument = (
	document: OpenAPIObject,
): OpenAPIObject => {
	document.tags = API_TAGS;

	for (const [path, pathItem] of Object.entries(document.paths)) {
		const typedPathItem = pathItem as SwaggerPathItem;

		for (const [method, operation] of Object.entries(typedPathItem)) {
			if (!HTTP_METHODS.has(method) || !operation) {
				continue;
			}

			decorateOperation(method, path, operation as SwaggerOperation);
		}
	}

	return document;
};
