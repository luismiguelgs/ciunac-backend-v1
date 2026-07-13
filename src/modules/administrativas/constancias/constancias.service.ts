import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateConstanciaDto } from './dto/create-constancia.dto';
import { UpdateConstanciaDto } from './dto/update-constancia.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Constancia, ConstanciaDocument } from './schemas/constancia.schema';
import { Model, Types } from 'mongoose';
import { UploadService } from 'src/shared/upload/upload.service';
import { SolicitudesService } from '../solicitudes/solicitudes.service';
import { SolicitudEstadoId } from '../solicitudes/constants/solicitud-estado.constants';

export interface ProcesarFirmaResult {
  success: true;
  fileId: string;
  name: string;
  viewLink: string;
  originalTrashed: boolean;
  warning?: string;
}

@Injectable()
export class ConstanciasService {
  private readonly logger = new Logger(ConstanciasService.name);

  constructor(
    @InjectModel(Constancia.name)
    private constanciaModel: Model<ConstanciaDocument>,
    @Inject(forwardRef(() => UploadService))
    private readonly uploadService: UploadService,
    private readonly solicitudesService: SolicitudesService,
  ) {}

  // Funcion auxiliar para normalizar el ID
  private mapId(doc: any) {
    if (!doc) return null;

    if (Array.isArray(doc)) {
      return doc.map((item) => this.mapId(item));
    }

    const idString = doc._id ? doc._id.toString() : null;

    return {
      ...doc,
      _id: idString,
      id: idString,
    };
  }

  async create(createConstanciaDto: CreateConstanciaDto): Promise<Constancia> {
    const created = new this.constanciaModel(createConstanciaDto);
    if (!created._id) {
      created._id = new Types.ObjectId();
    }
    const doc = await created.save();
    return this.mapId(doc.toObject());
  }

  async findAll(): Promise<Constancia[]> {
    const constancias = await this.constanciaModel.find().lean().exec();
    return constancias.map((constancia) => this.mapId(constancia));
  }

  async findPendientes(): Promise<Constancia[]> {
    const constancias = await this.constanciaModel
      .find({ impreso: false, aceptado: false })
      .sort({ creadoEn: -1 })
      .lean()
      .exec();
    return constancias.map((constancia) => this.mapId(constancia));
  }

  async findByImpreso(): Promise<Constancia[]> {
    const constancias = await this.constanciaModel
      .find({ impreso: true, aceptado: false })
      .sort({ creadoEn: -1 })
      .lean()
      .exec();
    return constancias.map((constancia) => this.mapId(constancia));
  }

  async findByAceptado(): Promise<Constancia[]> {
    const constancias = await this.constanciaModel
      .find({ impreso: true, aceptado: true })
      .sort({ creadoEn: -1 })
      .lean()
      .exec();
    return constancias.map((constancia) => this.mapId(constancia));
  }

  async findBySolicitudId(solicitudId: number): Promise<Constancia | null> {
    const constancia = await this.constanciaModel
      .findOne({ id_solicitud: solicitudId })
      .lean()
      .exec();

    return this.mapId(constancia);
  }

  async findOne(id: string): Promise<Constancia | null> {
    const criterios: any = [];
    criterios.push({ _id: id });

    if (Types.ObjectId.isValid(id)) {
      criterios.push({ _id: new Types.ObjectId(id) });
    }

    const constancia = await this.constanciaModel
      .findOne({ $or: criterios })
      .lean()
      .exec();

    if (!constancia) return null;

    return this.mapId(constancia);
  }

  async update(
    id: string,
    updateConstanciaDto: UpdateConstanciaDto,
  ): Promise<Constancia | null> {
    const query = {
      $or: [
        { _id: id },
        ...(Types.ObjectId.isValid(id)
          ? [{ _id: new Types.ObjectId(id) }]
          : []),
      ],
    };

    const updated = await this.constanciaModel
      .findOneAndUpdate(query, updateConstanciaDto, { new: true })
      .lean()
      .exec();

    if (!updated) return null;

    return this.mapId(updated);
  }

  async remove(id: string): Promise<Constancia | null> {
    const deleted = await this.constanciaModel
      .findOneAndDelete({ _id: id })
      .lean()
      .exec();
    return this.mapId(deleted);
  }

