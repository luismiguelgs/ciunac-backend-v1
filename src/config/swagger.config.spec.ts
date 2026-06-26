import { isSwaggerEnabled, SWAGGER_JSON_PATH, SWAGGER_UI_PATH } from './swagger.config';

describe('swagger.config', () => {
	it('habilita Swagger fuera de produccion', () => {
		expect(isSwaggerEnabled(undefined)).toBe(true);
		expect(isSwaggerEnabled('development')).toBe(true);
		expect(isSwaggerEnabled('test')).toBe(true);
	});

	it('deshabilita Swagger en produccion', () => {
		expect(isSwaggerEnabled('production')).toBe(false);
	});

	it('mantiene rutas estables para UI y JSON', () => {
		expect(SWAGGER_UI_PATH).toBe('api/docs');
		expect(SWAGGER_JSON_PATH).toBe('api/docs-json');
	});
});
