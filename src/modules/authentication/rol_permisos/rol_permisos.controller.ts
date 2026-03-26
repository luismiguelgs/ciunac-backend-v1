import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RolPermisosService } from './rol_permisos.service';
import { CreateRolPermisoDto } from './dto/create-rol_permiso.dto';
import { UpdateRolPermisoDto } from './dto/update-rol_permiso.dto';
import { RolUsuario } from '../usuarios/entities/usuario.entity';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@UseGuards(ApiKeyGuard, AuthGuard('jwt'), PermissionsGuard)
@Controller('rol-permisos')

export class RolPermisosController {
	constructor(private readonly rolPermisosService: RolPermisosService) { }

	@RequirePermissions('gestionar_usuarios')
	@Post()
	create(@Body() createRolPermisoDto: CreateRolPermisoDto) {
		return this.rolPermisosService.create(createRolPermisoDto);
	}

	@Get()
	findAll() {
		return this.rolPermisosService.findAll();
	}

	@Get('rol/:rol')
	findByRol(@Param('rol') rol: RolUsuario) {
		return this.rolPermisosService.findByRol(rol);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.rolPermisosService.findOne(+id);
	}

	@RequirePermissions('gestionar_usuarios')
	@Patch(':id')
	update(@Param('id') id: string, @Body() updateRolPermisoDto: UpdateRolPermisoDto) {
		return this.rolPermisosService.update(+id, updateRolPermisoDto);
	}

	@RequirePermissions('gestionar_usuarios')
	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.rolPermisosService.remove(+id);
	}
}
