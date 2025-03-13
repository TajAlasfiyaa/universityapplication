"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApplication, sudanStates } from "@/context/application-context"
import SiteHeader from "@/components/site-header"
import StepIndicator from "@/components/step-indicator"
import { motion } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, Sparkles } from "lucide-react"
import { generateRandomUserData } from "@/utils/random-data"

export default function LoginPage() {
  const router = useRouter()
  const { data, updateData, loadApplication } = useApplication()
  const [formData, setFormData] = useState({
    examNumber: data.examNumber || "",
    track: data.track || "",
    formNumber: data.formNumber || "",
    state: data.state || "",
    captcha: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Simple validation
    if (!formData.examNumber || !formData.track || !formData.formNumber || !formData.state || !formData.captcha) {
      setError("الرجاء إدخال جميع البيانات المطلوبة")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Try to load existing application
      const applicationExists = await loadApplication(formData.examNumber)

      if (!applicationExists) {
        // If no existing application, update the context with form data
        updateData({
          examNumber: formData.examNumber,
          track: formData.track,
          formNumber: formData.formNumber,
          state: formData.state,
        })
      }

      // Navigate to personal info page
      router.push("/personal-info")
    } catch (err) {
      console.error("Error during login:", err)
      setError("حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.")
    } finally {
      setIsLoading(false)
    }
  }

  // إضافة وظيفة لإنشاء مستخدم عشوائي
  const handleCreateRandomUser = () => {
    const randomData = generateRandomUserData()
    setFormData({
      examNumber: randomData.examNumber,
      track: randomData.track,
      formNumber: randomData.formNumber,
      state: randomData.state,
      captcha: "XY4Z9P", // تعبئة كود التحقق تلقائيًا
    })

    // تحديث بيانات المستخدم في السياق
    updateData({
      name: randomData.name,
      school: randomData.school,
      phoneNumber: randomData.phoneNumber,
      nationalId: randomData.nationalId,
      gender: randomData.gender,
      verificationCode: randomData.verificationCode,
    })
  }

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + N: Next page (submit form)
      if (e.altKey && e.key === "n") {
        e.preventDefault() // Prevent default browser behavior
        if (formData.examNumber && formData.track && formData.formNumber && formData.state && formData.captcha) {
          const event = new Event("submit", { cancelable: true })
          handleSubmit(event as any)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [formData])

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 py-8">
        <StepIndicator currentStep={1} />

        <div className="container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="max-w-md mx-auto shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">الدخول إلى النظام</CardTitle>
                <CardDescription>الرجاء إدخال البيانات المطلوبة للدخول إلى نظام التقديم</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>خطأ</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {data.error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>خطأ</AlertTitle>
                      <AlertDescription>{data.error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="examNumber">رقم الجلوس</Label>
                    <Input
                      id="examNumber"
                      name="examNumber"
                      value={formData.examNumber}
                      onChange={handleChange}
                      required
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="track">المساق</Label>
                    <Select value={formData.track} onValueChange={(value) => handleSelectChange("track", value)}>
                      <SelectTrigger id="track" className="text-right">
                        <SelectValue placeholder="اختر المساق" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">أكاديمي</SelectItem>
                        <SelectItem value="industrial">صناعي</SelectItem>
                        <SelectItem value="commercial">تجاري</SelectItem>
                        <SelectItem value="women">نسوي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formNumber">رقم الاستمارة</Label>
                    <Input
                      id="formNumber"
                      name="formNumber"
                      value={formData.formNumber}
                      onChange={handleChange}
                      required
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">الولاية</Label>
                    <Select value={formData.state} onValueChange={(value) => handleSelectChange("state", value)}>
                      <SelectTrigger id="state" className="text-right">
                        <SelectValue placeholder="اختر الولاية" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {sudanStates.map((state) => (
                          <SelectItem key={state.id} value={state.id}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="captcha">أدخل الرمز الموجود في الصورة</Label>
                    <div className="flex gap-2">
                      <Input
                        id="captcha"
                        name="captcha"
                        value={formData.captcha}
                        onChange={handleChange}
                        required
                        className="text-right"
                      />
                      <div className="bg-gray-100 w-24 h-10 flex items-center justify-center text-sm font-mono border rounded-md">
                        XY4Z9P
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          جاري التحميل...
                        </>
                      ) : (
                        "دخول"
                      )}
                    </Button>

                    <Button type="button" variant="outline" className="w-full" onClick={handleCreateRandomUser}>
                      <Sparkles className="ml-2 h-4 w-4" />
                      إنشاء مستخدم عشوائي
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

