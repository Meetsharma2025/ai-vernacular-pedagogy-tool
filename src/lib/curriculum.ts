// ─────────────────────────────────────────────────────────────────────────────
// GyanSetu curriculum — NIPUN Bharat / FLN-aligned seed content for Classes 1–3.
// This data is BOTH the database seed AND the built-in offline pack, so the
// app works after initial sync and even with no connectivity at all.
// Tribal-language glossaries are prototype packs (flagged for community
// validation) — online mode uses Nemotron for full translation.
// ─────────────────────────────────────────────────────────────────────────────

export interface SampleQuestion {
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

export interface LessonSeed {
  slug: string;
  class: number;
  subject: "Hindi" | "Math" | "EVS";
  titleHi: string;
  titleEn: string;
  concept: string;
  objective: string;
  nipunOutcome: string;
  keywords: string[];
  explanationHi: string;
  explanationEn: string;
  examplesHi: string[];
  examplesEn: string[];
  sampleQuiz: SampleQuestion[];
  sampleWorksheet: SampleQuestion[];
}

export const CURRICULUM: LessonSeed[] = [
  {
    slug: "water-cycle",
    class: 2,
    subject: "EVS",
    titleHi: "जल चक्र",
    titleEn: "Water Cycle",
    concept: "जल चक्र / water cycle",
    objective: "बच्चे समझेंगे कि पानी भाप बनकर बादल कैसे बनाता है और वर्षा कैसे होती है।",
    nipunOutcome: "EVS-2: जल के रूप परिवर्तन का प्रेक्षण (NIPUN EVS2-4)",
    keywords: ["जल", "पानी", "बादल", "भाप", "बारिश", "वर्षा", "सूरज", "धूप", "वाष्प", "water", "cloud", "rain", "vapour", "evaporation", "नदी", "तालाब", "आकाश"],
    explanationHi:
      "सूरज की गर्मी से नदी, तालाब और खेत का पानी धीरे-धीरे भाप बनकर आकाश में ऊपर चला जाता है। ऊपर ठंड लगने से भाप की छोटी-छोटी बूँदें बनती हैं और वे मिलकर बादल बनाती हैं। जब बूँदें भारी हो जाती हैं तो बारिश के रूप में नीचे गिरती हैं। यही जल चक्र है — पानी का घूमता हुआ चक्कर।",
    explanationEn:
      "The sun's heat turns water from rivers, ponds and fields into vapour that rises into the sky. High up it cools, forms tiny droplets, and the droplets join to make clouds. When the droplets grow heavy they fall as rain. This endless round trip of water is the water cycle.",
    examplesHi: [
      "धूप में गीले कपड़े सूख जाते हैं क्योंकि उनका पानी भाप बनकर हवा में चला जाता है।",
      "बरसात के बाद तालाब का पानी बढ़ जाता है और धूप निकलने पर धीरे-धीरे घट जाता है।",
    ],
    examplesEn: [
      "Wet clothes dry in sunlight because their water turns into vapour and goes into the air.",
      "After rain the pond fills up, and when the sun shines the water level slowly goes down.",
    ],
    sampleQuiz: [
      { question: "पानी को भाप में कौन बदलता है?", options: ["सूरज की गर्मी", "हवा", "चाँद", "मिट्टी"], answer: "सूरज की गर्मी", explanation: "सूरज की गर्मी पानी को भाप में बदलती है।" },
      { question: "बादल किससे बनते हैं?", options: ["धूल से", "भाप की छोटी बूँदों से", "पत्तों से", "रेत से"], answer: "भाप की छोटी बूँदों से", explanation: "भाप की छोटी बूँदें मिलकर बादल बनाती हैं।" },
      { question: "बारिश कहाँ से आती है?", options: ["नल से", "बादलों से", "पेड़ से", "कुएँ से"], answer: "बादलों से", explanation: "बादलों की बूँदें भारी होकर बारिश बनकर गिरती हैं।" },
    ],
    sampleWorksheet: [
      { question: "गीले कपड़े धूप में क्यों सूखते हैं?", answer: "क्योंकि पानी भाप बनकर हवा में चला जाता है।" },
      { question: "सही क्रम लगाओ: बादल → पानी → भाप → बारिश", options: ["पानी → भाप → बादल → बारिश", "बारिश → भाप → बादल → पानी", "भाप → बारिश → पानी → बादल"], answer: "पानी → भाप → बादल → बारिश" },
      { question: "जल चक्र में सूरज क्या करता है?", answer: "सूरज पानी को गर्म करके भाप बनाता है।" },
    ],
  },
  {
    slug: "clean-water",
    class: 2,
    subject: "EVS",
    titleHi: "साफ़ पानी, स्वस्थ शरीर",
    titleEn: "Clean Water, Healthy Body",
    concept: "स्वच्छ जल / clean drinking water",
    objective: "बच्चे साफ़ पानी पीने की आदत और गंदे पानी से होने वाली बीमारियाँ समझेंगे।",
    nipunOutcome: "EVS-1: स्वास्थ्य व स्वच्छता (NIPUN EVS1-2)",
    keywords: ["साफ़", "पानी", "स्वच्छ", "स्वास्थ्य", "शरीर", "गंदा", "उबाल", "बीमारी", "हाथ", "धोना", "clean", "water", "health", "boil"],
    explanationHi:
      "हमें पीने के लिए साफ़ पानी ही लेना चाहिए। गंदा पानी पीने से पेट में बीमारी हो सकती है। पानी को उबालकर या छानकर पीना चाहिए। खाना खाने से पहले और शौच के बाद साबुन से हाथ धोना भी हमें स्वस्थ रखता है।",
    explanationEn:
      "We must drink only clean water. Dirty water can make our stomach sick. Boil or filter water before drinking. Washing hands with soap before eating and after using the toilet also keeps us healthy.",
    examplesHi: ["पानी को 10 मिनट उबालने पर उसमें के कीटाणु मर जाते हैं।", "नल का पानी छानकर रखो तो उसमें की मिट्टी नीचे बैठ जाती है।"],
    examplesEn: ["Boiling water for 10 minutes kills the germs in it.", "If tap water is kept after filtering, the mud settles down."],
    sampleQuiz: [
      { question: "पीने का पानी कैसा होना चाहिए?", options: ["साफ़", "गंदा", "मीठा", "गरम"], answer: "साफ़", explanation: "हमें हमेशा साफ़ पानी पीना चाहिए।" },
      { question: "खाने से पहले क्या करना चाहिए?", options: ["साबुन से हाथ धोना", "दौड़ना", "सोना", "गाना"], answer: "साबुन से हाथ धोना", explanation: "हाथ धोने से कीटाणु दूर रहते हैं।" },
      { question: "पानी को कितने मिनट उबालना चाहिए?", options: ["1 मिनट", "10 मिनट", "100 मिनट", "कभी नहीं"], answer: "10 मिनट", explanation: "10 मिनट उबालने से कीटाणु मर जाते हैं।" },
    ],
    sampleWorksheet: [
      { question: "साफ़ पानी क्यों पीना चाहिए?", answer: "गंदे पानी से बीमारी होती है, इसलिए साफ़ पानी पीना चाहिए।" },
      { question: "हाथ कब-कब धोने चाहिए?", answer: "खाने से पहले और शौच के बाद।" },
    ],
  },
  {
    slug: "weather",
    class: 2,
    subject: "EVS",
    titleHi: "मौसम: धूप, बादल, बारिश",
    titleEn: "Weather: Sun, Clouds, Rain",
    concept: "मौसम / weather",
    objective: "बच्चे धूप, बादल, बारिश और मौसम के बदलाव को पहचानेंगे।",
    nipunOutcome: "EVS-2: मौसम का प्रेक्षण (NIPUN EVS2-3)",
    keywords: ["मौसम", "धूप", "बादल", "बारिश", "ठंड", "गर्मी", "छाता", "मौसम", "weather", "sun", "cloud", "rain", "season", "मानसून", "सर्दी"],
    explanationHi:
      "हर दिन आसमान अलग दिखता है — कभी धूप, कभी बादल, कभी बारिश। इसे मौसम कहते हैं। गर्मी के मौसम में धूप तेज़ होती है, बरसात के मौसम में बादल घिरते हैं और बारिश होती है, सर्दी में ठंड लगती है। बारिश से खेत, पेड़ और नदियाँ तर हो जाती हैं।",
    explanationEn:
      "Every day the sky looks different — sometimes sunny, sometimes cloudy, sometimes rainy. That is the weather. In summer the sun is strong, in monsoon clouds gather and it rains, in winter it is cold. Rain waters the fields, trees and rivers.",
    examplesHi: ["बादल काले दिखें तो छाता लेकर जाना चाहिए।", "धूप में गीले कपड़े जल्दी सूख जाते हैं।"],
    examplesEn: ["If the clouds look dark, carry an umbrella.", "Wet clothes dry quickly in the sun."],
    sampleQuiz: [
      { question: "बारिश किस मौसम में होती है?", options: ["बरसात में", "केवल रात में", "धूप में", "कभी नहीं"], answer: "बरसात में", explanation: "बरसात के मौसम में बादल घिरकर बारिश करते हैं।" },
      { question: "काले बादल देखकर क्या करना चाहिए?", options: ["छाता लेना", "आग जलाना", "नहाना", "सोना"], answer: "छाता लेना", explanation: "काले बादल बारिश का संकेत देते हैं।" },
    ],
    sampleWorksheet: [
      { question: "मौसम किसे कहते हैं?", answer: "दिन-प्रतिदिन आसमान की दशा जैसे धूप, बादल, बारिश को मौसम कहते हैं।" },
    ],
  },
  {
    slug: "photosynthesis",
    class: 3,
    subject: "EVS",
    titleHi: "प्रकाश संश्लेषण",
    titleEn: "Photosynthesis",
    concept: "पेड़-पौधे अपना भोजन कैसे बनाते हैं",
    objective: "बच्चे समझेंगे कि पौधे सूरज की रोशनी से अपना भोजन बनाते हैं।",
    nipunOutcome: "EVS-3: पादप जीवन प्रक्रिया (NIPUN EVS3-2)",
    keywords: ["पौधा", "पेड़", "पत्ता", "सूरज", "रोशनी", "धूप", "जड़", "पानी", "भोजन", "photosynthesis", "plant", "leaf", "sunlight", "root", "हरा"],
    explanationHi:
      "पौधे अपना भोजन खुद बनाते हैं। जड़ से पानी और मिट्टी का पोषण लेते हैं, पत्ते हवा से कार्बन डाइऑक्साइड लेते हैं, और सूरज की रोशनी की मदद से अपना भोजन बनाते हैं। इसीलिए पत्ते हरे रहते हैं और दिन में धूप पसंद करते हैं।",
    explanationEn:
      "Plants make their own food. Roots take water and nutrients from soil, leaves take carbon dioxide from the air, and with sunlight the plant makes its food. That is why leaves stay green and love daylight.",
    examplesHi: ["जिस पौधे को धूप नहीं मिलती, उसके पत्ते पीले पड़ जाते हैं।", "खेत की फसल को सूरज की रोशनी मिलने पर ही अच्छा दाना लगता है।"],
    examplesEn: ["A plant kept in the dark gets pale leaves.", "Crops give good grain only when they get sunlight."],
    sampleQuiz: [
      { question: "पौधा पानी कहाँ से लेता है?", options: ["जड़ से", "फूल से", "तने के ऊपर से", "हवा से"], answer: "जड़ से", explanation: "जड़ें मिट्टी से पानी खींचती हैं।" },
      { question: "पौधे का भोजन बनाने में किसकी मदद लेता है?", options: ["सूरज की रोशनी", "चाँद की रोशनी", "बिजली की रोशनी", "आग"], answer: "सूरज की रोशनी", explanation: "रोशनी की मदद से पत्ते भोजन बनाते हैं।" },
    ],
    sampleWorksheet: [
      { question: "पत्तियाँ हरी क्यों होती हैं?", answer: "क्योंकि उनमें हरित कण होते हैं जो सूरज की रोशनी से भोजन बनाते हैं।" },
    ],
  },
  {
    slug: "my-body",
    class: 1,
    subject: "EVS",
    titleHi: "मेरा शरीर",
    titleEn: "My Body",
    concept: "शरीर के अंग / body parts",
    objective: "बच्चे अपने शरीर के मुख्य अंगों के नाम और काम जानेंगे।",
    nipunOutcome: "EVS-1: शरीर की जागरूकता (NIPUN EVS1-1)",
    keywords: ["शरीर", "हाथ", "पैर", "आँख", "कान", "नाक", "मुँह", "सिर", "body", "hand", "leg", "eye", "ear", "nose", "उँगली"],
    explanationHi:
      "हमारा शरीर अलग-अलग अंगों से बना है। आँखों से देखते हैं, कानों से सुनते हैं, नाक से सूँघते हैं, मुँह से खाते-बोलते हैं, हाथों से काम करते हैं और पैरों से चलते हैं। हर अंग का अपना काम है।",
    explanationEn:
      "Our body has many parts. We see with eyes, hear with ears, smell with the nose, eat and speak with the mouth, work with hands and walk with legs. Every part has its own job.",
    examplesHi: ["खेलते समय हाथ-पैर दौड़ने-पकड़ने में मदद करते हैं।", "गर्म चीज़ से हाथ तुरंत हट जाता है।"],
    examplesEn: ["While playing, hands and legs help us run and catch.", "The hand quickly pulls away from something hot."],
    sampleQuiz: [
      { question: "हम किससे देखते हैं?", options: ["आँखों से", "कानों से", "नाक से", "पैरों से"], answer: "आँखों से", explanation: "आँखें देखने का काम करती हैं।" },
      { question: "किससे सुनते हैं?", options: ["कानों से", "आँखों से", "हाथों से", "मुँह से"], answer: "कानों से", explanation: "कान सुनने का काम करते हैं।" },
    ],
    sampleWorksheet: [
      { question: "नाक का काम क्या है?", answer: "नाक से हम सूँघते और साँस लेते हैं।" },
    ],
  },
  {
    slug: "clever-rabbit",
    class: 2,
    subject: "Hindi",
    titleHi: "चालाक खरगोश",
    titleEn: "The Clever Rabbit",
    concept: "कहानी पठन / story reading",
    objective: "बच्चे कहानी सुनकर समझेंगे और उसका मुख्य विचार बताएँगे।",
    nipunOutcome: "HIN-2: कहानी सुनकर समझना (NIPUN HIN2-1)",
    keywords: ["खरगोश", "चालाक", "कहानी", "शेर", "जंगल", "कुआँ", "rabbit", "lion", "story", "clever", "साहस", "बुद्धि"],
    explanationHi:
      "एक बार एक शेर जंगल के सभी जानवरों को डराता था। एक चालाक खरगोश ने बुद्धि से काम लिया — वह शेर को कुएँ के पास ले गया और कहा कि कुएँ में एक और शेर रहता है। शेर ने पानी में अपनी ही परछाई देखी और गुस्से में कूद पड़ा। इस तरह बुद्धि से बड़ा जानवर भी हार गया।",
    explanationEn:
      "A lion used to frighten all the animals of the jungle. A clever rabbit used his wits — he led the lion to a well and said another lion lived inside. The lion saw his own reflection in the water and jumped in angrily. So brains defeated strength.",
    examplesHi: ["छोटी चींटी मेहनत और एकता से बड़ा बोझ उठा लेती है।", "मुसीबत में डरना नहीं, सोचना चाहिए।"],
    examplesEn: ["A small ant lifts a big load with hard work and unity.", "In trouble, think instead of being afraid."],
    sampleQuiz: [
      { question: "कहानी में जंगल का डर कौन था?", options: ["शेर", "खरगोश", "हिरण", "कौआ"], answer: "शेर", explanation: "शेर सभी जानवरों को डराता था।" },
      { question: "खरगोश ने शेर को कहाँ ले गया?", options: ["कुएँ के पास", "नदी के पास", "पहाड़ पर", "बाज़ार"], answer: "कुएँ के पास", explanation: "कुएँ में शेर ने अपनी परछाई देखी।" },
      { question: "कहानी से क्या सीखते हैं?", options: ["बुद्धि से बड़ी समस्या हल होती है", "डरना अच्छा है", "बल ही सब कुछ है", "कुछ नहीं"], answer: "बुद्धि से बड़ी समस्या हल होती है", explanation: "खरगोश ने बुद्धि से शेर को हराया।" },
    ],
    sampleWorksheet: [
      { question: "शेर कुएँ में क्यों कूदा?", answer: "उसने पानी में अपनी परछाई को दूसरा शेर समझा।" },
    ],
  },
  {
    slug: "varnamala",
    class: 1,
    subject: "Hindi",
    titleHi: "वर्णमाला",
    titleEn: "Alphabet (Varnamala)",
    concept: "स्वर व व्यंजन / vowels & consonants",
    objective: "बच्चे हिन्दी वर्णमाला के स्वर और व्यंजन पहचानेंगे।",
    nipunOutcome: "HIN-1: वर्ण पहचान (NIPUN HIN1-1)",
    keywords: ["वर्णमाला", "स्वर", "व्यंजन", "अ", "आ", "क", "ख", "अक्षर", "alphabet", "vowel", "letter", "लिखना"],
    explanationHi:
      "हिन्दी भाषा के अक्षरों को वर्णमाला कहते हैं। इसमें स्वर होते हैं — अ, आ, इ, ई, उ, ऊ, ए, ऐ, ओ, औ, अं, अः — जो अकेले बोले जा सकते हैं। व्यंजन — क, ख, ग, घ... — स्वर की मदद से बोले जाते हैं। स्वर और व्यंजन मिलकर शब्द बनते हैं।",
    explanationEn:
      "The letters of the Hindi language are called varnamala. Vowels (swar) — a, aa, i, ee... — can be spoken alone. Consonants (vyanjan) — ka, kha, ga... — need a vowel to be spoken. Vowels and consonants join to make words.",
    examplesHi: ["'अ' + 'म' = अम", "'क' + 'अ' = क", "बच्चे 'अ से अनार, आ से आम' गीत से वर्णमाला सीखते हैं।"],
    examplesEn: ["'a' + 'm' = am", "'k' + 'a' = ka", "Children learn the alphabet with the 'a se anar, aa se aam' song."],
    sampleQuiz: [
      { question: "इनमें से स्वर कौन-सा है?", options: ["अ", "क", "म", "र"], answer: "अ", explanation: "अ स्वर है, क-म-र व्यंजन हैं।" },
      { question: "'क' क्या है?", options: ["व्यंजन", "स्वर", "मात्रा", "शब्द"], answer: "व्यंजन", explanation: "क एक व्यंजन है।" },
    ],
    sampleWorksheet: [
      { question: "अ से शुरू होने वाला एक शब्द लिखो।", answer: "अनार / अमरूद / अनाज" },
    ],
  },
  {
    slug: "noun",
    class: 3,
    subject: "Hindi",
    titleHi: "संज्ञा",
    titleEn: "Noun (Sangya)",
    concept: "संज्ञा / naming words",
    objective: "बच्चे व्यक्ति, वस्तु, स्थान और जानवरों के नाम (संज्ञा) पहचानेंगे।",
    nipunOutcome: "HIN-3: व्याकरण आधार (NIPUN HIN3-2)",
    keywords: ["संज्ञा", "नाम", "व्यक्ति", "वस्तु", "स्थान", "जानवर", "noun", "name", "राम", "स्कूल", "गाँव"],
    explanationHi:
      "जो शब्द किसी व्यक्ति, वस्तु, स्थान, जानवर या भाव का नाम बताए, उसे संज्ञा कहते हैं। जैसे — राम (व्यक्ति), किताब (वस्तु), स्कूल (स्थान), गाय (जानवर)। नाम बताने वाला शब्द ही संज्ञा है।",
    explanationEn:
      "A word that names a person, thing, place, animal or feeling is called a noun (sangya). For example — Ram (person), book (thing), school (place), cow (animal).",
    examplesHi: ["मेरा गाँव छोटा है — 'गाँव' संज्ञा है।", "सीता आम खाती है — 'सीता' और 'आम' संज्ञाएँ हैं।"],
    examplesEn: ["My village is small — 'village' is a noun.", "Sita eats a mango — 'Sita' and 'mango' are nouns."],
    sampleQuiz: [
      { question: "'स्कूल' किस प्रकार का शब्द है?", options: ["संज्ञा", "क्रिया", "विशेषण", "कुछ नहीं"], answer: "संज्ञा", explanation: "स्कूल स्थान का नाम है, इसलिए संज्ञा है।" },
      { question: "इनमें से संज्ञा कौन-सी है?", options: ["किताब", "खेलना", "तेज़", "और"], answer: "किताब", explanation: "किताब वस्तु का नाम है — संज्ञा।" },
    ],
    sampleWorksheet: [
      { question: "इनमें से संज्ञा छाँटो: सुंदर, पेड़, दौड़ना", answer: "पेड़" },
    ],
  },
  {
    slug: "addition",
    class: 1,
    subject: "Math",
    titleHi: "जोड़: 1 से 20 तक",
    titleEn: "Addition: 1 to 20",
    concept: "जोड़ / addition",
    objective: "बच्चे 1 से 20 तक की संख्याओं को जोड़ना सीखेंगे।",
    nipunOutcome: "MAT-1: जोड़ की समझ (NIPUN MAT1-2)",
    keywords: ["जोड़", "जोड़ना", "मिलाना", "गिनती", "संख्या", "addition", "add", "sum", "total", "आम", "बीज", "पेंसिल"],
    explanationHi:
      "जब हम दो चीज़ों के समूह को मिलाते हैं तो जोड़ बनता है। जैसे 2 आम + 3 आम = 5 आम। जोड़ने पर संख्या बढ़ती है। जोड़ का चिह्न '+' होता है और उत्तर को 'जोड़' या 'योग' कहते हैं।",
    explanationEn:
      "When we join two groups of things we get addition. For example 2 mangoes + 3 mangoes = 5 mangoes. Adding makes the number bigger. The sign of addition is '+' and the answer is called the sum.",
    examplesHi: ["कलमदान में 4 पेंसिल और 3 पेंसिल रखीं — कुल 7 पेंसिल।", "5 बीज + 2 बीज = 7 बीज।"],
    examplesEn: ["4 pencils + 3 pencils in the box = 7 pencils.", "5 seeds + 2 seeds = 7 seeds."],
    sampleQuiz: [
      { question: "3 + 4 = ?", options: ["7", "6", "8", "5"], answer: "7", explanation: "3 और 4 मिलकर 7 होते हैं।" },
      { question: "5 + 5 = ?", options: ["10", "9", "11", "8"], answer: "10", explanation: "पाँच और पाँच मिलकर दस होते हैं।" },
      { question: "2 + 6 = ?", options: ["8", "7", "9", "6"], answer: "8", explanation: "दो और छह मिलकर आठ होते हैं।" },
    ],
    sampleWorksheet: [
      { question: "6 + 2 = ?", answer: "8" },
      { question: "9 + 1 = ?", answer: "10" },
      { question: "4 + 4 = ?", answer: "8" },
    ],
  },
  {
    slug: "subtraction",
    class: 2,
    subject: "Math",
    titleHi: "घटाव: लेना-देना",
    titleEn: "Subtraction: Take Away",
    concept: "घटाव / subtraction",
    objective: "बच्चे वस्तुओं को घटाकर शेष निकालना सीखेंगे।",
    nipunOutcome: "MAT-2: घटाव की समझ (NIPUN MAT2-2)",
    keywords: ["घटाव", "घटाना", "लेना", "शेष", "बचना", "subtraction", "minus", "take away", "left", "संतरे", "मिठाई"],
    explanationHi:
      "जब किसी समूह में से कुछ चीज़ें ले ली जाती हैं तो घटाव होता है। जैसे 7 संतरे में से 2 संतरे दे दिए तो 5 बचे। घटाव का चिह्न '−' है और बची हुई संख्या को 'शेष' कहते हैं। घटाने पर संख्या छोटी होती है।",
    explanationEn:
      "When things are taken away from a group we get subtraction. If 2 oranges are given away from 7, then 5 are left. The sign of subtraction is '−' and the remaining number is called the difference. Subtracting makes the number smaller.",
    examplesHi: ["10 मिठाई में से 4 खा लीं — 6 बचीं।", "पाँच गिलास में से 1 टूट गया — 4 बचे।"],
    examplesEn: ["Out of 10 sweets, 4 were eaten — 6 remained.", "One glass broke out of five — 4 remained."],
    sampleQuiz: [
      { question: "9 − 3 = ?", options: ["6", "7", "5", "8"], answer: "6", explanation: "9 में से 3 लेने पर 6 बचते हैं।" },
      { question: "8 − 8 = ?", options: ["0", "1", "8", "16"], answer: "0", explanation: "सब ले लिया तो कुछ नहीं बचा — शून्य।" },
      { question: "12 − 2 = ?", options: ["10", "11", "9", "14"], answer: "10", explanation: "12 में से 2 घटाने पर 10 बचते हैं।" },
    ],
    sampleWorksheet: [
      { question: "15 − 5 = ?", answer: "10" },
      { question: "7 − 3 = ?", answer: "4" },
    ],
  },
  {
    slug: "numbers-99",
    class: 2,
    subject: "Math",
    titleHi: "99 तक की संख्याएँ",
    titleEn: "Numbers up to 99",
    concept: "स्थानीय मान / place value",
    objective: "बच्चे 99 तक की संख्याओं को पढ़ेंगे, लिखेंगे और उनका दहाई-इकाई समझेंगे।",
    nipunOutcome: "MAT-2: संख्या पहचान (NIPUN MAT2-1)",
    keywords: ["संख्या", "गिनती", "दहाई", "इकाई", "99", "numbers", "count", "tens", "ones", "place value", "सौ"],
    explanationHi:
      "हर संख्या अंकों से बनती है। 47 में 4 दहाई और 7 इकाई हैं — यानी चालीस और सात मिलकर सैंतालीस। दहाई का घर बाईं ओर और इकाई का घर दाईं ओर होता है। 99 सबसे बड़ी दो अंकों की संख्या है, उसके बाद 100 आता है।",
    explanationEn:
      "Every number is made of digits. In 47 there are 4 tens and 7 ones — forty and seven make forty-seven. The tens place is on the left and the ones place on the right. 99 is the biggest two-digit number; after it comes 100.",
    examplesHi: ["35 = 3 दहाई + 5 इकाई", "बाज़ार में 50 रुपये में 10 पेंसिलें मिलती हैं।"],
    examplesEn: ["35 = 3 tens + 5 ones", "In the market 10 pencils cost 50 rupees."],
    sampleQuiz: [
      { question: "47 में कितनी दहाई हैं?", options: ["4", "7", "40", "11"], answer: "4", explanation: "47 में 4 दहाई और 7 इकाई हैं।" },
      { question: "सबसे बड़ी दो अंकों की संख्या कौन-सी है?", options: ["99", "90", "100", "98"], answer: "99", explanation: "99 के बाद ही 100 आता है।" },
    ],
    sampleWorksheet: [
      { question: "56 = ___ दहाई + ___ इकाई", answer: "5 दहाई + 6 इकाई" },
      { question: "78 और 80 के बीच की संख्या क्या है?", answer: "79" },
    ],
  },
  {
    slug: "time",
    class: 2,
    subject: "Math",
    titleHi: "समय: घड़ी देखना",
    titleEn: "Time: Reading the Clock",
    concept: "समय / time & clock",
    objective: "बच्चे घड़ी में बजे और आधे बजे देखना सीखेंगे।",
    nipunOutcome: "MAT-2: समय की समझ (NIPUN MAT2-4)",
    keywords: ["समय", "घड़ी", "घंटा", "मिनट", "सुबह", "शाम", "time", "clock", "hour", "minute", "दिन", "रात"],
    explanationHi:
      "घड़ी हमें समय बताती है। घड़ी की छोटी सुई घंटा और लंबी सुई मिनट बताती है। लंबी सुई 12 पर हो तो पूरे बजते हैं, 6 पर हो तो आधे बजते हैं। सुबह स्कूल जाते हैं, दोपहर में खाना खाते हैं, शाम को खेलते हैं और रात में सोते हैं।",
    explanationEn:
      "A clock tells us time. The short hand shows hours and the long hand shows minutes. When the long hand is at 12 it is the full hour, at 6 it is half past. We go to school in the morning, eat at noon, play in the evening and sleep at night.",
    examplesHi: ["स्कूल सुबह 8 बजे लगता है।", "दादी की पुरानी घड़ी की घंटी बजती है।"],
    examplesEn: ["School starts at 8 in the morning.", "Grandma's old clock rings."],
    sampleQuiz: [
      { question: "छोटी सुई क्या बताती है?", options: ["घंटा", "मिनट", "सेकंड", "दिन"], answer: "घंटा", explanation: "छोटी सुई घंटा बताती है।" },
      { question: "लंबी सुई 12 पर हो तो क्या बजता है?", options: ["पूरे बजते हैं", "आधे बजते हैं", "सवा बजते हैं", "कुछ नहीं"], answer: "पूरे बजते हैं", explanation: "12 पर लंबी सुई होने पर पूरे बजते हैं।" },
    ],
    sampleWorksheet: [
      { question: "लंबी सुई 6 पर हो तो क्या बजता है?", answer: "आधे बजते हैं।" },
    ],
  },
];

// ── Prototype dictionary / phrasebook (flagged for community validation) ────
export interface DictionaryEntry {
  hi: string;
  en: string;
  sat?: string; // Santhali (Devanagari school script)
  hoc?: string; // Ho (Devanagari school script)
  mai?: string; // Maithili (Devanagari)
  unr?: string; // Mundari (Devanagari)
  kind?: string;
}

// ── Authoritative classroom phrasebook (community-validated reference) ──────
// These 20 teacher-classroom phrases in 5 languages are used as few-shot
// grounding for Nemotron so classroom translations stay authentic.
export interface Phrase {
  hi: string;
  sat: string;
  hoc: string;
  mai: string;
  unr: string;
}

export const PHRASEBOOK: Phrase[] = [
  { hi: "नमस्ते, आप कैसे हैं?", sat: "जोहार, आम चेत लेका मेना?", hoc: "जोहार, अम चेत लेका मेना?", mai: "प्रणाम, अहाँ कोना छी?", unr: "जोहार, नंग चेतना मेना?" },
  { hi: "मेरा नाम राहुल है।", sat: "इञाक् ञुत राहुल काना़।", hoc: "इङाक् नाम राहुल तना।", mai: "हमर नाम राहुल अछि।", unr: "अइञाक् नाम राहुल तना।" },
  { hi: "आज मौसम बहुत अच्छा है।", sat: "तिहिंज साकाम बाते सोहना मेना।", hoc: "तिसिंग सुसुन ते सोना मेना।", mai: "आइ मौसम बहुत नीक अछि।", unr: "तिसिङ मौसम बुगिन तना।" },
  { hi: "बच्चे स्कूल जा रहे हैं।", sat: "होपोन को इस्कुल सेत् आकिना।", hoc: "हापान को इस्कुल सेन तना।", mai: "बच्चा सभ स्कूल जा रहल अछि।", unr: "हापान को स्कूल सेन तना।" },
  { hi: "शिक्षक कक्षा में पढ़ा रहे हैं।", sat: "गुरुजी क्लास रे ओल चेत् आकिना।", hoc: "गुरुजी क्लास रे पढ़ा तना।", mai: "शिक्षक कक्षा मे पढ़ा रहल छथि।", unr: "गुरुजी क्लास रे पढ़ा तना।" },
  { hi: "किताब मेज पर रखो।", sat: "पुथी टेबुल चेतान रे दोहोमे।", hoc: "किताब टेबुल चेतान रे दहोमे।", mai: "किताब टेबुल पर राखू।", unr: "किताब टेबुल चेतान रे दहोमे।" },
  { hi: "अपना हाथ उठाओ।", sat: "आमाक् हात ताड़ा।", hoc: "अमाक् हात ताड़ा।", mai: "अपन हाथ उठाउ।", unr: "नंगाक् हात ताड़ा।" },
  { hi: "ध्यान से सुनो।", sat: "ला़गिते आंजोमे।", hoc: "जोमते आंजोमे।", mai: "ध्यान सँ सुनू।", unr: "ला़गिते आंजोमे।" },
  { hi: "पानी धीरे-धीरे पियो।", sat: "दा़ आड़ि आड़ि मे।", hoc: "दा़ धीरे-धीरे नोमे।", mai: "पानि धीरे-धीरे पिबू।", unr: "दा़ धीरे-धीरे नोमे।" },
  { hi: "सभी बच्चे बैठ जाओ।", sat: "जोतो होपोन को दोहोमे।", hoc: "जोतो हापान को दोहोमे।", mai: "सभ बच्चा बैसि जाउ।", unr: "जोतो हापान को दोहोमे।" },
  { hi: "दरवाजा बंद करो।", sat: "दुवा़र बोन्द मे।", hoc: "दुवा़र बन्द मे।", mai: "दरबज्जा बन्द करू।", unr: "दुवा़र बन्द मे।" },
  { hi: "खिड़की खोलो।", sat: "काड़की रा़पुद मे।", hoc: "काड़की रा़पुद मे।", mai: "खिड़की खोलू।", unr: "काड़की रा़पुद मे।" },
  { hi: "मुझे यह समझ में आया।", sat: "इञाक् नेंआ बुझा़व लेना।", hoc: "इङ नेंआ बुझाव लेना।", mai: "हमरा ई बुझायल।", unr: "अइञ नेंआ बुझाव लेना।" },
  { hi: "मुझे यह समझ में नहीं आया।", sat: "इञाक् नेंआ बा़य बुझा़व लेना।", hoc: "इङ नेंआ बा़य बुझाव लेना।", mai: "हमरा ई नहि बुझायल।", unr: "अइञ नेंआ बा़य बुझाव लेना।" },
  { hi: "कल हम फिर मिलेंगे।", sat: "गा़ते आ़म दोबारा भेटोक् आ।", hoc: "गा़ते अबु दोबारा भेटा।", mai: "काल्हि फेर भेटब।", unr: "गाते अबु दोबारा भेटा।" },
  { hi: "क्या आपको कोई प्रश्न है?", sat: "आमाक् जाहान काथा मेना?", hoc: "अमाक् जाहान सवाल मेना?", mai: "अहाँक कोनो प्रश्न अछि?", unr: "नंगाक् जाहान सवाल मेना?" },
  { hi: "अपना नाम बताओ।", sat: "आमाक् ञुत उदुग मे।", hoc: "अमाक् नाम उदुग मे।", mai: "अपन नाम कहू।", unr: "नंगाक् नाम उदुग मे।" },
  { hi: "बहुत अच्छा काम किया।", sat: "आ़डि बुगिन का़मी केला।", hoc: "आ़डि बुगिन कामी केला।", mai: "बहुत नीक काज केलहुँ।", unr: "आ़डि बुगिन कामी केला।" },
  { hi: "कल परीक्षा है।", sat: "गा़ते परीच्छा मेना।", hoc: "गा़ते परीक्षा मेना।", mai: "काल्हि परीक्षा अछि।", unr: "गाते परीक्षा मेना।" },
  { hi: "मेहनत से पढ़ाई करो।", sat: "जोमोन ते ओल-पाड़होमे।", hoc: "मेहनत ते पढ़ा।", mai: "मेहनति सँ पढ़ाइ करू।", unr: "मेहनत ते ओल-पाड़होमे।" },
];

export const DICTIONARY: DictionaryEntry[] = [
  { hi: "पानी", en: "water", sat: "दक्", hoc: "दा", mai: "पानि", unr: "दा", kind: "nature" },
  { hi: "सूरज", en: "sun", sat: "बेरा", hoc: "सिंगी", mai: "बेल", unr: "सिंगी", kind: "nature" },
  { hi: "चाँद", en: "moon", sat: "चन्दो", hoc: "चन्दु", unr: "चन्दु", kind: "nature" },
  { hi: "बादल", en: "cloud", sat: "रिमिल", hoc: "मेरम्", mai: "बादर", unr: "रिमिल", kind: "nature" },
  { hi: "बारिश", en: "rain", sat: "दा जोर", hoc: "गामा", mai: "बरखा", unr: "दुरु", kind: "nature" },
  { hi: "नदी", en: "river", sat: "गड़ा", hoc: "गड़ा", unr: "गड़ा", kind: "nature" },
  { hi: "तालाब", en: "pond", sat: "पोखर", hoc: "पोखर", mai: "पोखर", unr: "पोखर", kind: "nature" },
  { hi: "पेड़", en: "tree", sat: "डारे", hoc: "दारे", mai: "गाछ", unr: "डेरा", kind: "nature" },
  { hi: "पत्ता", en: "leaf", sat: "पाता", hoc: "पत्ता", unr: "पत्ता", kind: "nature" },
  { hi: "फूल", en: "flower", sat: "बाहा", hoc: "बाहा", unr: "बाहा", kind: "nature" },
  { hi: "फल", en: "fruit", sat: "जो", hoc: "जो", unr: "जो", kind: "nature" },
  { hi: "बीज", en: "seed", sat: "इताइ", hoc: "बियाँ", unr: "इताइ", kind: "nature" },
  { hi: "खेत", en: "field", sat: "बाड़ी", hoc: "बारी", unr: "बड़ी", kind: "nature" },
  { hi: "मिट्टी", en: "soil", sat: "हासा", hoc: "हासा", unr: "हासा", kind: "nature" },
  { hi: "हवा", en: "air", sat: "होयो", hoc: "होयो", unr: "होयो", kind: "nature" },
  { hi: "आग", en: "fire", sat: "सेनेल", hoc: "सेनेल", unr: "सेनेल", kind: "nature" },
  { hi: "घर", en: "house", sat: "ओराक", hoc: "ओवा", mai: "घर", unr: "ओरा", kind: "place" },
  { hi: "स्कूल", en: "school", sat: "स्कूल", hoc: "स्कूल", unr: "स्कूल", kind: "place" },
  { hi: "गाँव", en: "village", sat: "आतो", hoc: "हातु", mai: "गाम", unr: "हातु", kind: "place" },
  { hi: "बाज़ार", en: "market", sat: "हाट", hoc: "हाट", unr: "हाटु", kind: "place" },
  { hi: "माँ", en: "mother", sat: "गोदा", hoc: "एङ्गा", mai: "माय", unr: "एङ्गा", kind: "person" },
  { hi: "पिता", en: "father", sat: "बाबा", hoc: "अपु", unr: "अपु", kind: "person" },
  { hi: "बच्चा", en: "child", sat: "होन", hoc: "होन", mai: "बच्चा", unr: "होन", kind: "person" },
  { hi: "अध्यापक", en: "teacher", sat: "गुरु", hoc: "मास्टर", mai: "गुरु", unr: "गुरु", kind: "person" },
  { hi: "दोस्त", en: "friend", sat: "राराह", hoc: "मित्", mai: "मीत", unr: "राराह", kind: "person" },
  { hi: "मछली", en: "fish", sat: "हाकु", hoc: "हाकु", mai: "माछ", unr: "हाकु", kind: "animal" },
  { hi: "बाघ", en: "tiger", sat: "कुला", hoc: "कुला", unr: "कुला", kind: "animal" },
  { hi: "गाय", en: "cow", sat: "गाई", hoc: "गाय", mai: "गाइ", unr: "गाय", kind: "animal" },
  { hi: "खरगोश", en: "rabbit", sat: "कुलाय", hoc: "खरगोस", unr: "खरगोश", kind: "animal" },
  { hi: "किताब", en: "book", sat: "पोथी", hoc: "पोथी", mai: "पोथी", unr: "पोथी", kind: "thing" },
  { hi: "पेंसिल", en: "pencil", sat: "पेंसिल", hoc: "पेंसिल", unr: "पेंसिल", kind: "thing" },
  { hi: "खेल", en: "play/game", sat: "खेल", hoc: "खेल", unr: "खेल", kind: "action" },
  { hi: "खाना", en: "food / to eat", sat: "जोम", hoc: "जोम", unr: "जोम", kind: "action" },
  { hi: "सोना", en: "to sleep", sat: "निन्द्रा", hoc: "निन्दो", mai: "सुतब", unr: "निन्दो", kind: "action" },
  { hi: "देखना", en: "to see", sat: "नेल", hoc: "नेल", unr: "नेल", kind: "action" },
  { hi: "सुनना", en: "to hear", sat: "आयुम", hoc: "आयुम्", unr: "आयुम्", kind: "action" },
  { hi: "बड़ा", en: "big", sat: "मरङ्", hoc: "मरङ", mai: "पैघ", unr: "मरङ", kind: "adjective" },
  { hi: "छोटा", en: "small", sat: "हुड़िङ्", hoc: "हुड़िङ", unr: "हुड़िङ", kind: "adjective" },
  { hi: "अच्छा", en: "good", sat: "भाला", hoc: "भाला", mai: "नीक", unr: "भाला", kind: "adjective" },
  { hi: "जोड़", en: "addition", sat: "जोड़", hoc: "जोड़", unr: "जोड़", kind: "math" },
  { hi: "घटाव", en: "subtraction", sat: "घटाव", hoc: "घटाव", unr: "घटाव", kind: "math" },
  { hi: "संख्या", en: "number", sat: "लेखा", hoc: "लेखा", unr: "लेखा", kind: "math" },
  { hi: "समय", en: "time", sat: "समय", hoc: "समय", unr: "समय", kind: "math" },
  { hi: "शरीर", en: "body", sat: "होड़ो", hoc: "होड़ो", mai: "देह", unr: "होड़ो", kind: "body" },
  { hi: "हाथ", en: "hand", sat: "ति", hoc: "ति", unr: "ति", kind: "body" },
  { hi: "आँख", en: "eye", sat: "मेद", hoc: "मेद", unr: "मेद", kind: "body" },
  { hi: "स्वास्थ्य", en: "health", sat: "स्वास्थ", hoc: "स्वास्थ", unr: "स्वास्थ", kind: "body" },
];

export function getLesson(slug: string): LessonSeed | undefined {
  return CURRICULUM.find((l) => l.slug === slug);
}

export const SUBJECTS = ["Hindi", "Math", "EVS"] as const;
export const CLASSES = [1, 2, 3];
