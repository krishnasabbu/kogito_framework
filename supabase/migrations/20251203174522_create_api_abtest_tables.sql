/*
  # Create API A/B Testing Tables

  1. New Tables
    - `api_ab_tests`
      - `id` (uuid, primary key)
      - `name` (text, test name)
      - `description` (text, optional description)
      - `status` (text, test status: draft/running/paused/completed)
      - `variants` (jsonb, array of API variant configurations)
      - `traffic_split` (integer, traffic percentage for first variant)
      - `method` (text, HTTP method: GET/POST/PUT/DELETE/PATCH)
      - `request_payload` (jsonb, common request payload)
      - `headers` (jsonb, common headers)
      - `success_criteria` (jsonb, criteria for determining success)
      - `created_by` (text, user who created the test)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `api_ab_test_executions`
      - `id` (uuid, primary key)
      - `test_id` (uuid, foreign key to api_ab_tests)
      - `variant_id` (uuid, ID of the variant that was executed)
      - `variant_name` (text, name of the variant)
      - `status` (text, execution status: success/error)
      - `latency_ms` (integer, execution latency in milliseconds)
      - `status_code` (integer, HTTP status code)
      - `request_payload` (jsonb, request data)
      - `response_payload` (jsonb, response data)
      - `error_message` (text, error message if failed)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their tests
    - Add policies for test execution logging

  3. Indexes
    - Add indexes for common query patterns
*/

-- Create api_ab_tests table
CREATE TABLE IF NOT EXISTS api_ab_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  variants jsonb NOT NULL DEFAULT '[]'::jsonb,
  traffic_split integer NOT NULL DEFAULT 50 CHECK (traffic_split >= 0 AND traffic_split <= 100),
  method text NOT NULL DEFAULT 'POST' CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
  request_payload jsonb,
  headers jsonb,
  success_criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by text NOT NULL DEFAULT 'system',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create api_ab_test_executions table
CREATE TABLE IF NOT EXISTS api_ab_test_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES api_ab_tests(id) ON DELETE CASCADE,
  variant_id uuid NOT NULL,
  variant_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('success', 'error')),
  latency_ms integer NOT NULL,
  status_code integer NOT NULL,
  request_payload jsonb,
  response_payload jsonb,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_ab_tests_status ON api_ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_api_ab_tests_created_at ON api_ab_tests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_ab_test_executions_test_id ON api_ab_test_executions(test_id);
CREATE INDEX IF NOT EXISTS idx_api_ab_test_executions_variant_id ON api_ab_test_executions(variant_id);
CREATE INDEX IF NOT EXISTS idx_api_ab_test_executions_created_at ON api_ab_test_executions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_ab_test_executions_status ON api_ab_test_executions(status);

-- Enable Row Level Security
ALTER TABLE api_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_ab_test_executions ENABLE ROW LEVEL SECURITY;

-- Policies for api_ab_tests table
CREATE POLICY "Users can view all API A/B tests"
  ON api_ab_tests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create API A/B tests"
  ON api_ab_tests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update API A/B tests"
  ON api_ab_tests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete API A/B tests"
  ON api_ab_tests FOR DELETE
  TO authenticated
  USING (true);

-- Policies for api_ab_test_executions table
CREATE POLICY "Users can view API A/B test executions"
  ON api_ab_test_executions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create API A/B test executions"
  ON api_ab_test_executions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_api_ab_tests_updated_at
  BEFORE UPDATE ON api_ab_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE api_ab_tests IS 'Stores API A/B test configurations for comparing different API endpoints';
COMMENT ON TABLE api_ab_test_executions IS 'Logs each execution of an API A/B test variant';
COMMENT ON COLUMN api_ab_tests.variants IS 'JSONB array of variant configurations including API endpoints, headers, and traffic percentages';
COMMENT ON COLUMN api_ab_tests.success_criteria IS 'JSONB object defining success metrics: primaryMetric, minimumSampleSize, confidenceLevel, etc.';
COMMENT ON COLUMN api_ab_test_executions.latency_ms IS 'Time taken to execute the API call in milliseconds';
COMMENT ON COLUMN api_ab_test_executions.status_code IS 'HTTP status code returned by the API';
