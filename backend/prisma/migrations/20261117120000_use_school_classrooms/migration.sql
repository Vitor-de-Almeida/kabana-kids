-- Turmas reais da escola (D46). Sem dados reais ainda:
-- os valores antigos "toddler" e "preschool" viram "undecided".
ALTER TYPE "DesiredClassroom" RENAME TO "DesiredClassroom_old";

CREATE TYPE "DesiredClassroom" AS ENUM ('nursery', 'infant1', 'infant2', 'infant3', 'infant4', 'infant5', 'grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'undecided');

ALTER TABLE "waitlist_entries"
  ALTER COLUMN "desired_classroom" TYPE "DesiredClassroom"
  USING (
    CASE
      WHEN "desired_classroom"::text IN ('toddler', 'preschool') THEN 'undecided'
      ELSE "desired_classroom"::text
    END
  )::"DesiredClassroom";

DROP TYPE "DesiredClassroom_old";
