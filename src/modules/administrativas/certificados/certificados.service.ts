import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SolicitudEstadoId } from 'src/modules/administrativas/solicitudes/constants/solicitud-estado.constants';
import { SolicitudesService } from 'src/modules/administrativas/solicitudes/solicitudes.service';
import {
  UploadResult,
  UploadService,
} from 'src/shared/upload/upload.service';
import { CreateCertificadoDto } from './dto/create-certificado.dto';
import { UpdateCertificadoDto } from './dto/update-certificado.dto';
import {
  Certificado,
  CertificadoDocument,
} from './schemas/certificado.schema';

export interface ProcesarFirmaCertificadoResult {
  success: true;
  fileId: string;
  name: string;
  viewLink: string;
  originalTrashed: boolean;
  warning?: string;
}

export interface SubirArchivoCertificadoResult extends UploadResult {
  success: true;
}

@Injectable()
export class CertificadosService {
  private readonly logger = new Logger(CertificadosService.name);

  constructor(
    @InjectModel(Certificado.name)
    private readonly certificadoModel: Model<CertificadoDocument>,
    private readonly uploadService: UploadService,
    private readonly solicitudesService: SolicitudesService,
  ) {}

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

  async create(createCertificadoDto: CreateCertificadoDto): Promise<Certificado> {
    const created = new this.certificadoModel(createCertificadoDto);
    if (!created._id) {
      created._id = new Types.ObjectId();
    }
    const doc = await created.save();
    return this.mapId(doc.toObject());
  }

  async findAll(): Promise<Certificado[]> {
    const certificados = await this.certificadoModel.find().lean().exec();
    return certificados.map((certificado) => this.mapId(certificado));
  }

  async findPendientes(): Promise<Certificado[]> {
    return this.findByState({ impreso: false, aceptado: false });
  }

  async findFirmados(): Promise<Certificado[]> {
    return this.findByState({ impreso: true, aceptado: false });
  }

  async findAceptados(): Promise<Certificado[]> {
    return this.findByState({ impreso: true, aceptado: true });
  }

  async findBySolicitudId(solicitudId: number): Promise<Certificado | null> {
    const certificado = await this.certificadoModel
      .findOne({ solicitudId })
      .lean()
      .exec();
    return this.mapId(certificado);
  }

  async findByImpreso(impreso: boolean): Promise<Certificado[]> {
    const certificados = await this.certificadoModel
      .find({ impreso })
      .sort({ fechaEmision: -1 })
      .lean()
      .exec();
    return certificados.map((certificado) => this.mapId(certificado));
  }

  async findOne(id: string): Promise<Certificado | null> {
    const certificado = await this.certificadoModel
      .findOne(this.buildIdQuery(id))
      .lean()
      .exec();
    return this.mapId(certificado);
  }

  async update(
    id: string,
    updateCertificadoDto: UpdateCertificadoDto,
  ): Promise<Certificado | null> {
    const updated = await this.certificadoModel
      .findOneAndUpdate(this.buildIdQuery(id), updateCertificadoDto, {
        new: true,
      })
      .lean()
      .exec();
    return this.mapId(updated);
  }

  async subirArchivo(
    certificadoId: string,
    file: Express.Multer.File | undefined,
    fileId?: string,
  ): Promise<SubirArchivoCertificadoResult> {
    if (!file) {
      throw new BadRequestException('No se ha enviado ningun archivo');
    }
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('El archivo del certificado debe ser PDF');
    }

    const certificado = await this.findOne(certificadoId);
    if (!certificado) {
      throw new NotFoundException(
        `Certificado ${certificadoId} no encontrado`,
      );
    }

    const currentFileId =
      this.sanitizeFileId(fileId) || this.sanitizeFileId(certificado.driveId);
    const result = await this.uploadService.uploadToDrive(
      file,
      'CERTIFICADOS',
      `${certificadoId}-${certificado.estudiante}`,
      currentFileId,
    );
    const updated = await this.certificadoModel
      .findOneAndUpdate(
        this.buildIdQuery(certificadoId),
        { driveId: result.id },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(
        `Certificado ${certificadoId} no encontrado durante la actualizacion`,
      );
    }

