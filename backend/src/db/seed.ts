import bcrypt from 'bcryptjs';
import { AppDatabase } from './database.js';
import { UserRecord, PurchaseOrderRecord, AuditLogRecord, ChatMessageRecord } from './types.js';

export function seedDatabase(db: AppDatabase): void {
  // Check if users already exist
  const existingUsers = db.getAllUsers();
  if (existingUsers.length > 0) {
    return; // Already seeded
  }

  const saltRounds = 10;
  const passwordHash = bcrypt.hashSync('demo1234', saltRounds);
  const now = new Date().toISOString();

  // 1. Seed 5 Demo Users
  const users: UserRecord[] = [
    {
      id: 'usr_buyer_1',
      email: 'buyer@brightbox.io',
      password_hash: passwordHash,
      name: 'Elena Ramos',
      company_name: 'BrightBox Consumer Goods',
      role: 'BUYER',
      wallet_address: '0x1111111111111111111111111111111111111111',
      created_at: now
    },
    {
      id: 'usr_supplier_1',
      email: 'supplier@packagepro.io',
      password_hash: passwordHash,
      name: 'Marcus Chen',
      company_name: 'PackagePro Domestic',
      role: 'SUPPLIER',
      wallet_address: '0x2222222222222222222222222222222222222222',
      created_at: now
    },
    {
      id: 'usr_provider_1',
      email: 'vault@sentinel.fi',
      password_hash: passwordHash,
      name: 'Sarah Jenkins',
      company_name: 'Sentinel Protection Vault',
      role: 'PROVIDER',
      wallet_address: '0x4444444444444444444444444444444444444444',
      created_at: now
    },
    {
      id: 'usr_verifier_1',
      email: 'inspector@sgs-verify.org',
      password_hash: passwordHash,
      name: 'Dr. David Miller',
      company_name: 'SGS Independent Verifier',
      role: 'VERIFIER',
      wallet_address: '0x3333333333333333333333333333333333333333',
      created_at: now
    },
    {
      id: 'usr_judge_1',
      email: 'judge@fintechathon.org',
      password_hash: passwordHash,
      name: 'Hackathon Evaluation Committee',
      company_name: 'FinTechathon 2026 Judge',
      role: 'JUDGE',
      wallet_address: '0x8a3C00000000000000000000000000000000Bde6',
      created_at: now
    }
  ];

  for (const user of users) {
    db.insertUser(user);
  }

  // 2. Seed 3 Purchase Orders
  const pos: PurchaseOrderRecord[] = [
    {
      id: 'PO-2026-001',
      buyer_id: 'usr_buyer_1',
      buyer_company: 'BrightBox Consumer Goods',
      buyer_wallet: '0x1111111111111111111111111111111111111111',
      supplier_id: 'usr_supplier_1',
      supplier_company: 'PackagePro Domestic',
      supplier_wallet: '0x2222222222222222222222222222222222222222',
      product_spec: 'Custom-printed outer packaging boxes (Full-color printed corrugated cardboard, 300x200x150mm)',
      ordered_units: 10000,
      ordered_batches: 50,
      contract_value_meth: 100.0,
      coverage_rate_bps: 2000,
      required_collateral_meth: 20.0,
      locked_collateral_meth: 20.0,
      deadline: '2026-10-15T00:00:00Z',
      delivered_units: 2000,
      delivered_batches: 10,
      warehouse_receipt_notes: 'Warehouse receipt confirms 10 of 50 batches received at dock A3. Remaining 40 batches (8,000 units) not delivered by contract deadline.',
      evidence_hash: '0x3b89ef7c014798e1fae29c54e26a27e7d82f7c04fa27c6543bca470c1e8d91a2',
      verified_eligible_loss_meth: null,
      verifier_decision: 'PENDING',
      verifier_notes: null,
      payout_meth: 0,
      refunded_collateral_meth: 0,
      commitment_nft_id: 1,
      recovery_nft_id: null,
      recovery_nft_holder: null,
      status: 'CLAIM_SUBMITTED',
      tx_hashes_json: JSON.stringify({
        commitmentTx: '0x3a8f9c112b07e5f187a2745e454b51c8901b0a88ef4d7a9b09c85f7a1420791e',
        fundingTx: '0x7e1a3bc8945a0de78921cf02a819bca4507b91d7e23401fa91bb680de831ac12',
        claimTx: '0x4f2b8a1c9e3d7f6b5a4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a'
      }),
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      updated_at: now
    },
    {
      id: 'PO-2026-002',
      buyer_id: 'usr_buyer_1',
      buyer_company: 'BrightBox Consumer Goods',
      buyer_wallet: '0x1111111111111111111111111111111111111111',
      supplier_id: 'usr_supplier_1',
      supplier_company: 'PackagePro Domestic',
      supplier_wallet: '0x2222222222222222222222222222222222222222',
      product_spec: 'Corrugated retail counter display stands with high-gloss finish header',
      ordered_units: 5000,
      ordered_batches: 25,
      contract_value_meth: 50.0,
      coverage_rate_bps: 2000,
      required_collateral_meth: 10.0,
      locked_collateral_meth: 0,
      deadline: '2026-11-30T00:00:00Z',
      delivered_units: 0,
      delivered_batches: 0,
      warehouse_receipt_notes: null,
      evidence_hash: null,
      verified_eligible_loss_meth: null,
      verifier_decision: 'PENDING',
      verifier_notes: null,
      payout_meth: 0,
      refunded_collateral_meth: 0,
      commitment_nft_id: 2,
      recovery_nft_id: null,
      recovery_nft_holder: null,
      status: 'SUPPLIER_ACCEPTED',
      tx_hashes_json: JSON.stringify({
        commitmentTx: '0x8891ac442b07e5f187a2745e454b51c8901b0a88ef4d7a9b09c85f7a142011aa'
      }),
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: now
    },
    {
      id: 'PO-2026-003',
      buyer_id: 'usr_buyer_1',
      buyer_company: 'BrightBox Consumer Goods',
      buyer_wallet: '0x1111111111111111111111111111111111111111',
      supplier_id: 'usr_supplier_1',
      supplier_company: 'PackagePro Domestic',
      supplier_wallet: '0x2222222222222222222222222222222222222222',
      product_spec: 'Eco-friendly biodegradable Kraft padded mailers (250x350mm)',
      ordered_units: 20000,
      ordered_batches: 100,
      contract_value_meth: 120.0,
      coverage_rate_bps: 2000,
      required_collateral_meth: 24.0,
      locked_collateral_meth: 0,
      deadline: '2026-09-01T00:00:00Z',
      delivered_units: 16000,
      delivered_batches: 80,
      warehouse_receipt_notes: '16,000 units accepted. 4,000 units missing at deadline. Verifier attested 24.0 mETH loss.',
      evidence_hash: '0x77fa2b919e3d7f6b5a4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e1122',
      verified_eligible_loss_meth: 24.0,
      verifier_decision: 'APPROVED',
      verifier_notes: 'Eligible loss attested at 24.0 mETH (4,000 units shortfall evaluated at contract unit price).',
      payout_meth: 4.8,
      refunded_collateral_meth: 19.2,
      commitment_nft_id: 3,
      recovery_nft_id: 100,
      recovery_nft_holder: '0x8888888888888888888888888888888888888888',
      status: 'FACTORED',
      tx_hashes_json: JSON.stringify({
        commitmentTx: '0x55aa3bc8945a0de78921cf02a819bca4507b91d7e23401fa91bb680de831ffff',
        fundingTx: '0x66bb3bc8945a0de78921cf02a819bca4507b91d7e23401fa91bb680de831eeee',
        claimTx: '0x77cc3bc8945a0de78921cf02a819bca4507b91d7e23401fa91bb680de831dddd',
        verifierTx: '0x88dd3bc8945a0de78921cf02a819bca4507b91d7e23401fa91bb680de831cccc',
        settlementTx: '0x99ee3bc8945a0de78921cf02a819bca4507b91d7e23401fa91bb680de831bbbb',
        factoringTx: '0x00ff3bc8945a0de78921cf02a819bca4507b91d7e23401fa91bb680de831aaaa'
      }),
      created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 20).toISOString()
    }
  ];

  for (const po of pos) {
    db.insertPurchaseOrder(po);
  }

  // 3. Seed Initial Audit Logs for PO-2026-001
  const auditLogs: AuditLogRecord[] = [
    {
      id: 'aud_001',
      po_id: 'PO-2026-001',
      actor_role: 'SUPPLIER',
      stage: 'EXECUTE',
      action_type: 'REGISTER_COMMITMENT',
      tx_hash: '0x3a8f9c112b07e5f187a2745e454b51c8901b0a88ef4d7a9b09c85f7a1420791e',
      status: 'ALLOWED',
      summary: 'PO-2026-001 registered on SupplyRightNFT (#1) on Ethereum Sepolia.',
      timestamp: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: 'aud_002',
      po_id: 'PO-2026-001',
      actor_role: 'PROVIDER',
      stage: 'EXECUTE',
      action_type: 'FUND_POLICY',
      tx_hash: '0x7e1a3bc8945a0de78921cf02a819bca4507b91d7e23401fa91bb680de831ac12',
      status: 'ALLOWED',
      summary: 'Locked 20.0 mETH collateral in ProtectionVault.sol (20% coverage rate).',
      timestamp: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'aud_003',
      po_id: 'PO-2026-001',
      actor_role: 'BUYER',
      stage: 'ASSESS',
      action_type: 'CONFIRM_RECEIPT',
      tx_hash: null,
      status: 'INFO',
      summary: 'Warehouse dock logged delivery intake: 2,000 / 10,000 units received (80% shortfall).',
      timestamp: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: 'aud_004',
      po_id: 'PO-2026-001',
      actor_role: 'BUYER',
      stage: 'EXECUTE',
      action_type: 'SUBMIT_CLAIM',
      tx_hash: '0x4f2b8a1c9e3d7f6b5a4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a',
      status: 'ALLOWED',
      summary: 'Shortfall claim submitted to ClaimManager.sol with warehouse evidence hash.',
      timestamp: new Date(Date.now() - 86400000 * 1 + 3600000).toISOString()
    }
  ];

  for (const log of auditLogs) {
    db.insertAuditLog(log);
  }

  // 4. Seed Initial Welcome Chat Messages for PO-2026-001
  const messages: ChatMessageRecord[] = [
    {
      id: 'msg_001',
      po_id: 'PO-2026-001',
      sender_role: 'AI_COPILOT',
      sender_name: 'SupplyRight Financial Copilot',
      content: 'Welcome! I am monitoring Purchase Order **PO-2026-001** (BrightBox Consumer Goods ↔ PackagePro Domestic).\n\n• **Ordered**: 10,000 boxes (50 batches) | Value: 100.0 mETH\n• **Delivered**: 2,000 boxes (10 batches)\n• **Shortfall**: 8,000 boxes (80.0% unfulfilled)\n• **Protection Vault**: 20.0 mETH collateral locked\n\nThe claim is currently awaiting **Independent Verifier Attestation** (SGS). How can I assist you?',
      suggested_actions_json: JSON.stringify([
        { label: 'Run Risk Assessment', action: 'ASSESS_RISK' },
        { label: 'Check Missing Evidence', action: 'CHECK_EVIDENCE' },
        { label: 'Test Red-Team Attack', action: 'TEST_ATTACK' }
      ]),
      timestamp: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  for (const msg of messages) {
    db.insertChatMessage(msg);
  }
}
