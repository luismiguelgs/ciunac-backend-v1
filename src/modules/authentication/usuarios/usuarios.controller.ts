import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/modules/authentication/auth/guards/api-key.guard';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@UseGuards(ApiKeyGuard, AuthGuard('jwt'), PermissionsGuard)
@Controller('usuarios')
export class UsuariosController {
	constructor(private readonly usuariosService: UsuariosService) { }

	@RequirePermissions('gestionar_usuarios')
	@Post()
	create(@Body() createUsuarioDto: CreateUsuarioDto) {
		return this.usuariosService.create(createUsuarioDto);
	}

	@RequirePermissions('gestionar_usuarios')
	@Get()
	findAll() {
		return this.usuariosService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.usuariosService.findOne(id);
	}

	@RequirePermissions('gestionar_usuarios')
	@Patch(':id')
	update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
		return this.usuariosService.update(id, updateUsuarioDto);
	}

	@Get('buscar/:email')
	findByEmail(@Param('email') email: string): Promise<Usuario | null> {
		return this.usuariosService.findByEmail(email);
	}

	@RequirePermissions('gestionar_usuarios')
	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.usuariosService.remove(id);
	}
}
