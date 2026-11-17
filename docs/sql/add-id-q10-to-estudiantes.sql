-- Aplicar antes de desplegar la version del backend que escribe estudiantes.id_q10.
ALTER TABLE estudiantes
ADD COLUMN IF NOT EXISTS id_q10 varchar(100);

CREATE UNIQUE INDEX IF NOT EXISTS uq_estudiantes_id_q10
ON estudiantes (id_q10)
WHERE id_q10 IS NOT NULL;

-- Verificacion de la columna.
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'estudiantes'
  AND column_name = 'id_q10';

-- Verificacion del indice unico parcial.
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'estudiantes'
  AND indexname = 'uq_estudiantes_id_q10';
