import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { DataSource, EntityManager } from 'typeorm';
import { AuthService } from './auth.service';
import { UsuariosService } from 'src/modules/authentication/usuarios/usuarios.service';
import { DocentesService } from 'src/modules/principales/docentes/docentes.service';
import { RolUsuario } from 'src/modules/authentication/usuarios/entities/usuario.entity';

describe('AuthService', () => {
	let service: AuthService;
	let usuariosService: jest.Mocked<UsuariosService>;
	let docentesService: jest.Mocked<DocentesService>;
	let jwtService: jest.Mocked<JwtService>;
	let dataSource: { transaction: jest.Mock };
	let manager: EntityManager;

	beforeEach(async () => {
		manager = {} as EntityManager;

		const usuariosServiceMock = {
			findByEmail: jest.fn(),
			createLocal: jest.fn(),
		};

		const docentesServiceMock = {
			findByIdentificacion: jest.fn(),
			assignUsuario: jest.fn(),
		};

		const jwtServiceMock = {
			sign: jest.fn().mockReturnValue('mocked-token'),
		};

		dataSource = {
			transaction: jest.fn().mockImplementation(async (callback: (manager: EntityManager) => Promise<unknown>) => {
				return await callback(manager);
			}),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{ provide: UsuariosService, useValue: usuariosServiceMock },
				{ provide: DocentesService, useValue: docentesServiceMock },
				{ provide: JwtService, useValue: jwtServiceMock },
				{ provide: DataSource, useValue: dataSource },
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
		usuariosService = module.get(UsuariosService);
		docentesService = module.get(DocentesService);
		jwtService = module.get(JwtService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('registers a non-docente user without linking docente', async () => {
		usuariosService.findByEmail.mockResolvedValue(null);
		usuariosService.createLocal.mockResolvedValue({
			id: 'user-1',
			email: 'demo@ciunac.edu.pe',
			rol: RolUsuario.ESTUDIANTE,
		} as any);

		const result = await service.register('demo@ciunac.edu.pe', 'secret123', RolUsuario.ESTUDIANTE);

		expect(result).toBe('mocked-token');
		expect(usuariosService.findByEmail).toHaveBeenCalledWith('demo@ciunac.edu.pe', manager);
		expect(usuariosService.createLocal).toHaveBeenCalledWith(
			'demo@ciunac.edu.pe',
			'secret123',
			RolUsuario.ESTUDIANTE,
			manager,
		);
		expect(docentesService.findByIdentificacion).not.toHaveBeenCalled();
		expect(docentesService.assignUsuario).not.toHaveBeenCalled();
		expect(jwtService.sign).toHaveBeenCalledWith({
			sub: 'user-1',
			email: 'demo@ciunac.edu.pe',
			rol: RolUsuario.ESTUDIANTE,
		});
	});

	it('fails when a docente register request does not include numeroDocumento', async () => {
		usuariosService.findByEmail.mockResolvedValue(null);

		await expect(service.register('docente@ciunac.edu.pe', 'secret123', RolUsuario.DOCENTE)).rejects.toThrow(
			BadRequestException,
		);

		expect(usuariosService.createLocal).not.toHaveBeenCalled();
		expect(docentesService.findByIdentificacion).not.toHaveBeenCalled();
	});

	it('fails when the docente is not found by numeroDocumento', async () => {
		usuariosService.findByEmail.mockResolvedValue(null);
		docentesService.findByIdentificacion.mockResolvedValue(null);

		await expect(
			service.register('docente@ciunac.edu.pe', 'secret123', RolUsuario.DOCENTE, '12345678'),
		).rejects.toThrow(NotFoundException);

		expect(docentesService.findByIdentificacion).toHaveBeenCalledWith('12345678', manager);
		expect(usuariosService.createLocal).not.toHaveBeenCalled();
	});

	it('fails when the docente already has a linked user', async () => {
		usuariosService.findByEmail.mockResolvedValue(null);
		docentesService.findByIdentificacion.mockResolvedValue({
			id: 'docente-1',
			usuario_id: 'user-existing',
		} as any);

		await expect(
			service.register('docente@ciunac.edu.pe', 'secret123', RolUsuario.DOCENTE, '12345678'),
		).rejects.toThrow(ConflictException);

		expect(usuariosService.createLocal).not.toHaveBeenCalled();
		expect(docentesService.assignUsuario).not.toHaveBeenCalled();
	});

	it('links the docente with the new user when the role is DOCENTE', async () => {
		usuariosService.findByEmail.mockResolvedValue(null);
		docentesService.findByIdentificacion.mockResolvedValue({
			id: 'docente-1',
			usuario_id: null,
		} as any);
		usuariosService.createLocal.mockResolvedValue({
			id: 'user-1',
			email: 'docente@ciunac.edu.pe',
			rol: RolUsuario.DOCENTE,
		} as any);
		docentesService.assignUsuario.mockResolvedValue({
			id: 'docente-1',
			usuario_id: 'user-1',
		} as any);

		const result = await service.register(
			'docente@ciunac.edu.pe',
			'secret123',
			RolUsuario.DOCENTE,
			'12345678',
		);

		expect(result).toBe('mocked-token');
		expect(docentesService.findByIdentificacion).toHaveBeenCalledWith('12345678', manager);
		expect(usuariosService.createLocal).toHaveBeenCalledWith(
			'docente@ciunac.edu.pe',
			'secret123',
			RolUsuario.DOCENTE,
			manager,
		);
		expect(docentesService.assignUsuario).toHaveBeenCalledWith('docente-1', 'user-1', manager);
	});

	it('fails when the email is already registered', async () => {
		usuariosService.findByEmail.mockResolvedValue({
			id: 'user-1',
			email: 'demo@ciunac.edu.pe',
		} as any);

		await expect(
			service.register('demo@ciunac.edu.pe', 'secret123', RolUsuario.DOCENTE, '12345678'),
		).rejects.toThrow(ConflictException);

		expect(usuariosService.createLocal).not.toHaveBeenCalled();
		expect(docentesService.findByIdentificacion).not.toHaveBeenCalled();
	});
});
