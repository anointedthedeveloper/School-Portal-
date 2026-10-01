import { z } from 'zod';

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a 6-digit hex colour such as #1e40af');
/** Asset reference: an https URL or a site-relative path. Data URIs are not accepted. */
const assetRef = z
  .string()
  .max(500)
  .refine((v) => v === '' || /^https:\/\//.test(v) || v.startsWith('/'), 'Must be an https URL or a path starting with /');

const gradeBand = z
  .object({
    grade: z.string().trim().min(1).max(5),
    minScore: z.number().min(0).max(100),
    maxScore: z.number().min(0).max(100),
    remark: z.string().max(60),
  })
  .refine((b) => b.minScore <= b.maxScore, 'minScore cannot exceed maxScore');

const body = z
  .object({
    schoolName: z.string().trim().min(1).max(150),
    shortName: z.string().trim().min(1).max(40),
    logo: assetRef,
    favicon: assetRef,
    address: z.string().max(300),
    phone: z.string().max(40),
    email: z.union([z.literal(''), z.string().email()]),
    website: z.union([z.literal(''), z.string().url()]),
    primaryColor: hexColor,
    secondaryColor: hexColor,
    currentSession: z.string().max(20),
    currentTerm: z.string().max(20),
    gradingSystem: z
      .object({ passMark: z.number().min(0).max(100), scale: z.array(gradeBand).min(1).max(15) })
      .partial(),
    reportSettings: z
      .object({
        showPosition: z.boolean(),
        showClassAverage: z.boolean(),
        principalComment: z.boolean(),
        teacherComment: z.boolean(),
        headerNote: z.string().max(300),
      })
      .partial(),
    examSettings: z
      .object({
        caMaxScore: z.number().min(0).max(100),
        examMaxScore: z.number().min(0).max(100),
        defaultDurationMinutes: z.number().int().min(1).max(600),
        shuffleQuestions: z.boolean(),
      })
      .partial(),
    cbtSettings: z.object({ enabled: z.boolean(), allowResultSync: z.boolean() }).partial(),
  })
  .partial()
  .strict();

export const updateSettingsSchema = z.object({ body });
export type UpdateSettingsInput = z.infer<typeof body>;
