/*
  # Champion vs Challenge Execution System

  ## Overview
  Production-grade system for executing and comparing BPMN workflow variants (champion vs challenge).
  Designed for enterprise-scale deployment with full audit trail and performance analytics.

  ## Architecture
  - RESTful API backend (Spring Boot)
  - PostgreSQL with RLS for security
  - Real-time metrics collection
  - JSON filtering and comparison engine
  - Full audit trail

  ## Tables

  ### `champion_challenge_executions`
  Main execution records for champion vs challenge runs
  - `id` (uuid, primary key) - Unique execution identifier
  - `name` (text, not null) - User-friendly name for the comparison
  - `description` (text) - Optional detailed description
  - `champion_workflow_id` (text, not null) - Reference to champion BPMN workflow
  - `challenge_workflow_id` (text, not null) - Reference to challenge BPMN workflow
  - `request_payload` (jsonb, not null) - Initial request sent to both workflows
  - `status` (text, not null) - Execution status: 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED'
  - `started_at` (timestamptz) - When execution started
  - `completed_at` (timestamptz) - When execution completed
  - `total_champion_time_ms` (integer) - Total champion execution time
  - `total_challenge_time_ms` (integer) - Total challenge execution time
  - `winner` (text) - Which variant won: 'CHAMPION', 'CHALLENGE', 'TIE'
  - `created_at` (timestamptz, default now()) - Record creation time
  - `updated_at` (timestamptz, default now()) - Last update time
  - `created_by` (uuid) - User who created the execution

  ### `execution_node_metrics`
  Detailed node-level metrics for each execution step
  - `id` (uuid, primary key) - Unique metric identifier
  - `execution_id` (uuid, not null) - Reference to champion_challenge_executions
  - `variant` (text, not null) - Either 'CHAMPION' or 'CHALLENGE'
  - `node_id` (text, not null) - BPMN node identifier
  - `node_name` (text, not null) - Human-readable node name
  - `node_type` (text, not null) - Type of BPMN node (serviceTask, userTask, etc.)
  - `sequence` (integer, not null) - Execution order sequence
  - `request_data` (jsonb) - Request JSON sent to the node
  - `response_data` (jsonb) - Response JSON received from the node
  - `execution_time_ms` (integer, not null) - Time taken in milliseconds
  - `status` (text, not null) - Node execution status: 'SUCCESS', 'ERROR', 'SKIPPED'
  - `error_message` (text) - Error details if failed
  - `error_stack` (text) - Full error stack trace
  - `started_at` (timestamptz, not null) - Node execution start time
  - `completed_at` (timestamptz) - Node execution completion time
  - `memory_used_mb` (numeric) - Memory usage in megabytes
  - `cpu_usage_percent` (numeric) - CPU usage percentage
  - `metadata` (jsonb) - Additional metadata (headers, context, etc.)
  - `created_at` (timestamptz, default now()) - Record creation time

  ### `execution_comparisons`
  Aggregated comparison metrics between champion and challenge
  - `id` (uuid, primary key) - Unique comparison identifier
  - `execution_id` (uuid, not null) - Reference to champion_challenge_executions
  - `metric_name` (text, not null) - Name of the metric
  - `metric_category` (text, not null) - Category: 'PERFORMANCE', 'QUALITY', 'RESOURCE'
  - `champion_value` (numeric, not null) - Champion metric value
  - `challenge_value` (numeric, not null) - Challenge metric value
  - `difference` (numeric) - Absolute difference
  - `difference_percentage` (numeric) - Percentage difference
  - `winner` (text, not null) - Which variant performed better
  - `unit` (text) - Unit of measurement (ms, %, count, etc.)
  - `created_at` (timestamptz, default now()) - When comparison was calculated

  ### `execution_filters`
  Saved filter configurations for analysis
  - `id` (uuid, primary key) - Unique filter identifier
  - `execution_id` (uuid, not null) - Reference to champion_challenge_executions
  - `name` (text, not null) - Filter configuration name
  - `filter_config` (jsonb, not null) - Complete filter configuration
  - `created_by` (uuid) - User who created the filter
  - `created_at` (timestamptz, default now()) - Record creation time

  ## Indexes
  - High-performance indexes for common query patterns
  - Composite indexes for filtering and sorting
  - JSON path indexes for request/response filtering

  ## Security
  - Row Level Security enabled on all tables
  - Authenticated users can view all executions
  - Users can only create/modify their own executions
  - Audit trail with created_by tracking
*/

-- Create champion_challenge_executions table
CREATE TABLE IF NOT EXISTS champion_challenge_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  champion_workflow_id text NOT NULL,
  challenge_workflow_id text NOT NULL,
  request_payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  started_at timestamptz,
  completed_at timestamptz,
  total_champion_time_ms integer DEFAULT 0,
  total_challenge_time_ms integer DEFAULT 0,
  winner text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  CONSTRAINT valid_status CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')),
  CONSTRAINT valid_winner CHECK (winner IS NULL OR winner IN ('CHAMPION', 'CHALLENGE', 'TIE'))
);

