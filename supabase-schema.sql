-- Run this in Supabase: SQL Editor → New query → paste → Run

-- Foods repository (your personal food database)
CREATE TABLE IF NOT EXISTS foods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    serving_size DECIMAL NOT NULL DEFAULT 1,
    serving_unit TEXT NOT NULL DEFAULT 'serving',
    calories DECIMAL NOT NULL DEFAULT 0,
    protein DECIMAL NOT NULL DEFAULT 0,
    carbs DECIMAL NOT NULL DEFAULT 0,
    fat DECIMAL NOT NULL DEFAULT 0,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes (saved combinations of foods)
CREATE TABLE IF NOT EXISTS recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipe items (foods in each recipe)
CREATE TABLE IF NOT EXISTS recipe_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
    servings DECIMAL NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily food logs
CREATE TABLE IF NOT EXISTS daily_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
    servings DECIMAL NOT NULL DEFAULT 1,
    meal_type TEXT NOT NULL DEFAULT 'snack',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weight logs
CREATE TABLE IF NOT EXISTS weight_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE UNIQUE,
    weight_lbs DECIMAL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    current_weight DECIMAL,
    target_weight DECIMAL,
    height_inches DECIMAL,
    age INTEGER,
    sex TEXT DEFAULT 'male',
    activity_level TEXT DEFAULT 'moderate',
    weekly_loss_rate DECIMAL DEFAULT 1.0,
    protein_ratio DECIMAL DEFAULT 0.40,
    carbs_ratio DECIMAL DEFAULT 0.30,
    fat_ratio DECIMAL DEFAULT 0.30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings row (only if empty)
INSERT INTO user_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM user_settings LIMIT 1);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);
CREATE INDEX IF NOT EXISTS idx_weight_logs_date ON weight_logs(date);
CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name);
CREATE INDEX IF NOT EXISTS idx_recipe_items_recipe ON recipe_items(recipe_id);
