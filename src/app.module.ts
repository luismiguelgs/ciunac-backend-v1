import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { EscuelasModule } from './modules/auxiliares/escuelas/escuelas.module';
import { ModulosModule } from './modules/estructura/modulos/modulos.module';
import { FacultadesModule } from './modules/auxiliares/facultades/facultades.module';
import { EstudiantesModule } from './modules/principales/estudiantes/estudiantes.module';
import { UsuariosModule } from './modules/usuarios/usuarios/usuarios.module';
import { IdiomasModule } from './modules/estructura/idiomas/idiomas.module';
import { DocentesModule } from './modules/principales/docentes/docentes.module';
import { NivelesModule } from './modules/estructura/niveles/niveles.module';
import { CiclosModule } from './modules/estructura/ciclos/ciclos.module';
import { GruposModule } from './modules/estructura/grupos/grupos.module';
import { AulasModule } from './modules/estructura/aulas/aulas.module';
import { EvaluacionesModule } from './modules/calificaciones/evaluaciones/evaluaciones.module';
import { NotasModule } from './modules/calificaciones/notas/notas.module';
import { NotasfinalModule } from './modules/calificaciones/notasfinal/notasfinal.module';
import { TipossolicitudModule } from './modules/administrativas/tipossolicitud/tipossolicitud.module';
import { EstadosModule } from './modules/auxiliares/estados/estados.module';
import { SolicitudesModule } from './modules/administrativas/solicitudes/solicitudes.module';
import { ExamenesubicacionModule } from './modules/examen_ubicacion/examenesubicacion/examenesubicacion.module';
import { CalificacionesubicacionModule } from './modules/examen_ubicacion/calificacionesubicacion/calificacionesubicacion.module';
import { DetallesubicacionModule } from './modules/examen_ubicacion/detallesubicacion/detallesubicacion.module';
import { CronogramaubicacionModule } from './modules/examen_ubicacion/cronogramaubicacion/cronogramaubicacion.module';
import { TextosModule } from './modules/auxiliares/textos/textos.module';
import { ActanotasModule } from './modules/calificaciones/actanotas/actanotas.module';
import { ActasexamenubicacionModule } from './modules/examen_ubicacion/actasexamenubicacion/actasexamenubicacion.module';
import { SolicitudbecasModule } from './modules/administrativas/solicitudbecas/solicitudbecas.module';
import { ConstanciasModule } from './modules/administrativas/constancias/constancias.module';
import { CertificadosModule } from './modules/administrativas/certificados/certificados.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from './modules/usuarios/auth/auth.module';
import { UploadModule } from './shared/upload/upload.module';
import { MailerModule } from './shared/mailer/mailer.module';
import { Q10Module } from './q10/q10.module';
import { PerfilDocenteModule } from './modules/seguimiento_docente/perfil_docente/perfil_docente.module';
import { TipoDocumentoPerfilModule } from './modules/seguimiento_docente/tipo_documento_perfil/tipo_documento_perfil.module';
import { DocumentosDocenteModule } from './modules/seguimiento_docente/documentos_docente/documentos_docente.module';
import { AcademicoAdministrativoModule } from './modules/seguimiento_docente/academico_administrativo/academico_administrativo.module';
import { PuntajeAcademicoAdministrativoModule } from './modules/seguimiento_docente/puntaje_academico_administrativo/puntaje_academico_administrativo.module';
import { CumplimientoDocenteModule } from './modules/seguimiento_docente/cumplimiento_docente/cumplimiento_docente.module';
import { EncuestaPreguntasModule } from './modules/seguimiento_docente/encuesta_preguntas/encuesta_preguntas.module';
import { EncuestaRespuestasModule } from './modules/seguimiento_docente/encuesta_respuestas/encuesta_respuestas.module';
import { EncuestaRespuestasDetalleModule } from './modules/seguimiento_docente/encuesta_respuestas_detalle/encuesta_respuestas_detalle.module';
import { EncuestaMetricasDocenteModule } from './modules/seguimiento_docente/encuesta_metricas_docente/encuesta_metricas_docente.module';
import { PerfilDocenteResultadosModule } from './modules/seguimiento_docente/perfil_docente_resultados/perfil_docente_resultados.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: '.env',
			isGlobal: true,
		}),
		PassportModule,
		JwtModule.register({
			secret: process.env.JWT_ACCESS_SECRET,
			signOptions: { expiresIn: '60m' },
		}),
		// PostgreSQL con TypeORM
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				type: 'postgres',
				host: config.get('POSTGRES_HOST'),
				port: +(config.get<number>('POSTGRES_PORT') ?? 5432),
				username: config.get('POSTGRES_USER'),
				password: config.get('POSTGRES_PASSWORD'),
				database: config.get('POSTGRES_DB'),
				autoLoadEntities: true,
				synchronize: false, // true solo si no tienes datos reales
			}),
		}),
		// MongoDB connection
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				uri: config.get<string>('MONGO_URI'),
			}),
		}),
		EscuelasModule,
		UsuariosModule,
		ModulosModule,
		FacultadesModule,
		EstudiantesModule,
		EscuelasModule,
		IdiomasModule,
		DocentesModule,
		NivelesModule,
		CiclosModule,
		GruposModule,
		AulasModule,
		EvaluacionesModule,
		NotasModule,
		NotasfinalModule,
		TipossolicitudModule,
		EstadosModule,
		SolicitudesModule,
		ExamenesubicacionModule,
		CalificacionesubicacionModule,
		DetallesubicacionModule,
		CronogramaubicacionModule,
		TextosModule,
		ActanotasModule,
		ActasexamenubicacionModule,
		SolicitudbecasModule,
		ConstanciasModule,
		CertificadosModule,
		AuthModule,
		UploadModule,
		MailerModule,
		Q10Module,
		PerfilDocenteModule,
		TipoDocumentoPerfilModule,
		DocumentosDocenteModule,
		AcademicoAdministrativoModule,
		PuntajeAcademicoAdministrativoModule,
		CumplimientoDocenteModule,
		CumplimientoDocenteModule,
		EncuestaPreguntasModule,
		EncuestaRespuestasModule,
		EncuestaRespuestasDetalleModule,
		EncuestaMetricasDocenteModule,
		PerfilDocenteResultadosModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }
