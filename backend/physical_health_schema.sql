-- Physical Health Data Table
CREATE TABLE IF NOT EXISTS physical_health (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    height DECIMAL(5,2) NOT NULL, -- in cm
    weight DECIMAL(5,2) NOT NULL, -- in kg
    age INTEGER NOT NULL,
    gender TEXT,
    present_illnesses TEXT,
    medications TEXT,
    allergies TEXT,
    bmi DECIMAL(5,2),
    bmi_category TEXT,
    ai_analysis TEXT,
    health_recommendations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_physical_health_user_id ON physical_health(user_id);

-- Enable Row Level Security
ALTER TABLE physical_health ENABLE ROW LEVEL SECURITY;

-- Policy for service role
CREATE POLICY "Allow service role full access to physical_health"
ON physical_health FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
