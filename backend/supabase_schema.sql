-- ============================================================
-- SmartNest Hostel Management — Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─── Users ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              BIGSERIAL PRIMARY KEY,
  "studentId"     TEXT UNIQUE,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  password        TEXT NOT NULL,
  phone           TEXT DEFAULT '',
  course          TEXT DEFAULT '',
  year            TEXT DEFAULT '',
  "parentContact" TEXT DEFAULT '',
  room            TEXT DEFAULT 'Not Allotted',
  "hostelBlock"   TEXT DEFAULT '-',
  role            TEXT NOT NULL
);

-- ─── Rooms ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rooms (
  id            BIGSERIAL PRIMARY KEY,
  "roomSeries"  TEXT NOT NULL,
  "roomNo"      TEXT NOT NULL UNIQUE,
  block         TEXT NOT NULL,
  floor         INTEGER NOT NULL,
  sharing       INTEGER NOT NULL,
  "roomType"    TEXT NOT NULL,
  capacity      INTEGER NOT NULL,
  occupied      INTEGER DEFAULT 0,
  "monthlyFee"  INTEGER NOT NULL
);

-- ─── Fees ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fees (
  id               BIGSERIAL PRIMARY KEY,
  "studentId"      TEXT NOT NULL,
  "studentName"    TEXT NOT NULL,
  amount           INTEGER DEFAULT 0,
  "paidAmount"     INTEGER DEFAULT 0,
  "dueDate"        TEXT DEFAULT '2026-04-10',
  status           TEXT DEFAULT 'Pending',
  "paymentHistory" TEXT DEFAULT '[]'
);

-- ─── Complaints ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS complaints (
  id               BIGSERIAL PRIMARY KEY,
  "studentId"      TEXT NOT NULL,
  "studentName"    TEXT NOT NULL,
  category         TEXT NOT NULL,
  title            TEXT NOT NULL,
  description      TEXT NOT NULL,
  status           TEXT DEFAULT 'Pending',
  "createdAtLabel" TEXT DEFAULT ''
);

-- ─── Leaves ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leaves_table (
  id             BIGSERIAL PRIMARY KEY,
  "studentId"    TEXT NOT NULL,
  "studentName"  TEXT NOT NULL,
  "fromDate"     TEXT NOT NULL,
  "toDate"       TEXT NOT NULL,
  reason         TEXT NOT NULL,
  status         TEXT DEFAULT 'Pending'
);

-- ─── Notices ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notices (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  priority    TEXT DEFAULT 'General',
  date        TEXT DEFAULT '',
  "createdBy" TEXT DEFAULT ''
);

-- ─── Food Menu ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS food_menu (
  id        BIGSERIAL PRIMARY KEY,
  day       TEXT NOT NULL UNIQUE,
  breakfast TEXT DEFAULT '',
  lunch     TEXT DEFAULT '',
  snacks    TEXT DEFAULT '',
  dinner    TEXT DEFAULT ''
);

-- ─── Notifications ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id              BIGSERIAL PRIMARY KEY,
  "recipientRole" TEXT NOT NULL,
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  "isRead"        BOOLEAN DEFAULT FALSE,
  "createdAt"     TIMESTAMPTZ DEFAULT NOW()
);
