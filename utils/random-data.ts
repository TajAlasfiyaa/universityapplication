// قائمة بالأسماء الأولى الشائعة في السودان
const firstNames = [
  "محمد",
  "أحمد",
  "عبدالله",
  "إبراهيم",
  "عمر",
  "علي",
  "خالد",
  "عثمان",
  "يوسف",
  "حسن",
  "حسين",
  "مصطفى",
  "عبدالرحمن",
  "عبدالكريم",
  "صلاح",
  "طارق",
  "فاطمة",
  "عائشة",
  "مريم",
  "زينب",
  "خديجة",
  "أمينة",
  "سارة",
  "هدى",
  "نور",
  "سلمى",
  "ليلى",
  "رحمة",
  "آمنة",
  "سمية",
]

// قائمة بأسماء الآباء الشائعة في السودان
const middleNames = [
  "محمد",
  "أحمد",
  "عبدالله",
  "إبراهيم",
  "عمر",
  "علي",
  "خالد",
  "عثمان",
  "يوسف",
  "حسن",
  "حسين",
  "مصطفى",
  "عبدالرحمن",
  "عبدالكريم",
  "صلاح",
  "طارق",
  "بشير",
  "عبدالعزيز",
  "عبدالقادر",
  "محمود",
  "سليمان",
  "إسماعيل",
  "جعفر",
  "الطيب",
  "الصادق",
  "المهدي",
  "النور",
  "الفاتح",
  "المعتصم",
  "المنتصر",
]

// قائمة بالألقاب العائلية الشائعة في السودان
const lastNames = [
  "محمد",
  "أحمد",
  "عبدالله",
  "إبراهيم",
  "البشير",
  "الميرغني",
  "المهدي",
  "الخليفة",
  "الشيخ",
  "حسن",
  "حسين",
  "عثمان",
  "الطاهر",
  "الصادق",
  "الفاضل",
  "الحاج",
  "الأمين",
  "الزبير",
  "الدرديري",
  "الجزولي",
  "الكباشي",
  "الجعلي",
  "الشايقي",
  "الدناقلة",
  "البجا",
  "النوبي",
  "الفور",
  "المساليت",
  "الزغاوة",
  "البرتي",
]

// قائمة بالمدارس الثانوية الشائعة في السودان
const schools = [
  "مدرسة الخرطوم الثانوية",
  "مدرسة أم درمان الثانوية",
  "مدرسة بحري الثانوية",
  "مدرسة الفاشر الثانوية",
  "مدرسة نيالا الثانوية",
  "مدرسة بورتسودان الثانوية",
  "مدرسة كسلا الثانوية",
  "مدرسة القضارف الثانوية",
  "مدرسة سنار الثانوية",
  "مدرسة الدمازين الثانوية",
  "مدرسة الأبيض الثانوية",
  "مدرسة الفولة الثانوية",
  "مدرسة كادوقلي الثانوية",
  "مدرسة الدلنج الثانوية",
  "مدرسة الجنينة الثانوية",
  "مدرسة زالنجي الثانوية",
  "مدرسة الضعين الثانوية",
  "مدرسة عطبرة الثانوية",
  "مدرسة شندي الثانوية",
  "مدرسة الدامر الثانوية",
]

// توليد رقم عشوائي بين رقمين
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// توليد رقم هاتف سوداني عشوائي
export function generateRandomPhoneNumber(): string {
  const prefixes = ["0911", "0912", "0918", "0919", "0901", "0902", "0906", "0907", "0922", "0923", "0924", "0925"]
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const randomNumber = Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, "0")
  return randomPrefix + randomNumber
}

// توليد رقم وطني عشوائي
export function generateRandomNationalId(): string {
  return Math.floor(Math.random() * 10000000000000)
    .toString()
    .padStart(14, "0")
}

// توليد رقم جلوس عشوائي
export function generateRandomExamNumber(): string {
  return Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0")
}

// توليد رقم استمارة عشوائي
export function generateRandomFormNumber(): string {
  return Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0")
}

// توليد اسم عربي سوداني عشوائي
export function generateRandomArabicName(): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const middleName = middleNames[Math.floor(Math.random() * middleNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  return `${firstName} ${middleName} ${lastName}`
}

// توليد اسم مدرسة عشوائي
export function generateRandomSchool(): string {
  return schools[Math.floor(Math.random() * schools.length)]
}

// توليد كود تحقق عشوائي
export function generateVerificationCode(): string {
  return Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0")
}

// توليد بيانات مستخدم عشوائية
export function generateRandomUserData() {
  const gender = Math.random() > 0.5 ? "male" : "female"
  const tracks = ["academic", "industrial", "commercial", "women"]
  const states = ["khartoum", "gezira", "nile", "northern", "kassala", "red_sea", "gedaref", "sennar", "blue_nile"]

  return {
    name: generateRandomArabicName(),
    school: generateRandomSchool(),
    phoneNumber: generateRandomPhoneNumber(),
    nationalId: generateRandomNationalId(),
    gender: gender,
    examNumber: generateRandomExamNumber(),
    formNumber: generateRandomFormNumber(),
    track:
      gender === "female"
        ? Math.random() > 0.7
          ? "women"
          : tracks[Math.floor(Math.random() * 3)]
        : tracks[Math.floor(Math.random() * 3)],
    state: states[Math.floor(Math.random() * states.length)],
    verificationCode: generateVerificationCode(),
  }
}

