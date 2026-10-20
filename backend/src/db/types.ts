export type UserRole = 'BUYER' | 'SUPPLIER' | 'PROVIDER' | 'VERIFIER' | 'JUDGE';

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  company_name: string;
  role: UserRole;
  wallet_address: string;
  created_at: string;
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

export interface PurchaseOrderRecord {
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
  coverage_rate_bps: number; // e.g. 2000 for 20%
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
  tx_hashes_json: string; // JSON: { commitmentTx?, fundingTx?, claimTx?, verifierTx?, settlementTx?, factoringTx? }
  created_at: string;
  updated_at: string;
}

export interface AuditLogRecord {
  id: string;
  po_id: string;
  actor_role: string;
  stage: 'READ' | 'ASSESS' | 'PROPOSE' | 'AUTHORIZE' | 'EXECUTE' | 'AUDIT' | 'SECURITY_BLOCK';
  action_type: string;
  proposal_json?: string | null;
  policy_verdict_json?: string | null;
  tx_hash?: string | null;
  status: 'ALLOWED' | 'DENIED' | 'INFO';
  summary: string;
  timestamp: string;
}

export interface ChatMessageRecord {
  id: string;
  po_id: string;
  sender_role: 'USER' | 'AI_COPILOT' | 'SECURITY_FIREWALL';
  sender_name: string;
  content: string;
  suggested_actions_json?: string | null;
  security_alert_json?: string | null;
  timestamp: string;
}