  async procesarFirma(
    constanciaId: string,
    fileId: string | undefined,
    solicitudId?: number,
    signedFileId?: string,
  ): Promise<ProcesarFirmaResult> {
    const constancia = await this.findOne(constanciaId);
    if (!constancia) {
      throw new NotFoundException(`Constancia ${constanciaId} no encontrada`);
    }

    const persistedSolicitudId = constancia.id_solicitud;
    if (!persistedSolicitudId) {
      throw new BadRequestException(
        'La constancia no tiene una solicitud asociada',
      );
    }
    if (solicitudId !== undefined && solicitudId !== persistedSolicitudId) {
      throw new BadRequestException(
        `La solicitud ${solicitudId} no corresponde a la constancia ${constanciaId}`,
      );
    }

    const solicitud =
      await this.solicitudesService.findOne(persistedSolicitudId);
    if (!solicitud) {
      throw new NotFoundException(
        `Solicitud ${persistedSolicitudId} no encontrada`,
      );
    }

    const storedDriveId = this.sanitizeFileId(constancia.driveId);
    const storedOriginalDriveId = this.sanitizeFileId(
      constancia.driveIdOriginal,
    );
    const originalFileId =
      storedOriginalDriveId || storedDriveId || this.sanitizeFileId(fileId);
    if (!originalFileId) {
      throw new BadRequestException(
        'La constancia no tiene un driveId asociado',
      );
    }

    const retrySignedFileId =
      storedOriginalDriveId &&
      storedDriveId &&
      storedOriginalDriveId !== storedDriveId
        ? storedDriveId
        : undefined;
    const resolvedSignedFileId =
      this.sanitizeFileId(signedFileId) || retrySignedFileId;
    const { originalFile, signedFile } =
      await this.uploadService.findSignedVersion(
        originalFileId,
        resolvedSignedFileId,
      );
    const driveResult = await this.uploadService.moveFileToRepository(
      signedFile.id,
    );
    const query = this.buildIdQuery(constanciaId);
    const originalToTrashId =
      originalFile.id !== driveResult.id
        ? originalFile.id
        : storedOriginalDriveId;
    const cleanupAlreadyDone = Boolean(
      constancia.originalTrashed &&
        originalToTrashId &&
        storedOriginalDriveId === originalToTrashId,
    );
    const noOriginalToTrash =
      !originalToTrashId || originalToTrashId === driveResult.id;
    const initialOriginalTrashed = cleanupAlreadyDone || noOriginalToTrash;
    const signedFileUrl = `https://drive.google.com/uc?export=download&id=${driveResult.id}`;
    const previousConstanciaState = {
      impreso: constancia.impreso,
      driveId: constancia.driveId ?? null,
      url: constancia.url,
      driveIdOriginal: constancia.driveIdOriginal ?? null,
      originalTrashed: constancia.originalTrashed ?? false,
    };

    const updatedConstancia = await this.constanciaModel
      .findOneAndUpdate(
        query,
        {
          impreso: true,
          driveId: driveResult.id,
          url: signedFileUrl,
          driveIdOriginal: originalToTrashId ?? null,
          originalTrashed: initialOriginalTrashed,
        },
        { new: true },
      )
      .exec();

    if (!updatedConstancia) {
      throw new NotFoundException(
        `Constancia ${constanciaId} no encontrada durante la actualizacion`,
      );
    }

    try {
      const updatedSolicitud = await this.solicitudesService.update(
        persistedSolicitudId,
        {
          estadoId: SolicitudEstadoId.FIRMADA,
        },
      );
      if (!updatedSolicitud) {
        throw new NotFoundException(
          `Solicitud ${persistedSolicitudId} no encontrada durante la actualizacion`,
        );
      }
    } catch (error) {
      await this.restoreConstanciaAfterSolicitudFailure(
        query,
        previousConstanciaState,
        constanciaId,
        error,
      );
      throw error;
    }

    let originalTrashed = initialOriginalTrashed;
    let warning: string | undefined;

    if (originalToTrashId && !initialOriginalTrashed) {
      try {
        await this.uploadService.trashFile(originalToTrashId);
        originalTrashed = true;
      } catch (error) {
        originalTrashed = false;
        warning =
          'La constancia firmada fue procesada, pero no se pudo enviar el archivo original a la papelera';
        this.logger.warn(`${warning}: ${this.getErrorMessage(error)}`);
      }

      if (originalTrashed) {
        try {
          const cleanupRecorded = await this.constanciaModel
            .findOneAndUpdate(query, { originalTrashed: true }, { new: true })
            .exec();
          if (!cleanupRecorded) {
            throw new Error(
              'La constancia no fue encontrada al registrar la limpieza',
            );
          }
        } catch (error) {
          warning =
            'El archivo original se envio a la papelera, pero no se pudo registrar la limpieza';
          this.logger.warn(`${warning}: ${this.getErrorMessage(error)}`);
        }
      }
    }

    return {
      success: true,
      fileId: driveResult.id,
      name: driveResult.name,
      viewLink: signedFileUrl,
      originalTrashed,
      ...(warning ? { warning } : {}),
    };
  }

  private buildIdQuery(id: string): Record<string, unknown> {
    return {
      $or: [
        { _id: id },
        ...(Types.ObjectId.isValid(id)
          ? [{ _id: new Types.ObjectId(id) }]
          : []),
      ],
    };
  }

  private async restoreConstanciaAfterSolicitudFailure(
    query: Record<string, unknown>,
    previousState: Record<string, unknown>,
    constanciaId: string,
    originalError: unknown,
  ): Promise<void> {
    try {
      const restored = await this.constanciaModel
        .findOneAndUpdate(query, previousState, { new: true })
        .exec();
      if (!restored) {
        throw new Error(
          'La constancia no fue encontrada durante la compensacion',
        );
      }
    } catch (compensationError) {
      this.logger.error(
        `No se pudo revertir la constancia ${constanciaId} despues de fallar PostgreSQL. ` +
          `Error original: ${this.getErrorMessage(originalError)}. ` +
          `Error de compensacion: ${this.getErrorMessage(compensationError)}`,
      );
      throw new InternalServerErrorException(
        'Fallo la actualizacion de la solicitud y no se pudo revertir la constancia',
      );
    }
  }

  private sanitizeFileId(fileId?: string): string | undefined {
    if (
      !fileId ||
      fileId === 'null' ||
      fileId === 'undefined' ||
      !fileId.trim()
    ) {
      return undefined;
    }
    return fileId.trim();
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
