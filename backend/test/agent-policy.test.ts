import { describe, it } from 'node:test';
import assert from 'node:assert';
import { PolicyEngine } from '../src/policy/PolicyEngine.js';
import { SupplyRightAgent } from '../src/agent/SupplyRightAgent.js';
import { IsolatedSigner } from '../src/signer/IsolatedSigner.js';
import { PolicyConfig, ProposedAction } from '../src/policy/types.js';

describe('SupplyRight AI — Policy Engine & Agent Decision Pipeline Tests', () => {
  const buyerAddress = '0x1111111111111111111111111111111111111111';
  const providerAddress = '0x2222222222222222222222222222222222222222';
  const verifierAddress = '0x3333333333333333333333333333333333333333';
  const registrarAddress = '0x4444444444444444444444444444444444444444';
  const claimManagerAddress = '0x9999000400000000000000000000000000000004';
  const attackerAddress = '0x7777777777777777777777777777777777777777';

  const signer = new IsolatedSigner();
  const agentAddress = signer.getAddress();

  const config: PolicyConfig = {
    allowedChainIds: [11155111],
    allowedContracts: {
      claimManager: claimManagerAddress
    },
    allowedFunctions: ['submitClaim', 'settleWithPayout'],
    rolePermissions: {
      registrar: { address: registrarAddress, allowedActions: ['REGISTER_COMMITMENT'] },
      provider: { address: providerAddress, allowedActions: ['FUND_POLICY'] },
      verifier: { address: verifierAddress, allowedActions: ['VERIFY_CLAIM'] },
      buyer: { address: buyerAddress, allowedActions: ['SUBMIT_CLAIM', 'SETTLE_PAYOUT'] },
      agent: { address: agentAddress, allowedActions: ['SUBMIT_CLAIM', 'SETTLE_PAYOUT'] }
    },
    maxPayoutWei: BigInt('20000000000000000000'), // 20 mETH
    maxCoverageRateBps: 2000
  };

  const policyEngine = new PolicyEngine(config);
  const agent = new SupplyRightAgent(policyEngine, signer);

  it('TC-01: Happy Path — Policy authorizes settlement when claim is verified and collateral sufficient', () => {
    const proposal: ProposedAction = {
      action: 'SETTLE_PAYOUT',
      actor: agentAddress,
      targetContract: claimManagerAddress,
      targetFunction: 'settleWithPayout',
      chainId: 11155111,
      params: {
        commitmentTokenId: 1,
        recipient: buyerAddress,
        payoutAmountWei: '16000000000000000000' // 16 mETH
      },
      nonce: 'nonce-tc01-valid',
      timestamp: Date.now(),
      rationale: 'Legitimate settlement'
    };

    const verdict = policyEngine.evaluate(proposal, {
      isPolicyFunded: true,
      availableCollateralWei: BigInt('20000000000000000000'), // 20 mETH
      claimStatus: 2, // VerifierApproved
      verifierApproved: true,
      eligibleLossWei: BigInt('80000000000000000000'),
      buyerAddress: buyerAddress
    });

    assert.strictEqual(verdict.allowed, true);
    assert.strictEqual(verdict.verdict, 'ALLOW');
    assert.ok(verdict.checks.every(c => c.passed));
  });

  it('TC-02: Under-collateralized — Policy rejects settlement when payout exceeds available collateral', () => {
    const proposal: ProposedAction = {
      action: 'SETTLE_PAYOUT',
      actor: agentAddress,
      targetContract: claimManagerAddress,
      targetFunction: 'settleWithPayout',
      chainId: 11155111,
      params: {
        commitmentTokenId: 1,
        recipient: buyerAddress,
        payoutAmountWei: '16000000000000000000' // 16 mETH
      },
      nonce: 'nonce-tc02-undercollateralized',
      timestamp: Date.now(),
      rationale: 'Over-claim attempt'
    };

    const verdict = policyEngine.evaluate(proposal, {
      isPolicyFunded: true,
      availableCollateralWei: BigInt('5000000000000000000'), // Only 5 mETH available!
      claimStatus: 2,
      verifierApproved: true,
      buyerAddress: buyerAddress
    });

    assert.strictEqual(verdict.allowed, false);
    assert.strictEqual(verdict.verdict, 'DENY');
    const failedCheck = verdict.checks.find(c => c.rule === 'COLLATERAL_SUFFICIENCY');
    assert.ok(failedCheck);
    assert.strictEqual(failedCheck.passed, false);
  });

  it('TC-03: Unverified Claim — Policy denies settlement before verifier attestation', () => {
    const proposal: ProposedAction = {
      action: 'SETTLE_PAYOUT',
      actor: agentAddress,
      targetContract: claimManagerAddress,
      targetFunction: 'settleWithPayout',
      chainId: 11155111,
      params: {
        commitmentTokenId: 1,
        recipient: buyerAddress,
        payoutAmountWei: '16000000000000000000'
      },
      nonce: 'nonce-tc03-unverified',
      timestamp: Date.now(),
      rationale: 'Premature settlement attempt'
    };

    const verdict = policyEngine.evaluate(proposal, {
      isPolicyFunded: true,
      availableCollateralWei: BigInt('20000000000000000000'),
      claimStatus: 1, // Only Submitted, NOT approved
      verifierApproved: false,
      buyerAddress: buyerAddress
    });

    assert.strictEqual(verdict.allowed, false);
    assert.strictEqual(verdict.verdict, 'DENY');
    const failedCheck = verdict.checks.find(c => c.rule === 'VERIFIER_APPROVAL_REQUIRED');
    assert.ok(failedCheck);
    assert.strictEqual(failedCheck.passed, false);
  });

  it('TC-04: Nonce Replay — Policy rejects duplicate proposal with previously used nonce', () => {
    const nonce = 'nonce-tc04-replay-test';
    const proposal: ProposedAction = {
      action: 'SUBMIT_CLAIM',
      actor: agentAddress,
      targetContract: claimManagerAddress,
      targetFunction: 'submitClaim',
      chainId: 11155111,
      params: { commitmentTokenId: 1, deliveredQuantity: 2000 },
      nonce,
      timestamp: Date.now(),
      rationale: 'First submission'
    };

    const verdict1 = policyEngine.evaluate(proposal, { isPolicyFunded: true });
    assert.strictEqual(verdict1.allowed, true);

    // Second evaluation with identical nonce MUST be denied
    const verdict2 = policyEngine.evaluate(proposal, { isPolicyFunded: true });
    assert.strictEqual(verdict2.allowed, false);
    assert.strictEqual(verdict2.verdict, 'DENY');
    const failedCheck = verdict2.checks.find(c => c.rule === 'NONCE_IDEMPOTENCY');
    assert.ok(failedCheck);
    assert.strictEqual(failedCheck.passed, false);
  });

  it('TC-05: Invalid Role — Attacker address denied from triggering settlement', () => {
    const proposal: ProposedAction = {
      action: 'SETTLE_PAYOUT',
      actor: attackerAddress,
      targetContract: claimManagerAddress,
      targetFunction: 'settleWithPayout',
      chainId: 11155111,
      params: {
        commitmentTokenId: 1,
        recipient: attackerAddress,
        payoutAmountWei: '16000000000000000000'
      },
      nonce: 'nonce-tc05-attacker',
      timestamp: Date.now(),
      rationale: 'Attacker exploit attempt'
    };

    const verdict = policyEngine.evaluate(proposal, {
      isPolicyFunded: true,
      availableCollateralWei: BigInt('20000000000000000000'),
      claimStatus: 2,
      verifierApproved: true,
      buyerAddress: buyerAddress
    });

    assert.strictEqual(verdict.allowed, false);
    assert.strictEqual(verdict.verdict, 'DENY');
    const roleCheck = verdict.checks.find(c => c.rule === 'ROLE_AUTHORITY');
    assert.ok(roleCheck);
    assert.strictEqual(roleCheck.passed, false);
  });

  it('TC-06: Unauthorized Contract / Chain ID — Policy denies calls to foreign contracts or wrong chains', () => {
    const proposal: ProposedAction = {
      action: 'SETTLE_PAYOUT',
      actor: agentAddress,
      targetContract: '0x00000000000000000000000000000000deadbeef', // Unknown contract
      targetFunction: 'settleWithPayout',
      chainId: 1, // Mainnet instead of Sepolia
      params: { commitmentTokenId: 1 },
      nonce: 'nonce-tc06-wrong-chain',
      timestamp: Date.now(),
      rationale: 'Phishing contract attempt'
    };

    const verdict = policyEngine.evaluate(proposal);
    assert.strictEqual(verdict.allowed, false);
    assert.strictEqual(verdict.verdict, 'DENY');
    const chainCheck = verdict.checks.find(c => c.rule === 'CHAIN_ID_ALLOWLIST');
    assert.ok(chainCheck && !chainCheck.passed);
    const contractCheck = verdict.checks.find(c => c.rule === 'CONTRACT_ALLOWLIST');
    assert.ok(contractCheck && !contractCheck.passed);
  });

  it('TC-07: Isolated Signer Hard Gating — Signer refuses to broadcast when policy denied', async () => {
    const proposal: ProposedAction = {
      action: 'SETTLE_PAYOUT',
      actor: attackerAddress,
      targetContract: claimManagerAddress,
      targetFunction: 'settleWithPayout',
      chainId: 11155111,
      params: { commitmentTokenId: 1 },
      nonce: 'nonce-tc07-signer-gate',
      timestamp: Date.now(),
      rationale: 'Bypassing policy attempt'
    };

    const fakeDeniedVerdict = {
      allowed: false,
      verdict: 'DENY' as const,
      checks: [{ rule: 'ROLE_AUTHORITY', passed: false, reason: 'Unauthorized' }],
      timestamp: Date.now()
    };

    const result = await signer.execute(proposal, fakeDeniedVerdict);
    assert.strictEqual(result.success, false);
    assert.ok(result.error?.includes('Execution blocked by Policy Gate'));
  });

  it('TC-08: Qualitative Risk Assessment — Reconciles quantities accurately without fabricated scores', () => {
    const mockPO = {
      id: 'PO-2026-001',
      buyer: { name: 'SME Corp', wallet: buyerAddress, role: 'buyer' },
      supplier: { name: 'Supplier Corp', contact: 's@test.com', role: 'supplier' },
      product: { description: 'Packaging', type: 'boxes', specifications: 'corrugated' },
      quantity: { ordered: 10000, batches: 50, perBatch: 200, unit: 'boxes' },
      deadline: '2026-10-15T00:00:00Z',
      contractDate: '2026-09-01T00:00:00Z',
      totalValue: '100000000000000000000',
      totalValueDisplay: '100 mETH'
    };

    const mockEvidence = {
      deliveredBatches: 10,
      deliveredQuantity: 2000,
      deliveryDate: '2026-10-14T18:00:00Z',
      shortfallBatches: 40,
      shortfallQuantity: 8000,
      shortfallPercentage: 80,
      evidenceHash: '0xabc123',
      evidenceNotes: 'Partial delivery',
      inspectionDate: '2026-10-16T09:00:00Z'
    };

    const assessment = agent.assessRisk(mockPO, mockEvidence);
    assert.strictEqual(assessment.orderedQuantity, 10000);
    assert.strictEqual(assessment.deliveredQuantity, 2000);
    assert.strictEqual(assessment.shortfallQuantity, 8000);
    assert.strictEqual(assessment.shortfallPercentage, 80);
    assert.strictEqual(assessment.recommendedAction, 'SUBMIT_CLAIM');
    assert.ok(assessment.disclaimer.includes('No speculative scores'));
  });
});
