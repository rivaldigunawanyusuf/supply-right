import { ActionType, PolicyCheckResult, PolicyConfig, ProposedAction } from './types.js';

export class PolicyEngine {
  private config: PolicyConfig;
  private usedNonces: Set<string> = new Set();

  constructor(config: PolicyConfig) {
    this.config = config;
  }

  public updateConfig(newConfig: Partial<PolicyConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): PolicyConfig {
    return this.config;
  }

  /**
   * Evaluates a proposed transaction action against all safety rules.
   * Returns a complete audit breakdown with an overall ALLOW or DENY verdict.
   */
  public evaluate(action: ProposedAction, contextState?: {
    isPolicyFunded?: boolean;
    availableCollateralWei?: bigint;
    claimStatus?: number; // 0: None, 1: Submitted, 2: VerifierApproved, 3: VerifierRejected, 4: Settled
    verifierApproved?: boolean;
    eligibleLossWei?: bigint;
    buyerAddress?: string;
  }): PolicyCheckResult {
    const checks: { rule: string; passed: boolean; reason: string }[] = [];

    // Rule 1: Chain ID Allowlist
    const chainAllowed = this.config.allowedChainIds.includes(action.chainId);
    checks.push({
      rule: 'CHAIN_ID_ALLOWLIST',
      passed: chainAllowed,
      reason: chainAllowed 
        ? `Chain ID ${action.chainId} is authorized.`
        : `Chain ID ${action.chainId} is NOT in allowed list: [${this.config.allowedChainIds.join(', ')}]`
    });

    // Rule 2: Contract Address Allowlist
    const lowerTarget = action.targetContract.toLowerCase();
    const allowedContracts = Object.values(this.config.allowedContracts)
      .filter((addr): addr is string => Boolean(addr))
      .map(addr => addr.toLowerCase());
    const contractAllowed = allowedContracts.length === 0 || allowedContracts.includes(lowerTarget);
    checks.push({
      rule: 'CONTRACT_ALLOWLIST',
      passed: contractAllowed,
      reason: contractAllowed
        ? `Target contract ${action.targetContract} is verified.`
        : `Target contract ${action.targetContract} is NOT in allowed contract registry.`
    });

    // Rule 3: Function Signature Allowlist
    const functionAllowed = this.config.allowedFunctions.includes(action.targetFunction);
    checks.push({
      rule: 'FUNCTION_ALLOWLIST',
      passed: functionAllowed,
      reason: functionAllowed
        ? `Function ${action.targetFunction} is whitelisted.`
        : `Function ${action.targetFunction} is forbidden. Allowed: [${this.config.allowedFunctions.join(', ')}]`
    });

    // Rule 4: Actor Role Permission
    let roleAllowed = false;
    let roleReason = 'Unknown actor';
    const actorLower = action.actor.toLowerCase();

    for (const [roleName, roleInfo] of Object.entries(this.config.rolePermissions)) {
      if (roleInfo.address && roleInfo.address.toLowerCase() === actorLower) {
        if (roleInfo.allowedActions.includes(action.action)) {
          roleAllowed = true;
          roleReason = `Actor is verified ${roleName.toUpperCase()} authorized for ${action.action}.`;
        } else {
          roleReason = `Actor is registered as ${roleName.toUpperCase()} but is NOT permitted to perform ${action.action}.`;
        }
        break;
      }
    }

    // Fallback: If roles aren't locked to specific static addresses in demo, check logical role
    if (!roleAllowed && !checks.some(c => !c.passed)) {
      // If actor was configured as 0x0 or mock, verify against action type
      roleReason = `Actor ${action.actor} does not have assigned authority for ${action.action}.`;
    }

    checks.push({
      rule: 'ROLE_AUTHORITY',
      passed: roleAllowed,
      reason: roleReason
    });

    // Rule 5: Nonce Idempotency (Prevent Replay)
    const nonceUnique = !this.usedNonces.has(action.nonce);
    checks.push({
      rule: 'NONCE_IDEMPOTENCY',
      passed: nonceUnique,
      reason: nonceUnique
        ? `Nonce ${action.nonce} is fresh and unused.`
        : `Replay detected: Nonce ${action.nonce} has already been consumed.`
    });

    // Rule 6: Precondition & Business Logic Constraints
    if (action.action === 'SUBMIT_CLAIM') {
      const isFunded = contextState?.isPolicyFunded ?? true;
      checks.push({
        rule: 'POLICY_FUNDED_PRECONDITION',
        passed: isFunded,
        reason: isFunded
          ? 'Protection policy is funded and active on-chain.'
          : 'Cannot submit claim: Protection policy is unfunded or expired.'
      });
    }

    if (action.action === 'SETTLE_PAYOUT') {
      // Must be approved by verifier (status 2 = VerifierApproved)
      const isApproved = contextState?.claimStatus === 2 || contextState?.verifierApproved === true;
      checks.push({
        rule: 'VERIFIER_APPROVAL_REQUIRED',
        passed: isApproved,
        reason: isApproved
          ? 'Independent verifier attestation confirmed on-chain.'
          : 'Settlement denied: Claim has not been approved by the independent verifier.'
      });

      // Payout value cap
      const payoutWei = action.params?.payoutAmountWei 
        ? BigInt(action.params.payoutAmountWei)
        : BigInt(0);

      const withinMaxCap = payoutWei <= this.config.maxPayoutWei;
      checks.push({
        rule: 'VALUE_CAP_ENFORCEMENT',
        passed: withinMaxCap,
        reason: withinMaxCap
          ? `Payout amount (${payoutWei} wei) is within safety cap (${this.config.maxPayoutWei} wei).`
          : `Payout amount exceeds maximum policy limit of ${this.config.maxPayoutWei} wei.`
      });

      // Collateral check
      if (contextState?.availableCollateralWei !== undefined) {
        const hasCollateral = contextState.availableCollateralWei >= payoutWei;
        checks.push({
          rule: 'COLLATERAL_SUFFICIENCY',
          passed: hasCollateral,
          reason: hasCollateral
            ? `Vault has sufficient collateral (${contextState.availableCollateralWei} >= ${payoutWei}).`
            : `Under-collateralized: Vault has ${contextState.availableCollateralWei} wei, payout requires ${payoutWei} wei.`
        });
      }

      // Recipient check
      if (contextState?.buyerAddress && action.params?.recipient) {
        const correctRecipient = contextState.buyerAddress.toLowerCase() === action.params.recipient.toLowerCase();
        checks.push({
          rule: 'RECIPIENT_INTEGRITY',
          passed: correctRecipient,
          reason: correctRecipient
            ? `Recipient address matches verified buyer: ${action.params.recipient}`
            : `Unauthorized recipient! Expected buyer: ${contextState.buyerAddress}, got: ${action.params.recipient}`
        });
      }
    }

    const allPassed = checks.every(c => c.passed);

    // If allowed, mark nonce as used
    if (allPassed) {
      this.usedNonces.add(action.nonce);
    }

    return {
      allowed: allPassed,
      verdict: allPassed ? 'ALLOW' : 'DENY',
      checks,
      timestamp: Date.now()
    };
  }

  public resetNonces(): void {
    this.usedNonces.clear();
  }
}
