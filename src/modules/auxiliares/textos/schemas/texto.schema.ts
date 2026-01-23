import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ 
    collection: 'textos', 
    timestamps: { createdAt: 'creado_en', updatedAt: 'modificado_en' } 
})
export class Texto extends Document {
    @Prop({ required: true, unique: true })
    codigo: string;

    @Prop({ required: true })
    contenido: string;
}

export const TextoSchema = SchemaFactory.createForClass(Texto);