import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCumplimientoDocenteDto } from './dto/create-cumplimiento_docente.dto';
import { UpdateCumplimientoDocenteDto } from './dto/update-cumplimiento_docente.dto';
import { CumplimientoDocente } from './entities/cumplimiento_docente.entity';
import { PerfilDocenteResultadosService } from '../perfil_docente_resultados/perfil_docente_resultados.service';

@Injectable()
export class CumplimientoDocenteService {
	constructor(
		@InjectRepository(CumplimientoDocente)
		private readonly cumplimientoRepository: Repository<CumplimientoDocente>,
		private readonly perfilDocenteResultadosService: PerfilDocenteResultadosService,
	) { }

	async create(createCumplimientoDocenteDto: CreateCumplimientoDocenteDto) {
		const cumplimiento = this.cumplimientoRepository.create({
			...createCumplimientoDocenteDto,
		});
		const result = await this.cumplimientoRepository.save(cumplimiento);

		// Generar resultado del perfil docente
		await this.perfilDocenteResultadosService.generarResultado(
			result.moduloId,
			result.docenteId,
		);

		return result;
	}

	async findAll(moduloId?: number, academicoAdministrativoId?: number) {
		const where: any = {};
		if (moduloId) where.moduloId = moduloId;
		if (academicoAdministrativoId) where.academicoAdministrativoId = academicoAdministrativoId;

		return await this.cumplimientoRepository.find({
			where,
			relations: ['modulo', 'docente', 'academicoAdministrativo'],
		});
	}

	async findOne(id: number) {
		const cumplimiento = await this.cumplimientoRepository.findOne({
			where: { id },
			relations: ['modulo', 'docente', 'academicoAdministrativo'],
		});
		if (!cumplimiento) {
			throw new NotFoundException(`Cumplimiento Docente with ID ${id} not found`);
		}
		return cumplimiento;
	}

	async update(id: number, updateCumplimientoDocenteDto: UpdateCumplimientoDocenteDto) {
		const cumplimiento = await this.findOne(id);
		const { moduloId, docenteId, academicoAdministrativoId, ...rest } = updateCumplimientoDocenteDto;

		const updateData: any = { ...rest };
		if (moduloId) updateData.moduloId = moduloId;
		if (docenteId) updateData.docenteId = docenteId;
		if (academicoAdministrativoId) updateData.academicoAdministrativoId = academicoAdministrativoId;

		Object.assign(cumplimiento, updateData);
		const result = await this.cumplimientoRepository.save(cumplimiento);

		// Generar resultado del perfil docente
		await this.perfilDocenteResultadosService.generarResultado(
			result.moduloId,
			result.docenteId,
		);

		return result;
	}
}
