import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { UserRecord, PurchaseOrderRecord, AuditLogRecord, ChatMessageRecord } from './types.js';

export class AppDatabase {
  private db: Database.Database;

  constructor(dbPath?: string) {
    const resolvedPath = dbPath || process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'supplyright.db');
    const dbDir = path.dirname(resolvedPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = new Database(resolvedPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.initTables();
  }

  private initTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        company_name TEXT NOT NULL,
        role TEXT NOT NULL,
        wallet_address TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS purchase_orders (
        id TEXT PRIMARY KEY,
        buyer_id TEXT NOT NULL,
        buyer_company TEXT NOT NULL,
        buyer_wallet TEXT NOT NULL,
        supplier_id TEXT NOT NULL,
        supplier_company TEXT NOT NULL,
        supplier_wallet TEXT NOT NULL,
        product_spec TEXT NOT NULL,
        ordered_units INTEGER NOT NULL,
        ordered_batches INTEGER NOT NULL,
        contract_value_meth REAL NOT NULL,
        coverage_rate_bps INTEGER NOT NULL DEFAULT 2000,
        required_collateral_meth REAL NOT NULL,
        locked_collateral_meth REAL NOT NULL DEFAULT 0,
        deadline TEXT NOT NULL,
        delivered_units INTEGER NOT NULL DEFAULT 0,
        delivered_batches INTEGER NOT NULL DEFAULT 0,
        warehouse_receipt_notes TEXT,
        evidence_hash TEXT,
        verified_eligible_loss_meth REAL,
        verifier_decision TEXT DEFAULT 'PENDING',
        verifier_notes TEXT,
        payout_meth REAL NOT NULL DEFAULT 0,
        refunded_collateral_meth REAL NOT NULL DEFAULT 0,
        commitment_nft_id INTEGER,
        recovery_nft_id INTEGER,
        recovery_nft_holder TEXT,
        status TEXT NOT NULL,
        tx_hashes_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        po_id TEXT NOT NULL,
        actor_role TEXT NOT NULL,
        stage TEXT NOT NULL,
        action_type TEXT NOT NULL,
        proposal_json TEXT,
        policy_verdict_json TEXT,
        tx_hash TEXT,
        status TEXT NOT NULL,
        summary TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        po_id TEXT NOT NULL,
        sender_role TEXT NOT NULL,
        sender_name TEXT NOT NULL,
        content TEXT NOT NULL,
        suggested_actions_json TEXT,
        security_alert_json TEXT,
        timestamp TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_po_buyer ON purchase_orders(buyer_id);
      CREATE INDEX IF NOT EXISTS idx_po_supplier ON purchase_orders(supplier_id);
      CREATE INDEX IF NOT EXISTS idx_audit_po ON audit_logs(po_id);
      CREATE INDEX IF NOT EXISTS idx_chat_po ON chat_messages(po_id);
    `);
  }

  // --- User Operations ---
  public getUserByEmail(email: string): UserRecord | undefined {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email.toLowerCase()) as UserRecord | undefined;
  }

  public getUserById(id: string): UserRecord | undefined {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as UserRecord | undefined;
  }

  public getUserByRole(role: string): UserRecord | undefined {
    const stmt = this.db.prepare('SELECT * FROM users WHERE role = ? LIMIT 1');
    return stmt.get(role.toUpperCase()) as UserRecord | undefined;
  }

  public getAllUsers(): UserRecord[] {
    const stmt = this.db.prepare('SELECT * FROM users ORDER BY created_at ASC');
    return stmt.all() as UserRecord[];
  }

  public insertUser(user: UserRecord): void {
    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, password_hash, name, company_name, role, wallet_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      user.id,
      user.email.toLowerCase(),
      user.password_hash,
      user.name,
      user.company_name,
      user.role,
      user.wallet_address,
      user.created_at
    );
  }

  // --- Purchase Order Operations ---
  public getAllPurchaseOrders(): PurchaseOrderRecord[] {
    const stmt = this.db.prepare('SELECT * FROM purchase_orders ORDER BY created_at DESC');
    return stmt.all() as PurchaseOrderRecord[];
  }

  public getPurchaseOrderById(id: string): PurchaseOrderRecord | undefined {
    const stmt = this.db.prepare('SELECT * FROM purchase_orders WHERE id = ?');
    return stmt.get(id) as PurchaseOrderRecord | undefined;
  }

  public insertPurchaseOrder(po: PurchaseOrderRecord): void {
    const stmt = this.db.prepare(`
      INSERT INTO purchase_orders (
        id, buyer_id, buyer_company, buyer_wallet,
        supplier_id, supplier_company, supplier_wallet,
        product_spec, ordered_units, ordered_batches,
        contract_value_meth, coverage_rate_bps,
        required_collateral_meth, locked_collateral_meth,
        deadline, delivered_units, delivered_batches,
        warehouse_receipt_notes, evidence_hash,
        verified_eligible_loss_meth, verifier_decision, verifier_notes,
        payout_meth, refunded_collateral_meth,
        commitment_nft_id, recovery_nft_id, recovery_nft_holder,
        status, tx_hashes_json, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?
      )
    `);
    stmt.run(
      po.id,
      po.buyer_id,
      po.buyer_company,
      po.buyer_wallet,
      po.supplier_id,
      po.supplier_company,
      po.supplier_wallet,
      po.product_spec,
      po.ordered_units,
      po.ordered_batches,
      po.contract_value_meth,
      po.coverage_rate_bps,
      po.required_collateral_meth,
      po.locked_collateral_meth,
      po.deadline,
      po.delivered_units,
      po.delivered_batches,
      po.warehouse_receipt_notes || null,
      po.evidence_hash || null,
      po.verified_eligible_loss_meth ?? null,
      po.verifier_decision || 'PENDING',
      po.verifier_notes || null,
      po.payout_meth,
      po.refunded_collateral_meth,
      po.commitment_nft_id ?? null,
      po.recovery_nft_id ?? null,
      po.recovery_nft_holder || null,
      po.status,
      po.tx_hashes_json,
      po.created_at,
      po.updated_at
    );
  }

  public updatePurchaseOrder(id: string, updates: Partial<PurchaseOrderRecord>): void {
    const fields = Object.keys(updates).filter(k => k !== 'id');
    if (fields.length === 0) return;

    const setClauses = fields.map(k => `${k} = ?`).join(', ');
    const values = fields.map(k => (updates as any)[k]);
    values.push(new Date().toISOString()); // updated_at
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE purchase_orders
      SET ${setClauses}, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(...values);
  }

  // --- Audit Log Operations ---
  public getAuditLogs(poId?: string): AuditLogRecord[] {
    if (poId) {
      const stmt = this.db.prepare('SELECT * FROM audit_logs WHERE po_id = ? ORDER BY timestamp DESC');
      return stmt.all(poId) as AuditLogRecord[];
    }
    const stmt = this.db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 200');
    return stmt.all() as AuditLogRecord[];
  }

  public insertAuditLog(log: AuditLogRecord): void {
    const stmt = this.db.prepare(`
      INSERT INTO audit_logs (id, po_id, actor_role, stage, action_type, proposal_json, policy_verdict_json, tx_hash, status, summary, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      log.id,
      log.po_id,
      log.actor_role,
      log.stage,
      log.action_type,
      log.proposal_json || null,
      log.policy_verdict_json || null,
      log.tx_hash || null,
      log.status,
      log.summary,
      log.timestamp
    );
  }

  // --- Chat Message Operations ---
  public getChatMessages(poId: string): ChatMessageRecord[] {
    const stmt = this.db.prepare('SELECT * FROM chat_messages WHERE po_id = ? ORDER BY timestamp ASC');
    return stmt.all(poId) as ChatMessageRecord[];
  }

  public insertChatMessage(msg: ChatMessageRecord): void {
    const stmt = this.db.prepare(`
      INSERT INTO chat_messages (id, po_id, sender_role, sender_name, content, suggested_actions_json, security_alert_json, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      msg.id,
      msg.po_id,
      msg.sender_role,
      msg.sender_name,
      msg.content,
      msg.suggested_actions_json || null,
      msg.security_alert_json || null,
      msg.timestamp
    );
  }

  // --- Clear / Reset ---
  public resetToSeed(): void {
    this.db.exec(`
      DELETE FROM chat_messages;
      DELETE FROM audit_logs;
      DELETE FROM purchase_orders;
      DELETE FROM users;
    `);
  }

  public close(): void {
    this.db.close();
  }
}
