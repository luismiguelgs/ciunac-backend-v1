import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagosBancoService } from './pagos-banco.service';
import { PagosBancoController } from './pagos-banco.controller';
import { PagosBanco } from './entities/pagos-banco.entity';
import { Solicitud } from '../solicitudes/entities/solicitud.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PagosBanco, Solicitud])],
  controllers: [PagosBancoController],
  providers: [PagosBancoService],
  exports: [PagosBancoService],
})
export class PagosBancoModule {}
