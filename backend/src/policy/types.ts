export type ActionType = 
  | 'REGISTER_COMMITMENT'
  | 'FUND_POLICY'
  | 'SUBMIT_CLAIM'
  | 'VERIFY_CLAIM'
  | 'SETTLE_PAYOUT';

export interface ProposedAction {
  action: ActionType;
  actor: string;
  targetContract: string;
  targetFunction: string;
  chainId: number;
  params: Record<string, any>;
  value?: string; // in wei
  nonce: string;
  timestamp: number;
  rationale: string;
}

export interface PolicyCheckResult {
  allowed: boolean;
  verdict: 'ALLOW' | 'DENY';
  checks: {
    rule: string;
    passed: boolean;
    reason: string;
  }[];
  timestamp: number;
}

export interface PolicyConfig {
  allowedChainIds: number[];
  allowedContracts: {
    mockETH?: string;
    supplyRightNFT?: string;
    protectionVault?: string;
    claimManager?: string;
    recoveryClaimNFT?: string;
  };
  allowedFunctions: string[];
  rolePermissions: {
    registrar: { address: string; allowedActions: ActionType[] };
    provider: { address: string; allowedActions: ActionType[] };
    verifier: { address: string; allowedActions: ActionType[] };
    buyer: { address: string; allowedActions: ActionType[] };
    agent: { address: string; allowedActions: ActionType[] };
  };
  maxPayoutWei: bigint;
  maxCoverageRateBps: number;
}
