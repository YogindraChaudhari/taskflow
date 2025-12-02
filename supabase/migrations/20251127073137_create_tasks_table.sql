/*
  # Create tasks table for task management app

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key) - Unique identifier for each task
      - `title` (text) - Task title
      - `description` (text) - Optional task description
      - `completed` (boolean) - Task completion status, defaults to false
      - `priority` (text) - Priority level: 'low', 'medium', 'high'
      - `created_at` (timestamptz) - Timestamp when task was created
      - `updated_at` (timestamptz) - Timestamp when task was last updated
  
  2. Security
    - Enable RLS on `tasks` table
    - Add policies for public access (suitable for demo purposes)
    - In production, these would be restricted to authenticated users
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  completed boolean DEFAULT false,
  priority text DEFAULT 'medium',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tasks"
  ON tasks
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert tasks"
  ON tasks
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update tasks"
  ON tasks
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete tasks"
  ON tasks
  FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);