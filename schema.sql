
CREATE TABLE metrics (
  id SERIAL PRIMARY KEY,
  container_id TEXT,
  container_name TEXT,
  cpu_pct TEXT,
  memory_pct TEXT,
  memory_usage TEXT,
  net_io TEXT,
  block_io TEXT,
  pid TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (  
  id SERIAL PRIMARY KEY,
  username TEXT,
  phone_number TEXT,
  CONSTRAINT unique_username UNIQUE(username)
);

CREATE TABLE containers (
  id TEXT PRIMARY KEY,
  github_url TEXT,
  name TEXT
);

CREATE TABLE docker_networks (
  id SERIAL PRIMARY KEY,
  network_name TEXT,
  file_path TEXT
);

CREATE TABLE notification_settings (
  id SERIAL PRIMARY KEY,
  metric_name TEXT NOT NULL,
  triggering_value INT,
  CONSTRAINT unique_name UNIQUE(metric_name)
);

CREATE TABLE container_settings (
  container_id TEXT REFERENCES containers(id),
  notification_settings_id INT REFERENCES notification_settings(id),
  CONSTRAINT container_setting PRIMARY KEY(container_id, notification_settings_id)
);

INSERT INTO notification_settings (metric_name, triggering_value) VALUES
('memory', 80),
('cpu', 80),
('stopped', 0);
