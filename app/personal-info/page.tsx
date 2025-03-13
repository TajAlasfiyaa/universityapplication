"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { useApplication, getTrackName as getTrackNameFromContext } from "@/context/application-context"
import SiteHeader from "@/components/site-header"
import StepIndicator from "@/components/step-indicator"
import { motion } from "framer-motion"

export default function PersonalInfoPage() {
  const router = useRouter()
  const { data, updateData } = useApplication()

  const [formData, setFormData] = useState({
    phoneNumber: data.phoneNumber || "",
    nationality: data.nationality || "sudanese",
    country: data.country || "",
    receiveSMS: data.receiveSMS !== undefined ? data.receiveSMS : true,
    hasResignation: data.hasResignation || false,
    nationalId: data.nationalId || "",
    gender: data.gender || "male",
  })

  // Redirect if no exam number (user hasn't completed login)
  useEffect(() => {
    if (!data.examNumber) {
      router.push("/login")
    }
  }, [data.examNumber, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    // Update global state
    updateData({
      phoneNumber: formData.phoneNumber,
      nationality: formData.nationality,
      country: formData.country,
      receiveSMS: formData.receiveSMS,
      hasResignation: formData.hasResignation,
      gender: formData.gender,
    })

    router.push("/preferences")
  }

  // Display track name in Arabic
  const getTrackName = () => {
    return getTrackNameFromContext(data.track)
  }

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + N: Next page
      if (e.altKey && e.key === "n") {
        e.preventDefault() // Prevent default browser behavior
        if (formData.phoneNumber) {
          handleSubmit()
        }
      }

      // Alt + P: Previous page
      if (e.altKey && e.key === "p") {
        e.preventDefault() // Prevent default browser behavior
        router.push("/login")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [formData, router])

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 py-8">
        <StepIndicator currentStep={2} />

        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="max-w-3xl mx-auto shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">البيانات الشخصية</CardTitle>
                <CardDescription>تأكد من صحة البيانات الشخصية وأكمل المعلومات المطلوبة</CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
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
                        <Label className="text-muted-foreground">المدرسة</Label>
                        <p className="font-medium">{data.school}</p>
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

                    <div>
                      <Label className="text-muted-foreground">حالة سداد الرسوم</Label>
                      <p className="font-medium text-green-600">تم السداد</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">رقم الهاتف</Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="أدخل رقم الهاتف"
                        required
                        className="text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>الجنسية</Label>
                      <RadioGroup
                        value={formData.nationality}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, nationality: value }))}
                        className="flex flex-row gap-4 justify-end"
                      >
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <RadioGroupItem value="other" id="other" />
                          <Label htmlFor="other">أخرى</Label>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <RadioGroupItem value="sudanese" id="sudanese" />
                          <Label htmlFor="sudanese">سوداني</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.nationality === "other" && (
                      <div className="space-y-2">
                        <Label htmlFor="country">اسم الدولة</Label>
                        <Input
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          placeholder="أدخل اسم الدولة"
                          required
                          className="text-right"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-end space-x-2 space-x-reverse">
                      <Switch
                        id="sms"
                        checked={formData.receiveSMS}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, receiveSMS: checked }))}
                      />
                      <Label htmlFor="sms">أرغب في استلام رسالة نصية على الهاتف</Label>
                    </div>

                    <div className="space-y-2">
                      <Label>تحميل استقالة (اختياري)</Label>
                      <div className="flex items-center justify-between border rounded-md p-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData((prev) => ({ ...prev, hasResignation: true }))}
                        >
                          اختر الملف
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          {formData.hasResignation ? "تم تحميل الملف" : "يجب أن يكون الملف بصيغة PDF"}
                        </span>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button onClick={() => router.push("/login")} variant="outline">
                  رجوع
                </Button>
                <Button onClick={handleSubmit}>التالي</Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

