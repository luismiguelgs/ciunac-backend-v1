import { Module } from '@nestjs/common';
import { SolicitudbecasService } from './solicitudbecas.service';
import { SolicitudbecasController } from './solicitudbecas.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SolicitudBeca, SolicitudBecaSchema } from './schemas/solicitudbeca.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: SolicitudBeca.name, schema: SolicitudBecaSchema }])],
  controllers: [SolicitudbecasController],
  providers: [SolicitudbecasService],
  exports: [SolicitudbecasService],
})
export class SolicitudbecasModule {}
