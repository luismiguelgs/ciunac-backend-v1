import { Controller, Get } from '@nestjs/common';
import { DashboardDocentesService } from './dashboard_docentes.service';

@Controller('dashboard-docentes')
export class DashboardDocentesController {
	constructor(private readonly dashboardDocentesService: DashboardDocentesService) { }

	//Indicadores Gobales

	@Get('metricas-globales')
	getMetricasGlobales() {
		return this.dashboardDocentesService.getMetricasGlobales();
	}

	@Get('desempeno-general')
	getDesempeñoGeneral() {
		return this.dashboardDocentesService.getDesempeñoGeneral();
	}

	@Get('ranking-docentes')
	getRankingDocentes() {
		return this.dashboardDocentesService.getRankingDocentes();
	}

	//Desglose por Pilares

	@Get('perfil-profesional')
	getPerfilProfesional() {
		return this.dashboardDocentesService.getPerfilProfesional();
	}

	@Get('cumplimiento')
	getCumplimiento() {
		return this.dashboardDocentesService.getCumplimiento();
	}

	@Get('gestion-metodologica')
	getGestionMetodologica() {
		return this.dashboardDocentesService.getGestionMetodologica();
	}

	@Get('valoracion-estudiantil')
	getValoracionEstudiantil() {
		return this.dashboardDocentesService.getValoracionEstudiantil();
	}
}
