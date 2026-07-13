import compiledGraph from '../graph/workflow.js';
import cacheService from '../cache/cacheService.js';
import logger from '../logger/logger.js';
import YahooFinanceClass from 'yahoo-finance2';

const yahooFinance = new YahooFinanceClass();

/**
 * Company Analysis Controller
 * 
 * Purpose:
 * Entrypoint handler for stock ticker audit requests.
 * Checks the Redis caching service first for hits.
 * On misses, invokes the compiled multi-agent LangGraph workflow, compiles the report payload,
 * stores it in the cache with a 5-minute TTL, and returns it.
 *
 * Inputs:
 * - req.params.symbol (string): Company stock ticker (e.g. AAPL)
 *
 * Returns:
 * - JSON response with Success, Cached status, and final Report payload.
 */
export async function analyzeCompany(req, res, next) {
  const querySymbol = req.params.symbol?.trim();
  
  if (!querySymbol) {
    logger.warn('[Controller] Analysis request rejected: Ticker symbol is empty.');
    return res.status(400).json({ 
      success: false, 
      error: 'Ticker symbol is required as a route parameter (e.g. /api/analyze/AAPL).' 
    });
  }

  let symbol = querySymbol.toUpperCase();

  // Strict local mapping overrides for popular search names
  const overrideMappings = {
    'TCS': 'TCS.NS',
    'WIPRO': 'WIPRO.NS',
    'COGNIZANT': 'CTSH'
  };

  if (overrideMappings[symbol]) {
    logger.info(`[Controller] Query '${querySymbol}' matches strict override mapping: ${overrideMappings[symbol]}`);
    symbol = overrideMappings[symbol];
  } else {
    // Ticker resolution: If query is not a standard short ticker (e.g. has spaces, or matches names)
    const isPotentialTicker = /^[A-Z0-9.\-]{1,6}$/.test(symbol);
    if (!isPotentialTicker || querySymbol.includes(' ')) {
      logger.info(`[Controller] Query '${querySymbol}' requires ticker resolution search...`);
      try {
        const searchRes = await yahooFinance.search(querySymbol);
        const topQuote = searchRes.quotes?.[0];
        if (topQuote && topQuote.symbol) {
          logger.info(`[Controller] Successfully resolved query '${querySymbol}' to stock ticker: ${topQuote.symbol} (${topQuote.longname || topQuote.shortname})`);
          symbol = topQuote.symbol.toUpperCase();
        } else {
          logger.warn(`[Controller] Could not find any listed stock symbol for query: '${querySymbol}'`);
          return res.status(404).json({
            success: false,
            error: `Could not resolve '${querySymbol}' to a public stock ticker.`,
            details: [`'${querySymbol}' might be a private company (like InsideIIM) or is not listed on major public exchanges.`]
          });
        }
      } catch (searchErr) {
        logger.error(`[Controller] Ticker resolution failed for '${querySymbol}': ${searchErr.message}`);
      }
    }
  }

  const cacheKey = `report:${symbol}`;

  try {
    logger.info(`[Controller] Querying cache for ticker symbol: ${symbol}`);
    
    // 1. Query Caching service
    const cachedReport = await cacheService.get(cacheKey);
    if (cachedReport) {
      logger.info(`[Controller] Cache HIT for symbol: ${symbol}. Returning cached report.`);
      return res.json({
        success: true,
        fromCache: true,
        data: cachedReport
      });
    }

    logger.info(`[Controller] Cache MISS for symbol: ${symbol}. Executing LangGraph workflow.`);

    // 2. Formulate empty StateGraph input
    const inputState = {
      companyName: symbol,
      rawResearch: { company: null, financials: null, news: null },
      investmentData: null,
      analysis: null,
      decision: null,
      errors: []
    };

    // 3. Execute Graph
    const finalState = await compiledGraph.invoke(inputState);

    // 4. Verify output success
    if (!finalState.decision || (finalState.errors && finalState.errors.length > 0 && !finalState.investmentData)) {
      logger.error(`[Controller] LangGraph workflow failed for ${symbol}. Errors: ${JSON.stringify(finalState.errors)}`);
      return res.status(502).json({
        success: false,
        error: 'Failed to complete company analysis due to internal agent errors.',
        details: finalState.errors
      });
    }

    // 5. Structure final report response
    const reportData = {
      company: finalState.investmentData.company,
      metrics: finalState.investmentData.financials.metrics,
      annualHistory: finalState.investmentData.financials.annual,
      quarterlyHistory: finalState.investmentData.financials.quarterly,
      news: finalState.investmentData.news || [],
      analysis: finalState.analysis,
      decision: finalState.decision,
      warnings: finalState.errors || [],
      generatedAt: new Date().toISOString()
    };

    // 6. Cache the output (5 minutes / 300 seconds TTL)
    await cacheService.set(cacheKey, reportData, 300);

    logger.info(`[Controller] Workflow complete and report cached for: ${symbol}`);
    
    return res.json({
      success: true,
      fromCache: false,
      data: reportData
    });

  } catch (error) {
    logger.error(`[Controller] Error processing analysis for ticker ${symbol}: ${error.message}`);
    next(error);
  }
}

export default {
  analyzeCompany
};
