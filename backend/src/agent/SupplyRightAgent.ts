import { ethers } from 'ethers';
import { PolicyEngine } from '../policy/PolicyEngine.js';
import { ProposedAction, PolicyCheckResult } from '../policy/types.js';
import { IsolatedSigner, ExecutionResult } from '../signer/IsolatedSigner.js';

export interface PurchaseOrderData {
  id: string;
  buyer: { name: string; wallet: string; role: string };
  supplier: { name: string; contact: string; role: string };
  product: { description: string; type: string; specifications: string };
  quantity: { ordered: number; batches: number; perBatch: number; unit: string };
  deadline: string;
  contractDate: string;
  totalValue: string;
  totalValueDisplay: string;
}

export interface DeliveryEvidenceData {
  deliveredBatches: number;
  deliveredQuantity: number;
  deliveryDate: string;
  shortfallBatches: number;
  shortfallQuantity: number;
  shortfallPercentage: number;
  evidenceHash: string;
  evidenceNotes: string;
  inspectionDate: string;
}

export interface ProtectionTermsData {
  eligibleLoss: string;
  eligibleLossDisplay: string;
  coverageRate: number; // e.g. 20 (%)
  collateral: string;
  collateralDisplay: string;
  expectedPayout: string;
  expectedPayoutDisplay: string;
  remainingCollateral: string;
  remainingCollateralDisplay: string;
}

export interface AgentAssessment {
  poId: string;
  orderedQuantity: number;
  deliveredQuantity: number;
  shortfallQuantity: number;
  shortfallPercentage: number;
  deadlinePassed: boolean;
  evidenceStatus: 'VERIFIED_PARTIAL_DELIVERY' | 'INCOMPLETE_EVIDENCE' | 'NO_DEFICIT';
  qualitativeSummary: string;
  confidenceFlag: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: 'SUBMIT_CLAIM' | 'REQUEST_MORE_EVIDENCE' | 'NO_ACTION';
  disclaimer: string;
}

export interface AuditRecord {
  id: string;
  stage: 'ASSESS' | 'PROPOSE' | 'AUTHORIZE' | 'EXECUTE';
  actionType: string;
  actor: string;
  targetContract: string;
  policyVerdict?: 'ALLOW' | 'DENY';
  policyChecks?: { rule: string; passed: boolean; reason: string }[];
  txHash?: string;
  status: 'PENDING' | 'ALLOWED' | 'DENIED' | 'CONFIRMED' | 'FAILED';
  rationale: string;
  timestamp: number;
}

export class SupplyRightAgent {
  private policyEngine: PolicyEngine;
  private signer: IsolatedSigner;
  private auditTrail: AuditRecord[] = [];

  constructor(policyEngine: PolicyEngine, signer: IsolatedSigner) {
    this.policyEngine = policyEngine;
    this.signer = signer;
  }

  public getSignerAddress(): string {
    return this.signer.getAddress();
  }

  public getAuditTrail(): AuditRecord[] {
    return [...this.auditTrail];
  }

  /**
   * Stage 1 & 2: Read & Assess
   * Ingests PO data and delivery evidence without fabricating probability scores.
   */
  public assessRisk(po: PurchaseOrderData, evidence: DeliveryEvidenceData): AgentAssessment {
    const ordered = po.quantity.ordered;
    const delivered = evidence.deliveredQuantity;
    const shortfall = Math.max(0, ordered - delivered);
    const shortfallPct = ordered > 0 ? (shortfall / ordered) * 100 : 0;
    const deadlineDate = new Date(po.deadline);
    const deadlinePassed = Date.now() >= deadlineDate.getTime();

    const summary = shortfall > 0 
      ? `Delivery shortfall of ${shortfall} units (${shortfallPct}% deficit) confirmed across ${evidence.shortfallBatches} missing batches. Delivery deadline (${po.deadline}) has expired.`
      : 'Order fulfilled according to specifications. No non-delivery exposure detected.';

    const assessment: AgentAssessment = {
      poId: po.id,
      orderedQuantity: ordered,
      deliveredQuantity: delivered,
      shortfallQuantity: shortfall,
      shortfallPercentage: shortfallPct,
      deadlinePassed,
      evidenceStatus: shortfall > 0 ? 'VERIFIED_PARTIAL_DELIVERY' : 'NO_DEFICIT',
      qualitativeSummary: summary,
      confidenceFlag: 'HIGH',
      recommendedAction: shortfall > 0 ? 'SUBMIT_CLAIM' : 'NO_ACTION',
      disclaimer: 'Qualitative analysis based strictly on warehouse delivery receipts and PO commitment terms. No speculative scores.'
    };

    this.auditTrail.push({
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      stage: 'ASSESS',
      actionType: 'ASSESS_RISK',
      actor: this.getSignerAddress(),
      targetContract: 'N/A (Off-Chain Analysis)',
      status: 'CONFIRMED',
      rationale: summary,
      timestamp: Date.now()
    });

    return assessment;
  }

