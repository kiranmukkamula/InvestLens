import { z } from 'zod';

/**
 * Raw Research Data Zod Schema
 *
 * Purpose:
 * Validates the raw company, financial, and news datasets collected by the Research Node.
 * Ensures the subsequent Canonical Data Mapper gets clean, structured fields.
 */

export const researchSchema = z.object({
  company: z.object({
    name: z.string(),
    industry: z.string(),
    ceo: z.string(),
    headquarters: z.string(),
    employees: z.number(),
    ipoDate: z.string(),
    marketCapitalization: z.number(),
    competitors: z.array(z.string()).optional(),
    description: z.string(),
  }).nullable(),
  financials: z.object({
    annual: z.object({
      incomeStatements: z.array(z.any()),
      balanceSheets: z.array(z.any()),
      cashFlows: z.array(z.any()),
    }),
    quarterly: z.object({
      incomeStatements: z.array(z.any()),
      balanceSheets: z.array(z.any()).optional(),
      cashFlows: z.array(z.any()).optional(),
    }).optional(),
    ratios: z.object({
      peRatio: z.number().nullable().optional(),
      pegRatio: z.number().nullable().optional(),
      returnOnAssets: z.number().nullable().optional(),
      returnOnEquity: z.number().nullable().optional(),
      debtToEquity: z.number().nullable().optional(),
    }).optional()
  }).nullable(),
  news: z.array(
    z.object({
      title: z.string(),
      url: z.string().optional(),
      source: z.string(),
      publishedAt: z.string(),
      summary: z.string(),
    })
  ).nullable(),
});

export default researchSchema;
