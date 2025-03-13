import { CheckCircle } from "lucide-react"

interface StepIndicatorProps {
  currentStep: number
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = ["الدخول", "البيانات الشخصية", "اختيار الرغبات", "المراجعة", "الطباعة"]

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="hidden md:flex justify-between items-center">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center relative">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                ${
                  currentStep > index + 1
                    ? "bg-green-500 text-white"
                    : currentStep === index + 1
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "bg-gray-200 text-gray-500"
                }`}
            >
              {currentStep > index + 1 ? (
                <CheckCircle className="h-6 w-6" />
              ) : (
                <span className="text-lg font-bold">{index + 1}</span>
              )}
            </div>
            <span
              className={`text-sm text-center max-w-[100px] 
              ${
                currentStep === index + 1
                  ? "font-bold text-primary"
                  : currentStep > index + 1
                    ? "font-medium text-green-600"
                    : "text-gray-500"
              }`}
            >
              {step}
            </span>
            {index < steps.length - 1 && (
              <div className="absolute top-6 right-12 w-[calc(100%-6rem)] h-0.5 bg-gray-200 -z-10">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: currentStep > index + 1 ? "100%" : "0%" }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile version */}
      <div className="md:hidden">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center
              ${currentStep > 1 ? "bg-green-500 text-white" : "bg-primary text-white shadow-md shadow-primary/30"}`}
          >
            {currentStep > 1 ? <CheckCircle className="h-5 w-5" /> : <span className="text-base font-bold">1</span>}
          </div>
          <div className="h-0.5 w-4 bg-gray-200">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: currentStep > 1 ? "100%" : "0%" }}
            ></div>
          </div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center
              ${
                currentStep > 2
                  ? "bg-green-500 text-white"
                  : currentStep === 2
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "bg-gray-200 text-gray-500"
              }`}
          >
            {currentStep > 2 ? <CheckCircle className="h-5 w-5" /> : <span className="text-base font-bold">2</span>}
          </div>
          <div className="h-0.5 w-4 bg-gray-200">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: currentStep > 2 ? "100%" : "0%" }}
            ></div>
          </div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center
              ${
                currentStep > 3
                  ? "bg-green-500 text-white"
                  : currentStep === 3
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "bg-gray-200 text-gray-500"
              }`}
          >
            {currentStep > 3 ? <CheckCircle className="h-5 w-5" /> : <span className="text-base font-bold">3</span>}
          </div>
          <div className="h-0.5 w-4 bg-gray-200">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: currentStep > 3 ? "100%" : "0%" }}
            ></div>
          </div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center
              ${
                currentStep > 4
                  ? "bg-green-500 text-white"
                  : currentStep === 4
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "bg-gray-200 text-gray-500"
              }`}
          >
            {currentStep > 4 ? <CheckCircle className="h-5 w-5" /> : <span className="text-base font-bold">4</span>}
          </div>
          <div className="h-0.5 w-4 bg-gray-200">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: currentStep > 4 ? "100%" : "0%" }}
            ></div>
          </div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center
              ${currentStep === 5 ? "bg-primary text-white shadow-md shadow-primary/30" : "bg-gray-200 text-gray-500"}`}
          >
            <span className="text-base font-bold">5</span>
          </div>
        </div>
        <div className="text-center font-bold text-primary">{steps[currentStep - 1]}</div>
      </div>
    </div>
  )
}

