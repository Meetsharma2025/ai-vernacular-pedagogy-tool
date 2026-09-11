import { jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────────────────────────────────────
// GyanSetu database schema.
// The database stores REAL application facts (lessons, progress, worksheets).
// Nemotron only reasons OVER retrieved facts — it never writes arbitrary data.
// ─────────────────────────────────────────────────────────────────────────────

export interface LessonContentJson {
  explanationHi: string;
  explanationEn: string;
  examplesHi: string[];
  examplesEn: string[];
}

export const lessons = pgTable("gs_lessons", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  class: serial("class").notNull(),
  subject: text("subject").notNull(),
  titleHi: text("title_hi").notNull(),
  titleEn: text("title_en").notNull(),
  concept: text("concept").notNull(),
  objective: text("objective").notNull(),
  nipunOutcome: text("nipun_outcome").notNull(),
  keywords: text("keywords").array().notNull().default([]),
  content: jsonb("content").$type<LessonContentJson>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const progress = pgTable("gs_progress", {
  id: serial("id").primaryKey(),
  studentKey: text("student_key").notNull(),
  lessonSlug: text("lesson_slug").notNull(),
  score: serial("score").notNull(),
  total: serial("total").notNull(),
  wrong: text("wrong").array().notNull().default([]),
  details: jsonb("details").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const worksheets = pgTable("gs_worksheets", {
  id: serial("id").primaryKey(),
  lessonSlug: text("lesson_slug").notNull(),
  language: text("language").notNull(),
  title: text("title").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Teacher Upload Studio content — published materials appear in the student
// area; Nemotron converts them into each child's language on view.
export const teacherContent = pgTable("gs_teacher_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  kind: text("kind").notNull(), // text | link | file | worksheet | flashcards
  lessonSlug: text("lesson_slug"),
  author: text("author").notNull().default("teacher"),
  content: text("content"), // extracted/typed text (or null for rich payloads)
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Every Nemotron-generated result is persisted here so it can be
// re-downloaded to devices (IndexedDB) for offline research and usage.
export const aiGenerations = pgTable("gs_ai_generations", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull(), // ask | translate | search | worksheet | quiz | flashcards | dictionary
  inputHash: text("input_hash").notNull(), // deterministic hash of the input (cache key part)
  language: text("language").notNull(),
  lessonSlug: text("lesson_slug"),
  studentKey: text("student_key"),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
