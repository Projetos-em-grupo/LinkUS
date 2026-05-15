CREATE OR REPLACE FUNCTION registrar_novo_participante()
RETURNS TRIGGER AS $$
DECLARE
  nome_usuario VARCHAR(150);
BEGIN
  SELECT nome INTO nome_usuario
  FROM usuario
  WHERE id_usuario = NEW.fk_participante;

  INSERT INTO mensagem (texto, fk_remetente, fk_grupo)
  VALUES (
    'Bem-vindo(a) ao grupo! Usuario ' || nome_usuario || ' agora faz parte do grupo.',
    NEW.fk_participante,
    NEW.fk_grupo
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_novo_participante ON participante;

CREATE TRIGGER after_novo_participante
AFTER INSERT ON participante
FOR EACH ROW
EXECUTE FUNCTION registrar_novo_participante();
