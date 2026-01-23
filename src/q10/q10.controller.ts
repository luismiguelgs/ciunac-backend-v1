import { Body, Controller, Post, UseGuards, Get, Query } from '@nestjs/common';
import { Q10Service } from './q10.service';
import { Q10EstudianteDto } from './dto/q10-estudiante.dto';
import { Q10HorariosDto } from './dto/q10-horarios.dto';
import { ApiKeyGuard } from 'src/modules/usuarios/auth/guards/api-key.guard';

@UseGuards(ApiKeyGuard)
@Controller('q10')
export class Q10Controller {
    constructor(private readonly q10Service: Q10Service) { }

    @Post('estudiantes')
    async register(@Body() body: Q10EstudianteDto) {
        return this.q10Service.crearEstudianteEnQ10(body);
    }

    @Get('horarios-cursos')
    async listarHorariosCursos(@Query('periodo') periodo: string) {
        return this.q10Service.listarHorariosCursos(periodo);
    }

    @Post('horarios-cursos')
    async guardarHorariosCursos(@Body() body: Q10HorariosDto) {
        const { periodo, nombrePeriodo } = body;
        return this.q10Service.guardarHorariosCursos(periodo, nombrePeriodo);
    }
}
