import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class RolesService {
    constructor(
        private dataSource: DataSource,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    // Este método busca en las tablas que creamos en pgAdmin
    async getPermissionsByRole(rol: string): Promise<string[]> {
        const cacheKey = `permisos_rol_${rol}`;

        // 1. Intentamos buscar en caché primero
        const cachedPermissions = await this.cacheManager.get<string[]>(cacheKey);
        if (cachedPermissions) {
            return cachedPermissions;
        }

        const query = `
      SELECT p.codigo 
      FROM permisos p
      JOIN rol_permisos rp ON p.id = rp.permiso_id
      WHERE rp.rol = $1
    `;

        // Ejecutamos la consulta SQL directa
        const result = await this.dataSource.query(query, [rol]);

        // Convertimos el resultado de [{codigo: 'ver_tramites'}] a ['ver_tramites']
        const permissions = result.map((row: any) => row.codigo);

        // 2. Guardamos en el caché para próximas peticiones (ej. 1 hora = 3600000 ms)
        await this.cacheManager.set(cacheKey, permissions, 3600000);

        return permissions;
    }
}