-- Ejecutar antes de desplegar el backend que mapea escuelas.tipo.
-- No asigna tipos a escuelas historicas ni modifica estudiantes.tipo_estudiante.
BEGIN;

ALTER TABLE public.escuelas
    ADD COLUMN IF NOT EXISTS tipo VARCHAR(3);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'public.escuelas'::regclass
          AND conname = 'escuelas_tipo_check'
    ) THEN
        ALTER TABLE public.escuelas
            ADD CONSTRAINT escuelas_tipo_check
            CHECK (tipo IN ('PRE', 'POS'));
    END IF;
END
$$;

COMMIT;

-- Verificacion de la columna, restriccion y pendientes de clasificacion.
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'escuelas'
  AND column_name = 'tipo';

SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.escuelas'::regclass
  AND conname = 'escuelas_tipo_check';

SELECT COUNT(*) AS escuelas_sin_clasificar
FROM public.escuelas
WHERE tipo IS NULL;
