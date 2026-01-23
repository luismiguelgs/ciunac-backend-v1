import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CertificadoDocument = Certificado & Document;

export enum TipoCertificado {
  FISICO = 'FISICO',
  VIRTUAL = 'VIRTUAL',
}
export enum Modalidad {
  INTENSIVO = 'C.I.',
  REGULAR = 'C.R.',
  EXAMEN = 'EX.U.'
}

export class NotaCertificado {
  @Prop({ required: true })
  ciclo: string;

  @Prop({ required: true })
  periodo: string;

  @Prop({ required: true })
  modalidad: Modalidad;

  @Prop({ required: true })
  nota: number;
}

@Schema({
    collection: 'certificados',
    timestamps: { createdAt: 'creado_en', updatedAt: 'modificado_en' },
})
export class Certificado {

  @Prop({ type: MongooseSchema.Types.Mixed }) 
  _id: any;

  @Prop({ type: String, enum: TipoCertificado, required: true })
  tipo: TipoCertificado;

  @Prop({ required: true })
  periodo: string;

  @Prop({ required: true })
  estudiante: string;

  @Prop({ required: true })
  numeroDocumento: string;

  @Prop({ required : true})
  idiomaId: number

  @Prop({ required: true })
  idioma: string;

  @Prop({ required: true })
  nivel: string;

  @Prop({ required: true})
  nivelId: number;

  @Prop({ required: true, name: 'cantidad_horas' })
  cantidadHoras: number;

  @Prop({ type: Number, required: true, name: 'solicitud_id' })
  solicitudId: number; // referencia al sistema transaccional (Postgres)

  @Prop({ required: true, name: 'fecha_emision' })
  fechaEmision: Date;

  @Prop({ required: true, name: 'numero_registro' })
  numeroRegistro: string;

  @Prop({ required: true, name: 'fecha_concluido' })
  fechaConcluido: Date;

  @Prop({ default: false, name: 'curricula_anterior' })
  curriculaAnterior: boolean;

  @Prop({ default: false })
  impreso: boolean;

  @Prop({ default: false })
  duplicado: boolean;

  @Prop({ name: 'certificado_original' })
  certificadoOriginal: string;

  @Prop({ required: true, name: 'elaborado_por' })
  elaboradoPor: string;

  @Prop({ default: null })
  url: string;

  @Prop({ default: false })
  aceptado: boolean;

  @Prop({ required: false, name: 'fecha_aceptacion', type: Date })
  fechaAceptacion: Date;

  @Prop({ type: [NotaCertificado], default: [], name: 'notas' })
  notas: NotaCertificado[];
}

export const CertificadoSchema = SchemaFactory.createForClass(Certificado);



