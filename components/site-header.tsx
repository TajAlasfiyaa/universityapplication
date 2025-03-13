import Link from "next/link"
import { GraduationCap } from "lucide-react"
import KeyboardShortcutsHelp from "@/components/keyboard-shortcuts-help"

export default function SiteHeader() {
  return (
    <header className="bg-gradient-to-r from-primary/90 to-primary py-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-white" />
          <h1 className="text-xl md:text-2xl font-bold text-white hidden sm:block">نظام التقديم للجامعات</h1>
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-white text-sm md:text-base font-medium">العام الدراسي 2025/2024</div>
          <KeyboardShortcutsHelp />
        </div>
      </div>
    </header>
  )
}

