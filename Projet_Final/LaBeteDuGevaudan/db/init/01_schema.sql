-- 0) Créer la base avec une collation compatible MariaDB
CREATE DATABASE IF NOT EXISTS escape_game
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
-- NE PAS OUBLIER LE POINT-VIRGULE ↑

USE escape_game;

-- 1) Table users
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(255) NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2) Table user_sessions (audit)
DROP TABLE IF EXISTS user_sessions;
CREATE TABLE user_sessions (
  id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id   INT UNSIGNED NOT NULL,
  login_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  logout_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_sessions_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3) Table game_runs
DROP TABLE IF EXISTS game_runs;
CREATE TABLE game_runs (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id          INT UNSIGNED NOT NULL,
  started_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_elapsed_ms BIGINT UNSIGNED NOT NULL DEFAULT 0,
  current_start_at TIMESTAMP NULL DEFAULT NULL,
  is_completed     TINYINT(1) NOT NULL DEFAULT 0,
  completed_at     TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_runs_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ⚠️ IMPORTANT
-- J'ai SUPPRIMÉ l'unique contrainte (user_id, is_completed) que je t’avais mise avant.
-- Elle empêchait d’avoir plusieurs runs complétés par utilisateur.
-- On assurera "un seul run actif" côté code (c’est déjà le cas avec /api/start_run.php).

-- 4) Index utiles (pas de IF NOT EXISTS en MariaDB ancien)
DROP INDEX IF EXISTS idx_runs_user_completed ON game_runs;
CREATE INDEX idx_runs_user_completed ON game_runs (user_id, is_completed);

DROP INDEX IF EXISTS idx_runs_completed_time ON game_runs;
CREATE INDEX idx_runs_completed_time ON game_runs (is_completed, total_elapsed_ms);

-- 5) Vue Top 100
DROP VIEW IF EXISTS leaderboard;
CREATE VIEW leaderboard AS
SELECT r.id AS run_id,
       u.username,
       r.total_elapsed_ms,
       r.completed_at
FROM game_runs r
JOIN users u ON u.id = r.user_id
WHERE r.is_completed = 1
ORDER BY r.total_elapsed_ms ASC, r.completed_at ASC
LIMIT 100;
