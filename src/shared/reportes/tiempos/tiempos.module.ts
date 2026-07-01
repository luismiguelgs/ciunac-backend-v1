import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Certificado,
  CertificadoSchema,
} from 'src/modules/administrativas/certificados/schemas/certificado.schema';
import { Solicitud } from 'src/modules/administrativas/solicitudes/entities/solicitud.entity';
import { TiemposController } from './tiempos.controller';
import { TiemposService } from './tiempos.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Certificado.name,
        schema: CertificadoSchema,
      },
    ]),
    TypeOrmModule.forFeature([Solicitud]),
  ],
  controllers: [TiemposController],
  providers: [TiemposService],
})
export class TiemposModule {}
