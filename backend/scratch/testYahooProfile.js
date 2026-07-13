import YahooFinanceClass from 'yahoo-finance2';
const yahooFinance = new YahooFinanceClass();
import logger from '../logger/logger.js';

async function testProfile() {
  try {
    console.log('Testing Yahoo Finance assetProfile:');
    const result = await yahooFinance.quoteSummary('TSLA', { modules: ['assetProfile', 'price', 'defaultKeyStatistics'] });
    console.log('--- ASSET PROFILE DATA ---');
    console.log(JSON.stringify(result.assetProfile, null, 2));
    console.log('--- PRICE DATA ---');
    console.log(JSON.stringify(result.price, null, 2));
    console.log('--- STATS DATA ---');
    console.log(JSON.stringify(result.defaultKeyStatistics, null, 2));
  } catch (err) {
    console.error('Yahoo Finance test failed:', err.message);
  }
}

testProfile();
