import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { z } from 'zod';
import gemini from '../../services/geminiService.js';
import analysisPrompt from './analysisPrompt.js';
import analysisSchema from './analysisSchema.js';
import decisionPrompt from '../decision/decisionPrompt.js';
import decisionSchema from '../decision/decisionSchema.js';
import logger from '../../logger/logger.js';

// Combined validation schema for single-pass execution
const combinedSchema = z.object({
  analysis: analysisSchema,
  decision: decisionSchema
});

/**
 * Analysis Node (Groq Upgraded - Single-Pass Combined)
 *
 * Purpose:
 * Evaluates corporate datasets and issues the final decision report in a single LLM request.
 * Prevents consecutive token rate limit failures on Groq's free tier.
 *
 * Inputs:
 * - state (GraphState): Includes the normalized investmentData structure.
 *
 * Returns:
 * - GraphState updates: Appends analysis and decision parameters.
 */
export async function analysisNode(state) {
  const companyName = state.companyName || '';
  logger.info(`[AnalysisNode] Commencing unified analysis and rating for: "${companyName}"`);

  const investmentData = state.investmentData;
  if (!investmentData) {
    logger.error('[AnalysisNode] Cannot execute analysis. Normalized InvestmentData is missing in GraphState.');
    return {
      errors: ['Analysis skipped due to missing normalized investmentData.']
    };
  }

  try {
    if (!gemini) {
      throw new Error('LLM service client is not instantiated.');
    }

    // Assemble a highly compressed JSON instruction example to save tokens
    const jsonExample = {
      analysis: {
        businessAnalysis: {
          strengths: [''],
          weaknesses: [''],
          opportunities: [''],
          risks: [''],
          evaluation: ''
        },
        financialAnalysis: {
          strengths: [''],
          weaknesses: [''],
          opportunities: [''],
          risks: [''],
          evaluation: ''
        },
        newsAnalysis: {
          positiveEvents: [''],
          negativeEvents: [''],
          neutralEvents: [],
          businessImpact: ''
        },
        companySummary: {
          whatItDoes: '',
          whatItSolves: '',
          businessType: 'product-based', // must be: 'product-based', 'service-based', 'hybrid'
          typicalDescriptionLines: '' // Must start with: 'As a leading technology company...'
        },
        importantObservations: ['']
      },
      decision: {
        businessScore: 0,
        financialScore: 0,
        newsScore: 0,
        riskScore: 0,
        growthScore: 0,
        overallInvestmentScore: 0,
        recommendation: 'PASS', // must be: 'INVEST', 'PASS'
        confidenceLevel: 0,
        shortTermOutlook: '',
        longTermOutlook: '',
        topReasons: [''],
        majorRisks: [''],
        detailedExplanation: '',
        evidenceUsed: ['']
      }
    };

    const combinedSystemPrompt = `You are a Senior Investment Research Analyst and Decision Committee Chair.
Your target is to perform a detailed qualitative audit on a company based strictly on the provided InvestmentData, and output both the qualitative SWOT analysis and the final rating/scoring decision report.

Your analysis must follow these directives:

=== Business, Financial & News SWOT Directives ===
${analysisPrompt}

=== Rating, Scoring & Thesis Directives ===
${decisionPrompt}

=== Output Format ===
You must return your output as a raw JSON object matching the following structure. Do not wrap it in markdown code blocks. Ensure it is valid, parseable JSON:
${JSON.stringify(jsonExample, null, 2)}
`;

    // Trim description to first 2 sentences to save massive tokens
    const desc = investmentData.company.description || '';
    const trimmedDesc = desc.split('.').slice(0, 2).join('.') + '.';

    // Trim payload to optimize token usage (preventing Groq rate limits)
    const trimmedData = {
      company: {
        name: investmentData.company.name,
        industry: investmentData.company.industry,
        description: trimmedDesc
      },
      metrics: investmentData.financials.metrics,
      annualRevenueTrend: investmentData.financials.annual?.incomeStatements?.map(item => ({
        year: item.calendarDate,
        revenue: item.totalRevenue,
        netIncome: item.netIncome
      })) || [],
      news: (investmentData.news || []).slice(0, 3).map(item => ({
        title: item.title,
        source: item.source
      }))
    };

    const inputContent = `Here is the optimized corporate data (InvestmentData) for analysis:\n\n${JSON.stringify(trimmedData, null, 2)}`;
    
    logger.info('[AnalysisNode] Dispatching unified prompt to Groq Llama 3.3 70B...');
    const response = await gemini.invoke([
      new SystemMessage(combinedSystemPrompt),
      new HumanMessage(inputContent)
    ], {
      response_format: { type: 'json_object' }
    });

    // Clean markdown wraps and parse output
    const cleanedContent = response.content.replace(/```json|```/g, '').trim();
    const parsedData = JSON.parse(cleanedContent);

    // Validate the parsed response against the combined schema locally
    const result = combinedSchema.parse(parsedData);
    logger.info('[AnalysisNode] Unified analysis and decision report parsed and validated locally successfully.');

    return {
      analysis: result.analysis,
      decision: result.decision,
      errors: []
    };
  } catch (error) {
    logger.error(`[AnalysisNode] Unified Agent execution crash: ${error.message}`);
    return {
      errors: [`Analysis Node error: ${error.message}`]
    };
  }
}

export default analysisNode;
