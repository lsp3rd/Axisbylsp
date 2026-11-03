'use strict';
/**
 * AXIS PUBLIC synthetic cross-asset funding bridge.
 * It NEVER calls a broker, signs a wallet transaction or transfers currency.
 * All values and receipts are fixtures for an evidence-gated judge demonstration.
 */
(function(root) {
  const supported = /^[A-Z0-9][A-Z0-9._-]{0,14}$/;
  const STATES = Object.freeze({
    REVIEW: 'REVIEW', SOURCE_FILLED: 'SOURCE_FILLED',
    FUNDS_AVAILABLE: 'FUNDS_AVAILABLE', COMPLETED: 'COMPLETED',
    DESTINATION_REJECTED: 'DESTINATION_REJECTED', HOLD: 'HOLD'
  });
  const roundCents = value => Math.round((value + Number.EPSILON) * 100) / 100;
  function validatedText(value) {
    const symbol = String(value == null ? '' : value).trim().toUpperCase();
    if(!supported.test(symbol)) throw new Error('Enter a valid supported asset symbol (example: BTC or CORZ).');
    return symbol;
  }
  function create(direction, fromAsset, toAsset, grossUSD) {
    if(direction !== 'CRYPTO_TO_STOCK' && direction !== 'STOCK_TO_CRYPTO')
      throw new Error('Choose the conversion direction.');
    const source = validatedText(fromAsset);
    const target = validatedText(toAsset);
    if(source === target) throw new Error('Select different source and destination assets.');
    const amount = Number(grossUSD);
    if(!Number.isFinite(amount) || amount < 1 || amount > 1000000)
      throw new Error('Use a synthetic amount from $1 to $1,000,000.');
    const gross = roundCents(amount);
    const sourceFee = roundCents(gross * 0.005);
    const net = roundCents(gross - sourceFee);
    return {
      direction, source, target, gross, sourceFee, availableUSD: 0, net,
      destinationFee: 0, purchasedUSD: 0, state: STATES.REVIEW,
      receiptLog: [{kind: 'REVIEW', note: 'Synthetic quote shown. No provider order sent.'}]
    };
  }
  function transition(input, eventType) {
    if(!input || !Object.values(STATES).includes(input.state)) throw new Error('Invalid session');
    const s = {...input, receiptLog: input.receiptLog.slice()};
    const note = msg => s.receiptLog.push({kind: eventType, note: msg});
    if(eventType === 'SOURCE_FILL' && s.state === STATES.REVIEW) {
      s.state=STATES.SOURCE_FILLED;
      note('Synthetic source sale filled. Proceeds are not yet eligible buying power.');
    } else if(eventType === 'VERIFY_FUNDS' && s.state === STATES.SOURCE_FILLED) {
      s.state=STATES.FUNDS_AVAILABLE; s.availableUSD=s.net;
      note('Synthetic provider confirms eligible buying power; no bank transfer or provider call.');
    } else if(eventType === 'DESTINATION_FILL' && s.state === STATES.FUNDS_AVAILABLE) {
      s.destinationFee=roundCents(s.availableUSD * 0.005);
      s.purchasedUSD=roundCents(s.availableUSD - s.destinationFee);
      s.availableUSD=0; s.state=STATES.COMPLETED;
      note('Synthetic destination purchase filled. Both legs have simulated receipts.');
    } else if(eventType === 'DESTINATION_REJECT' && s.state === STATES.FUNDS_AVAILABLE) {
      s.state=STATES.DESTINATION_REJECTED;
      note('Synthetic purchase rejected. Sale already occurred; proceeds remain available as cash.');
    } else if(eventType === 'EVIDENCE_CONFLICT' && s.state !== STATES.COMPLETED) {
      s.state=STATES.HOLD;
      note('Conflicting provider evidence. RYAN policy: HOLD; no further action.');
    } else {
      throw new Error('Event refused: ' + eventType + ' in ' + s.state);
    }
    return s;
  }
  const api = {STATES, create, transition};
  if(typeof module === 'object' && module.exports) module.exports = api;
  if(root) root.AXISBridgeEngine=api;
})(typeof window === 'object' ? window : null);
