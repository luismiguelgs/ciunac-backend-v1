import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolPermisosService } from './rol_permisos.service';
import { RolPermisosController } from './rol_permisos.controller';
import { RolPermiso, Permiso } from './entities/rol_permiso.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RolPermiso, Permiso]),
    AuthModule,
  ],
  controllers: [RolPermisosController],
  providers: [RolPermisosService],
})
export class RolPermisosModule {}