-- Create execution_node_metrics table
CREATE TABLE IF NOT EXISTS execution_node_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id uuid NOT NULL REFERENCES champion_challenge_executions(id) ON DELETE CASCADE,
  variant text NOT NULL,
  node_id text NOT NULL,
  node_name text NOT NULL,
  node_type text NOT NULL,
  sequence integer NOT NULL,
  request_data jsonb,
  response_data jsonb,
  execution_time_ms integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'SUCCESS',
  error_message text,
  error_stack text,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  memory_used_mb numeric,
  cpu_usage_percent numeric,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_variant CHECK (variant IN ('CHAMPION', 'CHALLENGE')),
  CONSTRAINT valid_node_status CHECK (status IN ('SUCCESS', 'ERROR', 'SKIPPED'))
);

-- Create execution_comparisons table
CREATE TABLE IF NOT EXISTS execution_comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id uuid NOT NULL REFERENCES champion_challenge_executions(id) ON DELETE CASCADE,
  metric_name text NOT NULL,
  metric_category text NOT NULL,
  champion_value numeric NOT NULL,
  challenge_value numeric NOT NULL,
  difference numeric,
  difference_percentage numeric,
  winner text NOT NULL,
  unit text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_metric_category CHECK (metric_category IN ('PERFORMANCE', 'QUALITY', 'RESOURCE')),
  CONSTRAINT valid_comparison_winner CHECK (winner IN ('CHAMPION', 'CHALLENGE', 'TIE'))
);

-- Create execution_filters table
CREATE TABLE IF NOT EXISTS execution_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id uuid NOT NULL REFERENCES champion_challenge_executions(id) ON DELETE CASCADE,
  name text NOT NULL,
  filter_config jsonb NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_executions_status ON champion_challenge_executions(status);
CREATE INDEX IF NOT EXISTS idx_executions_created_at ON champion_challenge_executions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_executions_created_by ON champion_challenge_executions(created_by);

CREATE INDEX IF NOT EXISTS idx_node_metrics_execution_id ON execution_node_metrics(execution_id);
CREATE INDEX IF NOT EXISTS idx_node_metrics_variant ON execution_node_metrics(variant);
CREATE INDEX IF NOT EXISTS idx_node_metrics_node_type ON execution_node_metrics(node_type);
CREATE INDEX IF NOT EXISTS idx_node_metrics_status ON execution_node_metrics(status);
CREATE INDEX IF NOT EXISTS idx_node_metrics_sequence ON execution_node_metrics(execution_id, sequence);

CREATE INDEX IF NOT EXISTS idx_comparisons_execution_id ON execution_comparisons(execution_id);
CREATE INDEX IF NOT EXISTS idx_comparisons_category ON execution_comparisons(metric_category);

CREATE INDEX IF NOT EXISTS idx_filters_execution_id ON execution_filters(execution_id);

-- Create GIN indexes for JSONB columns for efficient filtering
CREATE INDEX IF NOT EXISTS idx_node_metrics_request_data ON execution_node_metrics USING GIN (request_data);
CREATE INDEX IF NOT EXISTS idx_node_metrics_response_data ON execution_node_metrics USING GIN (response_data);
CREATE INDEX IF NOT EXISTS idx_executions_payload ON champion_challenge_executions USING GIN (request_payload);

-- Enable Row Level Security
ALTER TABLE champion_challenge_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_node_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_filters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for champion_challenge_executions
CREATE POLICY "Users can view all executions"
  ON champion_challenge_executions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create executions"
  ON champion_challenge_executions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own executions"
  ON champion_challenge_executions FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own executions"
  ON champion_challenge_executions FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- RLS Policies for execution_node_metrics
CREATE POLICY "Users can view all node metrics"
  ON execution_node_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create node metrics for own executions"
  ON execution_node_metrics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM champion_challenge_executions
      WHERE id = execution_id AND created_by = auth.uid()
    )
  );

-- RLS Policies for execution_comparisons
CREATE POLICY "Users can view all comparisons"
  ON execution_comparisons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comparisons for own executions"
  ON execution_comparisons FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM champion_challenge_executions
      WHERE id = execution_id AND created_by = auth.uid()
    )
  );

-- RLS Policies for execution_filters
CREATE POLICY "Users can view all filters"
  ON execution_filters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create filters"
  ON execution_filters FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own filters"
  ON execution_filters FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own filters"
  ON execution_filters FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_champion_challenge_executions_updated_at
  BEFORE UPDATE ON champion_challenge_executions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();