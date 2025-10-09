/*
  # Comparison Master System for Champion Challenge

  ## Overview
  Enables aggregate analysis across multiple Champion vs Challenge executions.
  Master-Detail pattern for grouping and analyzing execution batches.

  ## New Tables

  ### `comparison_master`
  Groups multiple executions for aggregate analysis
  - `id` (uuid, primary key) - Unique comparison identifier
  - `name` (text, not null) - User-friendly name: "Q4 Payment Optimization"
  - `description` (text) - Detailed description of comparison purpose
  - `workflow_pair` (text, not null) - "champion-id vs challenge-id"
  - `champion_workflow_id` (text, not null) - Champion workflow reference
  - `challenge_workflow_id` (text, not null) - Challenge workflow reference
  - `status` (text, not null) - 'PENDING', 'ANALYZING', 'COMPLETED', 'FAILED'
  - `total_executions` (integer) - Total number of executions in comparison
  - `included_executions` (integer) - Number of executions included in analysis
  - `outlier_count` (integer) - Number of outliers detected
  - `aggregate_metrics` (jsonb) - Calculated aggregate metrics (cached)
  - `statistical_analysis` (jsonb) - Statistical test results
  - `created_at` (timestamptz) - When comparison was created
  - `completed_at` (timestamptz) - When analysis completed
  - `created_by` (uuid) - User who created comparison

  ### `execution_comparison_mapping`
  Join table linking executions to comparisons (N:M relationship)
  - `id` (uuid, primary key) - Unique mapping identifier
  - `comparison_id` (uuid, FK) - Reference to comparison_master
  - `execution_id` (uuid, FK) - Reference to champion_challenge_executions
  - `included` (boolean) - Whether to include in aggregate analysis
  - `outlier_flag` (boolean) - Flagged as statistical outlier
  - `outlier_reason` (text) - Reason for outlier flag (Z-score, IQR, etc.)
  - `outlier_score` (numeric) - Outlier detection score
  - `execution_order` (integer) - Order in the comparison (for chronological analysis)
  - `created_at` (timestamptz) - When execution was added to comparison

  ## Security
  - RLS enabled on all tables
  - Users can view all comparisons
  - Users can only create/modify their own comparisons
*/

-- Create comparison_master table
CREATE TABLE IF NOT EXISTS comparison_master (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  workflow_pair text NOT NULL,
  champion_workflow_id text NOT NULL,
  challenge_workflow_id text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  total_executions integer DEFAULT 0,
  included_executions integer DEFAULT 0,
  outlier_count integer DEFAULT 0,
  aggregate_metrics jsonb,
  statistical_analysis jsonb,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_by uuid,
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT status_check CHECK (status IN ('PENDING', 'ANALYZING', 'COMPLETED', 'FAILED'))
);

