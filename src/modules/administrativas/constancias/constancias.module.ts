import { Module } from '@nestjs/common';
import { ConstanciasService } from './constancias.service';
import { ConstanciasController } from './constancias.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Constancia } from './schemas/constancia.schema';
import { ConstanciaSchema } from './schemas/constancia.schema';

@Module({
  imports: [MongooseModule.forFeature([{ 
    name: Constancia.name, 
    schema: ConstanciaSchema 
  }])],
  controllers: [ConstanciasController],
  providers: [ConstanciasService],
  exports: [ConstanciasService],
})
export class ConstanciasModule {}
