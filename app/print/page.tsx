"use client"

import { useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Printer, Download, Keyboard, QrCode } from "lucide-react"
import { useApplication, faculties, getTrackName } from "@/context/application-context"
import SiteHeader from "@/components/site-header"
import StepIndicator from "@/components/step-indicator"
import { motion } from "framer-motion"
import Image from "next/image"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"

export default function PrintPage() {
  const router = useRouter()
  const { data, resetData } = useApplication()
  const printRef = useRef<HTMLDivElement>(null)

  // Redirect if not agreed (user hasn't completed review)
  useEffect(() => {
    if (!data.agreed) {
      router.push("/review")
    }
  }, [data.agreed, router])

  // Fix keyboard shortcuts to use direct function calls instead of event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + P: Print
      if (e.altKey && e.key === "p") {
        e.preventDefault() // Prevent default browser behavior
        handlePrint()
      }

      // Alt + H: Home
      if (e.altKey && e.key === "h") {
        e.preventDefault() // Prevent default browser behavior
        router.push("/")
      }

      // Alt + N: New application
      if (e.altKey && e.key === "n") {
        e.preventDefault() // Prevent default browser behavior
        handleStartNew()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [router])

  // Get faculty code
  const getFacultyCode = (universityId: string, facultyId: string): string => {
    const facultyList = faculties[universityId as keyof typeof faculties]
    if (!facultyList || !Array.isArray(facultyList)) return ""

    const faculty = facultyList.find((f) => f.id === facultyId)
    return faculty ? faculty.code : ""
  }

  const handleStartNew = () => {
    resetData()
    router.push("/")
  }

  // Simplified print function that works more reliably
  const handlePrint = () => {
    if (!printRef.current) return

    const content = printRef.current.innerHTML
    const printWindow = window.open("", "_blank")

    if (!printWindow) {
      alert("يرجى السماح بالنوافذ المنبثقة لطباعة الاستمارة")
      return
    }

    // Create a simplified HTML document with inline styles
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <title>استمارة التقديم للجامعات</title>
          <meta charset="utf-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
            
            body {
              font-family: 'Tajawal', Arial, sans-serif;
              padding: 2cm;
              direction: rtl;
              text-align: right;
              line-height: 1.5;
            }
            
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 3px double #000;
              padding-bottom: 15px;
            }
            
            .header h2 {
              margin: 5px 0;
              font-size: 22px;
            }
            
            .header h3 {
              margin: 5px 0;
              font-size: 18px;
            }
            
            .section-title {
              background-color: #f0f0f0;
              padding: 8px;
              border-right: 5px solid #1e40af;
              margin-bottom: 10px;
              font-weight: bold;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: right;
            }
            
            th {
              background-color: #f0f0f0;
              font-weight: bold;
              text-align: center;
            }
            
            .stamp {
              position: absolute;
              bottom: 100px;
              left: 50px;
              border: 2px solid #000;
              padding: 15px;
              border-radius: 5px;
              transform: rotate(-15deg);
              font-weight: bold;
              color: #1e40af;
            }
            
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 100px;
              opacity: 0.05;
              z-index: -1;
              font-weight: bold;
            }
            
            .footer {
              margin-top: 30px;
              text-align: center;
              border-top: 1px solid #000;
              padding-top: 10px;
            }
            
            .verification-code {
              text-align: center;
              margin-top: 20px;
              padding: 10px;
              border: 2px dashed #1e40af;
              background-color: #f0f8ff;
              font-weight: bold;
              font-size: 18px;
            }
            
            @page {
              size: A4;
              margin: 1.5cm;
            }
            
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="watermark">وزارة التعليم العالي</div>
          
          <div class="header">
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-xZLTc1kM7dWjSISI4IoObyxWOh0XMV.png" 
                 alt="شعار وزارة التعليم العالي" width="120" height="120" style="margin-bottom: 10px;">
            <h2>وزارة التعليم العالي والبحث العلمي</h2>
            <h3>الإدارة العامة للقبول وتقويم وتوثيق الشهادات</h3>
            <p style="font-size: 16px; font-weight: bold;">استمارة التقديم للجامعات السودانية</p>
            <p style="font-size: 14px; color: #555;">العام الدراسي 2025/2024</p>
          </div>
          
          <div>
            <h3 class="section-title">البيانات الشخصية</h3>
            <table>
              <tbody>
                <tr>
                  <td style="width: 30%; background-color: #f0f0f0; font-weight: bold;">الاسم</td>
                  <td>${data.name}</td>
                </tr>
                <tr>
                  <td style="background-color: #f0f0f0; font-weight: bold;">رقم الجلوس</td>
                  <td>${data.examNumber}</td>
                </tr>
                <tr>
                  <td style="background-color: #f0f0f0; font-weight: bold;">الرقم الوطني</td>
                  <td>${data.nationalId}</td>
                </tr>
                <tr>
                  <td style="background-color: #f0f0f0; font-weight: bold;">المدرسة</td>
                  <td>${data.school}</td>
                </tr>
                <tr>
                  <td style="background-color: #f0f0f0; font-weight: bold;">رقم الهاتف</td>
                  <td>${data.phoneNumber}</td>
                </tr>
                <tr>
                  <td style="background-color: #f0f0f0; font-weight: bold;">المساق</td>
                  <td>${getTrackName(data.track)}</td>
                </tr>
                <tr>
                  <td style="background-color: #f0f0f0; font-weight: bold;">الجنس</td>
                  <td>${data.gender === "male" ? "ذكر" : "أنثى"}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div>
            <h3 class="section-title">قائمة الرغبات</h3>
            <table>
              <thead>
                <tr>
                  <th style="width: 10%;">الترتيب</th>
                  <th style="width: 15%;">الكود</th>
                  <th style="width: 30%;">الجامعة</th>
                  <th style="width: 30%;">الكلية</th>
                  <th style="width: 15%;">نوع الدراسة</th>
                </tr>
              </thead>
              <tbody>
                ${
                  data.preferences && data.preferences.length > 0
                    ? data.preferences
                        .map(
                          (pref, index) => `
                    <tr>
                      <td style="text-align: center; font-weight: bold;">${index + 1}</td>
                      <td style="text-align: center; font-weight: bold; color: #1e40af;">
                        ${getFacultyCode(pref.university, pref.faculty)}
                      </td>
                      <td>${pref.universityName}</td>
                      <td>${pref.facultyName}</td>
                      <td style="text-align: center;">
                        ${pref.type === "bachelor" ? "بكالوريوس" : "دبلوم"}
                      </td>
                    </tr>
                  `,
                        )
                        .join("")
                    : `<tr>
                    <td colspan="5" style="text-align: center;">لا توجد رغبات مضافة</td>
                  </tr>`
                }
              </tbody>
            </table>
          </div>
          
          <div class="verification-code">
            كود التحقق: ${data.verificationCode}
            <p style="font-size: 14px; margin-top: 5px;">
              يمكنك استخدام هذا الكود للتحقق من حالة طلبك عبر صفحة التحقق
            </p>
          </div>
          
          <div class="stamp">ختم الإدارة العامة للقبول</div>
          
          <div class="footer">
            <p>تم إصدار هذه الاستمارة بتاريخ: ${new Date().toLocaleDateString("ar-SA")}</p>
            <p>رقم الطلب: SUP-2024-${data.examNumber}</p>
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()

    // Wait for resources to load before printing
    setTimeout(() => {
      printWindow.print()
      // Don't close the window after printing to allow the user to try again if needed
    }, 1000)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 py-8">
        <StepIndicator currentStep={5} />

        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="max-w-4xl mx-auto shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                  <CardTitle className="text-2xl text-center">تم إرسال طلبك بنجاح</CardTitle>
                </div>
                <CardDescription className="text-center">
                  يمكنك الآن طباعة استمارة التقديم للاحتفاظ بها كمرجع
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex justify-center gap-4 mb-6">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={handlePrint} className="gap-2">
                          <Printer className="h-4 w-4" />
                          طباعة الاستمارة
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>اختصار لوحة المفاتيح: Alt+P</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button variant="outline" className="gap-2" onClick={handlePrint}>
                    <Download className="h-4 w-4" />
                    تحميل كملف PDF
                  </Button>

                  <Link href="/verify" passHref>
                    <Button variant="secondary" className="gap-2">
                      <QrCode className="h-4 w-4" />
                      صفحة التحقق
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-md">
                    <Keyboard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      اختصارات لوحة المفاتيح: Alt+P للطباعة | Alt+H للصفحة الرئيسية | Alt+N لتقديم طلب جديد
                    </span>
                  </div>
                </div>

                <div className="border rounded-md p-6 shadow-sm bg-white" ref={printRef}>
                  <div className="header">
                    <div className="logo-container flex justify-center mb-4">
                      <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-xZLTc1kM7dWjSISI4IoObyxWOh0XMV.png"
                        alt="شعار وزارة التعليم العالي"
                        width={100}
                        height={100}
                        className="logo"
                      />
                    </div>
                    <h2 className="text-xl font-bold">وزارة التعليم العالي والبحث العلمي</h2>
                    <h3 className="text-lg">الإدارة العامة للقبول وتقويم وتوثيق الشهادات</h3>
                    <p className="text-base">استمارة التقديم للجامعات السودانية</p>
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
                            <td className="border p-2 bg-muted/30 font-bold">الرقم الوطني</td>
                            <td className="border p-2">{data.nationalId}</td>
                          </tr>
                          <tr>
                            <td className="border p-2 bg-muted/30 font-bold">المدرسة</td>
                            <td className="border p-2">{data.school}</td>
                          </tr>
                          <tr>
                            <td className="border p-2 bg-muted/30 font-bold">رقم الهاتف</td>
                            <td className="border p-2">{data.phoneNumber}</td>
                          </tr>
                          <tr>
                            <td className="border p-2 bg-muted/30 font-bold">المساق</td>
                            <td className="border p-2">{getTrackName(data.track)}</td>
                          </tr>
                          <tr>
                            <td className="border p-2 bg-muted/30 font-bold">الجنس</td>
                            <td className="border p-2">{data.gender === "male" ? "ذكر" : "أنثى"}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="section">
                      <h3 className="section-title bg-muted/30 p-2 border-r-4 border-primary font-bold">
                        قائمة الرغبات
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

                    {/* كود التحقق */}
                    <div className="bg-blue-50 border-2 border-dashed border-blue-500 p-4 rounded-md text-center">
                      <h3 className="font-bold text-lg mb-2">كود التحقق</h3>
                      <p className="text-2xl font-bold text-blue-600 font-mono">{data.verificationCode}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        يمكنك استخدام هذا الكود للتحقق من حالة طلبك عبر صفحة التحقق
                      </p>
                    </div>

                    <div className="stamp border-2 border-black p-3 rounded-md transform -rotate-12 absolute bottom-20 left-12 font-bold text-primary">
                      ختم الإدارة العامة للقبول
                    </div>

                    <div className="qr-code border p-2 absolute top-8 left-8 text-center text-sm">
                      رمز التحقق
                      <br />
                      SUP-2024-{data.examNumber}
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-center gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={() => router.push("/")} variant="outline">
                        العودة للصفحة الرئيسية
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>اختصار لوحة المفاتيح: Alt+H</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={handleStartNew} variant="secondary">
                        تقديم طلب جديد
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>اختصار لوحة المفاتيح: Alt+N</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

