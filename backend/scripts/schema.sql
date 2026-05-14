CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conexao_status') THEN
    CREATE TYPE conexao_status AS ENUM ('solicitado', 'aceito');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mensagem_status') THEN
    CREATE TYPE mensagem_status AS ENUM ('enviado', 'entregue', 'visualizado');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'participante_funcao') THEN
    CREATE TYPE participante_funcao AS ENUM ('admin', 'user');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'postagem_tipo_conteudo') THEN
    CREATE TYPE postagem_tipo_conteudo AS ENUM ('video', 'imagem');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interacao_tipo') THEN
    CREATE TYPE interacao_tipo AS ENUM ('like', 'dislike');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS interesse (
  id_interesse UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS usuario (
  id_usuario UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(150) NOT NULL UNIQUE,
  email VARCHAR(200) NOT NULL UNIQUE,
  senha VARCHAR(100) NOT NULL,
  url_foto VARCHAR(150),
  data_nascimento DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS usuario_interesse (
  fk_interesse UUID,
  fk_usuario UUID,
  PRIMARY KEY (fk_interesse, fk_usuario),
  FOREIGN KEY (fk_interesse) REFERENCES interesse(id_interesse),
  FOREIGN KEY (fk_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS conexao (
  usuario_1 UUID NOT NULL,
  usuario_2 UUID NOT NULL,
  status conexao_status DEFAULT 'solicitado',
  PRIMARY KEY (usuario_1, usuario_2),
  FOREIGN KEY (usuario_1) REFERENCES usuario(id_usuario),
  FOREIGN KEY (usuario_2) REFERENCES usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS grupo (
  id_grupo UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT NOT NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fk_criador UUID NOT NULL,
  FOREIGN KEY (fk_criador) REFERENCES usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS mensagem (
  id_mensagem UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  texto TEXT NOT NULL,
  data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status mensagem_status DEFAULT 'enviado',
  fk_destinatario UUID,
  fk_remetente UUID NOT NULL,
  fk_grupo UUID,
  FOREIGN KEY (fk_destinatario) REFERENCES usuario(id_usuario),
  FOREIGN KEY (fk_remetente) REFERENCES usuario(id_usuario),
  FOREIGN KEY (fk_grupo) REFERENCES grupo(id_grupo),
  CONSTRAINT um_preenchido CHECK (
    (fk_destinatario IS NOT NULL OR fk_grupo IS NOT NULL) AND
    (fk_destinatario IS NULL OR fk_grupo IS NULL)
  )
);

CREATE TABLE IF NOT EXISTS participante (
  fk_grupo UUID,
  fk_participante UUID,
  funcao participante_funcao DEFAULT 'user',
  PRIMARY KEY (fk_grupo, fk_participante),
  FOREIGN KEY (fk_grupo) REFERENCES grupo(id_grupo),
  FOREIGN KEY (fk_participante) REFERENCES usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS postagem (
  id_postagem UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tipo_conteudo postagem_tipo_conteudo,
  texto TEXT,
  url_midia VARCHAR(150),
  fk_autor UUID NOT NULL,
  FOREIGN KEY (fk_autor) REFERENCES usuario(id_usuario),
  CONSTRAINT algum_preenchido CHECK (
    texto IS NOT NULL OR url_midia IS NOT NULL
  )
);

CREATE TABLE IF NOT EXISTS comentario (
  id_comentario UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  conteudo TEXT NOT NULL,
  fk_autor UUID NOT NULL,
  fk_postagem UUID NOT NULL,
  fk_comentario_pai UUID,
  FOREIGN KEY (fk_autor) REFERENCES usuario(id_usuario),
  FOREIGN KEY (fk_postagem) REFERENCES postagem(id_postagem),
  FOREIGN KEY (fk_comentario_pai) REFERENCES comentario(id_comentario)
);

CREATE TABLE IF NOT EXISTS interacao (
  id_interacao UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo interacao_tipo NOT NULL,
  fk_postagem UUID NOT NULL,
  fk_usuario UUID NOT NULL,
  fk_comentario UUID,
  FOREIGN KEY (fk_postagem) REFERENCES postagem(id_postagem),
  FOREIGN KEY (fk_usuario) REFERENCES usuario(id_usuario),
  FOREIGN KEY (fk_comentario) REFERENCES comentario(id_comentario)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_interacao_post_usuario
  ON interacao (fk_usuario, fk_postagem)
  WHERE fk_comentario IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_interacao_comentario_usuario
  ON interacao (fk_usuario, fk_comentario)
  WHERE fk_comentario IS NOT NULL;

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
    'Bem-vindo(a) ao grupo! Usuario ' || nome_usuario,
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
