-- Separada da anterior: o PostgreSQL só usa o valor novo
-- de um enum ('manager') depois que a migration que o criou termina.

-- O admin mais antigo vira o dono; outros admins viram gerentes (D40)
UPDATE "users" SET "is_owner" = true
WHERE "id" = (SELECT "id" FROM "users" WHERE "role" = 'admin' ORDER BY "created_at" LIMIT 1);
UPDATE "users" SET "role" = 'manager' WHERE "role" = 'admin' AND "is_owner" IS NULL;

-- admin e dono andam juntos; is_owner só aceita true ou NULL
ALTER TABLE "users" ADD CONSTRAINT "users_owner_is_admin" CHECK (("role" = 'admin') = ("is_owner" IS TRUE));
ALTER TABLE "users" ADD CONSTRAINT "users_is_owner_true_or_null" CHECK ("is_owner" IS NULL OR "is_owner");

-- O dono não é removido nem rebaixado por nenhum caminho (D40)
CREATE FUNCTION protect_owner() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.is_owner THEN
      RAISE EXCEPTION 'O dono da escola não pode ser removido';
    END IF;
    RETURN OLD;
  END IF;
  IF OLD.is_owner AND NEW.is_owner IS NOT TRUE THEN
    RAISE EXCEPTION 'O dono da escola não pode ser rebaixado';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_protect_owner BEFORE UPDATE OR DELETE ON "users"
FOR EACH ROW EXECUTE FUNCTION protect_owner();

-- Histórico (auditoria e logins): ninguém altera; só apaga após 10 anos (D44)
CREATE FUNCTION protect_history() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'Registros de histórico não podem ser alterados';
  END IF;
  IF OLD.created_at > (now() AT TIME ZONE 'UTC') - interval '10 years' THEN
    RAISE EXCEPTION 'Registros de histórico só podem ser apagados depois de 10 anos';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_logs_protect_history BEFORE UPDATE OR DELETE ON "audit_logs"
FOR EACH ROW EXECUTE FUNCTION protect_history();

CREATE TRIGGER login_events_protect_history BEFORE UPDATE OR DELETE ON "login_events"
FOR EACH ROW EXECUTE FUNCTION protect_history();
