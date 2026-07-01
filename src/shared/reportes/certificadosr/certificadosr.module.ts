import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Certificado,
  CertificadoSchema,
} from 'src/modules/administrativas/certificados/schemas/certificado.schema';
import { Solicitud } from 'src/modules/administrativas/solicitudes/entities/solicitud.entity';
import { CertificadosrController } from './certificadosr.controller';
import { CertificadosrService } from './certificadosr.service';

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
  controllers: [CertificadosrController],
  providers: [CertificadosrService],
})
export class CertificadosrModule {}
