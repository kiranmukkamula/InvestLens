import { Annotation } from '@langchain/langgraph';

/**
 * Graph State Definition
 * 
 * Purpose:
 * Defines the schema of the shared GraphState using LangGraph's Annotation API.
 * Ensures strict types and merge-reducers for multi-agent execution.
 */

export const GraphState = Annotation.Root({
  // Ticker symbol or name of the target company to analyze
  companyName: Annotation({
    reducer: (current, next) => next ?? current,
    default: () => ''
  }),

  // Raw research dossier collected by the ReAct Research Node
  rawResearch: Annotation({
    reducer: (current, next) => {
      if (!next) return current;
      return {
        company: next.company !== undefined ? next.company : current.company,
        financials: next.financials !== undefined ? next.financials : current.financials,
        news: next.news !== undefined ? next.news : current.news
      };
    },
    default: () => ({ company: null, financials: null, news: null })
  }),

  // Normalized and calculated InvestmentData payload output by the Canonical Mapper
  investmentData: Annotation({
    reducer: (current, next) => next ?? current,
    default: () => null
  }),

  // Qualitative SWOT analysis output by the Analysis Node
  analysis: Annotation({
    reducer: (current, next) => next ?? current,
    default: () => null
  }),

  // Actionable scores, recommendation, and rationales output by the Decision Node
  decision: Annotation({
    reducer: (current, next) => next ?? current,
    default: () => null
  }),

  // Collective list of warnings or failures logged across node executions
  errors: Annotation({
    reducer: (current, next) => {
      if (!next) return current;
      const nextArr = Array.isArray(next) ? next : [next];
      return [...current, ...nextArr];
    },
    default: () => []
  })
});

export default GraphState;