  /**
   * Stage 3: Propose
   * Formulates a structured, bounded on-chain action proposal.
   */
  public proposeClaimSubmission(
    po: PurchaseOrderData,
    evidence: DeliveryEvidenceData,
    claimManagerAddress: string,
    tokenId: number
  ): ProposedAction {
    const nonce = ethers.keccak256(ethers.toUtf8Bytes(`claim-${po.id}-${Date.now()}`));

    const proposal: ProposedAction = {
      action: 'SUBMIT_CLAIM',
      actor: this.getSignerAddress(),
      targetContract: claimManagerAddress,
      targetFunction: 'submitClaim',
      chainId: 11155111, // Sepolia
      params: {
        commitmentTokenId: tokenId,
        deliveredQuantity: evidence.deliveredQuantity,
        evidenceHash: evidence.evidenceHash,
        nonce: nonce
      },
      nonce,
      timestamp: Date.now(),
      rationale: `Submit claim on-chain for PO ${po.id} citing ${evidence.deliveredQuantity} units delivered of ${po.quantity.ordered} ordered.`
    };

    this.auditTrail.push({
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      stage: 'PROPOSE',
      actionType: proposal.action,
      actor: proposal.actor,
      targetContract: proposal.targetContract,
      status: 'PENDING',
      rationale: proposal.rationale,
      timestamp: Date.now()
    });

    return proposal;
  }

  /**
   * Stage 3 (Settlement): Propose Settlement
   */
  public proposeSettlement(
    tokenId: number,
    buyerAddress: string,
    payoutAmountWei: string,
    claimManagerAddress: string
  ): ProposedAction {
    const nonce = ethers.keccak256(ethers.toUtf8Bytes(`settle-${tokenId}-${Date.now()}`));

    const proposal: ProposedAction = {
      action: 'SETTLE_PAYOUT',
      actor: this.getSignerAddress(),
      targetContract: claimManagerAddress,
      targetFunction: 'settleWithPayout',
      chainId: 11155111,
      params: {
        commitmentTokenId: tokenId,
        recipient: buyerAddress,
        payoutAmountWei: payoutAmountWei
      },
      nonce,
      timestamp: Date.now(),
      rationale: `Trigger atomic payout of ${ethers.formatEther(payoutAmountWei)} mETH to buyer and mint Recovery Claim NFT.`
    };

    this.auditTrail.push({
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      stage: 'PROPOSE',
      actionType: proposal.action,
      actor: proposal.actor,
      targetContract: proposal.targetContract,
      status: 'PENDING',
      rationale: proposal.rationale,
      timestamp: Date.now()
    });

    return proposal;
  }

  /**
   * Stage 4: Authorize
   * Evaluates proposal against independent Policy Engine.
   */
  public authorizeAction(
    action: ProposedAction,
    contextState?: {
      isPolicyFunded?: boolean;
      availableCollateralWei?: bigint;
      claimStatus?: number;
      verifierApproved?: boolean;
      eligibleLossWei?: bigint;
      buyerAddress?: string;
    }
  ): PolicyCheckResult {
    const verdict = this.policyEngine.evaluate(action, contextState);

    this.auditTrail.push({
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      stage: 'AUTHORIZE',
      actionType: action.action,
      actor: action.actor,
      targetContract: action.targetContract,
      policyVerdict: verdict.verdict,
      policyChecks: verdict.checks,
      status: verdict.allowed ? 'ALLOWED' : 'DENIED',
      rationale: verdict.allowed 
        ? 'All policy constraints and role checks satisfied.'
        : `Policy violation: ${verdict.checks.filter(c => !c.passed).map(c => c.reason).join('; ')}`,
      timestamp: Date.now()
    });

    return verdict;
  }

  /**
   * Stage 5 & 6: Execute & Audit
   * Dispatches the action to Isolated Signer only if policy allowed it.
   */
  public async executeAuthorizedAction(
    action: ProposedAction,
    verdict: PolicyCheckResult
  ): Promise<ExecutionResult> {
    const result = await this.signer.execute(action, verdict);

    this.auditTrail.push({
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      stage: 'EXECUTE',
      actionType: action.action,
      actor: action.actor,
      targetContract: action.targetContract,
      txHash: result.txHash,
      status: result.success ? 'CONFIRMED' : 'FAILED',
      rationale: result.success 
        ? `Transaction confirmed in block ${result.blockNumber} (tx: ${result.txHash.slice(0, 10)}...)`
        : `Execution failed: ${result.error}`,
      timestamp: Date.now()
    });

    return result;
  }

  public recordCustomAudit(record: Omit<AuditRecord, 'id' | 'timestamp'>): void {
    this.auditTrail.push({
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      ...record
    });
  }

  public resetAuditTrail(): void {
    this.auditTrail = [];
    this.policyEngine.resetNonces();
  }
}
