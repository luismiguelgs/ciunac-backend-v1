const { databases, load } = require('./database.cjs');

async function studentProbe(db) {
  const { EstudiantesService } = load(
    'src/modules/principales/estudiantes/estudiantes.service.ts',
  );
  const { CreateEstudianteDto } = load(
    'src/modules/principales/estudiantes/dto/create-estudiante.dto.ts',
  );
  const { UpdateEstudianteDto } = load(
    'src/modules/principales/estudiantes/dto/update-estudiante.dto.ts',
  );
  const { ValidationPipe } = require('@nestjs/common');
  const service = new EstudiantesService(
    db.repo('Estudiante'),
    db.repo('Facultad'),
    db.repo('Escuela'),
  );
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  });
  const create = await pipe.transform(
    {
      nombres: 'SDD',
      apellidos: 'Fecha',
      genero: 'F',
      fechaNacimiento: '2000-01-01',
      tipoDocumento: 'DNI',
      numeroDocumento: `TZ-${process.pid}`,
      celular: '999999999',
    },
    { type: 'body', metatype: CreateEstudianteDto },
  );
  const student = await service.create(create);
  try {
    const stored = await service.findOne(student.id);
    const patch = await pipe.transform(
      { fechaNacimiento: '2004-02-29' },
      { type: 'body', metatype: UpdateEstudianteDto },
    );
    await service.update(student.id, patch);
    const updated = await service.findOne(student.id);
    process.stdout.write(
      JSON.stringify({
        timezone: process.env.TZ,
        created: stored.fechaNacimiento,
        updated: updated.fechaNacimiento,
      }),
    );
  } finally {
    await db.repo('Estudiante').delete(student.id);
  }
}

async function main() {
  const db = await databases({ synchronize: false });
  try {
    if (process.argv.includes('--student')) {
      await studentProbe(db);
      return;
    }
    const payment = await db.repo('PagosBanco').save(
      db.repo('PagosBanco').create({
        numeroVoucher: 'SDD-TZ-PROBE',
        fechaEfectiva: new Date('2026-10-01T00:00:00.000Z'),
      }),
    );
    try {
      const stored = await db.repo('PagosBanco').findOneBy({ id: payment.id });
      process.stdout.write(
        JSON.stringify({
          timezone: process.env.TZ,
          stored: stored.fechaEfectiva,
        }),
      );
    } finally {
      await db.repo('PagosBanco').delete(payment.id);
    }
  } finally {
    await db.mongo.close();
    await db.pg.destroy();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
