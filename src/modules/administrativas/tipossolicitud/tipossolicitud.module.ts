import { Module } from '@nestjs/common';
import { TipossolicitudService } from './tipossolicitud.service';
import { TipossolicitudController } from './tipossolicitud.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tipossolicitud } from './entities/tipossolicitud.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tipossolicitud])],
  controllers: [TipossolicitudController],
  providers: [TipossolicitudService],
})
export class TipossolicitudModule {}
