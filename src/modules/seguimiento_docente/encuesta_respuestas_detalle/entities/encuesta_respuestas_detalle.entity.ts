import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EncuestaRespuesta } from '../../encuesta_respuestas/entities/encuesta_respuesta.entity';
import { EncuestaPregunta } from '../../encuesta_preguntas/entities/encuesta_pregunta.entity';

@Entity('encuesta_respuestas_detalle')
export class EncuestaRespuestasDetalle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'encuesta_id', type: 'int', nullable: false })
    encuestaId: number;

    @Column({ name: 'pregunta_id', type: 'int', nullable: false })
    preguntaId: number;

    @Column({ name: 'valor_texto', type: 'varchar', nullable: false })
    valorTexto: string;

    @Column({ name: 'valor_numero', type: 'int', nullable: false })
    valorNumero: number;

    // Relaciones
    @ManyToOne(() => EncuestaRespuesta, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'encuesta_id' })
    encuesta: EncuestaRespuesta;

    @ManyToOne(() => EncuestaPregunta)
    @JoinColumn({ name: 'pregunta_id' })
    pregunta: EncuestaPregunta;
}

