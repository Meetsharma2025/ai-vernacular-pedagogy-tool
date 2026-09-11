// ─────────────────────────────────────────────────────────────────────────────
// GyanSetu UI localization — when the student language changes, the WHOLE
// page (nav, headings, descriptions, buttons, empty states, badges) switches.
// Fallback chain: selected language → Hindi → English.
// Tribal-language UI strings are prototype packs (community validation
// pending) — where a translation is not yet validated, Hindi is used.
// Strings are written for 5–8 year old learners: short, warm, gamified.
// ─────────────────────────────────────────────────────────────────────────────
import { type LanguageCode } from "@/lib/languages";

export type UiKey =
  // shell
  | "home" | "teacher" | "liveMeet" | "learn" | "worksheets" | "dictionary"
  | "progress" | "askAi" | "flashcards" | "architecture"
  | "demoMode" | "onlineAI" | "onlineDesc" | "offlineAI" | "offlineDesc"
  | "checking" | "notConfigured" | "verifiedOk" | "verifiedPending" | "offlineBadge"
  | "login" | "logout" | "enterApp" | "demoLogin" | "yourName" | "teacherRole" | "studentRole"
  | "studentLang" | "teacherLang" | "answerLang" | "learningLang" | "classLabel"
  | "difficulty" | "easy" | "medium" | "hard" | "questions" | "allClasses" | "allSubjects"
  | "ask" | "search" | "listen" | "stopMic" | "sendClass" | "generate" | "start"
  | "submit" | "tryAgain" | "explainLesson" | "startQuiz" | "lookUp" | "print" | "save"
  | "sync" | "nextStep" | "readAloud" | "copy" | "copied" | "flip" | "prev" | "next"
  | "meaning" | "example" | "takeaway" | "steps" | "explanation" | "objective"
  | "answerKey" | "showAnswers" | "hideAnswers" | "try" | "thinking" | "voiceBridge"
  | "autoSpeak" | "pipeline" | "offlineSynced" | "syncDone"
  // home
  | "heroText" | "heroClass" | "heroAsk" | "demoTitle" | "demoSub"
  | "engineTitle" | "engineSub" | "engineB1" | "engineB2" | "engineB3" | "engineNet"
  | "pipe1T" | "pipe1X" | "pipe2T" | "pipe2X" | "pipe3T" | "pipe3X" | "pipe4T" | "pipe4X"
  | "qlTeacher" | "qlTeacherX" | "qlLearn" | "qlLearnX" | "qlWorksheets" | "qlWorksheetsX"
  | "qlDictionary" | "qlDictionaryX" | "qlFlashcards" | "qlFlashcardsX" | "qlProgress" | "qlProgressX"
  | "qlAsk" | "qlAskX" | "qlArch" | "qlArchX" | "homeLangNote1" | "homeLangNote2"
  // teacher
  | "teacherSub" | "statHindi" | "statMath" | "statEvs" | "teachModeTitle" | "teachModeSub"
  | "teachOnline1" | "teachOnline2" | "teachOffline1" | "teachOffline2" | "teachGotoClass"
  | "teachQuickTitle" | "teachQuickSub" | "qaWorksheet" | "qaBrowse" | "qaDictionary" | "qaProgress"
  | "teachLibTitle" | "teachLibSub" | "meetBanner" | "meetBannerText" | "openClass"
  // classroom
  | "classInputTitle" | "classInputSub" | "classOutputTitle" | "classOutputSub" | "classEmpty"
  | "classThinkOnline" | "classThinkOffline" | "classHint" | "classForChild" | "classSimplified"
  | "classNoteLabel" | "classMicFail" | "classMicStartFail" | "classPure" | "classMixed"
  | "classSpeaking" | "classTryLabel" | "classPipeline" | "classStudent" | "classTotal"
  | "classSTT" | "classAI" | "classTTS" | "classBridgeHint" | "bridgeAward"
  // learn
  | "learnSub" | "searchPh" | "learnEmpty" | "backAll" | "tabLesson" | "tabExplain" | "tabQuiz"
  | "hindiCurric" | "englishRef" | "examplesHi" | "examplesEn" | "explainCardTitle"
  | "explainSubOnline" | "explainSubOffline" | "explainInvite" | "explainBtn"
  | "explainThinkOnline" | "explainThinkOffline" | "quizCardTitle" | "quizSubOnline" | "quizSubOffline"
  | "quizInvite" | "quizBtn" | "quizThinkOnline" | "quizThinkOffline" | "submitQuiz"
  | "scoreLine" | "savedServer" | "savedQueue" | "savedFail" | "loginNote"
  | "great" | "good" | "perfect" | "tryMore" | "earnedStars"
  // worksheets
  | "wsSub" | "wsInfoOnline" | "wsInfoOffline" | "wsEmpty" | "wsSaved" | "wsSaveFail"
  | "wsTypeMcq" | "wsTypeFill" | "wsTypeShort" | "wsAnsLabel" | "wsAward"
  // flashcards
  | "fcSub" | "fcSubOnline" | "fcSubOffline" | "fcEmpty" | "fcFlipHint" | "fcLabel" | "fcAward"
  // dictionary
  | "dictSub" | "dictPh" | "dictEmpty" | "dictBadgeExact" | "dictBadgeAI" | "dictBadgeOffline" | "dictTransLabel"
  // progress
  | "progSubNamed" | "progSubAnon" | "statAttempts" | "statAvg" | "statEngine"
  | "histTitle" | "histSub" | "histEmpty" | "offlineWaiting" | "syncNothing" | "cachedAIBadge"
  | "syncUp" | "syncDown" | "onlineSyncHint" | "recTitle" | "recSubOnline" | "recSubOffline"
  | "recRemedial" | "recTargeted" | "recChallenge" | "recRevision" | "recOpenLesson"
  // ask
  | "askSub" | "askPh" | "askEmptyTitle" | "askEmptyText" | "askThinkOnline" | "askThinkOffline"
  | "outsideLessons" | "answerLabel" | "followUpLabel" | "askAward"
  // gamification
  | "mascotHi" | "mascotTip" | "levelLabel" | "xpLabel" | "xpToNext" | "rewardsTitle"
  | "achQuiz" | "achPerfect" | "achThree" | "achExplorer" | "achPolyglot" | "achWS" | "achFC"
  | "congrats"
  | "languageBar" | "askAnyLangNote"
  // studio / student panel / leaderboard / publishing
  | "studio" | "studioSub" | "uploadTitle" | "uploadSub" | "uploadKind" | "uploadText"
  | "uploadLink" | "uploadFile" | "uploadTitleLabel" | "uploadLesson" | "uploadPublish"
  | "uploadNote" | "uploadSuccess" | "uploadFail" | "uploadTextarea" | "uploadUrlPh"
  | "myClass" | "myClassSub" | "classGreeting" | "classFeed" | "classFeedEmpty"
  | "classLeaderboard" | "classYourLevel" | "leaderboardTitle" | "leaderboardEmpty"
  | "publishClass" | "publishedNote" | "viewContent" | "contentKind" | "classContent"
  | "studioSteps" | "studioExamples" | "studioTakeaway" | "studioListen"
  | "welcomeTeacher" | "welcomeStudent" | "welcomeGuest" | "you" | "recentPublished"
  | "syncNow" | "syncedAt" | "syncOfflineHint" | "syncSummary";

