-- INTERESSE (gêneros literários e temas de leitura)
INSERT INTO interesse (id_interesse, nome) VALUES
('uuid-int-01', 'Romance'),
('uuid-int-02', 'Ficção Científica'),
('uuid-int-03', 'Fantasia'),
('uuid-int-04', 'Biografia'),
('uuid-int-05', 'Suspense'),
('uuid-int-06', 'História'),
('uuid-int-07', 'Autoajuda'),
('uuid-int-08', 'Poesia'),
('uuid-int-09', 'Literatura Brasileira'),
('uuid-int-10', 'Clássicos');

-- USUARIO (nomes brasileiros, amantes de livros)
INSERT INTO usuario (id_usuario, nome, email, senha, url_foto, data_nascimento) VALUES
('uuid-usr-01', 'Beatriz Ramos', 'beatriz.ramos@email.com', 'senha123', 'beatriz.jpg', '1990-03-12'),
('uuid-usr-02', 'Mateus Cardoso', 'mateus.cardoso@email.com', 'senha123', 'mateus.jpg', '1988-07-25'),
('uuid-usr-03', 'Camila Alves', 'camila.alves@email.com', 'senha123', 'camila.jpg', '1992-01-18'),
('uuid-usr-04', 'Rafael Martins', 'rafael.martins@email.com', 'senha123', 'rafael.jpg', '1995-09-30'),
('uuid-usr-05', 'Juliana Silva', 'juliana.silva@email.com', 'senha123', 'juliana.jpg', '1991-05-14'),
('uuid-usr-06', 'Pedro Lima', 'pedro.lima@email.com', 'senha123', 'pedro.jpg', '1989-11-02'),
('uuid-usr-07', 'Mariana Costa', 'mariana.costa@email.com', 'senha123', 'mariana.jpg', '1993-04-21'),
('uuid-usr-08', 'Lucas Souza', 'lucas.souza@email.com', 'senha123', 'lucas.jpg', '1994-06-07'),
('uuid-usr-09', 'Fernanda Rocha', 'fernanda.rocha@email.com', 'senha123', 'fernanda.jpg', '1996-08-15'),
('uuid-usr-10', 'André Oliveira', 'andre.oliveira@email.com', 'senha123', 'andre.jpg', '1997-12-20');

-- USUARIO_INTERESSE (usuários e seus gêneros favoritos)
INSERT INTO usuario_interesse (fk_interesse, fk_usuario) VALUES
('uuid-int-01', 'uuid-usr-01'),
('uuid-int-02', 'uuid-usr-01'),
('uuid-int-03', 'uuid-usr-02'),
('uuid-int-04', 'uuid-usr-02'),
('uuid-int-05', 'uuid-usr-03'),
('uuid-int-06', 'uuid-usr-03'),
('uuid-int-07', 'uuid-usr-04'),
('uuid-int-08', 'uuid-usr-04'),
('uuid-int-09', 'uuid-usr-05'),
('uuid-int-10', 'uuid-usr-05'),
('uuid-int-01', 'uuid-usr-06'),
('uuid-int-02', 'uuid-usr-07'),
('uuid-int-03', 'uuid-usr-08'),
('uuid-int-04', 'uuid-usr-09'),
('uuid-int-05', 'uuid-usr-10');

-- CONEXAO (amizades literárias)
INSERT INTO conexao (usuario_1, usuario_2, status) VALUES
('uuid-usr-01', 'uuid-usr-02', 'aceito'),
('uuid-usr-01', 'uuid-usr-03', 'aceito'),
('uuid-usr-02', 'uuid-usr-04', 'aceito'),
('uuid-usr-03', 'uuid-usr-05', 'aceito'),
('uuid-usr-04', 'uuid-usr-06', 'aceito'),
('uuid-usr-05', 'uuid-usr-07', 'aceito'),
('uuid-usr-06', 'uuid-usr-08', 'aceito'),
('uuid-usr-07', 'uuid-usr-09', 'aceito'),
('uuid-usr-08', 'uuid-usr-10', 'aceito'),
('uuid-usr-09', 'uuid-usr-01', 'aceito');

