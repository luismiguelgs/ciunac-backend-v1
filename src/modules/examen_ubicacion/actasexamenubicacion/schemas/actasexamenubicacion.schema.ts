import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActaExamenUbicacionDocument = ActaExamenUbicacion & Document;

class Participante {
  @Prop({ required: true })
  dni: string;

  @Prop({ required: true })
  apellidos: string;

  @Prop({ required: true })
  nombres: string;

  @Prop({ required: true })
  nivel: string;

  @Prop({ required: true, min: 0, max: 100 })
  nota: number;

  @Prop({ required: true })
  ubicacion: string;

  @Prop({ default: false })
  terminado: boolean;
}

@Schema({ collection: 'actas_examen_ubicacion', timestamps: { createdAt: 'creado_en', updatedAt: 'modificado_en' } })
export class ActaExamenUbicacion {
  @Prop({ required: true })
  codigo: string;

  @Prop({ type: Date, required: true })
  fecha: Date;

  @Prop({ required: true })
  salon: string;

  @Prop({ required: true })
  docente: string;

  @Prop({ required: true })
  idioma: string;

  @Prop({ type: [Participante], default: [] })
  participantes: Participante[];
}

export const ActaExamenUbicacionSchema = SchemaFactory.createForClass(ActaExamenUbicacion);