const HI: Record<UiKey, string> = {
  home: "🏠 होम", teacher: "👩‍🏫 शिक्षक", liveMeet: "🔴 लाइव मीट", learn: "🌱 सीखो",
  worksheets: "📝 कार्यपत्रक", dictionary: "📚 शब्दकोश", progress: "📊 प्रगति",
  askAi: "💬 AI से पूछो", flashcards: "🃏 फ़्लैशकार्ड", architecture: "⚙️ तकनीकी ढाँचा",
  demoMode: "प्रदर्शन मोड", onlineAI: "🌐 ऑनलाइन AI", onlineDesc: "Nemotron 3 Ultra — पूरी बुद्धिमत्ता (सुरक्षित सर्वर से)",
  offlineAI: "📴 ऑफ़लाइन", offlineDesc: "स्थानीय इंजन — सहेजे पाठ, शब्द-बैंक व सामग्री",
  checking: "🧠 Nemotron की जाँच…", notConfigured: "⚠️ ऑनलाइन — Nemotron कॉन्फ़िगर नहीं",
  verifiedOk: "🧠 ऑनलाइन — Nemotron 3 Ultra ✓", verifiedPending: "🧠 Nemotron कॉन्फ़िगर — सत्यापन बाकी",
  offlineBadge: "📴 ऑफ़लाइन — स्थानीय इंजन",
  login: "👤 लॉगिन", logout: "लॉगआउट", enterApp: "ज्ञानसेतु में आओ!",
  demoLogin: "डेमो लॉगिन", yourName: "तुम्हारा नाम", teacherRole: "👩‍🏫 शिक्षक", studentRole: "🧑‍🎓 विद्यार्थी",
  studentLang: "विद्यार्थी भाषा", teacherLang: "शिक्षक भाषा", answerLang: "उत्तर की भाषा",
  learningLang: "सीखने की भाषा", classLabel: "कक्षा", difficulty: "कठिनाई",
  easy: "आसान", medium: "मध्यम", hard: "कठिन", questions: "प्रश्न",
  allClasses: "सभी कक्षाएँ", allSubjects: "सभी विषय",
  ask: "पूछो ➤", search: "🔎 खोजो", listen: "🎤 बोलो (माइक)", stopMic: "⏹️ माइक बंद",
  sendClass: "🎙️ कक्षा में भेजो", generate: "🧠 बनाओ", start: "शुरू करो",
  submit: "✅ जमा करो", tryAgain: "🔄 फिर खेलो", explainLesson: "पाठ समझाओ",
  startQuiz: "क्विज़ शुरू करो", lookUp: "🔎 देखो", print: "🖨️ छापो", save: "💾 सहेजो",
  sync: "🔄 सिंक करो", nextStep: "🧭 अब आगे क्या?", readAloud: "🔊 सुनो",
  copy: "📋 नकल", copied: "✓ नकल हुआ", flip: "🔄 पलटो", prev: "← पिछला", next: "अगला →",
  meaning: "अर्थ", example: "🌱 रोज़मर्रा का उदाहरण", takeaway: "⭐ याद रखो",
  steps: "चरण", explanation: "समझ", objective: "🎯 सीखने का लक्ष्य",
  answerKey: "उत्तर-कुंजी", showAnswers: "🔑 उत्तर दिखाओ", hideAnswers: "🙈 उत्तर छिपाओ",
  try: "आज़माओ:", thinking: "सोच रहा है…", voiceBridge: "🗣️ आवाज़ से आवाज़ पुल",
  autoSpeak: "🔊 उत्तर अपने-आप बोलो", pipeline: "पाइपलाइन",
  offlineSynced: "ऑफ़लाइन सहेजा — ऑनलाइन होते ही सिंक होगा", syncDone: "✓ सिंक पूरा",

  heroText: "हिन्दी बोलने वाले शिक्षक बोलते हैं — Nemotron 3 Ultra समझता है, सरल बनाता है — और हर बच्चा Santhali, Ho या Mundari में सीखता है।",
  heroClass: "🔴 जादुई कक्षा आज़माओ", heroAsk: "💬 AI से सवाल पूछो",
  demoTitle: "🎛️ प्रदर्शन मोड", demoSub: "खुद चुनो — ऑनलाइन AI या ऑफ़लाइन। यह अपने आप कभी नहीं बदलता।",
  engineTitle: "🧠 इंजन की स्थिति", engineSub: "यह असली रास्ता दिखाता है — अनुमान नहीं।",
  engineB1: "ऑनलाइन: ब्राउज़र → GyanSetu API → Nemotron 3 Ultra। API key ब्राउज़र में कभी नहीं जाती।",
  engineB2: "ऑफ़लाइन: IndexedDB + बंडल पाठ्यक्रम + शब्द-बैंक। Nemotron उपयोग नहीं होता और UI ईमानदारी से बताता है।",
  engineB3: "विद्यार्थी भाषा: हर AI अनुरोध में चुनी भाषा जाती है — उत्तर उसी भाषा में आता है।",
  engineNet: "📶 डिवाइस की कनेक्टिविटी केवल जानकारी है — ऊपर चुना मोड ही रास्ता तय करता है।",
  pipe1T: "शिक्षक का इनपुट", pipe1X: "हिन्दी में आवाज़ या लिखित — किसी आदिवासी भाषा की ज़रूरत नहीं।",
  pipe2T: "AI शिक्षा-इंजन", pipe2X: "Nemotron अर्थ समझता है और छोटी कक्षा के लिए सरल बनाता है।",
  pipe3T: "मातृभाषा की परत", pipe3X: "Santhali, Ho, Mundari — पाठ, प्रश्न, क्विज़ और आवाज़।",
  pipe4T: "प्रगति व अनुकूलन", pipe4X: "असली क्विज़ नतीजे Nemotron को अगला कदम बताते हैं।",
  qlTeacher: "👩‍🏫 शिक्षक डैशबोर्ड", qlTeacherX: "कक्षा, जादुई कक्षा और लाइव अनुवाद",
  qlLearn: "🌱 सीखो", qlLearnX: "12 NIPUN पाठ + AI समझ और खेल-क्विज़",
  qlWorksheets: "📝 कार्यपत्रक", qlWorksheetsX: "Nemotron से द्विभाषी कार्यपत्रक",
  qlDictionary: "📚 शब्दकोश", qlDictionaryX: "तुरंत अर्थ + AI की समझ",
  qlFlashcards: "🃏 फ़्लैशकार्ड", qlFlashcardsX: "तुम्हारी भाषा में चित्र-कार्ड",
  qlProgress: "📊 प्रगति", qlProgressX: "सितारे, स्तर और स्मार्ट सुझाव",
  qlAsk: "💬 AI से पूछो", qlAskX: "कोई भी सवाल — मातृभाषा में उत्तर",
  qlArch: "⚙️ तकनीकी ढाँचा", qlArchX: "LLM/AI/बैकएंड डिज़ाइन + ऑफ़लाइन मैट्रिक्स",
  homeLangNote1: "अभी चुनी गई भाषा:", homeLangNote2: "— यह पूरे ऐप के हर पेज पर लागू है।",

  teacherSub: "हिन्दी में पढ़ाओ। GyanSetu हर बच्चे की मातृभाषा में पहुँचाता है।",
  statHindi: "📖 हिन्दी पाठ", statMath: "🔢 गणित पाठ", statEvs: "🌿 पर्यावरण पाठ",
  teachModeTitle: "🎛️ अभी का मोड", teachModeSub: "AI परत असल में क्या चला रही है",
  teachOnline1: "🧠 Nemotron 3 Ultra सक्रिय है: खोज, शिक्षा, अनुवाद, कार्यपत्रक, क्विज़, सुझाव।",
  teachOnline2: "सभी अनुरोध: शिक्षक-ब्राउज़र → GyanSetu सर्वर → OpenRouter/NVIDIA। keys सर्वर पर ही रहती हैं।",
  teachOffline1: "📴 ऑफ़लाइन इंजन सक्रिय: सहेजे पाठ, शब्द-बैंक अनुवाद, कैश्ड क्विज़/कार्यपत्रक।",
  teachOffline2: "पूरी Nemotron बुद्धिमत्ता के लिए ऊपर ONLINE AI चुनो।",
  teachGotoClass: "🔴 जादुई कक्षा में जाओ →",
  teachQuickTitle: "⚡ तुरंत काम", teachQuickSub: "पाठ तैयारी के उपकरण",
  qaWorksheet: "📝 कार्यपत्रक बनाओ", qaBrowse: "🌱 पाठ देखो", qaDictionary: "📚 शब्दकोश", qaProgress: "📊 कक्षा प्रगति",
  teachLibTitle: "📚 पाठ्यक्रम पुस्तकालय", teachLibSub: "NIPUN Bharat / FLN पाठ (कक्षा 1–3)",
  meetBanner: "Live Meet — जादुई कक्षा",
  meetBannerText: "शिक्षक हिन्दी बोलते हैं → AI अर्थ समझता है → बच्चा Santhali/Ho/Mundari में सुनता है (लिखित + आवाज़)",
  openClass: "🔴 Live Meet खोलो",

  classInputTitle: "👩‍🏫 शिक्षक — बोलो या लिखो", classInputSub: "इनपुट भाषा: {lang}",
  classOutputTitle: "🧑‍🎓 विद्यार्थी — मातृभाषा में सुनता है", classOutputSub: "आउटपुट भाषा: {lang}",
  classEmpty: "शिक्षक का निर्देश यहाँ {lang} में आएगा — छोटे बच्चे के लिए सरल रूप में।",
  classThinkOnline: "Nemotron अनुवाद व शिक्षा-अनुकूलन कर रहा है…",
  classThinkOffline: "ऑफ़लाइन शब्द-बैंक अनुवाद कर रहा है…",
  classHint: "अर्थ समझना → शिक्षा-अनुकूलन → {lang} आउटपुट",
  classForChild: "🗣️ {lang} — बच्चे के लिए", classSimplified: "✏️ कक्षा 1–3 के लिए सरल",
  classNoteLabel: "नोट", classMicFail: "इस ब्राउज़र में आवाज़ काम नहीं करती — लिखकर भेजो।",
  classMicStartFail: "माइक चालू नहीं हुआ — लिखकर भेजो।",
  classPure: "शुद्ध {lang}", classMixed: "भाषा-मिश्रण ठीक किया",
  classSpeaking: "🔊 बोल रहा है…", classTryLabel: "आज़माओ:",
  classPipeline: "पाइपलाइन", classStudent: "विद्यार्थी", classTotal: "कुल",
  classSTT: "आवाज़→लिखित", classAI: "AI", classTTS: "लिखित→आवाज़",
  classBridgeHint: "(माइक → अनुवाद → आवाज़)", bridgeAward: "जादुई पुल चला! +1 ⭐",

  learnSub: "NIPUN Bharat / FLN पाठ (कक्षा 1–3)। अपने शब्दों में खोजो — जैसे “पानी से बादल कैसे बनते हैं?”",
  searchPh: "🔍 अपने शब्दों में खोजो…",
  learnEmpty: "कोई पाठ नहीं मिला। “बारिश”, “जोड़” या “संज्ञा” आज़माओ।",
  backAll: "← सभी पाठ",
  tabLesson: "📖 पाठ", tabExplain: "🧠 AI समझ", tabQuiz: "❓ खेल-क्विज़",
  hindiCurric: "📘 हिन्दी — पाठ्यक्रम", englishRef: "🌐 English — संदर्भ",
  examplesHi: "उदाहरण", examplesEn: "Examples",
  explainCardTitle: "🧠 AI की समझ — {lang}",
  explainSubOnline: "Nemotron इस पाठ से ताज़ा समझ बनाता है", explainSubOffline: "ऑफ़लाइन इंजन सहेजे पाठ से उत्तर देता है",
  explainInvite: "यह पाठ {lang} में कहानी की तरह समझो!",
  explainBtn: "🧠 {lang} में समझाओ",
  explainThinkOnline: "Nemotron समझ तैयार कर रहा है…", explainThinkOffline: "सहेजे पाठ से पढ़ रहा है…",
  quizCardTitle: "❓ खेल-क्विज़ — {title}", quizSubOnline: "Nemotron इसी पाठ से सवाल बनाता है",
  quizSubOffline: "ऑफ़लाइन सहेजा क्विज़",
  quizInvite: "सवाल इसी पाठ के अंदर से आएँगे — और तुम्हारे पिछले स्कोर के अनुसार!",
  quizBtn: "❓ {lang} क्विज़ शुरू करो",
  quizThinkOnline: "Nemotron सवाल लिख रहा है…", quizThinkOffline: "सहेजा क्विज़ खुल रहा है…",
  submitQuiz: "✅ उत्तर जमा करो", scoreLine: "स्कोर:",
  savedServer: "✓ प्रगति में सहेजा गया (असली डेटाबेस रिकॉर्ड)।",
  savedQueue: "📴 ऑफ़लाइन सहेजा — ONLINE AI चुनते ही सिंक होगा।",
  savedFail: "प्रगति सहेज नहीं पाए।",
  loginNote: "प्रगति बचाने के लिए ऊपर दाईं ओर लॉगिन करो।",
  great: "शाबाश! 👏", good: "अच्छा! 🌟", perfect: "पूरे नंबर! 💯", tryMore: "फिर खेलो!",
  earnedStars: "सितारे मिले:",

  wsSub: "असली पाठ से द्विभाषी कार्यपत्रक — सवाल पाठ्यक्रम के अंदर ही रहते हैं और {lang} में आते हैं।",
  wsInfoOnline: "Nemotron 3 Ultra लाइव बनाता है — पाठ की कक्षा, विषय, लक्ष्य और NIPUN परिणाम के साथ। नतीजा मान्यता-जाँच से गुज़रता है।",
  wsInfoOffline: "ऑफ़लाइन मोड सहेजे कार्यपत्रक पैक का उपयोग करता है।",
  wsEmpty: "पाठ चुनो और “कार्यपत्रक बनाओ” दबाओ। शिक्षक का हिन्दी इनपुट {lang} में बदल जाता है।",
  wsSaved: "✓ कार्यपत्रक स्कूल डेटाबेस में सहेजा गया।", wsSaveFail: "सहेज नहीं पाए।",
  wsTypeMcq: "सही उत्तर चुनो", wsTypeFill: "खाली जगह भरो", wsTypeShort: "छोटा उत्तर लिखो",
  wsAnsLabel: "✅ उत्तर:", wsAward: "कार्यपत्रक तैयार! +5 ⭐",

  fcSub: "{lang} में कार्ड — शब्द, अर्थ, उदाहरण और सीखने का लक्ष्य।",
  fcSubOnline: "Nemotron पाठ से बनाता है।", fcSubOffline: "सहेजे पैक से बनता है।",
  fcEmpty: "पाठ चुनो और {lang} कार्ड बनाओ!",
  fcFlipHint: "कार्ड छुओ — जादू से अर्थ दिखेगा! ✨", fcLabel: "कार्ड",
  fcAward: "कार्ड का पहाड़ तैयार! +5 ⭐",

  dictSub: "पक्के शब्द तुरंत मिलते हैं। अधूरे या गलत लिखे सवाल — जैसे “कमल का मतलब क्या है?” — AI समझता है।",
  dictPh: "पानी, बादल, खरगोश… या पूरा सवाल",
  dictEmpty: "शब्दकोश में {n} पक्के शब्द हैं (हिन्दी/English/Santhali/Ho/Mundari) — ऑनलाइन मोड में किसी भी शब्द की AI समझ मिलती है।",
  dictBadgeExact: "📚 पक्का स्थानीय शब्द — बिना AI कॉल",
  dictBadgeAI: "🧠 AI की संदर्भ-समझ", dictBadgeOffline: "📴 ऑफ़लाइन शब्दकोश",
  dictTransLabel: "{lang} में",

  progSubNamed: "{name} ({role}) के असली क्विज़ रिकॉर्ड — स्कूल डेटाबेस में।",
  progSubAnon: "क्विज़ ट्रैक करने के लिए ऊपर लॉगिन करो। रिकॉर्ड असली डेटाबेस पंक्तियाँ हैं।",
  statAttempts: "क्विज़ प्रयास", statAvg: "औसत स्कोर", statEngine: "उपयोग इंजन",
  histTitle: "🧾 प्रयास इतिहास", histSub: "PostgreSQL में Drizzle ORM से सहेजा",
  histEmpty: "अभी कोई क्विज़ नहीं — सीखो खोलो और खेल-क्विज़ खेलो। नतीजा असली रिकॉर्ड बनता है और Nemotron अगला कदम सुझाता है।",
  offlineWaiting: "📴 {n} रिकॉर्ड ऑफ़लाइन सहेजे हैं — ONLINE AI चुनो या सिंक दबाओ।",
  syncNothing: "सिंक करने को कुछ नहीं।",
  cachedAIBadge: "कैश्ड AI", syncUp: "{n} ऑफ़लाइन रिकॉर्ड ऊपर भेजे ✓",
  syncDown: "{n} AI उत्तर ऑफ़लाइन उपयोग के लिए सहेजे ✓",
  onlineSyncHint: "🧠 हर Nemotron उत्तर अपने-आप PostgreSQL में सहेजता है — सिंक इतिहास को डिवाइस पर लाता है, ताकि वही सवाल बाद में ऑफ़लाइन भी चलें।",
  recTitle: "🧭 AI सीखने का सुझाव", recSubOnline: "Nemotron ने असली प्रगति पर सोचा",
  recSubOffline: "ऑफ़लाइन ह्यूरिस्टिक",
  recRemedial: "🔁 फिर अभ्यास", recTargeted: "🎯 अभ्यास", recChallenge: "🚀 चुनौती", recRevision: "🔁 दोहराना",
  recOpenLesson: "🌱 यह पाठ खोलो →",

  askSub: "पाठों के बारे में कुछ भी पूछो। उत्तर {lang} में आएगा — छोटे बच्चे के लिए, रोज़मर्रा के उदाहरण के साथ।",
  askPh: "अपना सवाल पूछो… जैसे: पानी से बादल कैसे बनते हैं?",
  askEmptyTitle: "🧒 अभी कोई सवाल नहीं",
  askEmptyText: "पूछो: “पानी बादल कैसे बनता है?” — Nemotron जल चक्र को कहानी की तरह समझाएगा!",
  askThinkOnline: "Nemotron सोच रहा है…", askThinkOffline: "स्थानीय इंजन उत्तर दे रहा है…",
  outsideLessons: "पाठ से बाहर", answerLabel: "उत्तर", followUpLabel: "🤔",
  askAward: "सवाल पूछा! +2 ⭐",

  languageBar: "🌐 भाषा / Language",
  askAnyLangNote: "तुम किसी भी भाषा में लिखो — उत्तर हमेशा {lang} में ही मिलेगा।",
  studio: "📤 अपलोड स्टूडियो", studioSub: "पाठ सामग्री अपलोड करो — Nemotron उसे हर बच्चे की भाषा में ढाल देगा।",
  uploadTitle: "📤 नई सामग्री अपलोड करो", uploadSub: "लिखो, PDF चुनो या लिंक दो — प्रकाशित होते ही विद्यार्थियों को दिखेगा।",
  uploadKind: "प्रकार", uploadText: "✍️ लिखित (text)", uploadLink: "🔗 लिंक (link)", uploadFile: "📎 फ़ाइल (txt/pdf)",
  uploadTitleLabel: "शीर्षक", uploadLesson: "संबंधित पाठ", uploadPublish: "📢 प्रकाशित करो",
  uploadNote: "प्रकाशित करते ही: शिक्षक → Nemotron → विद्यार्थी। सामग्री बच्चे की भाषा में सरल होकर, उदाहरणों और चरणों (flowchart) के साथ पहुँचेगी।",
  uploadSuccess: "✓ प्रकाशित! अब विद्यार्थियों के 'मेरी कक्षा' में दिखेगा।", uploadFail: "अपलोड नहीं हुआ। फिर कोशिश करो।",
  uploadTextarea: "यहाँ पाठ लिखो…", uploadUrlPh: "https://…",
  myClass: "🎒 मेरी कक्षा", myClassSub: "तुम्हारी दुनिया — सितारे, स्तर, लीडरबोर्ड और शिक्षक की नई सामग्री।",
  classGreeting: "नमस्ते {name}! 👋", classFeed: "📢 शिक्षक की सामग्री", classFeedEmpty: "अभी शिक्षक ने कुछ प्रकाशित नहीं किया — बाद में फिर देखो!",
  classLeaderboard: "🏆 कक्षा लीडरबोर्ड", classYourLevel: "तुम्हारा स्तर",
  leaderboardTitle: "🏆 लीडरबोर्ड", leaderboardEmpty: "अभी कोई स्कोर नहीं — पहली क्विज़ खेलो!",
  publishClass: "📢 कक्षा में प्रकाशित करो", publishedNote: "✓ विद्यार्थियों के लिए प्रकाशित!",
  viewContent: "📖 पढ़ो", contentKind: "प्रकार", classContent: "🎒 विद्यार्थी क्षेत्र में पढ़ो",
  studioSteps: "चरण-प्रवाह (flowchart)", studioExamples: "रोज़मर्रा के उदाहरण", studioTakeaway: "⭐ याद रखो",
  studioListen: "🔊 सुनो",
  syncNow: "🔄 ऑफ़लाइन के लिए सिंक करो",
  syncedAt: "आखिरी सिंक: {time}",
  syncOfflineHint: "ऑनलाइन होकर एक बार सिंक करो — फिर पाठ, AI उत्तर, कक्षा सामग्री और पूरा UI (Nemotron-अनुवादित) ऑफ़लाइन चलेंगे।",
  syncSummary: "सिंक पूरा ✓ — {n} चीज़ें ऑफ़लाइन तैयार",
  welcomeTeacher: "नमस्ते शिक्षक! 👋 आज की कक्षा तैयार करो — अपलोड स्टूडियो और जादुई कक्षा आपकी मदद के लिए हैं।",
  welcomeStudent: "नमस्ते {name}! 👋 आओ खेल-खेल में सीखें — आज का पाठ खोलो और सितारे कमाओ!",
  welcomeGuest: "नमस्ते! 👋 लॉगिन करो और अपनी कक्षा खोलो — सितारे, स्तर और लीडरबोर्ड तुम्हारा इंतज़ार कर रहे हैं।",
  you: "तुम", recentPublished: "हाल में प्रकाशित",
  mascotHi: "नमस्ते! मैं ज्ञानू हूँ 🐘", mascotTip: "सीखो, खेलो और सितारे कमाओ!",
  levelLabel: "स्तर", xpLabel: "सितारे", xpToNext: "अगले स्तर तक", rewardsTitle: "🏆 तुम्हारी उपलब्धियाँ",
  achQuiz: "पहली क्विज़", achPerfect: "पूरे नंबर!", achThree: "तीन क्विज़",
  achExplorer: "ऑफ़लाइन खोजी", achPolyglot: "बहुभाषी विद्यार्थी", achWS: "पहला कार्यपत्रक",
  achFC: "कार्ड मास्टर", congrats: "बधाई हो! 🎉",
};

