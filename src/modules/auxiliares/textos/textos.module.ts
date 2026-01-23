import { Module } from '@nestjs/common';
import { TextosService } from './textos.service';
import { TextosController } from './textos.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Texto } from './schemas/texto.schema';
import { TextoSchema } from './schemas/texto.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Texto.name, schema: TextoSchema }])],
  controllers: [TextosController],
  providers: [TextosService],
  exports: [TextosService],
})
export class TextosModule {}
