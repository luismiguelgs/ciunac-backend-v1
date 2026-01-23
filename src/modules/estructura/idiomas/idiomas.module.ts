import { Module } from '@nestjs/common';
import { IdiomasService } from './idiomas.service';
import { IdiomasController } from './idiomas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Idioma } from './entities/idioma.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Idioma])],
  controllers: [IdiomasController],
  providers: [IdiomasService],
})
export class IdiomasModule {}
