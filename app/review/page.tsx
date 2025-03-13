"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, Loader2 } from "lucide-react"
import { useApplication, faculties, getTrackName as getTrackNameFromContext } from "@/context/application-context"
import SiteHeader from "@/components/site-header"
import StepIndicator from "@/components/step-indicator"
import { motion } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ReviewPage() {
  const router = useRouter()
  const { data, updateData, saveApplication } = useApplication()
  const [agreed, setAgreed] = useState(data.agreed || false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if no preferences (user hasn't completed preferences)
  useEffect(() => {
    if (
      (!data.bachelorPreferences || data.bachelorPreferences.length === 0) &&
      (!data.diplomaPreferences || data.diplomaPreferences.length === 0)
    ) {
      router.push("/preferences")
    }
  }, [data.bachelorPreferences, data.diplomaPreferences, router])

  const handleSubmit = async () => {
    // Update global state
    updateData({
      agreed,
    })

    setIsSubmitting(true)

    try {
      // Save application data to Supabase
      await saveApplication()

      // Navigate to print page
      router.push("/print")
    } catch (error) {
      console.error("Error saving application:", error)
      setIsSubmitting(false)
    }
  }

  // Display track name in Arabic
  const getTrackName = () => {
    return getTrackNameFromContext(data.track)
  }

  // Display application type in Arabic
  const getApplicationTypeName = () => {
    return "بكالوريوس ودبلوم"
  }

  // Get faculty code
  const getFacultyCode = (universityId: string, facultyId: string): string => {
    const facultyList = faculties[universityId as keyof typeof faculties]
    if (!facultyList || !Array.isArray(facultyList)) return ""

    const faculty = facultyList.find((f) => f.id === facultyId)
    return faculty ? faculty.code : ""
  }

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + C: Toggle checkbox
      if (e.altKey && e.key === "c") {
        e.preventDefault() // Prevent default browser behavior
        setAgreed(!agreed)
      }

      // Alt + N: Next page
      if (e.altKey && e.key === "n") {
        e.preventDefault() // Prevent default browser behavior
        if (agreed && !isSubmitting) {
          handleSubmit()
        }
      }

      // Alt + P: Previous page
      if (e.altKey && e.key === "p") {
        e.preventDefault() // Prevent default browser behavior
        router.push("/preferences")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [agreed, router, isSubmitting])

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 py-8">
        <StepIndicator currentStep={4} />

        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="max-w-3xl mx-auto shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">المراجعة والإقرار</CardTitle>
                <CardDescription>راجع بياناتك وتأكد من صحة الرغبات قبل الإرسال النهائي</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-6">
                  {data.error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>خطأ</AlertTitle>
                      <AlertDescription>{data.error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="bg-muted/30 p-4 rounded-lg space-y-3 border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">الاسم</Label>
                        <p className="font-medium">{data.name}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">رقم الجلوس</Label>
                        <p className="font-medium">{data.examNumber}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">رقم الهاتف</Label>
                        <p className="font-medium">{data.phoneNumber}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">المساق</Label>
                        <p className="font-medium">{getTrackName()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">الرقم الوطني</Label>
                        <p className="font-medium">{data.nationalId}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">الجنس</Label>
                        <p className="font-medium">{data.gender === "male" ? "ذكر" : "أنثى"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">نوع التقديم</Label>
                        <p className="font-medium">{getApplicationTypeName()}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">حالة سداد الرسوم</Label>
                        <p className="font-medium text-green-600">تم السداد</p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md shadow-sm">
                    <div className="p-3 border-b bg-muted/30 flex justify-between items-center">
                      <div className="text-primary text-sm">عدد الرغبات: {data.preferences?.length || 0}</div>
                      <h3 className="font-medium">قائمة الرغبات</h3>
                    </div>

                    <ScrollArea className="h-64">
                      <div className="space-y-2 p-2">
                        {data.preferences?.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">لم تقم بإضافة أي رغبات</div>
                        ) : (
                          data.preferences?.map((pref, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-white p-3 rounded-md border"
                            >
                              <div className="text-primary font-bold">
                                {getFacultyCode(pref.university, pref.faculty)}
                              </div>

                              <div>
                                <div className="font-medium">{pref.universityName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {pref.facultyName}
                                  <span className="mr-2 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                    {pref.type === "bachelor" ? "بكالوريوس" : "دبلوم"}
                                  </span>
                                </div>
                              </div>

                              <div className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center font-medium">
                                {index + 1}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="text-amber-800">
                      <p className="font-medium">تنبيه هام</p>
                      <p className="text-sm">
                        بعد الإرسال النهائي، لا يمكنك تعديل رغباتك. يرجى التأكد من صحة جميع البيانات قبل المتابعة.
                      </p>
                    </div>
                  </div>

                  <div className="border rounded-md p-4 space-y-4 shadow-sm">
                    <h3 className="font-medium">الإقرار</h3>
                    <p className="text-sm">
                      أقر أنا الطالب المذكور أعلاه بأن جميع البيانات المدخلة صحيحة وأن ترتيب الرغبات المدخل يمثل رغبتي
                      الحقيقية، وأتحمل مسؤولية أي خطأ في البيانات المدخلة.
                    </p>

                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id="agreement"
                        checked={agreed}
                        onCheckedChange={(checked) => setAgreed(checked as boolean)}
                      />
                      <Label htmlFor="agreement">نعم، أوافق على الإقرار أعلاه</Label>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      اختصارات لوحة المفاتيح: Alt+C لتحديد الموافقة | Alt+N للمتابعة | Alt+P للرجوع
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col md:flex-row justify-between gap-2">
                <Button onClick={() => router.push("/preferences")} variant="outline" className="w-full md:w-auto">
                  رجوع
                </Button>
                <Button onClick={handleSubmit} disabled={!agreed || isSubmitting} className="w-full md:w-auto">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    "إرسال الطلب"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

