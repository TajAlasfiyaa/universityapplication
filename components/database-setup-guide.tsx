"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertCircle, Database } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DatabaseSetupGuide() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Database className="h-4 w-4" />
          <span>دليل إعداد قاعدة البيانات</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>دليل إعداد قاعدة البيانات</DialogTitle>
          <DialogDescription>اتبع هذه الخطوات لإعداد قاعدة بيانات Supabase لنظام التقديم للجامعات</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] pr-2">
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>تنبيه</AlertTitle>
            <AlertDescription>
              يجب إعداد قاعدة البيانات قبل استخدام النظام بشكل كامل. بدون إعداد قاعدة البيانات، ستعمل التطبيق بالتخزين
              المحلي فقط.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="steps">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="steps">خطوات الإعداد</TabsTrigger>
              <TabsTrigger value="sql">كود SQL</TabsTrigger>
            </TabsList>
            <TabsContent value="steps" className="space-y-4 mt-4">
              <div className="space-y-2">
                <h3 className="text-lg font-bold">1. إنشاء مشروع Supabase</h3>
                <p>قم بإنشاء مشروع جديد على منصة Supabase من خلال الموقع الرسمي:</p>
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline block mt-2"
                >
                  https://supabase.com
                </a>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold">2. الحصول على بيانات الاتصال</h3>
                <p>بعد إنشاء المشروع، احصل على بيانات الاتصال التالية:</p>
                <ul className="list-disc list-inside space-y-1 mr-4">
                  <li>Supabase URL</li>
                  <li>Supabase Anon Key</li>
                </ul>
                <p>يمكنك العثور على هذه البيانات في إعدادات المشروع تحت قسم API.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold">3. إعداد متغيرات البيئة</h3>
                <p>قم بإضافة متغيرات البيئة التالية إلى مشروعك:</p>
                <div className="bg-muted p-2 rounded-md">
                  <code>NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co</code>
                </div>
                <div className="bg-muted p-2 rounded-md mt-2">
                  <code>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key</code>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold">4. إعداد قاعدة البيانات</h3>
                <p>انتقل إلى قسم SQL Editor في لوحة تحكم Supabase وقم بتنفيذ كود SQL الموجود في التبويب المجاور.</p>
              </div>
            </TabsContent>
            <TabsContent value="sql" className="mt-4">
              <div className="bg-muted p-4 rounded-md overflow-x-auto">
                <pre className="text-sm">
                  {`-- Create users table
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
CREATE POLICY "Anyone can delete preferences" ON public.preferences FOR DELETE USING (true);`}
                </pre>
              </div>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(document.querySelector("pre")?.textContent || "")
                  alert("تم نسخ الكود إلى الحافظة")
                }}
                className="mt-4"
              >
                نسخ الكود
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

