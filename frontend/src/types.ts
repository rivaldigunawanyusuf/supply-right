export type UserRole = 'BUYER' | 'SUPPLIER' | 'PROVIDER' | 'VERIFIER' | 'JUDGE';

export interface User {
  id: string;
  email: string;
  name: string;
  companyName: string;
  role: UserRole;
  walletAddress: string;
}

export type POStatus =
  | 'DRAFT'
  | 'SUPPLIER_ACCEPTED'
  | 'COMMITTED_ONCHAIN'
  | 'VAULT_FUNDED'
  | 'DELIVERY_LOGGED'
  | 'CLAIM_SUBMITTED'
  | 'VERIFIER_APPROVED'
  | 'VERIFIER_REJECTED'
  | 'SETTLED'
  | 'FACTORED';

export interface PurchaseOrder {
  id: string;
  buyer_id: string;
  buyer_company: string;
  buyer_wallet: string;
  supplier_id: string;
  supplier_company: string;
  supplier_wallet: string;
  product_spec: string;
  ordered_units: number;
  ordered_batches: number;
  contract_value_meth: number;
  coverage_rate_bps: number;
  required_collateral_meth: number;
  locked_collateral_meth: number;
  deadline: string;
  delivered_units: number;
  delivered_batches: number;
  warehouse_receipt_notes?: string | null;
  evidence_hash?: string | null;
  verified_eligible_loss_meth?: number | null;
  verifier_decision?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  verifier_notes?: string | null;
  payout_meth: number;
  refunded_collateral_meth: number;
  commitment_nft_id?: number | null;
  recovery_nft_id?: number | null;
  recovery_nft_holder?: string | null;
  status: POStatus;
  tx_hashes_json: string;
  created_at: string;
  updated_at: string;
}

export interface SystemMetrics {
  totalProtectedVolume: number;
  activeCommitments: number;
  lockedCollateral: number;
  claimsSettled: number;
  totalOrders: number;
}

export interface ChatMessage {
  id: string;
  po_id: string;
  sender_role: 'USER' | 'AI_COPILOT' | 'SECURITY_FIREWALL';
  sender_name: string;
  content: string;
  suggested_actions_json?: string | null;
  security_alert_json?: string | null;
  timestamp: string;
}

export interface TestVectorResult {
  testId: string;
  name: string;
  category: 'SECURITY' | 'COMPLIANCE' | 'FUNCTIONAL' | 'REPRODUCIBILITY';
  proposal: any;
  verdict: any;
  signerResult?: any;
  passed: boolean;
  explanation: string;
  timestamp: number;
}

export interface SystemState {
  purchaseOrder: {
    id: string;
    buyer: { name: string; wallet: string; role: string };
    supplier: { name: string; contact: string; role: string };
    product: { description: string; type: string; specifications: string };
    quantity: { ordered: number; batches: number; perBatch: number; unit: string };
    deadline: string;
    contractDate: string;
    totalValue: string;
    totalValueDisplay: string;
  };
  deliveryEvidence: {
    deliveredBatches: number;
    deliveredQuantity: number;
    deliveryDate: string;
    shortfallBatches: number;
    shortfallQuantity: number;
    shortfallPercentage: number;
    evidenceHash: string;
    evidenceNotes: string;
    inspectionDate: string;
  };
  protection: {
    eligibleLoss: string;
    eligibleLossDisplay: string;
    coverageRate: number;
    collateral: string;
    collateralDisplay: string;
    expectedPayout: string;
    expectedPayoutDisplay: string;
    remainingCollateral: string;
    remainingCollateralDisplay: string;
  };
  parties: {
    registrar: { address: string; role: string };
    provider: { address: string; role: string };
    verifier: { address: string; role: string };
    buyer: { address: string; role: string };
    agent: { address: string; role: string };
  };
  contracts: {
    mockETH: string;
    supplyRightNFT: string;
    protectionVault: string;
    claimManager: string;
    recoveryClaimNFT: string;
  };
  chain: {
    name: string;
    chainId: number;
    explorerUrl: string;
  };
  commitment: {
    tokenId: number;
    poId: string;
    buyer: string;
    totalValueWei: string;
    quantity: number;
    deadline: number;
    registeredAt: number;
    active: boolean;
    txHash: string;
  };
  vault: {
    collateralWei: string;
    coverageRateBps: number;
    maxPayoutWei: string;
    fundedAt: number;
    active: boolean;
    settled: boolean;
    txHash: string;
  };
  claim: {
    status: 'NONE' | 'SUBMITTED' | 'VERIFIER_APPROVED' | 'VERIFIER_REJECTED' | 'SETTLED';
    deliveredQuantity: number;
    eligibleLossWei: string;
    requestedPayoutWei: string;
    evidenceHash: string;
    submittedAt: number;
    settledAt: number;
    recoveryTokenId: number;
    txHash: string;
    settlementTxHash: string;
  };
  recoveryNFT: {
    tokenId: number;
    recipient: string;
    payoutAmountWei: string;
    eligibleLossWei: string;
    mintedAt: number;
    txHash: string;
  } | null;
  auditTrail: AuditRecord[];
  disclaimer: string;
}

export interface AuditRecord {
  id: string;
  stage: 'ASSESS' | 'PROPOSE' | 'AUTHORIZE' | 'EXECUTE' | 'READ' | 'AUDIT' | 'SECURITY_BLOCK';
  actionType: string;
  actor: string;
  targetContract?: string;
  policyVerdict?: 'ALLOW' | 'DENY';
  policyChecks?: { rule: string; passed: boolean; reason: string }[];
  txHash?: string;
  status: 'PENDING' | 'ALLOWED' | 'DENIED' | 'CONFIRMED' | 'FAILED' | 'INFO';
  summary?: string;
  rationale: string;
  timestamp: number | string;
}

export interface AgentAssessment {
  poId: string;
  orderedQuantity: number;
  deliveredQuantity: number;
  shortfallQuantity: number;
  shortfallPercentage: number;
  deadlinePassed: boolean;
  evidenceStatus: string;
  qualitativeSummary: string;
  confidenceFlag: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: string;
  disclaimer: string;
}

export interface PolicyVerdict {
  allowed: boolean;
  verdict: 'ALLOW' | 'DENY';
  checks: {
    rule: string;
    passed: boolean;
    reason: string;
  }[];
  timestamp: number;
}