const EN: Record<UiKey, string> = {
  home: "🏠 Home", teacher: "👩‍🏫 Teacher", liveMeet: "🔴 Live Meet", learn: "🌱 Learn",
  worksheets: "📝 Worksheets", dictionary: "📚 Dictionary", progress: "📊 Progress",
  askAi: "💬 Ask AI", flashcards: "🃏 Flashcards", architecture: "⚙️ Architecture",
  demoMode: "Demo Mode", onlineAI: "🌐 ONLINE AI", onlineDesc: "Nemotron 3 Ultra — full intelligence via secure server",
  offlineAI: "📴 OFFLINE", offlineDesc: "Local engine — synced lessons, word-bank & saved content",
  checking: "🧠 Checking Nemotron…", notConfigured: "⚠️ ONLINE — Nemotron not configured",
  verifiedOk: "🧠 ONLINE — Nemotron 3 Ultra ✓", verifiedPending: "🧠 Nemotron configured — verification pending",
  offlineBadge: "📴 OFFLINE — Local/Cached Engine",
  login: "👤 Login", logout: "Logout", enterApp: "Come into GyanSetu!",
  demoLogin: "Demo login", yourName: "Your name", teacherRole: "👩‍🏫 Teacher", studentRole: "🧑‍🎓 Student",
  studentLang: "Student language", teacherLang: "Teacher language", answerLang: "Answer language",
  learningLang: "Learning language", classLabel: "Class", difficulty: "Difficulty",
  easy: "Easy", medium: "Medium", hard: "Hard", questions: "Questions",
  allClasses: "All classes", allSubjects: "All subjects",
  ask: "Ask ➤", search: "🔎 Search", listen: "🎤 Speak (mic)", stopMic: "⏹️ Stop mic",
  sendClass: "🎙️ Send to classroom", generate: "🧠 Generate", start: "Start",
  submit: "✅ Submit", tryAgain: "🔄 Play again", explainLesson: "Explain lesson",
  startQuiz: "Start quiz", lookUp: "🔎 Look up", print: "🖨️ Print", save: "💾 Save",
  sync: "🔄 Sync now", nextStep: "🧭 What's next?", readAloud: "🔊 Listen",
  copy: "📋 Copy", copied: "✓ Copied", flip: "🔄 Flip", prev: "← Prev", next: "Next →",
  meaning: "Meaning", example: "🌱 Everyday example", takeaway: "⭐ Takeaway",
  steps: "Steps", explanation: "Explanation", objective: "🎯 Learning objective",
  answerKey: "Answer key", showAnswers: "🔑 Show answer key", hideAnswers: "🙈 Hide answer key",
  try: "Try:", thinking: "Thinking…", voiceBridge: "🗣️ Voice → Voice bridge",
  autoSpeak: "🔊 Auto-speak answers", pipeline: "Pipeline",
  offlineSynced: "Saved offline — syncs when online", syncDone: "✓ Sync complete",

  heroText: "A Hindi-speaking teacher talks — Nemotron 3 Ultra understands, simplifies — and every child learns in Santhali, Ho or Mundari.",
  heroClass: "🔴 Try the Magic Classroom", heroAsk: "💬 Ask AI a question",
  demoTitle: "🎛️ Demonstration Mode", demoSub: "You choose — ONLINE AI or OFFLINE. It never changes by itself.",
  engineTitle: "🧠 Engine Status", engineSub: "This shows the real execution path — never a guess.",
  engineB1: "Online: browser → GyanSetu API → Nemotron 3 Ultra. The API key never enters the browser.",
  engineB2: "Offline: IndexedDB + bundled curriculum + word-bank. Nemotron is not used and the UI says so honestly.",
  engineB3: "Student language: every AI request carries your language — answers come back in that language only.",
  engineNet: "📶 Device connectivity is informational only — the mode you choose above decides the path.",
  pipe1T: "Teacher Input", pipe1X: "Voice or text in Hindi — no fluency in tribal languages needed.",
  pipe2T: "AI Pedagogy Engine", pipe2X: "Nemotron understands meaning and simplifies it for Class 1–3.",
  pipe3T: "Mother-Tongue Layer", pipe3X: "Santhali, Ho, Mundari — lessons, questions, quizzes and audio.",
  pipe4T: "Progress & Adaptation", pipe4X: "Real quiz results tell Nemotron the next step.",
  qlTeacher: "👩‍🏫 Teacher Dashboard", qlTeacherX: "Classroom, Magic Classroom & live translation",
  qlLearn: "🌱 Learn", qlLearnX: "12 NIPUN lessons + AI explanations & game quizzes",
  qlWorksheets: "📝 Worksheets", qlWorksheetsX: "Nemotron-generated bilingual worksheets",
  qlDictionary: "📚 Dictionary", qlDictionaryX: "Instant meanings + AI understanding",
  qlFlashcards: "🃏 Flashcards", qlFlashcardsX: "Picture-cards in your language",
  qlProgress: "📊 Progress", qlProgressX: "Stars, levels and smart suggestions",
  qlAsk: "💬 Ask AI", qlAskX: "Any question — answered in your mother tongue",
  qlArch: "⚙️ Architecture", qlArchX: "LLM/AI/backend design + offline matrix",
  homeLangNote1: "Selected language:", homeLangNote2: "— it applies to every page of the app.",

  teacherSub: "Teach in Hindi. GyanSetu delivers in every child's mother tongue.",
  statHindi: "📖 Hindi lessons", statMath: "🔢 Math lessons", statEvs: "🌿 EVS lessons",
  teachModeTitle: "🎛️ Current mode", teachModeSub: "What the AI layer is actually running",
  teachOnline1: "🧠 Nemotron 3 Ultra is active: search, pedagogy, translation, worksheets, quizzes, recommendations.",
  teachOnline2: "All requests: teacher-browser → GyanSetu server → OpenRouter/NVIDIA. Keys stay server-side.",
  teachOffline1: "📴 Offline engine active: synced lessons, word-bank translation, cached quizzes/worksheets.",
  teachOffline2: "Choose ONLINE AI above for full Nemotron intelligence.",
  teachGotoClass: "🔴 Go to Magic Classroom →",
  teachQuickTitle: "⚡ Quick actions", teachQuickSub: "Lesson preparation tools",
  qaWorksheet: "📝 Make worksheet", qaBrowse: "🌱 Browse lessons", qaDictionary: "📚 Dictionary", qaProgress: "📊 Class progress",
  teachLibTitle: "📚 Curriculum library", teachLibSub: "NIPUN Bharat / FLN lessons (Classes 1–3)",
  meetBanner: "Live Meet — Magic Classroom",
  meetBannerText: "Teacher speaks Hindi → AI understands meaning → child hears Santhali/Ho/Mundari (text + audio)",
  openClass: "🔴 Open Live Meet",

  classInputTitle: "👩‍🏫 Teacher — Speak or Type", classInputSub: "Input language: {lang}",
  classOutputTitle: "🧑‍🎓 Student — Hears in Mother Tongue", classOutputSub: "Output language: {lang}",
  classEmpty: "The teacher's instruction will appear here in {lang} — simplified for a young child.",
  classThinkOnline: "Nemotron is translating & adapting…",
  classThinkOffline: "Offline word-bank is translating…",
  classHint: "Meaning → pedagogy → {lang} output",
  classForChild: "🗣️ {lang} — for the child", classSimplified: "✏️ Simplified for Class 1–3",
  classNoteLabel: "Note", classMicFail: "Voice input is not supported in this browser — please type instead.",
  classMicStartFail: "Mic could not start — please type instead.",
  classPure: "pure {lang}", classMixed: "language-mix repaired",
  classSpeaking: "🔊 speaking…", classTryLabel: "Try:",
  classPipeline: "Pipeline", classStudent: "Student", classTotal: "total",
  classSTT: "voice→text", classAI: "AI", classTTS: "text→voice",
  classBridgeHint: "(mic → translate → speak)", bridgeAward: "Magic bridge worked! +1 ⭐",

  learnSub: "NIPUN Bharat / FLN lessons (Classes 1–3). Search in your own words — e.g. “पानी से बादल कैसे बनते हैं?”",
  searchPh: "🔍 Search in your own words…",
  learnEmpty: "No lessons found. Try “बारिश”, “जोड़” or “संज्ञा”.",
  backAll: "← All lessons",
  tabLesson: "📖 Lesson", tabExplain: "🧠 AI Explain", tabQuiz: "❓ Game Quiz",
  hindiCurric: "📘 हिन्दी — Curriculum", englishRef: "🌐 English — Reference",
  examplesHi: "उदाहरण", examplesEn: "Examples",
  explainCardTitle: "🧠 AI explanation — {lang}",
  explainSubOnline: "Nemotron builds a fresh explanation from this lesson", explainSubOffline: "Offline engine answers from the synced pack",
  explainInvite: "Understand this lesson like a story — in {lang}!",
  explainBtn: "🧠 Explain in {lang}",
  explainThinkOnline: "Nemotron is preparing the explanation…", explainThinkOffline: "Reading the synced pack…",
  quizCardTitle: "❓ Game Quiz — {title}", quizSubOnline: "Nemotron writes questions inside this lesson",
  quizSubOffline: "Offline synced quiz",
  quizInvite: "Questions stay inside this lesson — and match your past scores!",
  quizBtn: "❓ Start {lang} quiz",
  quizThinkOnline: "Nemotron is writing questions…", quizThinkOffline: "Opening synced quiz…",
  submitQuiz: "✅ Submit answers", scoreLine: "Score:",
  savedServer: "✓ Saved to your progress (real database record).",
  savedQueue: "📴 Saved offline — syncs when you choose ONLINE AI.",
  savedFail: "Progress could not be saved.",
  loginNote: "Login (top-right) to save this result.",
  great: "Well done! 👏", good: "Good! 🌟", perfect: "Perfect! 💯", tryMore: "Play again!",
  earnedStars: "Stars earned:",

  wsSub: "Bilingual worksheets from the real lesson — questions stay inside the curriculum and come in {lang}.",
  wsInfoOnline: "Generated live by Nemotron 3 Ultra with the lesson's class, subject, objective and NIPUN outcome. Output is schema-validated.",
  wsInfoOffline: "Offline mode uses the synced worksheet pack.",
  wsEmpty: "Pick a lesson and press Generate — the teacher's Hindi input becomes a {lang} worksheet.",
  wsSaved: "✓ Worksheet saved to the school database.", wsSaveFail: "Could not save this worksheet.",
  wsTypeMcq: "choose one", wsTypeFill: "fill the blank", wsTypeShort: "short answer",
  wsAnsLabel: "✅ Answer:", wsAward: "Worksheet ready! +5 ⭐",

  fcSub: "Cards in {lang} — word, meaning, example and learning goal.",
  fcSubOnline: "Generated by Nemotron from the lesson.", fcSubOffline: "Built from the synced pack.",
  fcEmpty: "Pick a lesson and make {lang} cards!",
  fcFlipHint: "Touch the card — the meaning appears like magic! ✨", fcLabel: "Cards",
  fcAward: "Deck ready! +5 ⭐",

  dictSub: "Exact words are answered instantly. Misspelled or full questions — like “कमल का मतलब क्या है?” — are understood by AI.",
  dictPh: "पानी, बादल, खरगोश… or a full question",
  dictEmpty: "The dictionary has {n} exact entries (Hindi/English/Santhali/Ho/Mundari) — online mode adds AI understanding for any word.",
  dictBadgeExact: "📚 Exact local entry — no AI call",
  dictBadgeAI: "🧠 Contextual AI understanding", dictBadgeOffline: "📴 Offline dictionary",
  dictTransLabel: "In {lang}",

  progSubNamed: "Real quiz records for {name} ({role}) — in the school database.",
  progSubAnon: "Login (top-right) to track your quizzes. Records are real database rows.",
  statAttempts: "Quiz attempts", statAvg: "Average score", statEngine: "Engine used",
  histTitle: "🧾 Attempt history", histSub: "Stored in PostgreSQL via Drizzle ORM",
  histEmpty: "No quiz attempts yet — open Learn and play a game quiz. The result becomes a real record and Nemotron suggests the next step.",
  offlineWaiting: "📴 {n} record(s) saved offline are waiting — choose ONLINE AI or press sync.",
  syncNothing: "Nothing to sync.",
  cachedAIBadge: "cached AI", syncUp: "{n} offline record(s) synced up ✓",
  syncDown: "{n} AI result(s) stored for offline use ✓",
  onlineSyncHint: "🧠 Every Nemotron answer is stored in PostgreSQL automatically — sync downloads the history to this device, so the same questions work offline later.",
  recTitle: "🧭 AI learning suggestion", recSubOnline: "Nemotron reasoned over your real progress",
  recSubOffline: "Offline heuristic",
  recRemedial: "🔁 Practice again", recTargeted: "🎯 Practice", recChallenge: "🚀 Challenge", recRevision: "🔁 Revision",
  recOpenLesson: "🌱 Open this lesson →",

  askSub: "Ask anything about your lessons. Answers come in {lang} — for a young child, with an everyday example.",
  askPh: "Ask your question… e.g. How does water become clouds?",
  askEmptyTitle: "🧒 No questions yet",
  askEmptyText: "Ask: “How does water become a cloud?” — Nemotron will explain the water cycle like a story!",
  askThinkOnline: "Nemotron is thinking…", askThinkOffline: "Local engine is answering…",
  outsideLessons: "outside lessons", answerLabel: "Answer", followUpLabel: "🤔",
  askAward: "Question asked! +2 ⭐",

  languageBar: "🌐 Language",
  askAnyLangNote: "Type in any language — the answer always comes in {lang}.",
  studio: "📤 Upload Studio", studioSub: "Upload lesson material — Nemotron adapts it into every child's language.",
  uploadTitle: "📤 Upload new content", uploadSub: "Type, pick a PDF or paste a link — students see it as soon as you publish.",
  uploadKind: "Type", uploadText: "✍️ Text", uploadLink: "🔗 Link", uploadFile: "📎 File (txt/pdf)",
  uploadTitleLabel: "Title", uploadLesson: "Related lesson", uploadPublish: "📢 Publish",
  uploadNote: "On publish: Teacher → Nemotron → Student. Content arrives simplified in the child's language with examples and step-flows.",
  uploadSuccess: "✓ Published! Now visible in students' My Class.", uploadFail: "Upload failed. Please try again.",
  uploadTextarea: "Write the text here…", uploadUrlPh: "https://…",
  myClass: "🎒 My Class", myClassSub: "Your world — stars, levels, leaderboard and the teacher's latest content.",
  classGreeting: "Hi {name}! 👋", classFeed: "📢 Teacher's content", classFeedEmpty: "The teacher hasn't published anything yet — check back later!",
  classLeaderboard: "🏆 Class Leaderboard", classYourLevel: "Your level",
  leaderboardTitle: "🏆 Leaderboard", leaderboardEmpty: "No scores yet — play the first quiz!",
  publishClass: "📢 Publish to class", publishedNote: "✓ Published for students!",
  viewContent: "📖 Read", contentKind: "Type", classContent: "🎒 Read in the student area",
  studioSteps: "Step-flow", studioExamples: "Everyday examples", studioTakeaway: "⭐ Takeaway",
  studioListen: "🔊 Listen",
  syncNow: "🔄 Sync for offline",
  syncedAt: "Last sync: {time}",
  syncOfflineHint: "Sync once while online — then lessons, AI answers, class content and the whole UI (Nemotron-translated) work offline.",
  syncSummary: "Sync complete ✓ — {n} items ready offline",
  welcomeTeacher: "Hello Teacher! 👋 Prepare today's class — Upload Studio and Magic Classroom are here to help.",
  welcomeStudent: "Hi {name}! 👋 Let's learn by playing — open today's lesson and earn stars!",
  welcomeGuest: "Hello! 👋 Log in to open your class — stars, levels and the leaderboard are waiting.",
  you: "you", recentPublished: "Recently published",
  mascotHi: "Hi! I am Gyanu 🐘", mascotTip: "Learn, play and earn stars!",
  levelLabel: "Level", xpLabel: "stars", xpToNext: "to next level", rewardsTitle: "🏆 Your achievements",
  achQuiz: "First Quiz", achPerfect: "Full Marks!", achThree: "Three Quizzes",
  achExplorer: "Offline Explorer", achPolyglot: "Polyglot Learner", achWS: "First Worksheet",
  achFC: "Card Master", congrats: "Congratulations! 🎉",
};