    return { success: true, ...result };
  }

  async procesarFirma(
    certificadoId: string,
    fileId: string | undefined,
    solicitudId?: number,
    signedFileId?: string,
  ): Promise<ProcesarFirmaCertificadoResult> {
    const certificado = await this.findOne(certificadoId);
    if (!certificado) {
      throw new NotFoundException(
        `Certificado ${certificadoId} no encontrado`,
      );
    }

    const persistedSolicitudId = certificado.solicitudId;
    if (!persistedSolicitudId) {
      throw new BadRequestException(
        'El certificado no tiene una solicitud asociada',
      );
    }
    if (solicitudId !== undefined && solicitudId !== persistedSolicitudId) {
      throw new BadRequestException(
        `La solicitud ${solicitudId} no corresponde al certificado ${certificadoId}`,
      );
    }

    const solicitud =
      await this.solicitudesService.findOne(persistedSolicitudId);
    if (!solicitud) {
      throw new NotFoundException(
        `Solicitud ${persistedSolicitudId} no encontrada`,
      );
    }

    const storedDriveId = this.sanitizeFileId(certificado.driveId);
    const storedOriginalDriveId = this.sanitizeFileId(
      certificado.driveIdOriginal,
    );
    const originalFileId =
      storedOriginalDriveId || storedDriveId || this.sanitizeFileId(fileId);
    if (!originalFileId) {
      throw new BadRequestException(
        'El certificado no tiene un driveId asociado',
      );
    }

    const repositoryFolderId =
      await this.uploadService.getCertificatePeriodFolderId(
        certificado.periodo,
      );
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
        repositoryFolderId,
      );
    const driveResult = await this.uploadService.moveFileToRepository(
      signedFile.id,
      repositoryFolderId,
    );

    const query = this.buildIdQuery(certificadoId);
    const originalToTrashId =
      originalFile.id !== driveResult.id
        ? originalFile.id
        : storedOriginalDriveId;
    const cleanupAlreadyDone = Boolean(
      certificado.originalTrashed &&
        originalToTrashId &&
        storedOriginalDriveId === originalToTrashId,
    );
    const noOriginalToTrash =
      !originalToTrashId || originalToTrashId === driveResult.id;
    const initialOriginalTrashed = cleanupAlreadyDone || noOriginalToTrash;
    const signedFileUrl = `https://drive.google.com/uc?export=download&id=${driveResult.id}`;
    const previousCertificadoState = {
      impreso: certificado.impreso,
      driveId: certificado.driveId ?? null,
      url: certificado.url,
      driveIdOriginal: certificado.driveIdOriginal ?? null,
      originalTrashed: certificado.originalTrashed ?? false,
    };

    const updatedCertificado = await this.certificadoModel
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

    if (!updatedCertificado) {
      throw new NotFoundException(
        `Certificado ${certificadoId} no encontrado durante la actualizacion`,
      );
    }

    try {
      const updatedSolicitud = await this.solicitudesService.update(
        persistedSolicitudId,
        { estadoId: SolicitudEstadoId.TERMINADO },
      );
      if (!updatedSolicitud) {
        throw new NotFoundException(
          `Solicitud ${persistedSolicitudId} no encontrada durante la actualizacion`,
        );
      }
    } catch (error) {
      await this.restoreCertificadoAfterSolicitudFailure(
        query,
        previousCertificadoState,
        certificadoId,
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
          'El certificado firmado fue procesado, pero no se pudo enviar el archivo original a la papelera';
        this.logger.warn(`${warning}: ${this.getErrorMessage(error)}`);
      }

      if (originalTrashed) {
        try {
          const cleanupRecorded = await this.certificadoModel
            .findOneAndUpdate(query, { originalTrashed: true }, { new: true })
            .exec();
          if (!cleanupRecorded) {
            throw new Error(
              'El certificado no fue encontrado al registrar la limpieza',
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

  async remove(id: string): Promise<Certificado | null> {
    const deleted = await this.certificadoModel
      .findOneAndDelete({ _id: id })
      .lean()
      .exec();
    return this.mapId(deleted);
  }

  private async findByState(
    state: Record<string, boolean>,
  ): Promise<Certificado[]> {
    const certificados = await this.certificadoModel
      .find(state)
      .sort({ fechaEmision: -1 })
      .lean()
      .exec();
    return certificados.map((certificado) => this.mapId(certificado));
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

  private async restoreCertificadoAfterSolicitudFailure(
    query: Record<string, unknown>,
    previousState: Record<string, unknown>,
    certificadoId: string,
    originalError: unknown,
  ): Promise<void> {
    try {
      const restored = await this.certificadoModel
        .findOneAndUpdate(query, previousState, { new: true })
        .exec();
      if (!restored) {
        throw new Error(
          'El certificado no fue encontrado durante la compensacion',
        );
      }
    } catch (compensationError) {
      this.logger.error(
        `No se pudo revertir el certificado ${certificadoId} despues de fallar PostgreSQL. ` +
          `Error original: ${this.getErrorMessage(originalError)}. ` +
          `Error de compensacion: ${this.getErrorMessage(compensationError)}`,
      );
      throw new InternalServerErrorException(
        'Fallo la actualizacion de la solicitud y no se pudo revertir el certificado',
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
