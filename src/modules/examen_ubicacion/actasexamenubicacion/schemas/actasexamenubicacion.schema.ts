import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ActaExamenUbicacionDocument = HydratedDocument<ActaExamenUbicacion>;

@Schema({ _id: false })
export class AulaActa {
  @Prop({ type: Number, required: true })
  id: number;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  tipo: string;

  @Prop({ default: '' })
  ubicacion: string;
}

const AulaActaSchema = SchemaFactory.createForClass(AulaActa);

@Schema({ _id: false })
export class DocenteActa {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  nombres: string;

  @Prop({ required: true })
  apellidos: string;
}

const DocenteActaSchema = SchemaFactory.createForClass(DocenteActa);

@Schema({ _id: false })
export class IdiomaActa {
  @Prop({ type: Number, required: true })
  id: number;

  @Prop({ required: true })
  nombre: string;
}

const IdiomaActaSchema = SchemaFactory.createForClass(IdiomaActa);

@Schema({ _id: false })
export class GeneradoPorActa {
  @Prop({ required: true })
  usuarioId: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  rol: string;
}

const GeneradoPorActaSchema = SchemaFactory.createForClass(GeneradoPorActa);

@Schema({ _id: false })
export class ParticipanteActa {
  @Prop({ type: Number, required: true })
  detalleId: number;

  @Prop({ required: true })
  estudianteId: string;

  @Prop({ type: Number, required: true })
  solicitudId: number;

  @Prop({ required: true })
  numeroVoucher: string;

  @Prop({ required: true })
  tipoDocumento: string;

  @Prop({ required: true })
  dni: string;

  @Prop({ required: true })
  apellidos: string;

  @Prop({ required: true })
  nombres: string;

  @Prop({ type: Number, required: true })
  nivelId: number;

  @Prop({ required: true })
  nivel: string;

  @Prop({ type: Number, required: true })
  calificacionId: number;

  @Prop({ type: Number, required: true })
  cicloId: number;

  @Prop({ required: true })
  ciclo: string;

  @Prop({ required: true })
  cicloCodigo: string;

  @Prop({ type: Number, required: true, min: 0, max: 100 })
  nota: number;

  @Prop({ required: true })
  ubicacion: string;

  @Prop({ type: Boolean, required: true })
  terminado: boolean;
}

const ParticipanteActaSchema = SchemaFactory.createForClass(ParticipanteActa);

@Schema({
  collection: 'actas_examen_ubicacion',
  timestamps: { createdAt: 'creado_en', updatedAt: 'modificado_en' },
})
export class ActaExamenUbicacion {
  @Prop({ type: Number, required: true, default: 2 })
  schemaVersion: number;

  @Prop({ type: Number, required: true })
  examenId: number;

  @Prop({ required: true })
  codigo: string;

  @Prop({ type: Date, required: true })
  fecha: Date;

  @Prop({ required: true })
  estadoExamen: string;

  @Prop({ required: true })
  salon: string;

  @Prop({ required: true })
  docente: string;

  @Prop({ required: true })
  idioma: string;

  @Prop({ type: AulaActaSchema, required: true })
  aula: AulaActa;

  @Prop({ type: DocenteActaSchema, required: true })
  docenteDetalle: DocenteActa;

  @Prop({ type: IdiomaActaSchema, required: true })
  idiomaDetalle: IdiomaActa;

  @Prop({ type: GeneradoPorActaSchema, required: true })
  generadoPor: GeneradoPorActa;

  @Prop({ type: [ParticipanteActaSchema], default: [] })
  participantes: ParticipanteActa[];
}

export const ActaExamenUbicacionSchema =
  SchemaFactory.createForClass(ActaExamenUbicacion);

ActaExamenUbicacionSchema.index(
  { examenId: 1 },
  {
    unique: true,
    partialFilterExpression: { examenId: { $type: 'number' } },
  },
);
