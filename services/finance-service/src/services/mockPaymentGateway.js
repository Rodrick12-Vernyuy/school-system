// MOCK / SIMULATED mobile-money gateway. No real money moves and no real
// telecom API is called - this exists purely so the payment workflow can be
// demonstrated end-to-end for the university project. This is clearly
// labelled here and in the README/UI as simulated.
//
// Simulation rule (deterministic, so it is testable): a phone number ending
// in "0000" simulates a declined payment (e.g. insufficient balance). Every
// other well-formed number simulates a successful charge.
const crypto = require('crypto');

function simulateMobileMoneyCharge({ method, phoneNumber }) {
  const declined = phoneNumber.endsWith('0000');
  const transactionReference = `SIM-${method.toUpperCase()}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
  if (declined) {
    return { success: false, transactionReference, message: 'Simulated decline: insufficient balance' };
  }
  return { success: true, transactionReference, message: 'Simulated payment approved' };
}

module.exports = { simulateMobileMoneyCharge };