// Prototype tribal UI strings (Devanagari school script). Unvalidated keys
// fall back to Hindi via the chain — content still follows the selection.
const TRIBAL_COMMON: Partial<Record<UiKey, string>> = {
  liveMeet: "🔴 लाइव मीट", architecture: "⚙️ तकनीकी ढाँचा",
  demoMode: "प्रदर्शन मोड", onlineAI: "🌐 ऑनलाइन AI", offlineAI: "📴 ऑफ़लाइन",
  login: "👤 लॉगिन", logout: "लॉगआउट", enterApp: "ज्ञानसेतु में आओ!",
  demoLogin: "डेमो लॉगिन", yourName: "तुम्हारा नाम", teacherRole: "👩‍🏫 शिक्षक",
  studentRole: "🧑‍🎓 विद्यार्थी", languageBar: "🌐 भाषा",
  studentLang: "विद्यार्थी भाषा", teacherLang: "शिक्षक भाषा", answerLang: "उत्तर भाषा",
  learningLang: "सीखने भाषा", classLabel: "कक्षा", difficulty: "कठिनाई",
  easy: "आसान", medium: "मध्यम", hard: "कठिन", questions: "प्रश्न",
  allClasses: "सभी कक्षा", allSubjects: "सभी विषय",
  ask: "पूछो ➤", search: "🔎 खोजो", listen: "🎤 रो", stopMic: "⏹️ माइक बंद",
  sendClass: "🎙️ कक्षा में भेजो", generate: "🧠 बनाओ", start: "शुरू",
  submit: "✅ जमा करो", tryAgain: "🔄 फिर खेलो", explainLesson: "पाठ समझाओ",
  startQuiz: "क्विज़ शुरू", lookUp: "🔎 देखो", print: "🖨️ छापो", save: "💾 रखो",
  sync: "🔄 सिंक", nextStep: "🧭 अब आगे क्या?", readAloud: "🔊 सुनो",
  copy: "📋 नकल", copied: "✓ नकल हुआ", flip: "🔄 पलटो", prev: "← पिछला", next: "आगे →",
  meaning: "अर्थ", example: "🌱 उदाहरण", takeaway: "⭐ याद रखो",
  steps: "चरण", explanation: "समझ", objective: "🎯 लक्ष्य",
  answerKey: "उत्तर-कुंजी", showAnswers: "🔑 उत्तर दिखाओ", hideAnswers: "🙈 उत्तर छिपाओ",
  try: "आज़माओ:", thinking: "सोच रहा…",
  backAll: "← सभी पाठ", tabLesson: "📖 पाठ", tabExplain: "🧠 AI समझ", tabQuiz: "❓ खेल-क्विज़",
  hindiCurric: "📘 हिन्दी पाठ्यक्रम", englishRef: "🌐 English संदर्भ",
  examplesHi: "उदाहरण", examplesEn: "Examples",
  quizBtn: "❓ क्विज़ शुरू करो", submitQuiz: "✅ उत्तर जमा करो", scoreLine: "स्कोर:",
  perfect: "पूरे नंबर! 💯", good: "अच्छा! 🌟", great: "शाबाश! 👏",
  earnedStars: "सितारे मिले:", loginNote: "प्रगति बचाने हेतु लॉगिन करो।",
  mascotTip: "सीखो, खेलो आड़ सितारे पाओ!", levelLabel: "स्तर", xpLabel: "सितारे",
  rewardsTitle: "🏆 तुम्हारी उपलब्धियाँ",
  meetBanner: "Live Meet — जादुई कक्षा",
  classForChild: "🗣️ {lang} — बच्चा हेतु", classSimplified: "✏️ कक्षा 1–3 हेतु सरल",
  classNoteLabel: "नोट", classStudent: "विद्यार्थी", classTotal: "कुल",
  heroClass: "🔴 जादुई कक्षा देखो", heroAsk: "💬 AI से सवाल पूछो",
  recOpenLesson: "🌱 यह पाठ खोलो →",
  outsideLessons: "पाठ से बाहर", answerLabel: "उत्तर",
  askAnyLangNote: "तुम किसी भी भाषा में लिखो — उत्तर हमेशा {lang} में ही मिलेगा।",
  statAttempts: "क्विज़ प्रयास", statAvg: "औसत स्कोर", statEngine: "उपयोग इंजन",
};

