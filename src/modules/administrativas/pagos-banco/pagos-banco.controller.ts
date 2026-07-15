import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiKeyGuard } from 'src/modules/authentication/auth/guards/api-key.guard';
import { PagosBancoService } from './pagos-banco.service';
import { CreatePagosBancoDto } from './dto/create-pagos-banco.dto';
import { UpdatePagosBancoDto } from './dto/update-pagos-banco.dto';
import { PagosBanco } from './entities/pagos-banco.entity';
import { PAGOS_CSV_MAX_FILE_SIZE_BYTES } from './pagos-banco.constants';
import {
  ReverifyPagosBancoResult,
  UploadPagosBancoResult,
} from './interfaces/pagos-banco-processing.interface';

@UseGuards(ApiKeyGuard)
@Controller('pagos-banco')
export class PagosBancoController {
  constructor(private readonly pagosBancoService: PagosBancoService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: PAGOS_CSV_MAX_FILE_SIZE_BYTES },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadPagosBancoResult> {
    if (!file) {
      throw new BadRequestException('No se ha subido ningún archivo.');
    }

    if (file.mimetype !== 'text/csv' && !/\.csv$/i.test(file.originalname)) {
      throw new BadRequestException('Solo se permiten archivos CSV.');
    }

    return this.pagosBancoService.uploadAndProcess(file.buffer);
  }

  @Post('reverify')
  reverify(): Promise<ReverifyPagosBancoResult> {
    return this.pagosBancoService.reverifyUnverified();
  }

  @Post()
  create(
    @Body() createPagosBancoDto: CreatePagosBancoDto,
  ): Promise<PagosBanco> {
    return this.pagosBancoService.create(createPagosBancoDto);
  }

  @Get()
  findAll(): Promise<PagosBanco[]> {
    return this.pagosBancoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<PagosBanco> {
    return this.pagosBancoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePagosBancoDto: UpdatePagosBancoDto,
  ): Promise<PagosBanco> {
    return this.pagosBancoService.update(id, updatePagosBancoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.pagosBancoService.remove(id);
  }
}
