export type BankType = 'CBE' | 'TELEBIRR' | 'BOA';

export interface VerificationResult {
  isValid: boolean;
  bank: BankType;
  transactionId: string;
  expectedAmount: number;
  extractedAmount?: number;
  extractedSender?: string;
  extractedRecipient?: string;
  rawStatus?: string;
  verifiedAt?: Date;
  details?: string;
}
