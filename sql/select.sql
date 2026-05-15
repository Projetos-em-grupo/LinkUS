SELECT 
    u.nome AS usuario_principal,
    u2.nome AS usuario_sugerido,
    i.nome AS interesse_comum
FROM usuario u
JOIN usuario_interesse ui ON u.id_usuario = ui.fk_usuario
JOIN interesse i ON ui.fk_interesse = i.id_interesse
JOIN usuario_interesse ui2 ON ui2.fk_interesse = i.id_interesse
JOIN usuario u2 ON ui2.fk_usuario = u2.id_usuario
WHERE u.id_usuario = 'uuid-usr-01'  -- ID do usuário logado
    AND u2.id_usuario <> u.id_usuario;

-- Caso de uso: Sugere conexões com base em gêneros literários compartilhados.

SELECT 
    g.nome AS grupo,
    g.descricao,
    COUNT(p.fk_participante) AS total_membros,
    u.nome AS criador
FROM grupo g
JOIN participante p ON g.id_grupo = p.fk_grupo
JOIN usuario u ON g.fk_criador = u.id_usuario
GROUP BY g.id_grupo
ORDER BY total_membros DESC
LIMIT 5;
-- Caso de uso: Ranking de grupos para descobrir comunidades populares.

SELECT 
    p.texto AS postagem,
    p.url_midia,
    u.nome AS autor,
    COUNT(i.id_interacao) AS total_likes,
    MAX(p.data_criacao) AS data_postagem
FROM postagem p
JOIN usuario u ON p.fk_autor = u.id_usuario
LEFT JOIN interacao i ON p.id_postagem = i.fk_postagem
    AND i.tipo = 'like'
WHERE p.data_criacao >= NOW() - INTERVAL 7 DAY
GROUP BY p.id_postagem
ORDER BY data_postagem DESC;

-- Caso de uso: Exibição do feed principal com conteúdo recente e engajamento

SELECT
  u.nome,
  u.url_foto,
  c.status
FROM conexao c
JOIN usuario u ON (usuario_1 = u.id_usuario OR usuario_2 = u.id_usuario)
WHERE (usuario_1 = 'uuid-usr-01' OR usuario_2 = 'uuid-usr-01') AND u.id_usuario != 'uuid-usr-01'; -- ID do usuário logado
-- Caso de uso: Achar as conecões do usuário, sem incluir ele mesmo.