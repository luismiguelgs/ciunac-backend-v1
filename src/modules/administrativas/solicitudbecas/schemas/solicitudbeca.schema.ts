import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SolicitudBecaDocument = SolicitudBeca & Document;

export enum EstadoSolicitud {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
}

@Schema({ collection: 'solicitud_becas', timestamps: { createdAt: 'creado_en', updatedAt: 'modificado_en' } })
export class SolicitudBeca {
    @Prop({ required: true })
    nombres: string;

    @Prop({ required: true })
    apellidos: string;

    @Prop({required: true})
    telefono:string;

    @Prop({ required: true })
    tipo_documento: string;

    @Prop({ required: true })
    numero_documento: string;

    @Prop({ required: true })
    facultad: string;

    @Prop({ required: true })
    facultadId: string;

    @Prop({ required: true })
    escuela: string;

    @Prop({ required: true })
    escuelaId: string;

    @Prop({ required: true })
    codigo: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: false })
    direccion: string;

    @Prop({ required: true })
    periodo: string;

    @Prop({ required: true })
    carta_de_compromiso: string;

    @Prop({ required: true })
    historial_academico: string;

    @Prop({ required: true })
    constancia_matricula: string;

    @Prop({ required: true })
    contancia_tercio: string;

    @Prop({ required: true })
    declaracion_jurada: string;

    @Prop()
    observaciones?: string;

    @Prop({ type: String, enum: EstadoSolicitud, default: EstadoSolicitud.PENDIENTE })
    estado: EstadoSolicitud;
}

export const SolicitudBecaSchema = SchemaFactory.createForClass(SolicitudBeca);
