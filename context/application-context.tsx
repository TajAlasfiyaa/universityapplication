"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import { generateVerificationCode } from "@/utils/random-data"

// Define types for our application data
export type Preference = {
  id: string
  university: string
  universityName: string
  faculty: string
  facultyName: string
  type: "bachelor" | "diploma" // Add this field
}

// Update the ApplicationData type to use a single preferences array
type ApplicationData = {
  // Login data
  examNumber: string
  track: string
  formNumber: string
  state: string

  // Personal info
  name: string
  school: string
  phoneNumber: string
  nationality: string
  country: string
  receiveSMS: boolean
  hasResignation: boolean
  nationalId: string
  gender: string

  // Preferences
  applicationType: string
  preferences: Preference[]
  bachelorPreferences: Preference[]
  diplomaPreferences: Preference[]

  // Agreement
  agreed: boolean

  // Verification
  verificationCode: string
  applicationStatus: string

  // Supabase data
  applicationId?: string
  userId?: string
  isSaving: boolean
  isLoading: boolean
  error: string | null
}

// Update the initial data
const initialData: ApplicationData = {
  examNumber: "",
  track: "",
  formNumber: "",
  state: "",

  name: "محمد أحمد عبدالله",
  school: "مدرسة الخرطوم الثانوية",
  phoneNumber: "",
  nationality: "sudanese",
  country: "",
  receiveSMS: true,
  hasResignation: false,
  nationalId: "29xxxxxxxxxxxxxxx",
  gender: "male",

  applicationType: "both",
  preferences: [],
  bachelorPreferences: [],
  diplomaPreferences: [],

  agreed: false,

  // Verification
  verificationCode: "",
  applicationStatus: "قيد المراجعة",

  // Supabase data
  applicationId: undefined,
  userId: undefined,
  isSaving: false,
  isLoading: false,
  error: null,
}

type ApplicationContextType = {
  data: ApplicationData
  updateData: (newData: Partial<ApplicationData>) => void
  resetData: () => void
  saveApplication: () => Promise<void>
  loadApplication: (examNumber: string) => Promise<boolean>
  verifyApplication: (code: string) => Promise<boolean>
}

// Create context
const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined)

