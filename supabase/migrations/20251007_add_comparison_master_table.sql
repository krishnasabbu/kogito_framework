/*
  # Add Comparison Master Table for Champion Challenge

  ## Overview
  Restructure Champion Challenge to support master-detail pattern:
  - Master: Comparison definition (what workflows to compare)
  - Detail: Multiple test executions under each comparison

  ## Changes
  1. New Tables
    - `champion_challenge_comparisons` (master table)
      - id, name, description, champion_workflow_id, challenge_workflow_id
      - Stores the comparison definition

  2. Modified Tables
    - `champion_challenge_executions` (detail table)
      - Add `comparison_id` foreign key
      - Keep execution-specific data (request_payload, status, timing, etc.)

  ## Migration Strategy
  - Add new comparison table
  - Add comparison_id column to executions
  - Create comparison records for existing executions
  - Add foreign key constraint
  - Update indexes and RLS policies
*/

-- Step 1: Create champion_challenge_comparisons master table
CREATE TABLE IF NOT EXISTS champion_challenge_comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  champion_workflow_id text NOT NULL,
  challenge_workflow_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Step 2: Add comparison_id to executions table
ALTER TABLE champion_challenge_executions
  ADD COLUMN IF NOT EXISTS comparison_id uuid REFERENCES champion_challenge_comparisons(id) ON DELETE CASCADE;

-- Step 3: Migrate existing data - create comparisons for existing executions
INSERT INTO champion_challenge_comparisons (id, name, description, champion_workflow_id, challenge_workflow_id, created_at, created_by)
SELECT
  gen_random_uuid(),
  name || ' (Migrated)',
  description,
  champion_workflow_id,
  challenge_workflow_id,
  created_at,
  created_by
FROM champion_challenge_executions
WHERE comparison_id IS NULL
ON CONFLICT DO NOTHING;

-- Step 4: Update executions to link to new comparisons
UPDATE champion_challenge_executions e
SET comparison_id = c.id
FROM champion_challenge_comparisons c
WHERE e.comparison_id IS NULL
  AND e.champion_workflow_id = c.champion_workflow_id
  AND e.challenge_workflow_id = c.challenge_workflow_id
  AND e.name || ' (Migrated)' = c.name;

-- Step 5: Make comparison_id required after migration
ALTER TABLE champion_challenge_executions
  ALTER COLUMN comparison_id SET NOT NULL;

-- Step 6: Create indexes for new structure
CREATE INDEX IF NOT EXISTS idx_comparisons_created_at ON champion_challenge_comparisons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comparisons_created_by ON champion_challenge_comparisons(created_by);
CREATE INDEX IF NOT EXISTS idx_executions_comparison_id ON champion_challenge_executions(comparison_id);

-- Step 7: Enable Row Level Security on comparisons table
ALTER TABLE champion_challenge_comparisons ENABLE ROW LEVEL SECURITY;

-- Step 8: RLS Policies for champion_challenge_comparisons
CREATE POLICY "Users can view all comparisons"
  ON champion_challenge_comparisons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comparisons"
  ON champion_challenge_comparisons FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own comparisons"
  ON champion_challenge_comparisons FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own comparisons"
  ON champion_challenge_comparisons FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Step 9: Update RLS policies for executions to check comparison ownership
DROP POLICY IF EXISTS "Users can create executions" ON champion_challenge_executions;
DROP POLICY IF EXISTS "Users can update own executions" ON champion_challenge_executions;
DROP POLICY IF EXISTS "Users can delete own executions" ON champion_challenge_executions;

CREATE POLICY "Users can create executions for own comparisons"
  ON champion_challenge_executions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM champion_challenge_comparisons
      WHERE id = comparison_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update executions of own comparisons"
  ON champion_challenge_executions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM champion_challenge_comparisons
      WHERE id = comparison_id AND created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM champion_challenge_comparisons
      WHERE id = comparison_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete executions of own comparisons"
  ON champion_challenge_executions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM champion_challenge_comparisons
      WHERE id = comparison_id AND created_by = auth.uid()
    )
  );

-- Step 10: Create trigger for auto-updating updated_at on comparisons
CREATE TRIGGER update_champion_challenge_comparisons_updated_at
  BEFORE UPDATE ON champion_challenge_comparisons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 11: Create view for easy querying of comparisons with execution counts
CREATE OR REPLACE VIEW champion_challenge_comparison_summary AS
SELECT
  c.id,
  c.name,
  c.description,
  c.champion_workflow_id,
  c.challenge_workflow_id,
  c.created_at,
  c.updated_at,
  c.created_by,
  COUNT(e.id) as total_executions,
  COUNT(CASE WHEN e.status = 'COMPLETED' THEN 1 END) as completed_executions,
  COUNT(CASE WHEN e.status = 'RUNNING' THEN 1 END) as running_executions,
  COUNT(CASE WHEN e.status = 'FAILED' THEN 1 END) as failed_executions,
  MAX(e.created_at) as last_execution_at
FROM champion_challenge_comparisons c
LEFT JOIN champion_challenge_executions e ON e.comparison_id = c.id
GROUP BY c.id, c.name, c.description, c.champion_workflow_id, c.challenge_workflow_id,
         c.created_at, c.updated_at, c.created_by;
