CREATE TABLE IF NOT EXISTS entries (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  kind ENUM('weekly','schedule','project','wiki','handover') NOT NULL,
  title VARCHAR(120) NOT NULL,
  body TEXT NOT NULL,
  owner VARCHAR(40) NOT NULL,
  event_date DATE NULL,
  status ENUM('open','doing','done') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX entries_kind_updated (kind, updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