-- GRUPO (clubes de leitura e temas literários)
INSERT INTO grupo (id_grupo, nome, descricao, fk_criador) VALUES
('uuid-grp-01', 'Clube do Romance', 'Grupo para compartilhar e discutir romances.', 'uuid-usr-01'),
('uuid-grp-02', 'Sci-Fi Brasil', 'Fãs de ficção científica brasileira e internacional.', 'uuid-usr-02'),
('uuid-grp-03', 'Fantasia Sem Limites', 'Grupo dedicado à fantasia e mundos mágicos.', 'uuid-usr-03'),
('uuid-grp-04', 'Leitores de Biografias', 'Compartilhe e indique biografias inspiradoras.', 'uuid-usr-04'),
('uuid-grp-05', 'Suspense e Mistério', 'Para quem ama um bom suspense.', 'uuid-usr-05'),
('uuid-grp-06', 'História em Livros', 'Debates sobre livros históricos.', 'uuid-usr-06'),
('uuid-grp-07', 'Autoajuda e Bem-estar', 'Livros que ajudam a crescer.', 'uuid-usr-07'),
('uuid-grp-08', 'Versos e Poesias', 'Aprecie e compartilhe poesias.', 'uuid-usr-08'),
('uuid-grp-09', 'Literatura Nacional', 'Foco em autores brasileiros.', 'uuid-usr-09'),
('uuid-grp-10', 'Clássicos Eternos', 'Discussão sobre clássicos da literatura.', 'uuid-usr-10');

-- MENSAGEM (mensagens privadas e em grupos sobre livros)
INSERT INTO mensagem (id_mensagem, texto, fk_destinatario, fk_remetente, fk_grupo) VALUES
('uuid-msg-01', 'Você já leu "Dom Casmurro"?', 'uuid-usr-02', 'uuid-usr-01', NULL),
('uuid-msg-02', 'Qual seu autor de Sci-Fi favorito?', 'uuid-usr-04', 'uuid-usr-02', NULL),
('uuid-msg-03', 'Recomenda algum livro de fantasia?', 'uuid-usr-05', 'uuid-usr-03', NULL),
('uuid-msg-04', 'Gostou da biografia que indiquei?', 'uuid-usr-06', 'uuid-usr-04', NULL),
('uuid-msg-05', 'Qual o melhor suspense que já leu?', 'uuid-usr-07', 'uuid-usr-05', NULL),
('uuid-msg-06', 'Vamos ler "Sapiens" juntos?', 'uuid-usr-08', 'uuid-usr-06', NULL),
('uuid-msg-07', 'Indica um livro de autoajuda?', 'uuid-usr-09', 'uuid-usr-07', NULL),
('uuid-msg-08', 'Qual sua poesia favorita?', 'uuid-usr-10', 'uuid-usr-08', NULL),
('uuid-msg-09', 'Alguém já leu "Grande Sertão: Veredas"?', NULL, 'uuid-usr-09', 'uuid-grp-09'),
('uuid-msg-10', 'Vamos escolher o clássico do mês?', NULL, 'uuid-usr-10', 'uuid-grp-10');

-- PARTICIPANTE (participação dos usuários nos clubes de leitura)
INSERT INTO participante (fk_grupo, fk_participante, funcao) VALUES
('uuid-grp-01', 'uuid-usr-01', 'admin'),
('uuid-grp-01', 'uuid-usr-05', 'user'),
('uuid-grp-02', 'uuid-usr-02', 'admin'),
('uuid-grp-02', 'uuid-usr-06', 'user'),
('uuid-grp-03', 'uuid-usr-03', 'admin'),
('uuid-grp-03', 'uuid-usr-07', 'user'),
('uuid-grp-04', 'uuid-usr-04', 'admin'),
('uuid-grp-04', 'uuid-usr-08', 'user'),
('uuid-grp-05', 'uuid-usr-05', 'admin'),
('uuid-grp-05', 'uuid-usr-09', 'user');