// Provider component
export function ApplicationProvider({ children }: { children: React.ReactNode }) {
  // Try to load state from localStorage on initial render
  const [data, setData] = useState<ApplicationData>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("applicationData")
      if (saved) {
        try {
          return JSON.parse(saved) as ApplicationData
        } catch (e) {
          return initialData
        }
      }
    }
    return initialData
  })

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("applicationData", JSON.stringify(data))
    }
  }, [data])

  const updateData = (newData: Partial<ApplicationData>) => {
    setData((prev) => ({ ...prev, ...newData }))
  }

  const resetData = () => {
    setData(initialData)
    if (typeof window !== "undefined") {
      localStorage.removeItem("applicationData")
    }
  }

  // Save application data to Supabase
  const saveApplication = async () => {
    try {
      updateData({ isSaving: true, error: null })

      // Generate verification code if not already set
      const verificationCode = data.verificationCode || generateVerificationCode()

      // Create or get user
      let userId = data.userId
      if (!userId) {
        // Create a new user with phone number
        const { data: userData, error: userError } = await supabase
          .from("users")
          .insert({
            phone: data.phoneNumber,
            created_at: new Date().toISOString(),
          })
          .select("id")
          .single()

        if (userError) throw new Error(`Error creating user: ${userError.message}`)
        userId = userData.id
      }

      // Create or update application
      let applicationId = data.applicationId
      if (!applicationId) {
        // Create new application
        const { data: appData, error: appError } = await supabase
          .from("applications")
          .insert({
            user_id: userId,
            exam_number: data.examNumber,
            track: data.track,
            form_number: data.formNumber,
            state: data.state,
            name: data.name,
            school: data.school,
            phone_number: data.phoneNumber,
            nationality: data.nationality,
            country: data.country || null,
            receive_sms: data.receiveSMS,
            has_resignation: data.hasResignation,
            national_id: data.nationalId,
            gender: data.gender,
            application_type: data.applicationType,
            agreed: data.agreed,
            verification_code: verificationCode,
            application_status: data.applicationStatus,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select("id")
          .single()

        if (appError) throw new Error(`Error creating application: ${appError.message}`)
        applicationId = appData.id
      } else {
        // Update existing application
        const { error: appError } = await supabase
          .from("applications")
          .update({
            exam_number: data.examNumber,
            track: data.track,
            form_number: data.formNumber,
            state: data.state,
            name: data.name,
            school: data.school,
            phone_number: data.phoneNumber,
            nationality: data.nationality,
            country: data.country || null,
            receive_sms: data.receiveSMS,
            has_resignation: data.hasResignation,
            national_id: data.nationalId,
            gender: data.gender,
            application_type: data.applicationType,
            agreed: data.agreed,
            verification_code: verificationCode,
            application_status: data.applicationStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", applicationId)

        if (appError) throw new Error(`Error updating application: ${appError.message}`)

        // Delete existing preferences
        const { error: deleteError } = await supabase.from("preferences").delete().eq("application_id", applicationId)

        if (deleteError) throw new Error(`Error deleting preferences: ${deleteError.message}`)
      }

      // Insert preferences
      if (data.preferences.length > 0) {
        const preferencesToInsert = data.preferences.map((pref, index) => ({
          id: uuidv4(),
          application_id: applicationId!,
          university: pref.university,
          university_name: pref.universityName,
          faculty: pref.faculty,
          faculty_name: pref.facultyName,
          type: pref.type,
          order: index + 1,
          created_at: new Date().toISOString(),
        }))

        const { error: prefError } = await supabase.from("preferences").insert(preferencesToInsert)

        if (prefError) throw new Error(`Error inserting preferences: ${prefError.message}`)
      }

      // Update local state with IDs and verification code
      updateData({
        userId,
        applicationId,
        verificationCode,
        isSaving: false,
      })
    } catch (error) {
      console.error("Error saving application:", error)
      updateData({
        isSaving: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      })
    }
  }

  // Load application data from Supabase
  const loadApplication = async (examNumber: string): Promise<boolean> => {
    try {
      updateData({ isLoading: true, error: null })

      // Find application by exam number
      const { data: appData, error: appError } = await supabase
        .from("applications")
        .select("*")
        .eq("exam_number", examNumber)
        .single()

      if (appError) {
        if (appError.code === "PGRST116") {
          // No application found with this exam number
          updateData({ isLoading: false })
          return false
        }
        throw new Error(`Error loading application: ${appError.message}`)
      }

      // Load preferences
      const { data: prefData, error: prefError } = await supabase
        .from("preferences")
        .select("*")
        .eq("application_id", appData.id)
        .order("order", { ascending: true })

      if (prefError) throw new Error(`Error loading preferences: ${prefError.message}`)

      // Transform preferences to match our application state
      const preferences = prefData.map((pref) => ({
        id: pref.id,
        university: pref.university,
        universityName: pref.university_name,
        faculty: pref.faculty,
        facultyName: pref.faculty_name,
        type: pref.type as "bachelor" | "diploma",
      }))

      // Split preferences by type
      const bachelorPreferences = preferences.filter((pref) => pref.type === "bachelor")
      const diplomaPreferences = preferences.filter((pref) => pref.type === "diploma")

      // Update application state
      updateData({
        applicationId: appData.id,
        userId: appData.user_id,
        examNumber: appData.exam_number,
        track: appData.track,
        formNumber: appData.form_number,
        state: appData.state,
        name: appData.name,
        school: appData.school,
        phoneNumber: appData.phone_number,
        nationality: appData.nationality,
        country: appData.country || "",
        receiveSMS: appData.receive_sms,
        hasResignation: appData.has_resignation,
        nationalId: appData.national_id,
        gender: appData.gender,
        applicationType: appData.application_type,
        agreed: appData.agreed,
        verificationCode: appData.verification_code || "",
        applicationStatus: appData.application_status || "قيد المراجعة",
        preferences,
        bachelorPreferences,
        diplomaPreferences,
        isLoading: false,
      })

      return true
    } catch (error) {
      console.error("Error loading application:", error)
      updateData({
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      })
      return false
    }
  }

  // التحقق من الطلب باستخدام كود التحقق
  const verifyApplication = async (code: string): Promise<boolean> => {
    try {
      updateData({ isLoading: true, error: null })

      // البحث عن الطلب باستخدام كود التحقق
      const { data: appData, error: appError } = await supabase
        .from("applications")
        .select("*")
        .eq("verification_code", code)
        .single()

      if (appError) {
        if (appError.code === "PGRST116") {
          // لم يتم العثور على طلب بهذا الكود
          updateData({
            isLoading: false,
            error: "كود التحقق غير صحيح. يرجى التأكد من الكود وإعادة المحاولة.",
          })
          return false
        }
        throw new Error(`Error verifying application: ${appError.message}`)
      }

      // تحميل التفضيلات
      const { data: prefData, error: prefError } = await supabase
        .from("preferences")
        .select("*")
        .eq("application_id", appData.id)
        .order("order", { ascending: true })

      if (prefError) throw new Error(`Error loading preferences: ${prefError.message}`)

      // تحويل التفضيلات لتتناسب مع حالة التطبيق
      const preferences = prefData.map((pref) => ({
        id: pref.id,
        university: pref.university,
        universityName: pref.university_name,
        faculty: pref.faculty,
        facultyName: pref.faculty_name,
        type: pref.type as "bachelor" | "diploma",
      }))

      // تقسيم التفضيلات حسب النوع
      const bachelorPreferences = preferences.filter((pref) => pref.type === "bachelor")
      const diplomaPreferences = preferences.filter((pref) => pref.type === "diploma")

      // تحديث حالة التطبيق
      updateData({
        applicationId: appData.id,
        userId: appData.user_id,
        examNumber: appData.exam_number,
        track: appData.track,
        formNumber: appData.form_number,
        state: appData.state,
        name: appData.name,
        school: appData.school,
        phoneNumber: appData.phone_number,
        nationality: appData.nationality,
        country: appData.country || "",
        receiveSMS: appData.receive_sms,
        hasResignation: appData.has_resignation,
        nationalId: appData.national_id,
        gender: appData.gender,
        applicationType: appData.application_type,
        agreed: appData.agreed,
        verificationCode: appData.verification_code || "",
        applicationStatus: appData.application_status || "قيد المراجعة",
        preferences,
        bachelorPreferences,
        diplomaPreferences,
        isLoading: false,
      })

      return true
    } catch (error) {
      console.error("Error verifying application:", error)
      updateData({
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      })
      return false
    }
  }

  return (
    <ApplicationContext.Provider
      value={{
        data,
        updateData,
        resetData,
        saveApplication,
        loadApplication,
        verifyApplication,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  )
}

// Custom hook to use the context
export function useApplication() {
  const context = useContext(ApplicationContext)
  if (context === undefined) {
    throw new Error("useApplication must be used within an ApplicationProvider")
  }
  return context
}

// List of all Sudan states
export const sudanStates = [
  { id: "khartoum", name: "الخرطوم" },
  { id: "gezira", name: "الجزيرة" },
  { id: "nile", name: "نهر النيل" },
  { id: "northern", name: "الشمالية" },
  { id: "kassala", name: "كسلا" },
  { id: "red_sea", name: "البحر الأحمر" },
  { id: "gedaref", name: "القضارف" },
  { id: "sennar", name: "سنار" },
  { id: "blue_nile", name: "النيل الأزرق" },
  { id: "white_nile", name: "النيل الأبيض" },
  { id: "north_kordofan", name: "شمال كردفان" },
  { id: "south_kordofan", name: "جنوب كردفان" },
  { id: "west_kordofan", name: "غرب كردفان" },
  { id: "east_kordofan", name: "شرق كردفان" },
  { id: "north_darfur", name: "شمال دارفور" },
  { id: "south_darfur", name: "جنوب دارفور" },
  { id: "east_darfur", name: "شرق دارفور" },
  { id: "west_darfur", name: "غرب دارفور" },
  { id: "central_darfur", name: "وسط دارفور" },
]

// Mock data for universities and faculties
export const universities = [
  { id: "uofk", name: "جامعة الخرطوم" },
  { id: "oiu", name: "جامعة أم درمان الإسلامية" },
  { id: "sust", name: "جامعة السودان للعلوم والتكنولوجيا" },
  { id: "uofg", name: "جامعة الجزيرة" },
  { id: "butana", name: "جامعة البطانة" },
  { id: "quran_islamic", name: "جامعة القرآن الكريم والعلوم الإسلامية" },
  { id: "quran_gezira", name: "جامعة القرآن الكريم وتأصيل العلوم - ولاية الجزيرة" },
  { id: "neelain", name: "جامعة النيلين" },
  { id: "alzaiem", name: "جامعة الزعيم الأزهري" },
  { id: "bahri", name: "جامعة بحري" },
  { id: "shendi", name: "جامعة شندي" },
  { id: "nile_valley", name: "جامعة وادي النيل" },
  { id: "dongola", name: "جامعة دنقلا" },
  { id: "red_sea", name: "جامعة البحر الأحمر" },
  { id: "kassala", name: "جامعة كسلا" },
  { id: "gedaref", name: "جامعة القضارف" },
  { id: "sennar", name: "جامعة سنار" },
  { id: "blue_nile", name: "جامعة النيل الأزرق" },
  { id: "imam_hadi", name: "جامعة الإمام الهادي" },
  { id: "bakht_alruda", name: "جامعة بخت الرضا" },
  { id: "kordofan", name: "جامعة كردفان" },
  { id: "dalanj", name: "جامعة الدلنج" },
  { id: "west_kordofan", name: "جامعة غرب كردفان" },
  { id: "peace", name: "جامعة السلام" },
  { id: "elfasher", name: "جامعة الفاشر" },
  { id: "nyala", name: "جامعة نيالا" },
  { id: "zalingei", name: "جامعة زالنجي" },
  { id: "geneina", name: "جامعة الجنينة" },
  { id: "abdullatif", name: "جامعة عبداللطيف الحمد التكنولوجية" },
  { id: "aldaein", name: "جامعة الضعين" },
  { id: "sudan_tech", name: "جامعة السودان التقانية" },
  { id: "managil", name: "جامعة المناقل للعلوم والتكنولوجيا" },
  { id: "east_kordofan", name: "جامعة شرق كردفان" },
  { id: "tech_uni", name: "الجامعة التكنولوجية" },
  { id: "islamic_translation", name: "المعهد الإسلامي للترجمة (الخرطوم)" },
  { id: "open_sudan", name: "جامعة السودان المفتوحة" },
  { id: "ribat", name: "جامعة الرباط الوطني (الخرطوم)" },
  { id: "africa", name: "جامعة أفريقيا العالمية (الخرطوم)" },
  { id: "karari", name: "جامعة كرري (أم درمان)" },
  { id: "ahfad", name: "جامعة الأحفاد للبنات" },
]

// Update the faculty type to include eligibility for bachelor and diploma
export const faculties: Record<
  string,
  Array<{ id: string; name: string; eligible: boolean; code: string; forBachelor: boolean; forDiploma: boolean }>
> = {
  uofk: [
    { id: "med", name: "كلية الطب", eligible: true, code: "101", forBachelor: true, forDiploma: false },
    { id: "eng", name: "كلية الهندسة", eligible: true, code: "102", forBachelor: true, forDiploma: true },
    { id: "sci", name: "كلية العلوم", eligible: true, code: "103", forBachelor: true, forDiploma: true },
    { id: "law", name: "كلية القانون", eligible: false, code: "104", forBachelor: true, forDiploma: false },
    { id: "pharm", name: "كلية الصيدلة", eligible: true, code: "105", forBachelor: true, forDiploma: false },
    { id: "dent", name: "كلية طب الأسنان", eligible: true, code: "106", forBachelor: true, forDiploma: false },
    { id: "agr", name: "كلية الزراعة", eligible: true, code: "107", forBachelor: true, forDiploma: true },
    {
      id: "econ",
      name: "كلية الاقتصاد والعلوم الإدارية",
      eligible: true,
      code: "108",
      forBachelor: true,
      forDiploma: true,
    },
    { id: "arts", name: "كلية الآداب", eligible: true, code: "109", forBachelor: true, forDiploma: true },
  ],
  oiu: [
    { id: "sharia", name: "كلية الشريعة والقانون", eligible: true, code: "201", forBachelor: true, forDiploma: true },
    { id: "edu", name: "كلية التربية", eligible: true, code: "202", forBachelor: true, forDiploma: true },
    { id: "lang", name: "كلية اللغة العربية", eligible: true, code: "203", forBachelor: true, forDiploma: true },
    { id: "med", name: "كلية الطب", eligible: true, code: "204", forBachelor: true, forDiploma: false },
    { id: "pharm", name: "كلية الصيدلة", eligible: true, code: "205", forBachelor: true, forDiploma: false },
    { id: "dent", name: "كلية طب الأسنان", eligible: true, code: "206", forBachelor: true, forDiploma: false },
    { id: "eng", name: "كلية الهندسة", eligible: true, code: "207", forBachelor: true, forDiploma: true },
  ],
  sust: [
    { id: "eng", name: "كلية الهندسة", eligible: true, code: "301", forBachelor: true, forDiploma: true },
    { id: "it", name: "كلية تقانة المعلومات", eligible: true, code: "302", forBachelor: true, forDiploma: true },
    { id: "bus", name: "كلية إدارة الأعمال", eligible: true, code: "303", forBachelor: true, forDiploma: true },
    { id: "med", name: "كلية الطب", eligible: true, code: "304", forBachelor: true, forDiploma: false },
    { id: "pharm", name: "كلية الصيدلة", eligible: true, code: "305", forBachelor: true, forDiploma: false },
    { id: "dent", name: "كلية طب الأسنان", eligible: true, code: "306", forBachelor: true, forDiploma: false },
    { id: "sci", name: "كلية العلوم", eligible: true, code: "307", forBachelor: true, forDiploma: true },
  ],
  uofg: [
    { id: "med", name: "كلية الطب", eligible: true, code: "401", forBachelor: true, forDiploma: false },
    { id: "agr", name: "كلية الزراعة", eligible: true, code: "402", forBachelor: true, forDiploma: true },
    { id: "vet", name: "كلية الطب البيطري", eligible: true, code: "403", forBachelor: true, forDiploma: false },
    { id: "edu", name: "كلية التربية", eligible: true, code: "404", forBachelor: true, forDiploma: true },
    { id: "eng", name: "كلية الهندسة والتكنولوجيا", eligible: true, code: "405", forBachelor: true, forDiploma: true },
    {
      id: "econ",
      name: "كلية الاقتصاد والتنمية الريفية",
      eligible: true,
      code: "406",
      forBachelor: true,
      forDiploma: true,
    },
  ],
  butana: [
    { id: "edu", name: "كلية التربية", eligible: true, code: "501", forBachelor: true, forDiploma: true },
    { id: "agr", name: "كلية العلوم الزراعية", eligible: true, code: "502", forBachelor: true, forDiploma: true },
    { id: "eng", name: "كلية الهندسة", eligible: true, code: "503", forBachelor: true, forDiploma: true },
    { id: "comp", name: "كلية علوم الحاسوب", eligible: true, code: "504", forBachelor: true, forDiploma: true },
  ],
  quran_islamic: [
    { id: "quran", name: "كلية القرآن الكريم", eligible: true, code: "601", forBachelor: true, forDiploma: true },
    { id: "sharia", name: "كلية الشريعة", eligible: true, code: "602", forBachelor: true, forDiploma: true },
    { id: "edu", name: "كلية التربية", eligible: true, code: "603", forBachelor: true, forDiploma: true },
    { id: "lang", name: "كلية اللغة العربية", eligible: true, code: "604", forBachelor: true, forDiploma: true },
  ],
  quran_gezira: [
    { id: "quran", name: "كلية القرآن الكريم", eligible: true, code: "701", forBachelor: true, forDiploma: true },
    { id: "sharia", name: "كلية الشريعة", eligible: true, code: "702", forBachelor: true, forDiploma: true },
    { id: "edu", name: "كلية التربية", eligible: true, code: "703", forBachelor: true, forDiploma: true },
  ],
  neelain: [
    { id: "med", name: "كلية الطب", eligible: true, code: "801", forBachelor: true, forDiploma: false },
    { id: "pharm", name: "كلية الصيدلة", eligible: true, code: "802", forBachelor: true, forDiploma: false },
    { id: "econ", name: "كلية الاقتصاد", eligible: true, code: "803", forBachelor: true, forDiploma: true },
    { id: "comp", name: "كلية علوم الحاسوب", eligible: true, code: "804", forBachelor: true, forDiploma: true },
    { id: "law", name: "كلية القانون", eligible: true, code: "805", forBachelor: true, forDiploma: true },
    { id: "eng", name: "كلية الهندسة", eligible: true, code: "806", forBachelor: true, forDiploma: true },
  ],
  alzaiem: [
    { id: "edu", name: "كلية التربية", eligible: true, code: "901", forBachelor: true, forDiploma: true },
    { id: "arts", name: "كلية الآداب", eligible: true, code: "902", forBachelor: true, forDiploma: true },
    { id: "sci", name: "كلية العلوم", eligible: true, code: "903", forBachelor: true, forDiploma: true },
    { id: "med", name: "كلية الطب", eligible: true, code: "904", forBachelor: true, forDiploma: false },
  ],
  bahri: [
    { id: "med", name: "كلية الطب", eligible: true, code: "1001", forBachelor: true, forDiploma: false },
    { id: "dent", name: "كلية طب الأسنان", eligible: true, code: "1002", forBachelor: true, forDiploma: false },
    { id: "pharm", name: "كلية الصيدلة", eligible: true, code: "1003", forBachelor: true, forDiploma: false },
    { id: "vet", name: "كلية الطب البيطري", eligible: true, code: "1004", forBachelor: true, forDiploma: false },
    { id: "agr", name: "كلية الزراعة", eligible: true, code: "1005", forBachelor: true, forDiploma: true },
  ],
  shendi: [
    { id: "med", name: "كلية الطب", eligible: true, code: "1101", forBachelor: true, forDiploma: false },
    { id: "edu", name: "كلية التربية", eligible: true, code: "1102", forBachelor: true, forDiploma: true },
    { id: "eng", name: "كلية الهندسة", eligible: true, code: "1103", forBachelor: true, forDiploma: true },
    { id: "comp", name: "كلية علوم الحاسوب", eligible: true, code: "1104", forBachelor: true, forDiploma: true },
  ],
  nile_valley: [
    { id: "med", name: "كلية الطب", eligible: true, code: "1201", forBachelor: true, forDiploma: false },
    { id: "edu", name: "كلية التربية", eligible: true, code: "1202", forBachelor: true, forDiploma: true },
    { id: "eng", name: "كلية الهندسة", eligible: true, code: "1203", forBachelor: true, forDiploma: true },
    { id: "agr", name: "كلية الزراعة", eligible: true, code: "1204", forBachelor: true, forDiploma: true },
  ],
  dongola: [
    { id: "edu", name: "كلية التربية", eligible: true, code: "1301", forBachelor: true, forDiploma: true },
    { id: "agr", name: "كلية الزراعة", eligible: true, code: "1302", forBachelor: true, forDiploma: true },
    { id: "arts", name: "كلية الآداب", eligible: true, code: "1303", forBachelor: true, forDiploma: true },
  ],
  red_sea: [
    { id: "med", name: "كلية الطب", eligible: true, code: "1401", forBachelor: true, forDiploma: false },
    { id: "edu", name: "كلية التربية", eligible: true, code: "1402", forBachelor: true, forDiploma: true },
    { id: "eng", name: "كلية الهندسة", eligible: true, code: "1403", forBachelor: true, forDiploma: true },
    { id: "marine", name: "كلية علوم البحار", eligible: true, code: "1404", forBachelor: true, forDiploma: true },
  ],
  kassala: [
    { id: "med", name: "كلية الطب", eligible: true, code: "1501", forBachelor: true, forDiploma: false },
    { id: "edu", name: "كلية التربية", eligible: true, code: "1502", forBachelor: true, forDiploma: true },
    { id: "agr", name: "كلية الزراعة", eligible: true, code: "1503", forBachelor: true, forDiploma: true },
    { id: "vet", name: "كلية الطب البيطري", eligible: true, code: "1504", forBachelor: true, forDiploma: false },
  ],
  gedaref: [
    { id: "edu", name: "كلية التربية", eligible: true, code: "1601", forBachelor: true, forDiploma: true },
    { id: "agr", name: "كلية الزراعة", eligible: true, code: "1602", forBachelor: true, forDiploma: true },
    { id: "med", name: "كلية الطب", eligible: true, code: "1603", forBachelor: true, forDiploma: false },
  ],
  sennar: [
    { id: "edu", name: "كلية التربية", eligible: true, code: "1701", forBachelor: true, forDiploma: true },
    { id: "agr", name: "كلية الزراعة", eligible: true, code: "1702", forBachelor: true, forDiploma: true },
    { id: "med", name: "كلية الطب", eligible: true, code: "1703", forBachelor: true, forDiploma: false },
  ],
  blue_nile: [
    { id: "edu", name: "كلية التربية", eligible: true, code: "1801", forBachelor: true, forDiploma: true },
    { id: "agr", name: "كلية الزراعة", eligible: true, code: "1802", forBachelor: true, forDiploma: true },
  ],
  imam_hadi: [
    { id: "sharia", name: "كلية الشريعة", eligible: true, code: "1901", forBachelor: true, forDiploma: true },
    { id: "edu", name: "كلية التربية", eligible: true, code: "1902", forBachelor: true, forDiploma: true },
    { id: "arts", name: "كلية الآداب", eligible: true, code: "1903", forBachelor: true, forDiploma: true },
  ],
  bakht_alruda: [
    { id: "edu", name: "كلية التربية", eligible: true, code: "2001", forBachelor: true, forDiploma: true },
    { id: "agr", name: "كلية الزراعة", eligible: true, code: "2002", forBachelor: true, forDiploma: true },
  ],
  kordofan: [
    { id: "med", name: "كلية الطب", eligible: true, code: "2101", forBachelor: true, forDiploma: false },
    { id: "edu", name: "كلية التربية", eligible: true, code: "2102", forBachelor: true, forDiploma: true },
    { id: "agr", name: "كلية الزراعة", eligible: true, code: "2103", forBachelor: true, forDiploma: true },
    { id: "vet", name: "كلية الطب البيطري", eligible: true, code: "2104", forBachelor: true, forDiploma: false },
  ],
  dalanj: [
    { id: "edu", name: "كلية التربية", eligible: true, code: "2201", forBachelor: true, forDiploma: true },
    { id: "agr", name: "كلية الزراعة", eligible: true, code: "2202", forBachelor: true, forDiploma: true },
  ],
  west_kordofan: [
    { id: "edu", name: "كلية التربية", eligible: true, code: "2301", forBachelor: true, forDiploma: true },
    { id: "agr", name: "كلية الزراعة", eligible: true, code: "2302", forBachelor: true, forDiploma: true },
    { id: "eng", name: "كلية الهندسة", eligible: true, code: "2303", forBachelor: true, forDiploma: true },
  ],
  peace: [
    { id: "edu", name: "كلية التربية", eligible: true, code: "2401", forBachelor: true, forDiploma: true },
    { id: "agr", name: "كلية الزراعة", eligible: true, code: "2402", forBachelor: true, forDiploma: true },
  ],
  elfasher: [
    { id: "med", name: "كلية الطب", eligible: true, code: "2501", forBachelor: true, forDiploma: false },
    { id: "edu", name: "كلية التربية", eligible: true, code: "2502", forBachelor: true, forDiploma: true },
    { id: "agr", name: "كلية الزراعة", eligible: true, code: "2503", forBachelor: true, forDiploma: true },
  ],
  nyala: [
    { id: "med", name: "كلية الطب", eligible: true, code: "2601", forBachelor: true, forDiploma: false },
    { id: "edu", name: "كلية التربية", eligible: true, code: "2602", forBachelor: true, forDiploma: true },
    { id: "agr", name: "كلية الزراعة", eligible: true, code: "2603", forBachelor: true, forDiploma: true },
    { id: "vet", name: "كلية الطب البيطري", eligible: true, code: "2604", forBachelor: true, forDiploma: false },
  ],
  zalingei: [
    { id: "edu", name: "كلية التربية", eligible: true, code: "2701", forBachelor: true, forDiploma: true },
    { id: "agr", name: "كلية الزراعة", eligible: true, code: "2702", forBachelor: true, forDiploma: true },
  ],
  geneina: [
    { id: "edu", name: "كلية التربية", eligible: true, code: "2801", forBachelor: true, forDiploma: true },
    { id: "agr", name: "كلية الزراعة", eligible: true, code: "2802", forBachelor: true, forDiploma: true },
  ],
  abdullatif: [
    { id: "eng", name: "كلية الهندسة", eligible: true, code: "2901", forBachelor: true, forDiploma: true },
    { id: "comp", name: "كلية علوم الحاسوب", eligible: true, code: "2902", forBachelor: true, forDiploma: true },
  ],
  aldaein: [
    { id: "edu", name: "كلية التربية", eligible: true, code: "3001", forBachelor: true, forDiploma: true },
    { id: "agr", name: "كلية الزراعة", eligible: true, code: "3002", forBachelor: true, forDiploma: true },
  ],
  sudan_tech: [
    { id: "eng", name: "كلية الهندسة", eligible: true, code: "3101", forBachelor: true, forDiploma: true },
    { id: "comp", name: "كلية علوم الحاسوب", eligible: true, code: "3102", forBachelor: true, forDiploma: true },
    { id: "tech", name: "كلية التقنية", eligible: true, code: "3103", forBachelor: true, forDiploma: true },
  ],
  managil: [
    { id: "eng", name: "كلية الهندسة", eligible: true, code: "3201", forBachelor: true, forDiploma: true },
    { id: "agr", name: "كلية الزراعة", eligible: true, code: "3202", forBachelor: true, forDiploma: true },
  ],
  east_kordofan: [
    { id: "edu", name: "كلية التربية", eligible: true, code: "3301", forBachelor: true, forDiploma: true },
    { id: "agr", name: "كلية الزراعة", eligible: true, code: "3302", forBachelor: true, forDiploma: true },
  ],
  tech_uni: [
    { id: "eng", name: "كلية الهندسة", eligible: true, code: "3401", forBachelor: true, forDiploma: true },
    { id: "comp", name: "كلية علوم الحاسوب", eligible: true, code: "3402", forBachelor: true, forDiploma: true },
  ],
  islamic_translation: [
    { id: "trans", name: "كلية الترجمة", eligible: true, code: "3501", forBachelor: true, forDiploma: true },
    { id: "lang", name: "كلية اللغات", eligible: true, code: "3502", forBachelor: true, forDiploma: true },
  ],
  open_sudan: [
    { id: "edu", name: "كلية التربية", eligible: true, code: "3601", forBachelor: true, forDiploma: true },
    { id: "comp", name: "كلية علوم الحاسوب", eligible: true, code: "3602", forBachelor: true, forDiploma: true },
    { id: "bus", name: "كلية إدارة الأعمال", eligible: true, code: "3603", forBachelor: true, forDiploma: true },
  ],
  ribat: [
    { id: "med", name: "كلية الطب", eligible: true, code: "3701", forBachelor: true, forDiploma: false },
    { id: "eng", name: "كلية الهندسة", eligible: true, code: "3702", forBachelor: true, forDiploma: true },
    { id: "comp", name: "كلية علوم الحاسوب", eligible: true, code: "3703", forBachelor: true, forDiploma: true },
  ],
  africa: [
    { id: "med", name: "كلية الطب", eligible: true, code: "3801", forBachelor: true, forDiploma: false },
    { id: "eng", name: "كلية الهندسة", eligible: true, code: "3802", forBachelor: true, forDiploma: true },
    { id: "edu", name: "كلية التربية", eligible: true, code: "3803", forBachelor: true, forDiploma: true },
    { id: "sharia", name: "كلية الشريعة", eligible: true, code: "3804", forBachelor: true, forDiploma: true },
  ],
  karari: [
    { id: "med", name: "كلية الطب", eligible: true, code: "3901", forBachelor: true, forDiploma: false },
    { id: "eng", name: "كلية الهندسة", eligible: true, code: "3902", forBachelor: true, forDiploma: true },
    { id: "sci", name: "كلية العلوم", eligible: true, code: "3903", forBachelor: true, forDiploma: true },
  ],
  ahfad: [
    { id: "med", name: "كلية الطب", eligible: true, code: "4001", forBachelor: true, forDiploma: false },
    { id: "health", name: "كلية العلوم الصحية", eligible: true, code: "4002", forBachelor: true, forDiploma: true },
    { id: "bus", name: "كلية إدارة الأعمال", eligible: true, code: "4003", forBachelor: true, forDiploma: true },
    { id: "rural", name: "كلية التنمية الريفية", eligible: true, code: "4004", forBachelor: true, forDiploma: true },
  ],
}

// Display track name in Arabic
export function getTrackName(track: string): string {
  switch (track) {
    case "academic":
      return "أكاديمي"
    case "industrial":
      return "صناعي"
    case "commercial":
      return "تجاري"
    case "women":
      return "نسوي"
    default:
      return track
  }
}

// Add a helper function to find faculty by code
export function findFacultyByCode(
  code: string,
  applicationType: string,
): { university: string; faculty: string; universityName: string; facultyName: string } | null {
  for (const [universityId, facultiesList] of Object.entries(faculties)) {
    if (!Array.isArray(facultiesList)) continue

    const faculty = facultiesList.find(
      (f) => f.code === code && (applicationType === "bachelor" ? f.forBachelor : f.forDiploma),
    )

    if (faculty) {
      const university = universities.find((u) => u.id === universityId)
      if (university) {
        return {
          university: universityId,
          faculty: faculty.id,
          universityName: university.name,
          facultyName: faculty.name,
        }
      }
    }
  }
  return null
}

// Add a helper function to get universities that have faculties for the selected application type
export function getUniversitiesForApplicationType(applicationType: string): typeof universities {
  return universities.filter((university) => {
    const universityFaculties = faculties[university.id]
    if (!Array.isArray(universityFaculties)) return false

    return universityFaculties.some((faculty) =>
      applicationType === "bachelor" ? faculty.forBachelor : faculty.forDiploma,
    )
  })
}

export { resetApplication }
// resetApplication function
function resetApplication() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("applicationData")
  }
}

