export const TIPOS_ESTUDIANTE = ['PRE', 'POS', 'PG'] as const;
export type TipoEstudiante = (typeof TIPOS_ESTUDIANTE)[number];

export const TIPOS_ESCUELA = ['PRE', 'POS'] as const;
export type TipoEscuela = (typeof TIPOS_ESCUELA)[number];
