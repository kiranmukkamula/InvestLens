import compiledGraph from '../graph/workflow.js';
import logger from '../logger/logger.js';

/**
 * Diagnostic Verification Script
 *
 * Purpose:
 * Tests the compiled LangGraph workflow end-to-end.
 * Invokes the graph for a target company (e.g. 'TSLA') and prints the updated state.
 */
async function runWorkflowTest() {
  logger.info('Initializing diagnostic end-to-end workflow test...');

  try {
    const inputState = {
      companyName: 'TSLA',
      rawResearch: { company: null, financials: null, news: null },
      investmentData: null,
      analysis: null,
      decision: null,
      errors: []
    };

    logger.info('Invoking compiled LangGraph flow for symbol: TSLA');
    const finalState = await compiledGraph.invoke(inputState);

    logger.info('==================================================');
    logger.info('Workflow execution finished.');
    logger.info(`Errors logged: ${JSON.stringify(finalState.errors)}`);
    
    if (finalState.investmentData) {
      logger.info('Canonical mapping data succeeded.');
    }
    
    if (finalState.analysis) {
      logger.info('Qualitative analysis succeeded.');
    }

    if (finalState.decision) {
      logger.info('==================================================');
      logger.info('FINAL RECOMMENDATION REPORT SUMMARY:');
      logger.info(`Company Name   : ${finalState.investmentData.company.name}`);
      logger.info(`Recommendation : ${finalState.decision.recommendation}`);
      logger.info(`Overall Score  : ${finalState.decision.overallInvestmentScore}`);
      logger.info(`Confidence     : ${finalState.decision.confidenceLevel}`);
      logger.info(`Outlook (Short): ${finalState.decision.shortTermOutlook}`);
      logger.info(`Outlook (Long) : ${finalState.decision.longTermOutlook}`);
      logger.info(`Evidence Cited : ${JSON.stringify(finalState.decision.evidenceUsed)}`);
      logger.info('==================================================');
    } else {
      logger.error('Final decision block is missing from the state.');
    }
  } catch (error) {
    logger.error(`Critical error during graph invocation: ${error.stack}`);
  }
}

runWorkflowTest();