const SAT: Partial<Record<UiKey, string>> = {
  ...TRIBAL_COMMON,
  home: "🏠 ओराक", teacher: "👩‍🏫 गुरु", learn: "🌱 सीखो",
  worksheets: "📝 कार्यपत्रक", dictionary: "📚 शब्दकोश", progress: "📊 प्रगति",
  askAi: "💬 पूछो", flashcards: "🃏 कार्ड",
  mascotHi: "जोहार! इंयाम ज्ञानू हूँ 🐘",
  teacherSub: "हिन्दी में पढ़ाओ। GyanSetu हर बच्चा रे मातृभाषा में पहुँचाता है।",
  classEmpty: "गुरु रे बात इंयाहाँ {lang} में आएगा — छोटे बच्चा हेतु सरल रूप में।",
};

const HOC: Partial<Record<UiKey, string>> = {
  ...TRIBAL_COMMON,
  home: "🏠 ओवा", teacher: "👩‍🏫 मास्टर", learn: "🌱 सीखो",
  worksheets: "📝 कार्यपत्रक", dictionary: "📚 शब्दकोश", progress: "📊 प्रगति",
  askAi: "💬 पूछो", flashcards: "🃏 कार्ड",
  mascotHi: "जोहार! इन्या ज्ञानू हूँ 🐘",
  teacherSub: "हिन्दी में पढ़ाओ। GyanSetu हर बच्चा रे मातृभाषा में पहुँचाता है।",
  classEmpty: "मास्टर रे बात इन्याहाँ {lang} में आएगा — छोटे बच्चा हेतु सरल रूप में।",
};

