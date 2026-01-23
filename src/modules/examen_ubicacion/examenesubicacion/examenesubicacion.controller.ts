import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExamenesubicacionService } from './examenesubicacion.service';
import { CreateExamenesubicacionDto } from './dto/create-examenesubicacion.dto';
import { UpdateExamenesubicacionDto } from './dto/update-examenesubicacion.dto';
import { UseGuards } from '@nestjs/common';
//import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from 'src/modules/usuarios/auth/guards/api-key.guard';
//@UseGuards(JwtAuthGuard)

@UseGuards(ApiKeyGuard)
@Controller('examenesubicacion')
export class ExamenesubicacionController {
	constructor(private readonly examenesubicacionService: ExamenesubicacionService) { }

	@Post()
	create(@Body() createExamenesubicacionDto: CreateExamenesubicacionDto) {
		return this.examenesubicacionService.create(createExamenesubicacionDto);
	}

	@Get()
	findAll() {
		return this.examenesubicacionService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.examenesubicacionService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateExamenesubicacionDto: UpdateExamenesubicacionDto) {
		return this.examenesubicacionService.update(+id, updateExamenesubicacionDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.examenesubicacionService.remove(+id);
	}
}
