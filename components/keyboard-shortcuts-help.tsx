import { Keyboard } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function KeyboardShortcutsHelp() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">
          <Keyboard className="h-4 w-4" />
          <span className="text-xs">اختصارات لوحة المفاتيح</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>اختصارات لوحة المفاتيح</DialogTitle>
          <DialogDescription>استخدم هذه الاختصارات لتسريع عملية التقديم</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-bold mb-2">اختصارات عامة</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="font-medium">الانتقال للصفحة التالية</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + N</kbd>
              </li>
              <li className="flex justify-between">
                <span className="font-medium">الرجوع للصفحة السابقة</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + P</kbd>
              </li>
              <li className="flex justify-between">
                <span className="font-medium">العودة للصفحة الرئيسية</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + H</kbd>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-2">صفحة اختيار الرغبات</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="font-medium">إضافة رغبة</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + A</kbd>
              </li>
              <li className="flex justify-between">
                <span className="font-medium">التبديل لقائمة البكالوريوس</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + B</kbd>
              </li>
              <li className="flex justify-between">
                <span className="font-medium">التبديل لقائمة الدبلوم</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + D</kbd>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-2">صفحة المراجعة</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="font-medium">تحديد/إلغاء الموافقة</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + C</kbd>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-2">صفحة الطباعة</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="font-medium">طباعة الاستمارة</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + P</kbd>
              </li>
              <li className="flex justify-between">
                <span className="font-medium">تقديم طلب جديد</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + N</kbd>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

