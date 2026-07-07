import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { RequirePermissions } from 'src/modules/authentication/auth/decorators/permissions.decorator';
import { ApiKeyGuard } from 'src/modules/authentication/auth/guards/api-key.guard';
import { PermissionsGuard } from 'src/modules/authentication/auth/guards/permissions.guard';
import { ActaExamenUbicacionResponseDto } from './dto/acta-examen-ubicacion-response.dto';
import { CreateActasexamenubicacionDto } from './dto/create-actasexamenubicacion.dto';
import { UpdateActasexamenubicacionDto } from './dto/update-actasexamenubicacion.dto';
import { ActasexamenubicacionService } from './actasexamenubicacion.service';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email: string;
    rol: string;
  };
};

@UseGuards(ApiKeyGuard)
@Controller('actasexamenubicacion')
export class ActasexamenubicacionController {
  constructor(
    private readonly actasexamenubicacionService: ActasexamenubicacionService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('gestionar_examen_ubicacion')
  create(
    @Body() createDto: CreateActasexamenubicacionDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<ActaExamenUbicacionResponseDto> {
    return this.actasexamenubicacionService.create(createDto, {
      usuarioId: request.user.id,
      email: request.user.email,
      rol: request.user.rol,
    });
  }

  @Get()
  findAll(): Promise<ActaExamenUbicacionResponseDto[]> {
    return this.actasexamenubicacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ActaExamenUbicacionResponseDto> {
    return this.actasexamenubicacionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ deprecated: true })
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('gestionar_examen_ubicacion')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateActasexamenubicacionDto,
  ): never {
    return this.actasexamenubicacionService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ deprecated: true })
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('gestionar_examen_ubicacion')
  remove(@Param('id') id: string): never {
    return this.actasexamenubicacionService.remove(id);
  }
}
