-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  exam_number TEXT NOT NULL,
  track TEXT NOT NULL,
  form_number TEXT NOT NULL,
  state TEXT NOT NULL,
  name TEXT NOT NULL,
  school TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  nationality TEXT NOT NULL,
  country TEXT,
  receive_sms BOOLEAN DEFAULT TRUE,
  has_resignation BOOLEAN DEFAULT FALSE,
  national_id TEXT NOT NULL,
  gender TEXT NOT NULL,
  application_type TEXT DEFAULT 'both',
  agreed BOOLEAN DEFAULT FALSE,
  verification_code TEXT,
  application_status TEXT DEFAULT 'قيد المراجعة',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exam_number)
);

-- Create preferences table
CREATE TABLE IF NOT EXISTS public.preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  university TEXT NOT NULL,
  university_name TEXT NOT NULL,
  faculty TEXT NOT NULL,
  faculty_name TEXT NOT NULL,
  type TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_applications_exam_number ON public.applications(exam_number);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_verification_code ON public.applications(verification_code);
CREATE INDEX IF NOT EXISTS idx_preferences_application_id ON public.preferences(application_id);

-- Set up Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public users are viewable by everyone." ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own data." ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own data." ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Applications are viewable by everyone." ON public.applications FOR SELECT USING (true);
CREATE POLICY "Anyone can insert applications" ON public.applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own applications." ON public.applications FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Preferences are viewable by everyone." ON public.preferences FOR SELECT USING (true);
CREATE POLICY "Anyone can insert preferences" ON public.preferences FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update preferences" ON public.preferences FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete preferences" ON public.preferences FOR DELETE USING (true);

