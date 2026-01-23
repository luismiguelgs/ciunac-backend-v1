import { Module } from '@nestjs/common';
import { ActanotasService } from './actanotas.service';
import { ActanotasController } from './actanotas.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ActaNotaSchema } from './schemas/actanota.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'ActaNota', schema: ActaNotaSchema }])],
  controllers: [ActanotasController],
  providers: [ActanotasService],
  exports: [ActanotasService],
})
export class ActanotasModule {}
