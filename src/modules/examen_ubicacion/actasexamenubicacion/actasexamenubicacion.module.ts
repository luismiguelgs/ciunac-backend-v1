import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Solicitud } from 'src/modules/administrativas/solicitudes/entities/solicitud.entity';
import { AuthModule } from 'src/modules/authentication/auth/auth.module';
import { Detallesubicacion } from '../detallesubicacion/entities/detallesubicacion.entity';
import { Examenesubicacion } from '../examenesubicacion/entities/examenesubicacion.entity';
import { ActasexamenubicacionController } from './actasexamenubicacion.controller';
import { ActasexamenubicacionService } from './actasexamenubicacion.service';
import {
  ActaExamenUbicacion,
  ActaExamenUbicacionSchema,
} from './schemas/actasexamenubicacion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ActaExamenUbicacion.name, schema: ActaExamenUbicacionSchema },
    ]),
    TypeOrmModule.forFeature([Examenesubicacion, Detallesubicacion, Solicitud]),
    AuthModule,
  ],
  controllers: [ActasexamenubicacionController],
  providers: [ActasexamenubicacionService],
  exports: [ActasexamenubicacionService],
})
export class ActasexamenubicacionModule {}
