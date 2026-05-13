import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type ConstanciaDocument = Constancia & Document;

export enum TipoConstancia {
	MATRICULA = 'MATRICULA',
	NOTAS = 'NOTAS',
}

export enum Modalidad {
	REGULAR = 'REGULAR',
	INTENSIVO = 'INTENSIVO',
}

export class DetalleConstancia {
	@Prop({ required: true })
	idioma: string;

	@Prop({ required: true })
	nivel: string;

	@Prop({ required: true })
	ciclo: string;

	@Prop({ type: String, enum: Modalidad, required: true })
	modalidad: Modalidad;

	@Prop({ required: true })
	mes: string;

	@Prop({ required: true })
	año: string;

	@Prop({ required: true })
	aprobado: boolean;

	@Prop({ required: true })
	nota: number;
}

@Schema({ collection: 'constancias', timestamps: { createdAt: 'creado_en', updatedAt: 'modificado_en' } })
export class Constancia {
	@Prop({ type: MongooseSchema.Types.Mixed })
	_id: any;

	@Prop({ type: String, enum: TipoConstancia, required: true })
	tipo: TipoConstancia;

	@Prop({ required: true })
	estudiante: string;

	@Prop({ required: true })
	dni: string;

	@Prop({ required: true })
	idioma: string;

	@Prop({ required: true })
	idiomaId: number;

	@Prop({ required: true })
	nivel: string;

	@Prop({ required: true })
	nivelId: number;

	@Prop({ required: true })
	ciclo: number;

	@Prop({ default: false })
	impreso: boolean;

	@Prop({ required: true })
	id_solicitud: number;

	@Prop()
	horario?: string;

	@Prop({ required: true })
	url: string;

	@Prop({ type: String, enum: Modalidad, required: true })
	modalidad: Modalidad;

	@Prop({ default: false })
	aceptado: boolean;

	@Prop({ required: false, name: 'fecha_aceptacion', type: Date })
	fechaAceptacion: Date;

	@Prop({ type: [DetalleConstancia], default: [] })
	detalle: DetalleConstancia[];

	@Prop({ type: String, default: null })
	driveId?: string;

	@Prop()
	creado_en: Date;

	@Prop()
	modificado_en: Date;
}

export const ConstanciaSchema = SchemaFactory.createForClass(Constancia);
