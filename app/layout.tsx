import type React from "react"
import type { Metadata } from "next"
import { Tajawal } from "next/font/google"
import "./globals.css"
import { ApplicationProvider } from "@/context/application-context"
import { ThemeProvider } from "@/components/theme-provider"

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
})

export const metadata: Metadata = {
  title: "نظام التقديم الإلكتروني للجامعات السودانية",
  description: "نظام التقديم الإلكتروني للجامعات السودانية",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.className} min-h-screen bg-gradient-to-b from-slate-50 to-slate-100`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ApplicationProvider>{children}</ApplicationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

import "./globals.css"



import './globals.css'