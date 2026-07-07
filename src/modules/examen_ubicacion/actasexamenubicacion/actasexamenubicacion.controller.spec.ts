import { PERMISSIONS_KEY } from 'src/modules/authentication/auth/decorators/permissions.decorator';
import { ActasexamenubicacionController } from './actasexamenubicacion.controller';
import { ActasexamenubicacionService } from './actasexamenubicacion.service';

describe('ActasexamenubicacionController', () => {
  let controller: ActasexamenubicacionController;
  let service: jest.Mocked<
    Pick<
      ActasexamenubicacionService,
      'create' | 'findAll' | 'findOne' | 'update' | 'remove'
    >
  >;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new ActasexamenubicacionController(
      service as unknown as ActasexamenubicacionService,
    );
  });

  it('envia solo examenId y la identidad autenticada al servicio', async () => {
    const dto = { examenId: 123 };
    const request = {
      user: {
        id: 'usuario-1',
        email: 'usuario@ciunac.edu.pe',
        rol: 'Administrador',
      },
    };
    const response = { id: 'mongo-id', examenId: 123 };
    service.create.mockResolvedValue(response);

    await expect(controller.create(dto, request as never)).resolves.toEqual(
      response,
    );
    expect(service.create).toHaveBeenCalledWith(dto, {
      usuarioId: 'usuario-1',
      email: 'usuario@ciunac.edu.pe',
      rol: 'Administrador',
    });
  });

  it('exige el permiso gestionar_examen_ubicacion en las escrituras', () => {
    for (const methodName of ['create', 'update', 'remove'] as const) {
      expect(
        Reflect.getMetadata(
          PERMISSIONS_KEY,
          ActasexamenubicacionController.prototype[methodName],
        ),
      ).toEqual(['gestionar_examen_ubicacion']);
    }
  });

  it('delega las consultas sin exigir datos adicionales', async () => {
    service.findAll.mockResolvedValue([]);
    service.findOne.mockResolvedValue({ id: 'mongo-id' });

    await expect(controller.findAll()).resolves.toEqual([]);
    await expect(controller.findOne('mongo-id')).resolves.toEqual({
      id: 'mongo-id',
    });
  });
});
