import { verifyTransaction, verifyCbeTransaction } from '../src/lib/verifier';

async function main() {
  console.log('--- TESTING CBE VERIFIER ---');
  const txId = 'FT26278654BP';
  const amount = 1000;

  console.log(`Checking transaction: ${txId} with amount: ${amount} ETB`);
  
  const cbeResult = await verifyCbeTransaction(txId, amount);
  console.log('\nverifyCbeTransaction output:');
  console.log(JSON.stringify(cbeResult, null, 2));

  console.log('\nTesting unified verifyTransaction function:');
  const unifiedResult = await verifyTransaction('CBE', txId, amount);
  console.log(`verifyTransaction('CBE', '${txId}', ${amount}) =>`, unifiedResult);

  // Also test with mismatch amount to ensure validation rigor
  console.log('\nTesting with wrong amount (500 ETB):');
  const wrongAmountResult = await verifyTransaction('CBE', txId, 500);
  console.log(`verifyTransaction('CBE', '${txId}', 500) =>`, wrongAmountResult);

  // Also test with invalid transaction format
  console.log('\nTesting with invalid transaction format:');
  const invalidResult = await verifyTransaction('CBE', 'INVALID_123', amount);
  console.log(`verifyTransaction('CBE', 'INVALID_123', ${amount}) =>`, invalidResult);
}

main().catch(console.error);
