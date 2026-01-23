import { Module } from '@nestjs/common';
import { ActasexamenubicacionService } from './actasexamenubicacion.service';
import { ActasexamenubicacionController } from './actasexamenubicacion.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ActaExamenUbicacion } from './schemas/actasexamenubicacion.schema';
import { ActaExamenUbicacionSchema } from './schemas/actasexamenubicacion.schema';

@Module({
	imports: [MongooseModule.forFeature([
		{ name: ActaExamenUbicacion.name, schema: ActaExamenUbicacionSchema }
	])],
	controllers: [ActasexamenubicacionController],
	providers: [ActasexamenubicacionService],
	exports: [ActasexamenubicacionService],
})
export class ActasexamenubicacionModule {}
