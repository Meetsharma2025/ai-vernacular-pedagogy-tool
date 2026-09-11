// ─────────────────────────────────────────────────────────────────────────────
// Idempotent curriculum seeding. Called by API routes before serving data;
// guarantees the database always contains the GyanSetu FLN curriculum.
// ─────────────────────────────────────────────────────────────────────────────
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { lessons, progress, teacherContent, type LessonContentJson } from "@/db/schema";
import { CURRICULUM } from "@/lib/curriculum";

let seedPromise: Promise<void> | null = null;

export function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((err) => {
      seedPromise = null;
      console.error("[gyansetu:seed] seeding failed:", err);
      throw err;
    });
  }
  return seedPromise;
}

/** Demo classmates so the class leaderboard has life from the first run. */
async function seedDemoProgress(): Promise<void> {
  const existing = await db.execute(sql`select count(*)::int as c from progress`);
  if (Number(existing.rows[0]?.c ?? 0) >= 5) return;

  const demo = [
    { studentKey: "student:sita", lessonSlug: "addition", score: 4, total: 4, wrong: [] as string[] },
    { studentKey: "student:sita", lessonSlug: "water-cycle", score: 3, total: 4, wrong: ["बादल किससे बनते हैं?"] },
    { studentKey: "student:amit", lessonSlug: "addition", score: 3, total: 4, wrong: ["3 + 4 = ?"] },
    { studentKey: "student:amit", lessonSlug: "clean-water", score: 2, total: 4, wrong: ["पानी को कितने मिनट उबालना चाहिए?", "साफ़ पानी क्यों पीना चाहिए?"] },
    { studentKey: "student:ravi", lessonSlug: "addition", score: 1, total: 4, wrong: ["3 + 4 = ?", "5 + 5 = ?", "2 + 6 = ?"] },
  ];
  for (const d of demo) {
    await db
      .insert(progress)
      .values({ ...d, details: { demo: true } })
      .onConflictDoNothing();
  }
}

/** One sample teacher post so the student feed is never empty on first run. */
async function seedSampleContent(): Promise<void> {
  const existing = await db.execute(sql`select count(*)::int as c from teacher_content`);
  if (Number(existing.rows[0]?.c ?? 0) >= 1) return;
  await db
    .insert(teacherContent)
    .values({
      title: "स्वागत! पहला पाठ — पानी की कहानी",
      kind: "text",
      lessonSlug: "water-cycle",
      author: "शिक्षक",
      content:
        "पानी की कहानी: सूरज की गर्मी से नदी-तालाब का पानी भाप बनकर आकाश में जाता है। ठंड से छोटी-छोटी बूँदें बनती हैं और वे मिलकर बादल बनाती हैं। जब बूँदें भारी हो जाती हैं तो बारिश होती है और पानी फिर धरती पर लौट आता है। यही जल चक्र है।",
      payload: {},
    })
    .onConflictDoNothing();
}

async function runSeed(): Promise<void> {
  const result = await db.execute(sql`select count(*)::int as c from lessons`);
  const c = Number(result.rows[0]?.c ?? 0);

  // Demo classmates + sample teacher post are seeded regardless of whether
  // lessons already exist (they have their own guards inside).
  if (c >= CURRICULUM.length) {
    await seedDemoProgress();
    await seedSampleContent();
    return;
  }

  for (const lesson of CURRICULUM) {
    const content: LessonContentJson = {
      explanationHi: lesson.explanationHi,
      explanationEn: lesson.explanationEn,
      examplesHi: lesson.examplesHi,
      examplesEn: lesson.examplesEn,
    };
    await db
      .insert(lessons)
      .values({
        slug: lesson.slug,
        class: lesson.class,
        subject: lesson.subject,
        titleHi: lesson.titleHi,
        titleEn: lesson.titleEn,
        concept: lesson.concept,
        objective: lesson.objective,
        nipunOutcome: lesson.nipunOutcome,
        keywords: lesson.keywords,
        content,
      })
      .onConflictDoNothing();
  }

  await seedDemoProgress();
  await seedSampleContent();
}
