import { CheckCircle2, UserCircle, ListChecks, FileCheck, Printer } from "lucide-react"

export default function ApplicationSteps() {
  const steps = [
    {
      title: "الدخول إلى النظام",
      icon: <CheckCircle2 className="h-6 w-6" />,
      description: "إدخال رقم الجلوس والمساق ورقم الاستمارة",
      color: "blue",
    },
    {
      title: "البيانات الشخصية",
      icon: <UserCircle className="h-6 w-6" />,
      description: "التحقق من البيانات الشخصية وإدخال رقم الهاتف",
      color: "green",
    },
    {
      title: "اختيار الرغبات",
      icon: <ListChecks className="h-6 w-6" />,
      description: "اختيار الجامعات والكليات حسب الأولوية",
      color: "amber",
    },
    {
      title: "المراجعة والإقرار",
      icon: <FileCheck className="h-6 w-6" />,
      description: "مراجعة البيانات والتأكيد على صحتها",
      color: "purple",
    },
    {
      title: "طباعة الاستمارة",
      icon: <Printer className="h-6 w-6" />,
      description: "طباعة الاستمارة كإثبات للتقديم",
      color: "pink",
    },
  ]

  return (
    <div className="space-y-8">
      {steps.map((step, index) => (
        <div key={index} className="flex gap-4 items-start">
          <div className={`bg-${step.color}-100 p-3 rounded-full text-${step.color}-600 flex-shrink-0 mt-1`}>
            {step.icon}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`bg-${step.color}-100 text-${step.color}-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold`}
              >
                {index + 1}
              </span>
              <h4 className="font-bold text-lg">{step.title}</h4>
            </div>
            <p className="text-gray-600">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

