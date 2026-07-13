import { z } from 'zod';

/**
 * Analysis Schema
 *
 * Purpose:
 * Defines the contract validation schema for the output of the Analysis Node.
 * Ensures the Investment Decision Agent receives a clean, structured payload of qualitative evaluations.
 */

export const analysisSchema = z.object({
  businessAnalysis: z.object({
    strengths: z.array(z.string()).describe('Core business strengths, competitive advantages, or market leadership.'),
    weaknesses: z.array(z.string()).describe('Core business weaknesses, execution issues, or operational gaps.'),
    opportunities: z.array(z.string()).describe('Growth vectors, product expansions, or new markets.'),
    risks: z.array(z.string()).describe('Competitive threat, regulatory challenges, or industry shifts.'),
    evaluation: z.string().describe('Comprehensive evaluation of the company business model, competitive position, and innovation capacity.')
  }),
  financialAnalysis: z.object({
    strengths: z.array(z.string()).describe('Financial strengths, such as strong cash flow, robust liquidity, or stable growth.'),
    weaknesses: z.array(z.string()).describe('Financial weaknesses, such as declining margins, rising debt, or negative cash flow.'),
    opportunities: z.array(z.string()).describe('Financial opportunities, such as tax efficiency, capital restructuring, or reinvestment.'),
    risks: z.array(z.string()).describe('Financial risks, such as debt service coverage issues, refinancing risks, or rate exposure.'),
    evaluation: z.string().describe('Comprehensive evaluation of the company financial trends, profit stability, and leverage health.')
  }),
  newsAnalysis: z.object({
    positiveEvents: z.array(z.string()).describe('Positive events identified in news articles (e.g. product launch, earnings beat).'),
    negativeEvents: z.array(z.string()).describe('Negative events identified in news articles (e.g. lawsuit, management departure).'),
    neutralEvents: z.array(z.string()).describe('Neutral but notable corporate events.'),
    businessImpact: z.string().describe('Comprehensive assessment of the business and financial impact of recent news events.')
  }),
  companySummary: z.object({
    whatItDoes: z.string().describe('Brief summary of what the company does and its primary business activities.'),
    whatItSolves: z.string().describe('The primary problems, customer paint points, or market needs the company solves.'),
    businessType: z.enum(['product-based', 'service-based', 'hybrid']).describe('Classification of whether it is product-based, service-based, or hybrid.'),
    typicalDescriptionLines: z.string().describe('A typical, professionally written summary sentence about the company, e.g. "As a leading product-based technology company, Tesla focuses on..."')
  }).describe('Human-readable core business classification and value proposition summary.'),
  importantObservations: z.array(z.string()).describe('Key highlights or critical warnings that demand immediate attention.')
});

export default analysisSchema;
