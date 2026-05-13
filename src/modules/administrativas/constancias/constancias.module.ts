import { Module, forwardRef } from '@nestjs/common';
import { ConstanciasService } from './constancias.service';
import { ConstanciasController } from './constancias.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Constancia } from './schemas/constancia.schema';
import { ConstanciaSchema } from './schemas/constancia.schema';
import { SolicitudesModule } from 'src/modules/administrativas/solicitudes/solicitudes.module';
import { UploadModule } from 'src/shared/upload/upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ 
      name: Constancia.name, 
      schema: ConstanciaSchema 
    }]),
    SolicitudesModule,
    forwardRef(() => UploadModule)
  ],
  controllers: [ConstanciasController],
  providers: [ConstanciasService],
  exports: [ConstanciasService],
})
export class ConstanciasModule {}
