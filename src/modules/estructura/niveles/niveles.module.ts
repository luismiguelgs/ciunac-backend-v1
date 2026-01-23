import { Module } from '@nestjs/common';
import { NivelesService } from './niveles.service';
import { NivelesController } from './niveles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nivel } from './entities/nivel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Nivel])],
  controllers: [NivelesController],
  providers: [NivelesService],
})
export class NivelesModule {}
