import { ethers } from 'ethers';
import { createRequire } from 'module';
import { AppDatabase } from '../db/database.js';
import { seedDatabase } from '../db/seed.js';
import { PurchaseOrderRecord } from '../db/types.js';

const require = createRequire(import.meta.url);
const seedData = require('../../../fixtures/seed.json');

export interface SystemState {
  purchaseOrder: typeof seedData.purchaseOrder;
  deliveryEvidence: typeof seedData.deliveryEvidence;
  protection: typeof seedData.protection;
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
  disclaimer: string;
}

export class StateManager {
  private db: AppDatabase;
  private agentAddress: string;

  constructor(agentAddress: string, db?: AppDatabase) {
    this.agentAddress = agentAddress;
    this.db = db || new AppDatabase();
    seedDatabase(this.db);
  }

  public getDatabase(): AppDatabase {
    return this.db;
  }

  // Convert mETH (float) to Wei (string)
  public static methToWei(meth: number): string {
    // 1 mETH = 10^15 Wei (100 mETH = 0.1 ETH = 10^17 Wei)
    // In seedData: 100 mETH is represented as 100 * 10^18 in original seed.json or 10^17
    // Let's check seedData: "100000000000000000000" = 100 * 10^18.
    // So 1 mETH display unit = 10^18 Wei in current test suite.
    try {
      return ethers.parseUnits(meth.toFixed(6), 18).toString();
    } catch {
      return BigInt(Math.floor(meth * 1e6) * 1e12).toString();
    }
  }

  public static weiToMeth(wei: string): number {
    try {
      return parseFloat(ethers.formatUnits(wei, 18));
    } catch {
      return 0;
    }
  }

