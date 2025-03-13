import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import ApplicationSteps from "@/components/application-steps"
import SiteHeader from "@/components/site-header"
import { GraduationCap, BookOpen, School, Award, Bell } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-primary/10 to-transparent py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
                <GraduationCap className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                نظام التقديم الإلكتروني للجامعات السودانية
              </h2>
              <p className="text-lg text-gray-600">
                من خلال هذا النظام يمكنكم التقديم للجامعات السودانية بكل سهولة ويسر
              </p>
              <Link href="/login">
                <Button size="lg" className="px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                  ابدأ التقديم الآن
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-bold text-center mb-12">مميزات النظام</h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <Card className="border-none shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="text-xl font-bold">سهولة الاستخدام</h4>
                  <p className="text-gray-600">واجهة سهلة الاستخدام تمكنك من التقديم بخطوات بسيطة وواضحة</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <School className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold">تنوع المسارات</h4>
                  <p className="text-gray-600">دعم لجميع المسارات: أكاديمي، صناعي، تجاري، ونسوي</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-amber-100 rounded-full">
                    <Award className="h-8 w-8 text-amber-600" />
                  </div>
                  <h4 className="text-xl font-bold">تقديم مزدوج</h4>
                  <p className="text-gray-600">إمكانية التقديم للبكالوريوس والدبلوم معاً في نفس الوقت</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Bell className="h-8 w-8 text-purple-600" />
                  </div>
                  <h4 className="text-xl font-bold">متابعة مستمرة</h4>
                  <p className="text-gray-600">إمكانية متابعة حالة طلبك والحصول على إشعارات بالمستجدات</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Steps Section */}
        <div className="py-12 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-bold text-center mb-12">خطوات التقديم</h3>

            <div className="max-w-3xl mx-auto">
              <ApplicationSteps />

              <div className="mt-12 text-center">
                <Link href="/login">
                  <Button size="lg" className="px-8">
                    ابدأ التقديم الآن
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <GraduationCap className="h-6 w-6" />
              <span className="font-bold">نظام التقديم للجامعات السودانية</span>
            </div>
            <div className="text-sm text-gray-400">جميع الحقوق محفوظة © {new Date().getFullYear()}</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

