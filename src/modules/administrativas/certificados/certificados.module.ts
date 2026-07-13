import { Module } from '@nestjs/common';
import { CertificadosService } from './certificados.service';
import { CertificadosController } from './certificados.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Certificado, CertificadoSchema } from './schemas/certificado.schema';
import { SolicitudesModule } from 'src/modules/administrativas/solicitudes/solicitudes.module';
import { UploadModule } from 'src/shared/upload/upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Certificado.name,
        schema: CertificadoSchema,
      },
    ]),
    SolicitudesModule,
    UploadModule,
  ],
  controllers: [CertificadosController],
  providers: [CertificadosService],
})
export class CertificadosModule {}