  /**
   * Constructs the legacy SystemState structure for a specific PO (defaulting to PO-2026-001)
   */
  public getState(poId = 'PO-2026-001'): SystemState {
    const po = this.db.getPurchaseOrderById(poId) || this.db.getPurchaseOrderById('PO-2026-001');
    if (!po) {
      throw new Error(`PO not found in database: ${poId}`);
    }

    const txHashes = JSON.parse(po.tx_hashes_json || '{}');
    const contractValueWei = StateManager.methToWei(po.contract_value_meth);
    const lockedCollateralWei = StateManager.methToWei(po.locked_collateral_meth);
    const eligibleLossWei = po.verified_eligible_loss_meth ? StateManager.methToWei(po.verified_eligible_loss_meth) : '0';
    const payoutWei = po.payout_meth ? StateManager.methToWei(po.payout_meth) : '0';

    const shortfallUnits = Math.max(0, po.ordered_units - po.delivered_units);
    const shortfallBatches = Math.max(0, po.ordered_batches - po.delivered_batches);
    const shortfallPercentage = po.ordered_units > 0 ? Math.round((shortfallUnits / po.ordered_units) * 100) : 0;

    let claimStatus: 'NONE' | 'SUBMITTED' | 'VERIFIER_APPROVED' | 'VERIFIER_REJECTED' | 'SETTLED' = 'NONE';
    if (po.status === 'SETTLED' || po.status === 'FACTORED') {
      claimStatus = 'SETTLED';
    } else if (po.status === 'VERIFIER_APPROVED') {
      claimStatus = 'VERIFIER_APPROVED';
    } else if (po.status === 'VERIFIER_REJECTED') {
      claimStatus = 'VERIFIER_REJECTED';
    } else if (po.status === 'CLAIM_SUBMITTED') {
      claimStatus = 'SUBMITTED';
    }

    const buyerAddr = po.buyer_wallet || '0x1111111111111111111111111111111111111111';
    const supplierAddr = po.supplier_wallet || '0x2222222222222222222222222222222222222222';
    const verifierAddr = '0x3333333333333333333333333333333333333333';
    const providerAddr = '0x4444444444444444444444444444444444444444';

    return {
      purchaseOrder: {
        id: po.id,
        buyer: {
          name: po.buyer_company,
          wallet: buyerAddr,
          role: 'buyer'
        },
        supplier: {
          name: po.supplier_company,
          contact: `ops@${po.supplier_company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          role: 'supplier'
        },
        product: {
          description: po.product_spec,
          type: 'B2B Procurement Goods',
          specifications: po.product_spec
        },
        quantity: {
          ordered: po.ordered_units,
          batches: po.ordered_batches,
          perBatch: po.ordered_batches > 0 ? Math.round(po.ordered_units / po.ordered_batches) : 0,
          unit: 'units'
        },
        deadline: po.deadline,
        contractDate: po.created_at,
        totalValue: contractValueWei,
        totalValueDisplay: `${po.contract_value_meth} mETH`
      },
      deliveryEvidence: {
        deliveredBatches: po.delivered_batches,
        deliveredQuantity: po.delivered_units,
        deliveryDate: po.updated_at,
        shortfallBatches: shortfallBatches,
        shortfallQuantity: shortfallUnits,
        shortfallPercentage: shortfallPercentage,
        evidenceHash: po.evidence_hash || '0x3b89ef7c014798e1fae29c54e26a27e7d82f7c04fa27c6543bca470c1e8d91a2',
        evidenceNotes: po.warehouse_receipt_notes || 'Pending delivery receipt',
        inspectionDate: po.updated_at
      },
      protection: {
        eligibleLoss: eligibleLossWei,
        eligibleLossDisplay: `${po.verified_eligible_loss_meth || 0} mETH`,
        coverageRate: Math.round(po.coverage_rate_bps / 100),
        collateral: lockedCollateralWei,
        collateralDisplay: `${po.locked_collateral_meth} mETH`,
        expectedPayout: payoutWei,
        expectedPayoutDisplay: `${po.payout_meth} mETH`,
        remainingCollateral: StateManager.methToWei(po.refunded_collateral_meth),
        remainingCollateralDisplay: `${po.refunded_collateral_meth} mETH`
      },
      parties: {
        registrar: { address: supplierAddr, role: 'registrar' },
        provider: { address: providerAddr, role: 'provider' },
        verifier: { address: verifierAddr, role: 'verifier' },
        buyer: { address: buyerAddr, role: 'buyer' },
        agent: { address: this.agentAddress, role: 'agent' }
      },
      contracts: {
        mockETH: '0x9999000100000000000000000000000000000001',
        supplyRightNFT: '0x9999000200000000000000000000000000000002',
        protectionVault: '0x9999000300000000000000000000000000000003',
        claimManager: '0x9999000400000000000000000000000000000004',
        recoveryClaimNFT: '0x9999000500000000000000000000000000000005'
      },
      chain: {
        name: 'Ethereum Sepolia',
        chainId: 11155111,
        explorerUrl: 'https://sepolia.etherscan.io'
      },
      commitment: {
        tokenId: po.commitment_nft_id || 1,
        poId: po.id,
        buyer: buyerAddr,
        totalValueWei: contractValueWei,
        quantity: po.ordered_units,
        deadline: Math.floor(new Date(po.deadline).getTime() / 1000),
        registeredAt: Math.floor(new Date(po.created_at).getTime() / 1000),
        active: po.status !== 'DRAFT',
        txHash: txHashes.commitmentTx || '0x3a8f9c112b07e5f187a2745e454b51c8901b0a88ef4d7a9b09c85f7a1420791e'
      },
      vault: {
        collateralWei: lockedCollateralWei,
        coverageRateBps: po.coverage_rate_bps,
        maxPayoutWei: lockedCollateralWei,
        fundedAt: Math.floor(new Date(po.created_at).getTime() / 1000),
        active: po.locked_collateral_meth > 0 && po.status !== 'SETTLED' && po.status !== 'FACTORED',
        settled: po.status === 'SETTLED' || po.status === 'FACTORED',
        txHash: txHashes.fundingTx || '0x7e1a3bc8945a0de78921cf02a819bca4507b91d7e23401fa91bb680de831ac12'
      },
      claim: {
        status: claimStatus,
        deliveredQuantity: po.delivered_units,
        eligibleLossWei: eligibleLossWei,
        requestedPayoutWei: payoutWei || (po.verified_eligible_loss_meth ? StateManager.methToWei(Math.min(po.verified_eligible_loss_meth * (po.coverage_rate_bps / 10000), po.locked_collateral_meth)) : '0'),
        evidenceHash: po.evidence_hash || '0x3b89ef7c014798e1fae29c54e26a27e7d82f7c04fa27c6543bca470c1e8d91a2',
        submittedAt: Math.floor(new Date(po.updated_at).getTime() / 1000),
        settledAt: (po.status === 'SETTLED' || po.status === 'FACTORED') ? Math.floor(Date.now() / 1000) : 0,
        recoveryTokenId: po.recovery_nft_id || (po.status === 'SETTLED' || po.status === 'FACTORED' ? 101 : 0),
        txHash: txHashes.claimTx || '',
        settlementTxHash: txHashes.settlementTx || ''
      },
      recoveryNFT: (po.status === 'SETTLED' || po.status === 'FACTORED') ? {
        tokenId: po.recovery_nft_id || 101,
        recipient: po.recovery_nft_holder || buyerAddr,
        payoutAmountWei: payoutWei,
        eligibleLossWei: eligibleLossWei,
        mintedAt: Math.floor(Date.now() / 1000),
        txHash: txHashes.settlementTx || '0x99ee3bc8945a0de78921cf02a819bca4507b91d7e23401fa91bb680de831bbbb'
      } : null,
      disclaimer: 'Demonstration environment on Ethereum Sepolia testnet with mock mETH (no real monetary value). All wallet authorizations are governed by independent policy allowlists.'
    };
  }

  // --- Multi-PO Operations ---
  public getAllOrders(): PurchaseOrderRecord[] {
    return this.db.getAllPurchaseOrders();
  }

  public getOrder(poId: string): PurchaseOrderRecord | undefined {
    return this.db.getPurchaseOrderById(poId);
  }

  public createOrder(data: {
    buyerId: string;
    buyerCompany: string;
    buyerWallet: string;
    supplierId?: string;
    supplierCompany: string;
    supplierWallet?: string;
    productSpec: string;
    orderedUnits: number;
    orderedBatches: number;
    contractValueMeth: number;
    coverageRateBps?: number;
    deadline: string;
  }): PurchaseOrderRecord {
    const poCount = this.db.getAllPurchaseOrders().length + 1;
    const id = `PO-2026-${String(poCount).padStart(3, '0')}`;
    const coverageRateBps = data.coverageRateBps || 2000; // 20%
    const requiredCollateral = Number((data.contractValueMeth * (coverageRateBps / 10000)).toFixed(4));

    const po: PurchaseOrderRecord = {
      id,
      buyer_id: data.buyerId,
      buyer_company: data.buyerCompany,
      buyer_wallet: data.buyerWallet,
      supplier_id: data.supplierId || 'usr_supplier_1',
      supplier_company: data.supplierCompany,
      supplier_wallet: data.supplierWallet || '0x2222222222222222222222222222222222222222',
      product_spec: data.productSpec,
      ordered_units: data.orderedUnits,
      ordered_batches: data.orderedBatches,
      contract_value_meth: data.contractValueMeth,
      coverage_rate_bps: coverageRateBps,
      required_collateral_meth: requiredCollateral,
      locked_collateral_meth: 0,
      deadline: data.deadline,
      delivered_units: 0,
      delivered_batches: 0,
      warehouse_receipt_notes: null,
      evidence_hash: null,
      verified_eligible_loss_meth: null,
      verifier_decision: 'PENDING',
      verifier_notes: null,
      payout_meth: 0,
      refunded_collateral_meth: 0,
      commitment_nft_id: null,
      recovery_nft_id: null,
      recovery_nft_holder: null,
      status: 'DRAFT',
      tx_hashes_json: '{}',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.db.insertPurchaseOrder(po);
    return po;
  }

  public supplierAcceptOrder(poId: string, txHash?: string): PurchaseOrderRecord {
    const po = this.getOrder(poId);
    if (!po) throw new Error(`PO not found: ${poId}`);

    const txs = JSON.parse(po.tx_hashes_json || '{}');
    const commitmentTx = txHash || '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    txs.commitmentTx = commitmentTx;

    const commitmentNftId = Math.floor(Math.random() * 900) + 10;
    this.db.updatePurchaseOrder(poId, {
      status: 'SUPPLIER_ACCEPTED',
      commitment_nft_id: commitmentNftId,
      tx_hashes_json: JSON.stringify(txs)
    });

    return this.getOrder(poId)!;
  }

  public fundVault(poId: string, collateralMeth: number, txHash?: string): PurchaseOrderRecord {
    const po = this.getOrder(poId);
    if (!po) throw new Error(`PO not found: ${poId}`);

    const txs = JSON.parse(po.tx_hashes_json || '{}');
    const fundingTx = txHash || '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    txs.fundingTx = fundingTx;

    this.db.updatePurchaseOrder(poId, {
      locked_collateral_meth: collateralMeth,
      status: 'VAULT_FUNDED',
      tx_hashes_json: JSON.stringify(txs)
    });

    return this.getOrder(poId)!;
  }

  public logShipment(poId: string, units: number, batches: number, notes?: string): PurchaseOrderRecord {
    const po = this.getOrder(poId);
    if (!po) throw new Error(`PO not found: ${poId}`);

    this.db.updatePurchaseOrder(poId, {
      delivered_units: units,
      delivered_batches: batches,
      warehouse_receipt_notes: notes || `Shipment logged: ${units} units (${batches} batches) dispatched.`,
      status: 'DELIVERY_LOGGED'
    });

    return this.getOrder(poId)!;
  }

  public confirmReceipt(poId: string, units: number, notes?: string, hash?: string): PurchaseOrderRecord {
    const po = this.getOrder(poId);
    if (!po) throw new Error(`PO not found: ${poId}`);

    const evidenceHash = hash || '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    this.db.updatePurchaseOrder(poId, {
      delivered_units: units,
      evidence_hash: evidenceHash,
      warehouse_receipt_notes: notes || `Receipt confirmed at dock: ${units} units accepted.`,
      status: 'CLAIM_SUBMITTED'
    });

    return this.getOrder(poId)!;
  }

  public verifyClaim(poId: string, approved: boolean, lossMeth: number, notes?: string, txHash?: string): PurchaseOrderRecord {
    const po = this.getOrder(poId);
    if (!po) throw new Error(`PO not found: ${poId}`);

    const txs = JSON.parse(po.tx_hashes_json || '{}');
    if (txHash) txs.verifierTx = txHash;

    const verifiedLoss = approved ? lossMeth : 0;
    // Calculate deterministic payout: min(Loss * coverageRate, Collateral)
    const coverageRate = po.coverage_rate_bps / 10000;
    const calculatedPayout = approved ? Math.min(verifiedLoss * coverageRate, po.locked_collateral_meth) : 0;

    this.db.updatePurchaseOrder(poId, {
      verified_eligible_loss_meth: verifiedLoss,
      payout_meth: calculatedPayout,
      verifier_decision: approved ? 'APPROVED' : 'REJECTED',
      verifier_notes: notes || (approved ? `Independent Verifier attested eligible shortfall loss of ${verifiedLoss} mETH.` : 'Claim rejected due to non-qualifying shortfall or lack of evidence.'),
      status: approved ? 'VERIFIER_APPROVED' : 'VERIFIER_REJECTED',
      tx_hashes_json: JSON.stringify(txs)
    });

    return this.getOrder(poId)!;
  }

  public settleOrder(poId: string, txHash?: string): PurchaseOrderRecord {
    const po = this.getOrder(poId);
    if (!po) throw new Error(`PO not found: ${poId}`);

    const txs = JSON.parse(po.tx_hashes_json || '{}');
    const settlementTx = txHash || '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    txs.settlementTx = settlementTx;

    const payout = po.payout_meth;
    const remainingCollateral = Math.max(0, po.locked_collateral_meth - payout);
    const recoveryNftId = 101;

    this.db.updatePurchaseOrder(poId, {
      status: 'SETTLED',
      refunded_collateral_meth: remainingCollateral,
      recovery_nft_id: recoveryNftId,
      recovery_nft_holder: po.buyer_wallet,
      tx_hashes_json: JSON.stringify(txs)
    });

    return this.getOrder(poId)!;
  }

  public factorRecoveryNFT(poId: string, factorDeskAddress: string, txHash?: string): PurchaseOrderRecord {
    const po = this.getOrder(poId);
    if (!po) throw new Error(`PO not found: ${poId}`);

    const txs = JSON.parse(po.tx_hashes_json || '{}');
    const factoringTx = txHash || '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    txs.factoringTx = factoringTx;

    this.db.updatePurchaseOrder(poId, {
      status: 'FACTORED',
      recovery_nft_holder: factorDeskAddress,
      tx_hashes_json: JSON.stringify(txs)
    });

    return this.getOrder(poId)!;
  }

  // --- Backward-Compatible Methods for Canonical PO-2026-001 ---
  public recordClaimSubmitted(deliveredQuantity: number, evidenceHash: string, txHash: string): void {
    const po = this.getOrder('PO-2026-001');
    if (po) {
      const txs = JSON.parse(po.tx_hashes_json || '{}');
      txs.claimTx = txHash;
      this.db.updatePurchaseOrder('PO-2026-001', {
        delivered_units: deliveredQuantity,
        evidence_hash: evidenceHash,
        status: 'CLAIM_SUBMITTED',
        tx_hashes_json: JSON.stringify(txs)
      });
    }
  }

  public recordVerifierDecision(eligibleLossWei: string, approved: boolean): void {
    const po = this.getOrder('PO-2026-001');
    if (po) {
      const lossMeth = approved ? StateManager.weiToMeth(eligibleLossWei) : 0;
      this.verifyClaim('PO-2026-001', approved, lossMeth);
    }
  }

  public recordSettlement(txHash: string): void {
    this.settleOrder('PO-2026-001', txHash);
  }

  public recordProviderFunding(collateralWei: string, txHash: string): void {
    const collateralMeth = StateManager.weiToMeth(collateralWei);
    this.fundVault('PO-2026-001', collateralMeth, txHash);
  }

  public recordRecoveryTransfer(newRecipient: string, txHash: string): void {
    this.factorRecoveryNFT('PO-2026-001', newRecipient, txHash);
  }

  public reset(agentAddress: string): void {
    this.agentAddress = agentAddress;
    this.db.resetToSeed();
    seedDatabase(this.db);
  }

  // --- Aggregate System KPIs ---
  public getSystemMetrics() {
    const orders = this.db.getAllPurchaseOrders();
    let totalProtectedVolume = 0;
    let activeCommitments = 0;
    let lockedCollateral = 0;
    let claimsSettled = 0;

    for (const po of orders) {
      totalProtectedVolume += po.contract_value_meth;
      if (po.status !== 'DRAFT') activeCommitments++;
      if (po.locked_collateral_meth > 0 && po.status !== 'SETTLED' && po.status !== 'FACTORED') {
        lockedCollateral += po.locked_collateral_meth;
      }
      if (po.status === 'SETTLED' || po.status === 'FACTORED') {
        claimsSettled++;
      }
    }

    return {
      totalProtectedVolume: Number(totalProtectedVolume.toFixed(2)),
      activeCommitments,
      lockedCollateral: Number(lockedCollateral.toFixed(2)),
      claimsSettled,
      totalOrders: orders.length
    };
  }
}
