-- PostgreSQL schema สำหรับ Project Access Control

CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  display_name VARCHAR(160) NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'employee')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE projects (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tasks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  assigned_to BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status VARCHAR(10) NOT NULL DEFAULT 'To Do' CHECK (status IN ('To Do', 'Done')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- Keep the original identifier after task deletion so audit history survives.
  task_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  action VARCHAR(80) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- รองรับ GET tasks สำหรับ Employee: filter ตามผู้รับผิดชอบ/สถานะ และเรียงงานล่าสุด
CREATE INDEX tasks_assigned_status_created_idx
  ON tasks (assigned_to, status, created_at DESC);

-- รองรับ GET tasks ของ Admin ในโครงการที่เลือก โดยเรียงงานล่าสุดก่อน
CREATE INDEX tasks_project_created_idx
  ON tasks (project_id, created_at DESC);

-- รองรับการเปิดประวัติการเปลี่ยนแปลงของ Task ตามเวลา
CREATE INDEX audit_log_task_created_idx
  ON audit_log (task_id, created_at DESC);