const UNR: Partial<Record<UiKey, string>> = {
  ...TRIBAL_COMMON,
  home: "🏠 ओरा", teacher: "👩‍🏫 गुरु", learn: "🌱 सीखो",
  worksheets: "📝 कार्यपत्रक", dictionary: "📚 शब्दकोश", progress: "📊 प्रगति",
  askAi: "💬 पूछो", flashcards: "🃏 कार्ड",
  mascotHi: "जोहार! इंया ज्ञानू हूँ 🐘",
  teacherSub: "हिन्दी में पढ़ाओ। GyanSetu हर बच्चा रे मातृभाषा में पहुँचाता है।",
  classEmpty: "गुरु रे बात इंयाहाँ {lang} में आएगा — छोटे बच्चा हेतु सरल रूप में।",
};

const MAI: Partial<Record<UiKey, string>> = {
  ...TRIBAL_COMMON,
  home: "🏠 घर", teacher: "👩‍🏫 गुरु", learn: "🌱 सीखू",
  worksheets: "📝 कार्यपत्रक", dictionary: "📚 शब्दकोश", progress: "📊 प्रगति",
  askAi: "💬 पूछू", flashcards: "🃏 कार्ड",
  mascotHi: "प्रणाम! हम ज्ञानू छी 🐘",
  teacherSub: "हिन्दी मे पढ़ाबू। GyanSetu हर बच्चाक मातृभाषा मे पहुँचाबैत अछि।",
  classEmpty: "गुरुक बात एतय {lang} मे आयत — छोट बच्चा लेल आसान रूप मे।",
  great: "शाबाश! 👏", earnedStars: "सितारा भेटल:", loginNote: "प्रगति बचाबय लेल लॉगिन करू।",
};