-- POSTAGEM (postagens sobre livros, resenhas, capas, citações)
INSERT INTO postagem (id_postagem, tipo_conteudo, texto, url_midia, fk_autor) VALUES
('uuid-post-01', 'imagem', 'Minha edição de "Orgulho e Preconceito".', 'orgulho_preconceito.jpg', 'uuid-usr-01'),
('uuid-post-02', 'imagem', 'Acabei de terminar "Duna", incrível!', 'duna.jpg', 'uuid-usr-02'),
('uuid-post-03', 'imagem', 'Capa linda de "O Senhor dos Anéis".', 'senhor_aneis.jpg', 'uuid-usr-03'),
('uuid-post-04', 'imagem', 'Biografia do Steve Jobs, recomendo!', 'steve_jobs.jpg', 'uuid-usr-04'),
('uuid-post-05', 'imagem', 'Novo suspense na estante: "Garota Exemplar".', 'garota_exemplar.jpg', 'uuid-usr-05'),
('uuid-post-06', 'imagem', 'Livro histórico: "1808" de Laurentino Gomes.', '1808.jpg', 'uuid-usr-06'),
('uuid-post-07', 'imagem', 'Leitura do mês: "O Poder do Hábito".', 'poder_habito.jpg', 'uuid-usr-07'),
('uuid-post-08', 'imagem', 'Poema favorito de Drummond.', 'drummond.jpg', 'uuid-usr-08'),
('uuid-post-09', 'imagem', 'Leitura nacional: "Capitães da Areia".', 'capitaes_areia.jpg', 'uuid-usr-09'),
('uuid-post-10', 'imagem', 'Clássico: "Dom Quixote".', 'dom_quixote.jpg', 'uuid-usr-10');

-- COMENTARIO (comentários sobre livros e postagens)
INSERT INTO comentario (id_comentario, conteudo, fk_autor, fk_postagem, fk_comentario_pai) VALUES
('uuid-com-01', 'Amo esse livro!', 'uuid-usr-02', 'uuid-post-01', NULL),
('uuid-com-02', 'Também terminei "Duna", sensacional!', 'uuid-usr-03', 'uuid-post-02', NULL),
('uuid-com-03', 'Essa capa é maravilhosa.', 'uuid-usr-04', 'uuid-post-03', NULL),
('uuid-com-04', 'Quero ler essa biografia!', 'uuid-usr-05', 'uuid-post-04', NULL),
('uuid-com-05', 'Já li, é muito bom!', 'uuid-usr-06', 'uuid-post-05', NULL),
('uuid-com-06', 'História fascinante!', 'uuid-usr-07', 'uuid-post-06', NULL),
('uuid-com-07', 'Esse livro mudou minha vida.', 'uuid-usr-08', 'uuid-post-07', NULL),
('uuid-com-08', 'Drummond é genial.', 'uuid-usr-09', 'uuid-post-08', NULL),
('uuid-com-09', 'Adoro Jorge Amado!', 'uuid-usr-10', 'uuid-post-09', NULL),
('uuid-com-10', 'Dom Quixote é eterno.', 'uuid-usr-01', 'uuid-post-10', NULL);

-- INTERACAO (likes/dislikes em postagens e comentários literários)
INSERT INTO interacao (id_interacao, tipo, fk_postagem, fk_usuario, fk_comentario) VALUES
('uuid-intc-01', 'like', 'uuid-post-01', 'uuid-usr-02', NULL),
('uuid-intc-02', 'like', 'uuid-post-02', 'uuid-usr-03', NULL),
('uuid-intc-03', 'like', 'uuid-post-03', 'uuid-usr-04', NULL),
('uuid-intc-04', 'like', 'uuid-post-04', 'uuid-usr-05', NULL),
('uuid-intc-05', 'like', 'uuid-post-05', 'uuid-usr-06', NULL),
('uuid-intc-06', 'like', 'uuid-post-06', 'uuid-usr-07', NULL),
('uuid-intc-07', 'like', 'uuid-post-07', 'uuid-usr-08', NULL),
('uuid-intc-08', 'like', 'uuid-post-08', 'uuid-usr-09', NULL),
('uuid-intc-09', 'like', 'uuid-post-09', 'uuid-usr-10', NULL),
('uuid-intc-10', 'like', 'uuid-post-10', 'uuid-usr-01', NULL);