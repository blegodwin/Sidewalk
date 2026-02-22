import { z } from "zod";

const trimmed = (label: string) =>
  z
    .string({
      required_error: `${label} is required`,
      invalid_type_error: `${label} must be a string`,
    })
    .trim()
    .min(1, `${label} is required`);

export const createReportBodySchema = z.object({
  title: trimmed("title"),
  description: trimmed("description"),
  category: z.enum([
    "INFRASTRUCTURE",
    "SANITATION",
    "SAFETY",
    "LIGHTING",
    "TRANSPORT",
    "DRAINAGE",
  ]),
  location: z.object({
    type: z.literal("Point"),
    coordinates: z
      .tuple([z.number(), z.number()])
      .refine(
        ([lng, lat]) =>
          Number.isFinite(lng) &&
          Number.isFinite(lat) &&
          lng >= -180 &&
          lng <= 180 &&
          lat >= -90 &&
          lat <= 90,
        "location.coordinates must be valid and ordered [longitude, latitude]",
      ),
  }),
  media_urls: z.array(z.string().url("media_urls must contain valid URLs")).default([]),
});

export const verifyReportBodySchema = z.object({
  txHash: trimmed("txHash"),
  originalDescription: trimmed("originalDescription"),
});

export const updateReportStatusBodySchema = z.object({
  originalTxHash: trimmed("originalTxHash"),
  status: trimmed("status"),
  evidence: z
    .string({
      invalid_type_error: "evidence must be a string",
    })
    .trim()
    .optional(),
});

export const verifyStatusBodySchema = z.object({
  statusTxHash: trimmed("statusTxHash"),
  originalTxHash: trimmed("originalTxHash"),
  status: trimmed("status"),
  evidence: z
    .string({
      invalid_type_error: "evidence must be a string",
    })
    .trim()
    .optional(),
});

export type CreateReportDTO = z.infer<typeof createReportBodySchema>;
export type VerifyReportDTO = z.infer<typeof verifyReportBodySchema>;
export type UpdateReportStatusDTO = z.infer<typeof updateReportStatusBodySchema>;
export type VerifyStatusDTO = z.infer<typeof verifyStatusBodySchema>;