const DICTS: Record<LanguageCode, Partial<Record<UiKey, string>>> = {
  hi: HI,
  en: EN,
  sat: SAT,
  hoc: HOC,
  mai: MAI,
  unr: UNR,
};

export function translateUi(lang: LanguageCode, key: UiKey, vars?: Record<string, string>): string {
  let s = DICTS[lang][key] ?? HI[key] ?? EN[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.split(`{${k}}`).join(v);
    }
  }
  return s;
}

export function makeT(lang: LanguageCode) {
  return (key: UiKey, vars?: Record<string, string>) => translateUi(lang, key, vars);
}

export type TFunc = (key: UiKey, vars?: Record<string, string>) => string;

/**
 * Core UI keys that get pre-translated by Nemotron during the manual sync —
 * the SAME source strings that useLocalized() registers on screen. After a
 * sync, the whole app chrome renders in the tribal language even offline.
 */
export const UI_SYNC_KEYS: UiKey[] = [
  "home", "teacher", "liveMeet", "learn", "worksheets", "flashcards", "dictionary",
  "progress", "askAi", "myClass", "studio", "demoMode", "onlineAI", "offlineAI",
  "login", "logout", "studentLang", "teacherLang", "learningLang", "answerLang",
  "classLabel", "allClasses", "allSubjects", "ask", "search", "listen", "stopMic",
  "sendClass", "generate", "start", "submit", "tryAgain", "startQuiz", "lookUp",
  "print", "save", "syncNow", "syncOfflineHint", "nextStep", "readAloud", "copy",
  "flip", "prev", "next", "meaning", "example", "takeaway", "steps", "explanation",
  "objective", "answerKey", "showAnswers", "hideAnswers", "try", "classFeed",
  "classLeaderboard", "rewardsTitle", "mascotTip", "leaderboardEmpty",
  "classFeedEmpty", "uploadTitle", "uploadPublish", "publishClass", "viewContent",
  "studioSteps", "studioExamples", "studioTakeaway", "studioListen",
  "welcomeTeacher", "welcomeStudent", "welcomeGuest", "teacherSub", "learnSub",
  "dictSub", "myClassSub", "studioSub",
];
