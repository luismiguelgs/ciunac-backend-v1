import { Module } from '@nestjs/common';
import { CertificadosService } from './certificados.service';
import { CertificadosController } from './certificados.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Certificado, CertificadoSchema } from './schemas/certificado.schema';

@Module({
  imports: [MongooseModule.forFeature([{ 
    name: Certificado.name, 
    schema: CertificadoSchema
  }])],
  controllers: [CertificadosController],
  providers: [CertificadosService],
})
export class CertificadosModule {}
