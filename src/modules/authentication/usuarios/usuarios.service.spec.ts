import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { UsuariosService } from './usuarios.service';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let queryBuilder: {
    where: jest.Mock;
    setLock: jest.Mock;
    getOne: jest.Mock;
  };
  let repository: { createQueryBuilder: jest.Mock };

  beforeEach(async () => {
    queryBuilder = {
      where: jest.fn(),
      setLock: jest.fn(),
      getOne: jest.fn(),
    };
    queryBuilder.where.mockReturnValue(queryBuilder);
    queryBuilder.setLock.mockReturnValue(queryBuilder);
    repository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: getRepositoryToken(Usuario), useValue: repository },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('finds email case-insensitively and locks the user when requested', async () => {
    const user = { id: 'user-1' } as Usuario;
    queryBuilder.getOne.mockResolvedValue(user);
    const transactionalRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    const manager = {
      getRepository: jest.fn().mockReturnValue(transactionalRepository),
    } as unknown as EntityManager;

    await expect(
      service.findByEmailInsensitive('  Usuario@CIUNAC.edu.pe ', manager, true),
    ).resolves.toBe(user);

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'LOWER(usuario.email) = :email',
      { email: 'usuario@ciunac.edu.pe' },
    );
    expect(queryBuilder.setLock).toHaveBeenCalledWith('pessimistic_write');
  });
});
