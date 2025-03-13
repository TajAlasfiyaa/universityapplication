"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApplication, faculties, getTrackName } from "@/context/application-context"
import SiteHeader from "@/components/site-header"
import { motion } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, Search, CheckCircle, XCircle } from "lucide-react"
import Image from "next/image"

export default function VerifyPage() {
  const router = useRouter()
  const { data, verifyApplication } = useApplication()
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [verified, setVerified] = useState(false)

  // Get faculty code
  const getFacultyCode = (universityId: string, facultyId: string): string => {
    const facultyList = faculties[universityId as keyof typeof faculties]
    if (!facultyList || !Array.isArray(facultyList)) return ""

    const faculty = facultyList.find((f) => f.id === facultyId)
    return faculty ? faculty.code : ""
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!verificationCode) {
      setError("الرجاء إدخال كود التحقق")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const success = await verifyApplication(verificationCode)
      if (success) {
        setVerified(true)
      } else {
        setError(data.error || "كود التحقق غير صحيح. يرجى التأكد من الكود وإعادة المحاولة.")
      }
    } catch (err) {
      console.error("Error during verification:", err)
      setError("حدث خطأ أثناء التحقق. يرجى المحاولة مرة أخرى.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="max-w-4xl mx-auto shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">التحقق من حالة الطلب</CardTitle>
                <CardDescription>أدخل كود التحقق للاطلاع على حالة طلبك</CardDescription>
              </CardHeader>
              <CardContent>
                {!verified ? (
                  <form onSubmit={handleVerify} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>خطأ</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="verificationCode">كود التحقق</Label>
                      <Input
                        id="verificationCode"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        required
                        className="text-center font-mono text-lg"
                        placeholder="أدخل كود التحقق هنا"
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          جاري التحقق...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          التحقق من الطلب
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center gap-4 p-6 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                        <h2 className="text-xl font-bold">تم التحقق بنجاح</h2>
                      </div>
                      <p className="text-gray-600">تم العثور على بيانات الطلب بنجاح</p>
                    </div>

                    <div className="border rounded-md p-6 shadow-sm bg-white">
                      <div className="header flex flex-col items-center mb-6">
                        <div className="logo-container flex justify-center mb-4">
                          <Image
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-xZLTc1kM7dWjSISI4IoObyxWOh0XMV.png"
                            alt="شعار وزارة التعليم العالي"
                            width={80}
                            height={80}
                            className="logo"
                          />
                        </div>
                        <h2 className="text-xl font-bold">وزارة التعليم العالي والبحث العلمي</h2>
                        <h3 className="text-lg">الإدارة العامة للقبول وتقويم وتوثيق الشهادات</h3>
                        <p className="text-base">نتيجة التقديم للجامعات السودانية</p>
                        <p className="text-sm text-muted-foreground">العام الدراسي 2025/2024</p>
                      </div>

                      <div className="space-y-6">
                        <div className="section">
                          <h3 className="section-title bg-muted/30 p-2 border-r-4 border-primary font-bold">
                            البيانات الشخصية
                          </h3>
                          <table className="w-full border-collapse">
                            <tbody>
                              <tr>
                                <td className="border p-2 bg-muted/30 w-1/3 font-bold">الاسم</td>
                                <td className="border p-2">{data.name}</td>
                              </tr>
                              <tr>
                                <td className="border p-2 bg-muted/30 font-bold">رقم الجلوس</td>
                                <td className="border p-2">{data.examNumber}</td>
                              </tr>
                              <tr>
                                <td className="border p-2 bg-muted/30 font-bold">المساق</td>
                                <td className="border p-2">{getTrackName(data.track)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div className="section">
                          <h3 className="section-title bg-muted/30 p-2 border-r-4 border-primary font-bold">
                            حالة الطلب
                          </h3>
                          <div className="p-4 border rounded-md">
                            <div className="flex items-center gap-2 mb-2">
                              {data.applicationStatus === "مقبول" ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : data.applicationStatus === "مرفوض" ? (
                                <XCircle className="h-5 w-5 text-red-500" />
                              ) : (
                                <Loader2 className="h-5 w-5 text-yellow-500" />
                              )}
                              <span className="font-bold">{data.applicationStatus}</span>
                            </div>
                            <p className="text-gray-600 text-sm">
                              {data.applicationStatus === "مقبول"
                                ? "تهانينا! تم قبول طلبك. يرجى مراجعة الجامعة لاستكمال إجراءات التسجيل."
                                : data.applicationStatus === "مرفوض"
                                  ? "نأسف، لم يتم قبول طلبك. يمكنك التقديم مرة أخرى في الفترة القادمة."
                                  : "طلبك قيد المراجعة. يرجى التحقق لاحقًا."}
                            </p>
                          </div>
                        </div>

                        {data.applicationStatus === "مقبول" && (
                          <div className="section">
                            <h3 className="section-title bg-muted/30 p-2 border-r-4 border-primary font-bold">
                              نتيجة القبول
                            </h3>
                            <div className="p-4 border rounded-md bg-green-50">
                              <p className="font-bold mb-2">تم قبولك في:</p>
                              <div className="flex flex-col gap-1">
                                <span className="text-lg font-bold">{data.preferences[0]?.universityName}</span>
                                <span>{data.preferences[0]?.facultyName}</span>
                                <span className="text-sm text-gray-600">
                                  {data.preferences[0]?.type === "bachelor" ? "بكالوريوس" : "دبلوم"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="section">
                          <h3 className="section-title bg-muted/30 p-2 border-r-4 border-primary font-bold">
                            قائمة الرغبات المقدمة
                          </h3>
                          <table className="w-full border-collapse">
                            <thead>
                              <tr>
                                <th className="border p-2 text-center">الترتيب</th>
                                <th className="border p-2 text-center">الكود</th>
                                <th className="border p-2">الجامعة</th>
                                <th className="border p-2">الكلية</th>
                                <th className="border p-2 text-center">نوع الدراسة</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.preferences && data.preferences.length > 0 ? (
                                data.preferences.map((pref, index) => (
                                  <tr key={index}>
                                    <td className="border p-2 text-center font-bold">{index + 1}</td>
                                    <td className="border p-2 text-center font-bold text-primary">
                                      {getFacultyCode(pref.university, pref.faculty)}
                                    </td>
                                    <td className="border p-2">{pref.universityName}</td>
                                    <td className="border p-2">{pref.facultyName}</td>
                                    <td className="border p-2 text-center">
                                      {pref.type === "bachelor" ? "بكالوريوس" : "دبلوم"}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={5} className="border p-2 text-center">
                                    لا توجد رغبات مضافة
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-center gap-4">
                <Button onClick={() => router.push("/")} variant="outline">
                  العودة للصفحة الرئيسية
                </Button>
                {verified && (
                  <Button onClick={() => setVerified(false)} variant="secondary">
                    التحقق من طلب آخر
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

