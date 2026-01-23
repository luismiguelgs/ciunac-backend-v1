import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ 
    collection: 'actas_notas', 
    timestamps: { createdAt: 'creado_en', updatedAt: 'modificado_en' } 
})
export class ActaNota extends Document {
    @Prop({ type: Number, required: true }) // 🔗 ID de grupo en PostgreSQL
    grupo_id: number; 

    @Prop()
    docente_id: string;   // UUID de Postgres
    
    @Prop()
    docente_nombre: string; // Snapshot del nombre

    @Prop({ required: true })
    periodo: string;

    @Prop({ type: Date })
    fecha_cierre: Date;

    @Prop({
        type: [
        {
            dni: { type: String, required: true },
            estudiante: { type: String, required: true },
            nota_final: { type: Number, required: true },
            aprobado: { type: Boolean, required: true },
        },
        ],
        default: [],
    })
    notas: {
        dni: string;
        estudiante: string;
        nota_final: number;
        aprobado: boolean;
    }[];
}

export const ActaNotaSchema = SchemaFactory.createForClass(ActaNota);