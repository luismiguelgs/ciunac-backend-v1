import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Provider, RolUsuario, Usuario } from './entities/usuario.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
	constructor(
		@InjectRepository(Usuario)
		private readonly usuarioRepo: Repository<Usuario>) { }

	private getUsuarioRepository(manager?: EntityManager): Repository<Usuario> {
		return manager ? manager.getRepository(Usuario) : this.usuarioRepo;
	}

	async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
		const nuevo = this.usuarioRepo.create(createUsuarioDto);
		return await this.usuarioRepo.save(nuevo);
	}

	async createLocal(email: string, password: string, rol?: RolUsuario, manager?: EntityManager): Promise<Usuario> {
		const usuarioRepo = this.getUsuarioRepository(manager);
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);
		const user = usuarioRepo.create({
			email,
			password: hashedPassword,
			provider: 'local',
			rol: rol,
		});
		return await usuarioRepo.save(user);
	}

	async createOAuth(email: string, provider: Provider, providerId: string, rol: RolUsuario): Promise<Usuario> {
		const user = this.usuarioRepo.create({
			email,
			provider,
			providerId,
			rol,
		});
		return await this.usuarioRepo.save(user);
	}

	async findAll(): Promise<Usuario[]> {
		return await this.usuarioRepo.find();
	}

	findOne(id: string): Promise<Usuario | null> {
		return this.usuarioRepo.findOne({
			where: { id },
			relations: ['estudiante'],
		});
	}

	async findByEmail(email: string, manager?: EntityManager): Promise<Usuario | null> {
		return await this.getUsuarioRepository(manager).findOne({ where: { email } });
	}

	async update(id: string, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario | null> {
		await this.usuarioRepo.update(id, updateUsuarioDto);
		return this.findOne(id)
	}

	async remove(id: string): Promise<void> {
		await this.usuarioRepo.delete(id);
	}

	// async setRefreshToken(userId: string, refreshToken: string) {
	// 	const hash = await bcrypt.hash(refreshToken, 10);
	// 	await this.usuarioRepo.update({ id: userId }, { refreshTokenHash: hash });
	// }

	// async removeRefreshToken(userId: string) {
	// 	await this.usuarioRepo.update({ id: userId }, { refreshTokenHash: null });
	// }

	// async validateRefreshToken(user: Usuario, token: string) {
	// 	if (!user?.refreshTokenHash) return false;
	// 	return bcrypt.compare(token, user.refreshTokenHash);
	// }
}
