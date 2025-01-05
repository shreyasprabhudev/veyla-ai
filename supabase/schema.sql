-- Create tables for sensitive data caching
CREATE TABLE cached_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_prompt TEXT NOT NULL,
    sanitized_prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    augmented_response TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for sensitive data patterns
CREATE TABLE sensitive_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_name VARCHAR(255) NOT NULL,
    pattern_regex TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit log for tracking access
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    user_id UUID,
    ip_address INET,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE cached_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensitive_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for cached_responses
CREATE POLICY "Allow authenticated access to cached_responses"
    ON cached_responses
    FOR ALL
    TO authenticated
    USING (true);

-- Create policy for sensitive_patterns
CREATE POLICY "Allow authenticated read access to patterns"
    ON sensitive_patterns
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy for audit_logs
CREATE POLICY "Allow authenticated insert to audit_logs"
    ON audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for cached_responses
CREATE TRIGGER update_cached_responses_updated_at
    BEFORE UPDATE ON cached_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
