import YahooFinanceClass from 'yahoo-finance2';
const yahooFinance = new YahooFinanceClass();

async function testSearch() {
  try {
    console.log('Searching Yahoo Finance for "wipro":');
    const resWipro = await yahooFinance.search('wipro');
    console.log('WIPRO SEARCH RESULT (Top Ticker):', resWipro.quotes?.[0]?.symbol);

    console.log('\nSearching Yahoo Finance for "tcs":');
    const resTcs = await yahooFinance.search('tcs');
    console.log('TCS SEARCH RESULT (Top Ticker):', resTcs.quotes?.[0]?.symbol);

    console.log('\nSearching Yahoo Finance for "cognizant":');
    const resCognizant = await yahooFinance.search('cognizant');
    console.log('COGNIZANT SEARCH RESULT (Top Ticker):', resCognizant.quotes?.[0]?.symbol);

    console.log('\nSearching Yahoo Finance for "inside iim":');
    const resIim = await yahooFinance.search('inside iim');
    console.log('INSIDE IIM SEARCH RESULT:', resIim.quotes?.slice(0, 3));
  } catch (err) {
    console.error('Yahoo Finance search failed:', err.message);
  }
}

testSearch();
