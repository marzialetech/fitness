-- GitHub Auth + Per-User Data
--
-- SETUP:
-- 1. Supabase: Authentication → URL Configuration → add your site URL and redirect URL (e.g. http://localhost:5500 or file:// for local)
-- 2. Supabase: Authentication → Providers → enable GitHub, add GitHub OAuth App Client ID & Secret
--    (Create OAuth app at github.com → Settings → Developer settings → OAuth Apps; callback URL = https://<project-ref>.supabase.co/auth/v1/callback)
-- 3. Run this entire file in SQL Editor once.
--
-- For existing data: after first sign-in, run the backfill at the bottom with your user id.

-- 1. Add user_id to all tables (references auth.users)
ALTER TABLE foods ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE weight_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Drop unique on weight_logs.date so we can have one per user per date
ALTER TABLE weight_logs DROP CONSTRAINT IF EXISTS weight_logs_date_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_weight_logs_user_date ON weight_logs(user_id, date);

-- 3. One settings row per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- 4. Indexes for user_id (faster RLS)
CREATE INDEX IF NOT EXISTS idx_foods_user ON foods(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_user ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user ON daily_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_logs_user ON weight_logs(user_id);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies: users can only see/edit their own rows

-- Foods
CREATE POLICY "Users can read own foods" ON foods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own foods" ON foods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own foods" ON foods FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own foods" ON foods FOR DELETE USING (auth.uid() = user_id);

-- Recipes
CREATE POLICY "Users can read own recipes" ON recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recipes" ON recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recipes" ON recipes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recipes" ON recipes FOR DELETE USING (auth.uid() = user_id);

-- Recipe items: allow if user owns the recipe
CREATE POLICY "Users can read own recipe items" ON recipe_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM recipes r WHERE r.id = recipe_items.recipe_id AND r.user_id = auth.uid()));
CREATE POLICY "Users can insert own recipe items" ON recipe_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM recipes r WHERE r.id = recipe_items.recipe_id AND r.user_id = auth.uid()));
CREATE POLICY "Users can update own recipe items" ON recipe_items FOR UPDATE
  USING (EXISTS (SELECT 1 FROM recipes r WHERE r.id = recipe_items.recipe_id AND r.user_id = auth.uid()));
CREATE POLICY "Users can delete own recipe items" ON recipe_items FOR DELETE
  USING (EXISTS (SELECT 1 FROM recipes r WHERE r.id = recipe_items.recipe_id AND r.user_id = auth.uid()));

-- Daily logs
CREATE POLICY "Users can read own daily logs" ON daily_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily logs" ON daily_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily logs" ON daily_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own daily logs" ON daily_logs FOR DELETE USING (auth.uid() = user_id);

-- Weight logs
CREATE POLICY "Users can read own weight logs" ON weight_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weight logs" ON weight_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weight logs" ON weight_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own weight logs" ON weight_logs FOR DELETE USING (auth.uid() = user_id);

-- User settings (one row per user)
CREATE POLICY "Users can read own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings" ON user_settings FOR DELETE USING (auth.uid() = user_id);

-- 7. Optional: backfill existing rows to a user (run AFTER first GitHub sign-in)
-- Replace YOUR_AUTH_UID with your auth.users id from Authentication → Users in Supabase
-- UPDATE foods SET user_id = 'YOUR_AUTH_UID' WHERE user_id IS NULL;
-- UPDATE recipes SET user_id = 'YOUR_AUTH_UID' WHERE user_id IS NULL;
-- UPDATE daily_logs SET user_id = 'YOUR_AUTH_UID' WHERE user_id IS NULL;
-- UPDATE weight_logs SET user_id = 'YOUR_AUTH_UID' WHERE user_id IS NULL;
-- UPDATE user_settings SET user_id = 'YOUR_AUTH_UID' WHERE user_id IS NULL;
