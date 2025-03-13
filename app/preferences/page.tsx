"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { GripVertical, X, Info, Search, BookOpen, AlertCircle, Keyboard } from "lucide-react"
import {
  useApplication,
  universities,
  faculties,
  type Preference,
  findFacultyByCode,
  getUniversitiesForApplicationType,
  getTrackName as getTrackNameFromContext,
} from "@/context/application-context"
import SiteHeader from "@/components/site-header"
import StepIndicator from "@/components/step-indicator"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function PreferencesPage() {
  const router = useRouter()
  const { data, updateData } = useApplication()
  const codeInputRef = useRef<HTMLInputElement>(null)

  const [selectedUniversity, setSelectedUniversity] = useState("")
  const [selectedFaculty, setSelectedFaculty] = useState("")
  const [bachelorPreferences, setBachelorPreferences] = useState<Preference[]>(data.bachelorPreferences || [])
  const [diplomaPreferences, setDiplomaPreferences] = useState<Preference[]>(data.diplomaPreferences || [])
  const [activeType, setActiveType] = useState<"bachelor" | "diploma">("bachelor")
  const [searchQuery, setSearchQuery] = useState("")
  const [facultyCode, setFacultyCode] = useState("")
  const [codeError, setCodeError] = useState("")
  const [duplicateError, setDuplicateError] = useState("")
  const [showCodeGuide, setShowCodeGuide] = useState(false)
  const [activeTab, setActiveTab] = useState("dropdown")

  // Redirect if no phone number (user hasn't completed personal info)
  useEffect(() => {
    if (!data.phoneNumber) {
      router.push("/personal-info")
    }
  }, [data.phoneNumber, router])

  // Check if a preference already exists in the current active type
  const isDuplicatePreference = (university: string, faculty: string) => {
    const currentPreferences = activeType === "bachelor" ? bachelorPreferences : diplomaPreferences
    return currentPreferences.some((pref) => pref.university === university && pref.faculty === faculty)
  }

  // Update handleAddPreference
  const handleAddPreference = () => {
    if (!selectedUniversity || !selectedFaculty) return

    // Check for duplicate
    if (isDuplicatePreference(selectedUniversity, selectedFaculty)) {
      setDuplicateError("لا يمكن اختيار نفس التخصص في نفس الجامعة مرتين")
      return
    }

    const university = universities.find((u) => u.id === selectedUniversity)
    const faculty = faculties[selectedUniversity as keyof typeof faculties]?.find((f) => f.id === selectedFaculty)

    if (!university || !faculty) return

    const newPreference: Preference = {
      id: `${selectedUniversity}-${selectedFaculty}-${Date.now()}`,
      university: selectedUniversity,
      universityName: university.name,
      faculty: selectedFaculty,
      facultyName: faculty.name,
      type: activeType,
    }

    if (activeType === "bachelor") {
      setBachelorPreferences([...bachelorPreferences, newPreference])
    } else {
      setDiplomaPreferences([...diplomaPreferences, newPreference])
    }

    setSelectedFaculty("")
    setDuplicateError("")
  }

  const handleAddPreferenceByCode = () => {
    if (!facultyCode) {
      setCodeError("الرجاء إدخال كود التخصص")
      return
    }

    const result = findFacultyByCode(facultyCode, activeType)

    if (!result) {
      setCodeError("كود التخصص غير صحيح أو غير متاح لنوع التقديم المحدد")
      return
    }

    // Check for duplicate
    if (isDuplicatePreference(result.university, result.faculty)) {
      setCodeError("لا يمكن اختيار نفس التخصص في نفس الجامعة مرتين")
      return
    }

    const newPreference: Preference = {
      id: `${result.university}-${result.faculty}-${Date.now()}`,
      university: result.university,
      universityName: result.universityName,
      faculty: result.faculty,
      facultyName: result.facultyName,
      type: activeType,
    }

    if (activeType === "bachelor") {
      setBachelorPreferences([...bachelorPreferences, newPreference])
    } else {
      setDiplomaPreferences([...diplomaPreferences, newPreference])
    }

    setFacultyCode("")
    setCodeError("")

    // Keep focus on the input field after adding
    if (codeInputRef.current) {
      codeInputRef.current.focus()
    }
  }

  const handleRemovePreference = (id: string) => {
    if (activeType === "bachelor") {
      setBachelorPreferences(bachelorPreferences.filter((p) => p.id !== id))
    } else {
      setDiplomaPreferences(diplomaPreferences.filter((p) => p.id !== id))
    }
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const currentPreferences = activeType === "bachelor" ? bachelorPreferences : diplomaPreferences
    const items = Array.from(currentPreferences)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    if (activeType === "bachelor") {
      setBachelorPreferences(items)
    } else {
      setDiplomaPreferences(items)
    }
  }

  // Fix the handleSubmit function to properly update the preferences
  const handleSubmit = () => {
    // Combine bachelor and diploma preferences into a single array
    const allPreferences = [
      ...bachelorPreferences.map((pref) => ({ ...pref, type: "bachelor" })),
      ...diplomaPreferences.map((pref) => ({ ...pref, type: "diploma" })),
    ]

    // Update global state
    updateData({
      applicationType: "both",
      preferences: allPreferences,
      bachelorPreferences,
      diplomaPreferences,
    })

    router.push("/review")
  }

  // Clear errors when changing selection
  useEffect(() => {
    setDuplicateError("")
  }, [selectedUniversity, selectedFaculty])

  // Display track name in Arabic
  const getTrackName = () => {
    return getTrackNameFromContext(data.track)
  }

  // Get universities available for the selected application type
  const availableUniversities = getUniversitiesForApplicationType(activeType)

  // Filter universities based on search query
  const filteredUniversities = availableUniversities.filter((uni) => uni.name.includes(searchQuery))

  // Generate a list of all faculties with their codes for the guide
  const allFacultiesWithCodes = Object.entries(faculties).reduce(
    (acc, [uniId, facList]) => {
      const university = universities.find((u) => u.id === uniId)
      if (university && Array.isArray(facList)) {
        const facultiesForUni = facList
          .filter((fac) => (activeType === "bachelor" ? fac.forBachelor : fac.forDiploma))
          .map((fac) => ({
            universityName: university.name,
            facultyName: fac.name,
            code: fac.code,
          }))
        return [...acc, ...facultiesForUni]
      }
      return acc
    },
    [] as Array<{ universityName: string; facultyName: string; code: string }>,
  )

  // Handle Enter key press in the faculty code input
  const handleCodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddPreferenceByCode()
    }
  }

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + A: Add preference
      if (e.altKey && e.key === "a") {
        e.preventDefault() // Prevent default browser behavior
        if (selectedUniversity && selectedFaculty) {
          handleAddPreference()
        } else if (facultyCode) {
          handleAddPreferenceByCode()
        }
      }

      // Alt + B: Switch to Bachelor tab
      if (e.altKey && e.key === "b") {
        e.preventDefault() // Prevent default browser behavior
        setActiveType("bachelor")
      }

      // Alt + D: Switch to Diploma tab
      if (e.altKey && e.key === "d") {
        e.preventDefault() // Prevent default browser behavior
        setActiveType("diploma")
      }

      // Alt + N: Next page
      if (e.altKey && e.key === "n") {
        e.preventDefault() // Prevent default browser behavior
        if (bachelorPreferences.length > 0 || diplomaPreferences.length > 0) {
          handleSubmit()
        }
      }

      // Alt + P: Previous page
      if (e.altKey && e.key === "p") {
        e.preventDefault() // Prevent default browser behavior
        router.push("/personal-info")
      }

      // Alt + F: Focus on faculty code input and switch to code tab
      if (e.altKey && e.key === "f") {
        e.preventDefault() // Prevent default browser behavior
        setActiveTab("code")
        setTimeout(() => {
          if (codeInputRef.current) {
            codeInputRef.current.focus()
          }
        }, 100)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedUniversity, selectedFaculty, bachelorPreferences, diplomaPreferences, router, facultyCode])

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 py-8">
        <StepIndicator currentStep={3} />

        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="max-w-3xl mx-auto shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">اختيار الرغبات</CardTitle>
                <CardDescription>اختر الجامعات والكليات التي ترغب في التقديم إليها حسب الأولوية</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-6">
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
                        <Label className="text-muted-foreground">المساق</Label>
                        <p className="font-medium">{getTrackName()}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">عدد الرغبات المتاحة</Label>
                        <p className="font-medium">24 رغبة</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center mb-2">
                    <div className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-md">
                      <Keyboard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        اختصار: Alt+F للتركيز على حقل الكود | اضغط Enter لإضافة الرغبة
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Tabs for Bachelor/Diploma selection */}
                    <div className="space-y-2 mb-4">
                      <Label>نوع التقديم</Label>
                      <Tabs
                        value={activeType}
                        onValueChange={(value) => setActiveType(value as "bachelor" | "diploma")}
                        className="w-full"
                      >
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="bachelor">بكالوريوس</TabsTrigger>
                          <TabsTrigger value="diploma">دبلوم</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-2 mb-4">
                      <Dialog open={showCodeGuide} onOpenChange={setShowCodeGuide}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-xs gap-1 w-full md:w-auto">
                            <BookOpen className="h-3 w-3" />
                            دليل أكواد التخصصات
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
                          <DialogHeader>
                            <DialogTitle>
                              دليل أكواد التخصصات ({activeType === "bachelor" ? "بكالوريوس" : "دبلوم"})
                            </DialogTitle>
                            <DialogDescription>يمكنك استخدام هذه الأكواد لإضافة التخصصات بسرعة</DialogDescription>
                          </DialogHeader>
                          <div className="overflow-y-auto max-h-[60vh] pr-2">
                            <Input
                              placeholder="ابحث عن الجامعة أو التخصص"
                              className="mb-4"
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-muted/50">
                                  <th className="border p-2 text-right">الكود</th>
                                  <th className="border p-2 text-right">الجامعة</th>
                                  <th className="border p-2 text-right">التخصص</th>
                                </tr>
                              </thead>
                              <tbody>
                                {allFacultiesWithCodes
                                  .filter(
                                    (item) =>
                                      item.universityName.includes(searchQuery) ||
                                      item.facultyName.includes(searchQuery) ||
                                      item.code.includes(searchQuery),
                                  )
                                  .map((item, index) => (
                                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-muted/20"}>
                                      <td className="border p-2 text-center font-bold">{item.code}</td>
                                      <td className="border p-2">{item.universityName}</td>
                                      <td className="border p-2">{item.facultyName}</td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" className="text-xs gap-1 w-full md:w-auto">
                              <Info className="h-3 w-3" />
                              دليل نسب القبول للعام الماضي
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="w-80 p-4">
                            <p className="font-bold mb-2">نسب القبول للعام الماضي:</p>
                            <ul className="text-sm space-y-1">
                              <li>كلية الطب: 95%</li>
                              <li>كلية الهندسة: 90%</li>
                              <li>كلية الصيدلة: 88%</li>
                              <li>كلية طب الأسنان: 89%</li>
                              <li>كلية العلوم: 75%</li>
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {duplicateError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>خطأ</AlertTitle>
                        <AlertDescription>{duplicateError}</AlertDescription>
                      </Alert>
                    )}

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="dropdown">اختيار من القائمة</TabsTrigger>
                        <TabsTrigger value="code">إدخال الكود</TabsTrigger>
                      </TabsList>

                      <TabsContent value="dropdown" className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="university">المؤسسة التعليمية</Label>
                            <div className="relative">
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <Search className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <Input
                                placeholder="ابحث عن الجامعة"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pr-10 text-right"
                              />
                            </div>
                            <Select
                              value={selectedUniversity}
                              onValueChange={(value) => {
                                setSelectedUniversity(value)
                                setSelectedFaculty("")
                              }}
                            >
                              <SelectTrigger id="university" className="text-right">
                                <SelectValue placeholder="اختر الجامعة" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[200px]">
                                {filteredUniversities.map((university) => (
                                  <SelectItem key={university.id} value={university.id}>
                                    {university.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="faculty">الكلية</Label>
                            <Select
                              value={selectedFaculty}
                              onValueChange={setSelectedFaculty}
                              disabled={!selectedUniversity}
                            >
                              <SelectTrigger id="faculty" className="text-right">
                                <SelectValue placeholder="اختر الكلية" />
                              </SelectTrigger>
                              <SelectContent>
                                {selectedUniversity &&
                                  Array.isArray(faculties[selectedUniversity as keyof typeof faculties]) &&
                                  faculties[selectedUniversity as keyof typeof faculties]
                                    ?.filter((faculty) =>
                                      activeType === "bachelor" ? faculty.forBachelor : faculty.forDiploma,
                                    )
                                    .map((faculty) => {
                                      // Check if this faculty is already selected
                                      const isAlreadySelected = isDuplicatePreference(selectedUniversity, faculty.id)

                                      return (
                                        <SelectItem
                                          key={faculty.id}
                                          value={faculty.id}
                                          disabled={!faculty.eligible || isAlreadySelected}
                                          className={
                                            isAlreadySelected
                                              ? "text-red-500 line-through"
                                              : !faculty.eligible
                                                ? "text-red-500"
                                                : ""
                                          }
                                        >
                                          <span className="flex justify-between w-full">
                                            <span className="font-bold text-primary">{faculty.code}</span>
                                            <span>
                                              {faculty.name}
                                              {!faculty.eligible && " (غير مؤهل)"}
                                              {isAlreadySelected && " (تم اختياره مسبقاً)"}
                                            </span>
                                          </span>
                                        </SelectItem>
                                      )
                                    })}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            onClick={handleAddPreference}
                            disabled={!selectedUniversity || !selectedFaculty}
                            className="w-full md:w-auto"
                          >
                            إضافة الرغبة
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="code" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="facultyCode">كود التخصص</Label>
                          <div className="flex flex-col md:flex-row gap-2">
                            <Input
                              id="facultyCode"
                              ref={codeInputRef}
                              placeholder="أدخل كود التخصص"
                              value={facultyCode}
                              onChange={(e) => {
                                setFacultyCode(e.target.value)
                                setCodeError("")
                              }}
                              onKeyDown={handleCodeKeyDown}
                              className="text-right"
                            />
                            <Button
                              onClick={handleAddPreferenceByCode}
                              disabled={!facultyCode}
                              className="w-full md:w-auto"
                            >
                              إضافة
                            </Button>
                          </div>
                          {codeError && <p className="text-sm text-red-500">{codeError}</p>}
                          <p className="text-sm text-muted-foreground">
                            يمكنك الاطلاع على أكواد التخصصات من خلال الضغط على "دليل أكواد التخصصات"
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Update the preferences list rendering */}
                    <div className="border rounded-md shadow-sm">
                      <div className="p-3 border-b bg-muted/30">
                        <h3 className="font-medium">
                          قائمة الرغبات ({activeType === "bachelor" ? "بكالوريوس" : "دبلوم"}) (اسحب لإعادة الترتيب)
                        </h3>
                      </div>

                      <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="preferences">
                          {(provided) => (
                            <ScrollArea className="h-64">
                              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 p-2">
                                {(activeType === "bachelor" ? bachelorPreferences : diplomaPreferences).length === 0 ? (
                                  <div className="text-center py-8 text-muted-foreground">
                                    لم تقم بإضافة أي رغبات بعد
                                  </div>
                                ) : (
                                  (activeType === "bachelor" ? bachelorPreferences : diplomaPreferences).map(
                                    (pref, index) => (
                                      <Draggable key={pref.id} draggableId={pref.id} index={index}>
                                        {(provided) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="flex items-center justify-between bg-white p-3 rounded-md border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                                          >
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => handleRemovePreference(pref.id)}
                                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                              <X className="h-4 w-4" />
                                            </Button>

                                            <div className="flex-1 mx-2 text-right">
                                              <div className="font-medium">{pref.universityName}</div>
                                              <div className="text-sm text-muted-foreground">
                                                {pref.facultyName}
                                                <span className="mr-2 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                                  {activeType === "bachelor" ? "بكالوريوس" : "دبلوم"}
                                                </span>
                                              </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                              <div className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center font-medium">
                                                {index + 1}
                                              </div>
                                              <div {...provided.dragHandleProps}>
                                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </Draggable>
                                    ),
                                  )
                                )}
                                {provided.placeholder}
                              </div>
                            </ScrollArea>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-primary">
                          {activeType === "bachelor" ? bachelorPreferences.length : diplomaPreferences.length}
                        </span>{" "}
                        رغبة من أصل 24
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">البكالوريوس:</span> {bachelorPreferences.length} رغبة |
                        <span className="font-medium mr-2">الدبلوم:</span> {diplomaPreferences.length} رغبة
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col md:flex-row justify-between gap-2">
                <Button onClick={() => router.push("/personal-info")} variant="outline" className="w-full md:w-auto">
                  رجوع
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={bachelorPreferences.length === 0 && diplomaPreferences.length === 0}
                  className="w-full md:w-auto"
                >
                  التالي
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

