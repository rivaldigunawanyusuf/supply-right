import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { StateManager } from '../blockchain/StateManager.js';
import { SupplyRightAgent } from '../agent/SupplyRightAgent.js';
import { PolicyEngine } from '../policy/PolicyEngine.js';
import { IsolatedSigner } from '../signer/IsolatedSigner.js';
import { PolicyConfig, ProposedAction } from '../policy/types.js';
import { AppDatabase } from '../db/database.js';
import {
  generateToken,
  authMiddleware,
  requireAuth,
  requireRole,
  AuthenticatedRequest
} from './auth.js';
import { CopilotEngine } from '../agent/CopilotEngine.js';
import { SecurityLabRunner } from './securityLab.js';

export function createServer(options?: {
  agentPrivateKey?: string;
  rpcUrl?: string;
  db?: AppDatabase;
}) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Database initialization
  const db = options?.db || new AppDatabase();

  // SSE clients
  const sseClients: Response[] = [];

  const broadcastEvent = (type: string, data: any) => {
    const payload = `data: ${JSON.stringify({ type, data, timestamp: Date.now() })}\n\n`;
    sseClients.forEach(res => {
      try {
        res.write(payload);
      } catch {
        // Ignore closed client
      }
    });
  };

  // 1. Initialize Signer
  const signer = new IsolatedSigner(options?.agentPrivateKey, options?.rpcUrl);
  const agentAddress = signer.getAddress();

  // 2. Initialize StateManager with SQLite DB
  const stateManager = new StateManager(agentAddress, db);
  const initialState = stateManager.getState();

  // 3. Initialize Policy Engine
  const policyConfig: PolicyConfig = {
    allowedChainIds: [11155111, 31337],
    allowedContracts: {
      mockETH: initialState.contracts.mockETH,
      supplyRightNFT: initialState.contracts.supplyRightNFT,
      protectionVault: initialState.contracts.protectionVault,
      claimManager: initialState.contracts.claimManager,
      recoveryClaimNFT: initialState.contracts.recoveryClaimNFT
    },
    allowedFunctions: [
      'registerCommitment',
      'fundPolicy',
      'submitClaim',
      'verifyClaim',
      'settleWithPayout'
    ],
    rolePermissions: {
      registrar: {
        address: initialState.parties.registrar.address,
        allowedActions: ['REGISTER_COMMITMENT']
      },
      provider: {
        address: initialState.parties.provider.address,
        allowedActions: ['FUND_POLICY']
      },
      verifier: {
        address: initialState.parties.verifier.address,
        allowedActions: ['VERIFY_CLAIM']
      },
      buyer: {
        address: initialState.parties.buyer.address,
        allowedActions: ['SUBMIT_CLAIM', 'SETTLE_PAYOUT']
      },
      agent: {
        address: agentAddress,
        allowedActions: ['SUBMIT_CLAIM', 'SETTLE_PAYOUT']
      }
    },
    maxPayoutWei: BigInt('20000000000000000000'), // 20 mETH cap
    maxCoverageRateBps: 2000 // 20%
  };

  const policyEngine = new PolicyEngine(policyConfig);

  // 4. Initialize Agent & Copilot & Security Lab
  const agent = new SupplyRightAgent(policyEngine, signer);
  const copilot = new CopilotEngine(db);
  const securityLab = new SecurityLabRunner(policyEngine, signer, agent);

  // Apply auth middleware to all requests (extracts Bearer token if present)
  app.use(authMiddleware);

  // ==========================================
  // AUTHENTICATION & PERSONA MANAGEMENT
  // ==========================================

  // Register new user
  app.post('/api/auth/register', (req: Request, res: Response) => {
    try {
      const { name, companyName, email, password, role, walletAddress } = req.body;
      if (!name || !companyName || !email || !password || !role) {
        res.status(400).json({ error: 'Missing required registration fields' });
        return;
      }

      const existing = db.getUserByEmail(email);
      if (existing) {
        res.status(409).json({ error: 'An account with this email already exists' });
        return;
      }

      const passwordHash = bcrypt.hashSync(password, 10);
      const id = `usr_${Date.now()}`;
      const wallet = walletAddress || `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

      const user = {
        id,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        name,
        company_name: companyName,
        role: role.toUpperCase(),
        wallet_address: wallet,
        created_at: new Date().toISOString()
      };

      db.insertUser(user as any);
      const token = generateToken(user as any);

      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          companyName: user.company_name,
          role: user.role,
          walletAddress: user.wallet_address
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Login (supports standard email/password or 1-Click personaRole)
  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { email, password, personaRole } = req.body;

      let user;
      if (personaRole) {
        user = db.getUserByRole(personaRole);
        if (!user) {
          res.status(404).json({ error: `Demo user for role ${personaRole} not found` });
          return;
        }
      } else {
        if (!email || !password) {
          res.status(400).json({ error: 'Email and password required' });
          return;
        }
        user = db.getUserByEmail(email);
        if (!user || !bcrypt.compareSync(password, user.password_hash)) {
          res.status(401).json({ error: 'Invalid email or password' });
          return;
        }
      }

      const token = generateToken(user);
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          companyName: user.company_name,
          role: user.role,
          walletAddress: user.wallet_address
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get all demo personas for 1-click switcher
  app.get('/api/auth/personas', (_req: Request, res: Response) => {
    const users = db.getAllUsers().map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      companyName: u.company_name,
      role: u.role,
      walletAddress: u.wallet_address
    }));
    res.json(users);
  });

  // Get current user profile
  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    res.json({ user: req.user });
  });

  // ==========================================
  // MULTI-PO B2B WORKFLOW ENDPOINTS
  // ==========================================

  // Get all orders + global system telemetry
  app.get('/api/orders', (_req: Request, res: Response) => {
    const orders = stateManager.getAllOrders();
    const metrics = stateManager.getSystemMetrics();
    res.json({ orders, metrics });
  });

  // Get specific PO detail + audit logs + chat messages
  app.get('/api/orders/:poId', (req: Request, res: Response) => {
    const po = stateManager.getOrder(req.params.poId);
    if (!po) {
      res.status(404).json({ error: `Purchase Order ${req.params.poId} not found` });
      return;
    }
    const auditLogs = db.getAuditLogs(po.id);
    const chatMessages = db.getChatMessages(po.id);
    res.json({ order: po, auditLogs, chatMessages });
  });

  // Create new PO (Buyer)
  app.post('/api/orders', (req: Request, res: Response) => {
    try {
      const {
        buyerId,
        buyerCompany,
        buyerWallet,
        supplierCompany,
        productSpec,
        orderedUnits,
        orderedBatches,
        contractValueMeth,
        coverageRateBps,
        deadline
      } = req.body;

      if (!productSpec || !orderedUnits || !contractValueMeth || !deadline) {
        res.status(400).json({ error: 'Missing required PO fields' });
        return;
      }

      const po = stateManager.createOrder({
        buyerId: buyerId || 'usr_buyer_1',
        buyerCompany: buyerCompany || 'BrightBox Consumer Goods',
        buyerWallet: buyerWallet || '0x1111111111111111111111111111111111111111',
        supplierCompany: supplierCompany || 'PackagePro Domestic',
        productSpec,
        orderedUnits: Number(orderedUnits),
        orderedBatches: Number(orderedBatches) || 10,
        contractValueMeth: Number(contractValueMeth),
        coverageRateBps: Number(coverageRateBps) || 2000,
        deadline
      });

      db.insertAuditLog({
        id: `aud_${Date.now()}`,
        po_id: po.id,
        actor_role: 'BUYER',
        stage: 'READ',
        action_type: 'CREATE_PO',
        status: 'ALLOWED',
        summary: `Created purchase order ${po.id} for ${po.ordered_units} units (${po.contract_value_meth} mETH).`,
        timestamp: new Date().toISOString()
      });

      broadcastEvent('ORDER_CREATED', { order: po });
      res.status(201).json(po);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Supplier Accepts PO and registers SupplyRightNFT commitment on-chain
  app.post('/api/orders/:poId/supplier-accept', (req: Request, res: Response) => {
    try {
      const po = stateManager.supplierAcceptOrder(req.params.poId);

      db.insertAuditLog({
        id: `aud_${Date.now()}`,
        po_id: po.id,
        actor_role: 'SUPPLIER',
        stage: 'EXECUTE',
        action_type: 'REGISTER_COMMITMENT',
        tx_hash: JSON.parse(po.tx_hashes_json).commitmentTx,
        status: 'ALLOWED',
        summary: `Supplier accepted terms. Minted SupplyRightNFT #${po.commitment_nft_id} on Sepolia.`,
        timestamp: new Date().toISOString()
      });

      broadcastEvent('SUPPLIER_ACCEPTED', { order: po });
      res.json(po);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Protection Provider Funds Collateral Vault
  app.post('/api/orders/:poId/fund-vault', (req: Request, res: Response) => {
    try {
      const { collateralMeth } = req.body;
      const po = stateManager.getOrder(req.params.poId);
      if (!po) {
        res.status(404).json({ error: 'PO not found' });
        return;
      }

      const amount = collateralMeth !== undefined ? Number(collateralMeth) : po.required_collateral_meth;
      const updated = stateManager.fundVault(po.id, amount);

      db.insertAuditLog({
        id: `aud_${Date.now()}`,
        po_id: po.id,
        actor_role: 'PROVIDER',
        stage: 'EXECUTE',
        action_type: 'FUND_POLICY',
        tx_hash: JSON.parse(updated.tx_hashes_json).fundingTx,
        status: 'ALLOWED',
        summary: `Sentinel Vault locked ${amount} mETH collateral in ProtectionVault.sol.`,
        timestamp: new Date().toISOString()
      });

      broadcastEvent('VAULT_FUNDED', { order: updated });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Supplier Logs Delivery Batch (includes prompt injection sanitizer)
  app.post('/api/orders/:poId/log-shipment', (req: Request, res: Response) => {
    try {
      const { units, batches, invoiceText } = req.body;
      const po = stateManager.getOrder(req.params.poId);
      if (!po) {
        res.status(404).json({ error: 'PO not found' });
        return;
      }

      // Run adversarial prompt injection check on invoice text
      let sanitizedNotes = invoiceText;
      if (invoiceText) {
        const scan = copilot.scanDocument(invoiceText);
        if (!scan.clean) {
          db.insertAuditLog({
            id: `sec_${Date.now()}`,
            po_id: po.id,
            actor_role: 'SUPPLIER',
            stage: 'SECURITY_BLOCK',
            action_type: 'PROMPT_INJECTION_INVOICE_INTERCEPT',
            status: 'DENIED',
            summary: `Interception: Stripped malicious directives from supplier invoice text (${scan.threatsDetected.join(', ')}).`,
            timestamp: new Date().toISOString()
          });
        }
        sanitizedNotes = scan.sanitizedText;
      }

      const updated = stateManager.logShipment(po.id, Number(units), Number(batches) || 1, sanitizedNotes);

      db.insertAuditLog({
        id: `aud_${Date.now()}`,
        po_id: po.id,
        actor_role: 'SUPPLIER',
        stage: 'READ',
        action_type: 'LOG_SHIPMENT',
        status: 'INFO',
        summary: `Supplier dispatched batch: ${units} units logged.`,
        timestamp: new Date().toISOString()
      });

      broadcastEvent('SHIPMENT_LOGGED', { order: updated });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Buyer Confirms Actual Warehouse Receipt
  app.post('/api/orders/:poId/confirm-receipt', (req: Request, res: Response) => {
    try {
      const { deliveredUnits, receiptNotes } = req.body;
      const po = stateManager.getOrder(req.params.poId);
      if (!po) {
        res.status(404).json({ error: 'PO not found' });
        return;
      }

      const units = Number(deliveredUnits);
      const updated = stateManager.confirmReceipt(po.id, units, receiptNotes);

      db.insertAuditLog({
        id: `aud_${Date.now()}`,
        po_id: po.id,
        actor_role: 'BUYER',
        stage: 'ASSESS',
        action_type: 'CONFIRM_RECEIPT',
        status: 'INFO',
        summary: `Warehouse intake confirmed: ${units} / ${po.ordered_units} units received (${po.ordered_units - units} shortfall).`,
        timestamp: new Date().toISOString()
      });

      broadcastEvent('RECEIPT_CONFIRMED', { order: updated });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Independent Verifier Attestation
  app.post('/api/orders/:poId/verify', (req: Request, res: Response) => {
    try {
      const { approved, eligibleLossMeth, notes } = req.body;
      const po = stateManager.getOrder(req.params.poId);
      if (!po) {
        res.status(404).json({ error: 'PO not found' });
        return;
      }

      const loss = Number(eligibleLossMeth) || 80.0;
      const isApproved = Boolean(approved);
      const updated = stateManager.verifyClaim(po.id, isApproved, loss, notes);

      db.insertAuditLog({
        id: `aud_${Date.now()}`,
        po_id: po.id,
        actor_role: 'VERIFIER',
        stage: 'ASSESS',
        action_type: 'VERIFY_CLAIM',
        status: isApproved ? 'ALLOWED' : 'DENIED',
        summary: isApproved
          ? `SGS Verifier attested eligible shortfall loss of ${loss} mETH on-chain.`
          : 'SGS Verifier rejected shortfall claim.',
        timestamp: new Date().toISOString()
      });

      broadcastEvent('CLAIM_VERIFIED', { order: updated });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Settle Order (Autonomous Agent / Buyer)
  app.post('/api/orders/:poId/settle', async (req: Request, res: Response) => {
    try {
      const po = stateManager.getOrder(req.params.poId);
      if (!po) {
        res.status(404).json({ error: 'PO not found' });
        return;
      }

      if (po.status !== 'VERIFIER_APPROVED') {
        res.status(400).json({ error: 'Cannot settle: Claim has not been approved by Independent Verifier' });
        return;
      }

      // Formulate proposal and run policy evaluation
      const payoutWei = StateManager.methToWei(po.payout_meth);
      const proposal: ProposedAction = {
        action: 'SETTLE_PAYOUT',
        actor: agentAddress,
        targetContract: initialState.contracts.claimManager,
        targetFunction: 'settleWithPayout',
        chainId: 11155111,
        params: {
          commitmentTokenId: po.commitment_nft_id || 1,
          recipient: po.buyer_wallet,
          payoutAmountWei: payoutWei
        },
        nonce: `nonce-${po.id}-${Date.now()}`,
        timestamp: Date.now(),
        rationale: `Autonomous settlement for ${po.id}`
      };

      const verdict = policyEngine.evaluate(proposal, {
        isPolicyFunded: true,
        availableCollateralWei: BigInt(StateManager.methToWei(po.locked_collateral_meth)),
        claimStatus: 2,
        verifierApproved: true,
        eligibleLossWei: BigInt(StateManager.methToWei(po.verified_eligible_loss_meth || 80)),
        buyerAddress: po.buyer_wallet
      });

      if (!verdict.allowed) {
        res.status(403).json({ error: 'Policy Engine denied settlement proposal', verdict });
        return;
      }

      const execution = await signer.execute(proposal, verdict);
      const updated = stateManager.settleOrder(po.id, execution.txHash);

      db.insertAuditLog({
        id: `aud_${Date.now()}`,
        po_id: po.id,
        actor_role: 'AGENT',
        stage: 'EXECUTE',
        action_type: 'SETTLE_PAYOUT',
        tx_hash: execution.txHash,
        status: 'ALLOWED',
        summary: `Dispatched atomic payout of ${updated.payout_meth} mETH to Buyer, refunded ${updated.refunded_collateral_meth} mETH to Provider, and minted RecoveryClaimNFT #${updated.recovery_nft_id}.`,
        timestamp: new Date().toISOString()
      });

      broadcastEvent('ORDER_SETTLED', { order: updated, execution });
      res.json({ order: updated, execution });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Assign / Factor RecoveryClaimNFT to Factoring Desk (Bonus Challenge)
  app.post('/api/orders/:poId/factor-nft', (req: Request, res: Response) => {
    try {
      const { factorDeskAddress } = req.body;
      const po = stateManager.getOrder(req.params.poId);
      if (!po) {
        res.status(404).json({ error: 'PO not found' });
        return;
      }

      if (po.status !== 'SETTLED') {
        res.status(400).json({ error: 'Can only factor recovery claim NFT on settled orders' });
        return;
      }

      const recipient = factorDeskAddress || '0x8888888888888888888888888888888888888888';
      const updated = stateManager.factorRecoveryNFT(po.id, recipient);

      db.insertAuditLog({
        id: `aud_${Date.now()}`,
        po_id: po.id,
        actor_role: 'BUYER',
        stage: 'EXECUTE',
        action_type: 'TRANSFER_RECOVERY_CLAIM',
        tx_hash: JSON.parse(updated.tx_hashes_json).factoringTx,
        status: 'ALLOWED',
        summary: `Assigned RecoveryClaimNFT #${updated.recovery_nft_id} to Apex Debt Recovery Specialist (${recipient}) for immediate secondary liquidity.`,
        timestamp: new Date().toISOString()
      });

      broadcastEvent('NFT_FACTORED', { order: updated });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // AI WALLET COPILOT & RED-TEAM SECURITY
  // ==========================================

  // Interactive AI Copilot Chat Endpoint
  app.post('/api/agent/chat', async (req: Request, res: Response) => {
    try {
      const { poId, message, userRole, userName } = req.body;
      if (!message) {
        res.status(400).json({ error: 'Message content is required' });
        return;
      }

      const activePoId = poId || 'PO-2026-001';
      const role = userRole || 'BUYER';

      // Save user message in DB
      db.insertChatMessage({
        id: `msg_u_${Date.now()}`,
        po_id: activePoId,
        sender_role: 'USER',
        sender_name: userName || 'User',
        content: message,
        timestamp: new Date().toISOString()
      });

      // Process via Copilot Engine
      const response = await copilot.handleChat({
        poId: activePoId,
        message,
        userRole: role,
        userName
      });

      // Save assistant message in DB
      db.insertChatMessage({
        id: `msg_a_${Date.now()}`,
        po_id: activePoId,
        sender_role: response.senderRole,
        sender_name: response.senderRole === 'SECURITY_FIREWALL' ? 'SupplyRight Security Firewall' : 'SupplyRight AI Copilot',
        content: response.message,
        suggested_actions_json: JSON.stringify(response.suggestedActions),
        security_alert_json: response.securityAlert ? JSON.stringify(response.securityAlert) : null,
        timestamp: new Date().toISOString()
      });

      broadcastEvent('COPILOT_MESSAGE', {
        poId: activePoId,
        userMessage: message,
        copilotResponse: response
      });

      res.json(response);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Document scan & prompt injection sanitizer
  app.post('/api/agent/scan-document', (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      if (!text) {
        res.status(400).json({ error: 'Document text required' });
        return;
      }
      const scanResult = copilot.scanDocument(text);
      res.json(scanResult);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Red-Team Security Lab test-vector runner
  app.post('/api/security/test-vector', async (req: Request, res: Response) => {
    try {
      const { testId } = req.body;
      if (!testId) {
        res.status(400).json({ error: 'testId is required (e.g., TC-01..TC-10)' });
        return;
      }

      const result = await securityLab.runTestVector(testId);

      // Record in audit logs
      db.insertAuditLog({
        id: `sec_test_${Date.now()}`,
        po_id: 'PO-2026-001',
        actor_role: 'JUDGE',
        stage: 'AUDIT',
        action_type: `RUN_${testId.toUpperCase()}`,
        proposal_json: JSON.stringify(result.proposal),
        policy_verdict_json: JSON.stringify(result.verdict),
        status: result.passed ? 'ALLOWED' : 'DENIED',
        summary: `Executed benchmark test ${testId}: ${result.name}. Result: ${result.passed ? 'PASS' : 'FAIL'}.`,
        timestamp: new Date().toISOString()
      });

      broadcastEvent('SECURITY_TEST_COMPLETED', result);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // BACKWARD-COMPATIBLE LEGACY ROUTES
  // ==========================================

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      agentWallet: agentAddress,
      network: 'Ethereum Sepolia (Chain ID 11155111)',
      policyEngine: 'Active (Strict Allowlist)',
      timestamp: Date.now()
    });
  });

  // Full state (defaults to canonical PO-2026-001)
  app.get('/api/state', (req: Request, res: Response) => {
    const poId = (req.query.poId as string) || 'PO-2026-001';
    res.json({
      ...stateManager.getState(poId),
      auditTrail: agent.getAuditTrail()
    });
  });

  // Get PO
  app.get('/api/po/:id', (req: Request, res: Response) => {
    try {
      const state = stateManager.getState(req.params.id);
      res.json(state.purchaseOrder);
    } catch {
      res.status(404).json({ error: 'Purchase Order not found' });
    }
  });

  // Stage 1 & 2: Risk Assessment
  app.post('/api/agent/assess', (req: Request, res: Response) => {
    const poId = req.body?.poId || 'PO-2026-001';
    const state = stateManager.getState(poId);
    broadcastEvent('AGENT_THINKING', { stage: 'READ_ASSESS', message: 'Reading PO commitment terms and warehouse delivery evidence...' });

    const assessment = agent.assessRisk(state.purchaseOrder, state.deliveryEvidence);

    broadcastEvent('ASSESSMENT_COMPLETED', assessment);
    res.json(assessment);
  });

  // Stage 3: Propose Claim
  app.post('/api/agent/propose-claim', (req: Request, res: Response) => {
    const poId = req.body?.poId || 'PO-2026-001';
    const state = stateManager.getState(poId);
    broadcastEvent('AGENT_THINKING', { stage: 'PROPOSE_CLAIM', message: 'Formulating bounded on-chain claim submission proposal...' });

    const proposal = agent.proposeClaimSubmission(
      state.purchaseOrder,
      state.deliveryEvidence,
      state.contracts.claimManager,
      state.commitment.tokenId
    );

    broadcastEvent('PROPOSAL_GENERATED', proposal);
    res.json(proposal);
  });

  // Stage 3: Propose Settlement
  app.post('/api/agent/propose-settlement', (req: Request, res: Response) => {
    const poId = req.body?.poId || 'PO-2026-001';
    const state = stateManager.getState(poId);
    if (state.claim.status !== 'VERIFIER_APPROVED') {
      res.status(400).json({ error: 'Cannot propose settlement: Claim is not verifier-approved' });
      return;
    }

    broadcastEvent('AGENT_THINKING', { stage: 'PROPOSE_SETTLEMENT', message: 'Formulating atomic settlement & Recovery Claim NFT proposal...' });

    const proposal = agent.proposeSettlement(
      state.commitment.tokenId,
      state.parties.buyer.address,
      state.claim.requestedPayoutWei,
      state.contracts.claimManager
    );

    broadcastEvent('PROPOSAL_GENERATED', proposal);
    res.json(proposal);
  });

  // Stage 4: Authorize (Policy Engine)
  app.post('/api/agent/authorize', (req: Request, res: Response) => {
    const action: ProposedAction = req.body;
    const poId = req.body?.poId || 'PO-2026-001';
    const state = stateManager.getState(poId);

    broadcastEvent('POLICY_EVALUATING', { action: action.action, target: action.targetContract });

    const contextState = {
      isPolicyFunded: state.vault.active && !state.vault.settled,
      availableCollateralWei: BigInt(state.vault.collateralWei),
      claimStatus: state.claim.status === 'VERIFIER_APPROVED' ? 2 : (state.claim.status === 'SUBMITTED' ? 1 : 0),
      verifierApproved: state.claim.status === 'VERIFIER_APPROVED',
      eligibleLossWei: BigInt(state.claim.eligibleLossWei || '0'),
      buyerAddress: state.parties.buyer.address
    };

    const verdict = agent.authorizeAction(action, contextState);

    broadcastEvent('POLICY_VERDICT', verdict);
    res.json(verdict);
  });

  // Stage 5 & 6: Execute & Audit
  app.post('/api/agent/execute', async (req: Request, res: Response) => {
    const { action, verdict } = req.body;
    if (!action || !verdict) {
      res.status(400).json({ error: 'Missing action or verdict in execution request' });
      return;
    }

    broadcastEvent('EXECUTION_STARTING', { action: action.action });

    try {
      const result = await agent.executeAuthorizedAction(action, verdict);

      if (result.success) {
        if (action.action === 'SUBMIT_CLAIM') {
          stateManager.recordClaimSubmitted(
            action.params.deliveredQuantity,
            action.params.evidenceHash,
            result.txHash
          );
        } else if (action.action === 'SETTLE_PAYOUT') {
          stateManager.recordSettlement(result.txHash);
        }

        broadcastEvent('EXECUTION_SUCCESS', { result, newState: stateManager.getState() });
      } else {
        broadcastEvent('EXECUTION_FAILED', { error: result.error });
      }

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Independent Verifier Station
  app.post('/api/verifier/decide', (req: Request, res: Response) => {
    const { approved, eligibleLossWei, poId } = req.body;
    const activePoId = poId || 'PO-2026-001';
    const state = stateManager.getState(activePoId);

    if (state.claim.status !== 'SUBMITTED') {
      res.status(400).json({ error: 'No submitted claim awaiting verifier decision' });
      return;
    }

    const lossWei = approved ? (eligibleLossWei || state.protection.eligibleLoss) : '0';
    stateManager.recordVerifierDecision(lossWei, Boolean(approved));

    broadcastEvent('VERIFIER_DECISION', {
      approved: Boolean(approved),
      eligibleLossWei: lossWei,
      newState: stateManager.getState(activePoId)
    });

    res.json({
      success: true,
      decision: approved ? 'APPROVED' : 'REJECTED',
      eligibleLossWei: lossWei,
      state: stateManager.getState(activePoId)
    });
  });

  // Provider Collateral Funding
  app.post('/api/provider/fund', (req: Request, res: Response) => {
    const { collateralWei, poId } = req.body;
    const activePoId = poId || 'PO-2026-001';
    const state = stateManager.getState(activePoId);
    const amount = collateralWei || state.protection.collateral;
    const mockTx = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    stateManager.recordProviderFunding(amount, mockTx);

    broadcastEvent('PROVIDER_FUNDED', {
      collateralWei: amount,
      txHash: mockTx,
      newState: stateManager.getState(activePoId)
    });

    res.json({ success: true, collateralWei: amount, txHash: mockTx });
  });

  // Secondary Claim Right Transfer (ERC-721 Subrogation Assignment)
  app.post('/api/recovery/transfer', (req: Request, res: Response) => {
    const { newRecipient, poId } = req.body;
    const activePoId = poId || 'PO-2026-001';
    const state = stateManager.getState(activePoId);

    if (!state.recoveryNFT || state.claim.status !== 'SETTLED') {
      res.status(400).json({ error: 'Cannot transfer: Recovery Claim NFT has not been minted or settled' });
      return;
    }

    const recipient = newRecipient || '0x8888888888888888888888888888888888888888';
    const transferTx = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    stateManager.recordRecoveryTransfer(recipient, transferTx);

    agent.recordCustomAudit({
      stage: 'EXECUTE',
      actionType: 'TRANSFER_RECOVERY_CLAIM',
      actor: state.parties.buyer.address,
      targetContract: state.contracts.recoveryClaimNFT,
      txHash: transferTx,
      status: 'CONFIRMED',
      rationale: `Subrogation claim right NFT #${state.recoveryNFT.tokenId} transferred to debt specialist ${recipient}`
    });

    broadcastEvent('RECOVERY_TRANSFERRED', {
      tokenId: state.recoveryNFT.tokenId,
      newRecipient: recipient,
      txHash: transferTx,
      newState: {
        ...stateManager.getState(activePoId),
        auditTrail: agent.getAuditTrail()
      }
    });

    res.json({
      success: true,
      message: `Recovery Claim NFT #${state.recoveryNFT.tokenId} assigned to debt specialist ${recipient}`,
      txHash: transferTx,
      state: stateManager.getState(activePoId)
    });
  });

  // Audit trail
  app.get('/api/audit', (_req: Request, res: Response) => {
    res.json(agent.getAuditTrail());
  });

  // Reset demo fixture
  app.post('/api/reset', (_req: Request, res: Response) => {
    stateManager.reset(agentAddress);
    agent.resetAuditTrail();
    broadcastEvent('SYSTEM_RESET', stateManager.getState());
    res.json({ success: true, message: 'System state reset to clean seed fixture' });
  });

  // Real-time SSE Stream
  app.get('/api/events/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    sseClients.push(res);
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'SSE connection established', agent: agentAddress })}\n\n`);

    req.on('close', () => {
      const idx = sseClients.indexOf(res);
      if (idx !== -1) sseClients.splice(idx, 1);
    });
  });

  return { app, stateManager, agent, policyEngine, signer, db };
}
