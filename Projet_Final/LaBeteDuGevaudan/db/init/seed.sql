USE escape_game;

-- Crée un utilisateur démo si non présent
INSERT INTO users (username, email, password_hash)
SELECT 'demo',
       'demo@gevaudan.test',
       '$2y$10$XWZ5v98Uo0QZbqv2Q0jPzu8iG.0J7KQw2qO5mC0vP2G9M4oJH1j9u' -- bcrypt de "demo1234"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo@gevaudan.test');

-- Enregistre une session de jeu complétée pour la démo si absente
INSERT INTO game_runs (user_id, total_elapsed_ms, is_completed, completed_at)
SELECT u.id,
       312000,
       1,
       DATE_SUB(NOW(), INTERVAL 1 DAY)
FROM users u
WHERE u.email = 'demo@gevaudan.test'
  AND NOT EXISTS (
    SELECT 1 FROM game_runs gr
    WHERE gr.user_id = u.id AND gr.is_completed = 1
  );
