import * as yf from 'yahoo-finance2';
import logger from '../logger/logger.js';

const YahooFinanceClass = yf.default;

try {
  logger.info('Instantiating new YahooFinanceClass()...');
  const instance = new YahooFinanceClass();
  logger.info(`Instance type: ${typeof instance}`);
  
  // Log own property names and prototype names
  logger.info(`Instance own properties: ${Object.getOwnPropertyNames(instance)}`);
  
  const proto = Object.getPrototypeOf(instance);
  logger.info(`Instance prototype properties: ${Object.getOwnPropertyNames(proto)}`);
  
  const parentProto = Object.getPrototypeOf(proto);
  if (parentProto) {
    logger.info(`Parent prototype properties: ${Object.getOwnPropertyNames(parentProto)}`);
  }

  // Let's print out what methods are on the instance
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (typeof instance[key] === 'function') {
      logger.info(`Method found on prototype: ${key}`);
    }
  }

} catch (err) {
  logger.error('Failed: ' + err.stack);
}