-- Create execution_comparison_mapping table
CREATE TABLE IF NOT EXISTS execution_comparison_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comparison_id uuid NOT NULL REFERENCES comparison_master(id) ON DELETE CASCADE,
  execution_id uuid NOT NULL REFERENCES champion_challenge_executions(id) ON DELETE CASCADE,
  included boolean DEFAULT true,
  outlier_flag boolean DEFAULT false,
  outlier_reason text,
  outlier_score numeric,
  execution_order integer,
  created_at timestamptz DEFAULT now(),

  UNIQUE(comparison_id, execution_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comparison_master_created_by ON comparison_master(created_by);
CREATE INDEX IF NOT EXISTS idx_comparison_master_status ON comparison_master(status);
CREATE INDEX IF NOT EXISTS idx_comparison_master_created_at ON comparison_master(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comparison_master_workflow_pair ON comparison_master(champion_workflow_id, challenge_workflow_id);

CREATE INDEX IF NOT EXISTS idx_execution_mapping_comparison ON execution_comparison_mapping(comparison_id);
CREATE INDEX IF NOT EXISTS idx_execution_mapping_execution ON execution_comparison_mapping(execution_id);
CREATE INDEX IF NOT EXISTS idx_execution_mapping_included ON execution_comparison_mapping(included) WHERE included = true;
CREATE INDEX IF NOT EXISTS idx_execution_mapping_outliers ON execution_comparison_mapping(outlier_flag) WHERE outlier_flag = true;

-- Enable Row Level Security
ALTER TABLE comparison_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_comparison_mapping ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comparison_master

-- Allow all authenticated users to view all comparisons
CREATE POLICY "Users can view all comparisons"
  ON comparison_master
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to create their own comparisons
CREATE POLICY "Users can create own comparisons"
  ON comparison_master
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own comparisons
CREATE POLICY "Users can update own comparisons"
  ON comparison_master
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Allow users to delete their own comparisons
CREATE POLICY "Users can delete own comparisons"
  ON comparison_master
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- RLS Policies for execution_comparison_mapping

-- Allow all authenticated users to view mappings
CREATE POLICY "Users can view all execution mappings"
  ON execution_comparison_mapping
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to add executions to their own comparisons
CREATE POLICY "Users can add executions to own comparisons"
  ON execution_comparison_mapping
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM comparison_master
      WHERE comparison_master.id = comparison_id
      AND comparison_master.created_by = auth.uid()
    )
  );

-- Allow users to update mappings in their own comparisons
CREATE POLICY "Users can update mappings in own comparisons"
  ON execution_comparison_mapping
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM comparison_master
      WHERE comparison_master.id = comparison_id
      AND comparison_master.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM comparison_master
      WHERE comparison_master.id = comparison_id
      AND comparison_master.created_by = auth.uid()
    )
  );

-- Allow users to delete mappings from their own comparisons
CREATE POLICY "Users can delete mappings from own comparisons"
  ON execution_comparison_mapping
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM comparison_master
      WHERE comparison_master.id = comparison_id
      AND comparison_master.created_by = auth.uid()
    )
  );

-- Function to update comparison counts
CREATE OR REPLACE FUNCTION update_comparison_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE comparison_master
    SET
      total_executions = (
        SELECT COUNT(*)
        FROM execution_comparison_mapping
        WHERE comparison_id = NEW.comparison_id
      ),
      included_executions = (
        SELECT COUNT(*)
        FROM execution_comparison_mapping
        WHERE comparison_id = NEW.comparison_id AND included = true
      ),
      outlier_count = (
        SELECT COUNT(*)
        FROM execution_comparison_mapping
        WHERE comparison_id = NEW.comparison_id AND outlier_flag = true
      ),
      updated_at = now()
    WHERE id = NEW.comparison_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    UPDATE comparison_master
    SET
      total_executions = (
        SELECT COUNT(*)
        FROM execution_comparison_mapping
        WHERE comparison_id = OLD.comparison_id
      ),
      included_executions = (
        SELECT COUNT(*)
        FROM execution_comparison_mapping
        WHERE comparison_id = OLD.comparison_id AND included = true
      ),
      outlier_count = (
        SELECT COUNT(*)
        FROM execution_comparison_mapping
        WHERE comparison_id = OLD.comparison_id AND outlier_flag = true
      ),
      updated_at = now()
    WHERE id = OLD.comparison_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update counts
CREATE TRIGGER trigger_update_comparison_counts
AFTER INSERT OR UPDATE OR DELETE ON execution_comparison_mapping
FOR EACH ROW
EXECUTE FUNCTION update_comparison_counts();

-- Function to auto-set execution_order
CREATE OR REPLACE FUNCTION set_execution_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.execution_order IS NULL THEN
    NEW.execution_order := (
      SELECT COALESCE(MAX(execution_order), 0) + 1
      FROM execution_comparison_mapping
      WHERE comparison_id = NEW.comparison_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set execution_order before insert
CREATE TRIGGER trigger_set_execution_order
BEFORE INSERT ON execution_comparison_mapping
FOR EACH ROW
EXECUTE FUNCTION set_execution_order();
