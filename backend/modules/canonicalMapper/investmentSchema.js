import { z } from 'zod';

/**
 * Mapped Investment Data Schema
 *
 * Purpose:
 * Defines a Zod validation schema for the output of the Canonical Data Mapper.
 * Serves as the immutable boundary between raw retrieved information and cognitive reasoning agents.
 */

export const investmentSchema = z.object({
  company: z.object({
    name: z.string(),
    ticker: z.string(),
    industry: z.string(),
    ceo: z.string(),
    headquarters: z.string(),
    employees: z.number(),
    ipoDate: z.string(),
    marketCapitalization: z.number(),
    competitors: z.array(z.string()),
    description: z.string()
  }),
  financials: z.object({
    metrics: z.object({
      revenue: z.number(),
      priorRevenue: z.number(),
      revenueGrowth: z.number(),
      netIncome: z.number(),
      priorNetIncome: z.number(),
      profitGrowth: z.number(),
      operatingMargin: z.number(),
      profitMargin: z.number(),
      debtRatio: z.number(),
      currentRatio: z.number(),
      quickRatio: z.number(),
      roe: z.number(),
      roa: z.number(),
      pe: z.number().nullable(),
      peg: z.number().nullable()
    }),
    annual: z.object({
      incomeStatements: z.array(z.object({
        calendarDate: z.string(),
        totalRevenue: z.number(),
        netIncome: z.number(),
        operatingIncome: z.number(),
        costOfRevenue: z.number(),
        ebit: z.number()
      })),
      balanceSheets: z.array(z.object({
        calendarDate: z.string(),
        totalAssets: z.number(),
        totalLiabilitiesNetMinorityInterest: z.number(),
        totalStockholderEquity: z.number(),
        currentAssets: z.number(),
        currentLiabilities: z.number(),
        inventory: z.number(),
        cashAndCashEquivalents: z.number()
      })),
      cashFlows: z.array(z.object({
        calendarDate: z.string(),
        operatingCashFlow: z.number(),
        capitalExpenditure: z.number(),
        freeCashFlow: z.number()
      }))
    }),
    quarterly: z.object({
      incomeStatements: z.array(z.object({
        calendarDate: z.string(),
        totalRevenue: z.number(),
        netIncome: z.number()
      }))
    })
  }),
  news: z.array(
    z.object({
      title: z.string(),
      url: z.string().or(z.literal('')),
      source: z.string(),
      publishedAt: z.string(),
      summary: z.string()
    })
  )
});

export default investmentSchema;
