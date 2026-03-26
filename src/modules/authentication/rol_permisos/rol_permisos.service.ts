import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRolPermisoDto } from './dto/create-rol_permiso.dto';
import { UpdateRolPermisoDto } from './dto/update-rol_permiso.dto';
import { RolPermiso } from './entities/rol_permiso.entity';
import { RolUsuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class RolPermisosService {
	constructor(
		@InjectRepository(RolPermiso)
		private readonly rolPermisosRepository: Repository<RolPermiso>,
	) { }

	async create(createRolPermisoDto: CreateRolPermisoDto): Promise<RolPermiso> {
		const rolPermiso = this.rolPermisosRepository.create(createRolPermisoDto);
		return await this.rolPermisosRepository.save(rolPermiso);
	}

	async findAll(): Promise<RolPermiso[]> {
		return await this.rolPermisosRepository.find({
			relations: ['permiso'],
		});
	}

	async findByRol(rol: RolUsuario): Promise<RolPermiso[]> {
		return await this.rolPermisosRepository.find({
			where: { rol },
			relations: ['permiso'],
		});
	}

	async findOne(id: number): Promise<RolPermiso> {
		const rolPermiso = await this.rolPermisosRepository.findOne({
			where: { id },
			relations: ['permiso'],
		});

		if (!rolPermiso) {
			throw new NotFoundException(`RolPermiso with ID ${id} not found`);
		}

		return rolPermiso;
	}

	async update(id: number, updateRolPermisoDto: UpdateRolPermisoDto): Promise<RolPermiso> {
		const rolPermiso = await this.findOne(id);
		this.rolPermisosRepository.merge(rolPermiso, updateRolPermisoDto);
		return await this.rolPermisosRepository.save(rolPermiso);
	}

	async remove(id: number): Promise<void> {
		const rolPermiso = await this.findOne(id);
		await this.rolPermisosRepository.remove(rolPermiso);
	}
}

