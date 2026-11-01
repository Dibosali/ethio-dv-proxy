import { BankType, VerificationResult } from './types';
import { verifyTelebirrTransaction } from './telebirr';
import { verifyCbeTransaction } from './cbe';
import { verifyBoaTransaction } from './boa';

export * from './types';
export * from './telebirr';
export * from './cbe';
export * from './boa';

/**
 * Unified verification function for Ethiopian bank payments (Telebirr, CBE, BOA).
 * 
 * @param bank 'CBE' | 'TELEBIRR' | 'BOA'
 * @param transactionId Reference code or Transaction ID provided by the user
 * @param expectedAmount Required payment amount in ETB
 * @returns Promise<boolean> true if verified, false otherwise
 */
export async function verifyTransaction(
  bank: BankType,
  transactionId: string,
  expectedAmount: number
): Promise<boolean> {
  if (!transactionId || typeof transactionId !== 'string' || expectedAmount <= 0) {
    return false;
  }

  const normalizedBank = bank.toUpperCase() as BankType;

  try {
    let result: VerificationResult;

    switch (normalizedBank) {
      case 'TELEBIRR':
        result = await verifyTelebirrTransaction(transactionId, expectedAmount);
        break;
      case 'CBE':
        result = await verifyCbeTransaction(transactionId, expectedAmount);
        break;
      case 'BOA':
        result = await verifyBoaTransaction(transactionId, expectedAmount);
        break;
      default:
        return false;
    }

    return result.isValid;
  } catch (err) {
    console.error(`[verifyTransaction] Error verifying ${bank} tx ${transactionId}:`, err);
    return false;
  }
}
