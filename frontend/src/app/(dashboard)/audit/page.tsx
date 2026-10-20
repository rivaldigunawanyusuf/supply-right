'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  History,
  Download,
  Search,
  ExternalLink,
  Shield,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  FileCode,
  ChevronLeft
} from 'lucide-react';
import { AuditRecord, SystemState } from '@/types';

export default function AuditLedgerPage() {
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);
  const [state, setState] = useState<SystemState | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [auditRes, stateRes] = await Promise.all([
        fetch('/api/audit'),
        fetch('/api/state')
      ]);
      if (auditRes.ok) setAuditLogs(await auditRes.json());
      if (stateRes.ok) setState(await stateRes.json());
    } catch {}
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const contracts = [
    { name: 'MockETH (mETH Token)', address: state?.contracts.mockETH || '0x9999000100000000000000000000000000000001' },
    { name: 'SupplyRightNFT (PO Commitments)', address: state?.contracts.supplyRightNFT || '0x9999000200000000000000000000000000000002' },
    { name: 'ProtectionVault (Collateral Escrow)', address: state?.contracts.protectionVault || '0x9999000300000000000000000000000000000003' },
    { name: 'ClaimManager (Atomic Settlement)', address: state?.contracts.claimManager || '0x9999000400000000000000000000000000000004' },
    { name: 'RecoveryClaimNFT (Subrogation Debt)', address: state?.contracts.recoveryClaimNFT || '0x9999000500000000000000000000000000000005' }
  ];

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(auditLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supplyright_ledger_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = auditLogs.filter(
    l =>
      l.actionType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.actor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.rationale?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.txHash && l.txHash.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-1.5 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <History className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Audit & On-Chain Sepolia Ledger
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cryptographic ledger tracking all verified deliveries, policy verdicts, and Ethereum Sepolia transaction proofs.
          </p>
        </div>

        <button
          onClick={exportJSON}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border hover:bg-muted text-foreground text-xs font-semibold shadow-sm transition self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Ledger JSON</span>
        </button>
      </div>

      {/* Protocol Smart Contracts Allowlist */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Shield className="w-4 h-4 text-emerald-500" />
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Allowlisted Ethereum Sepolia Protocol Contracts (Chain ID 11155111)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {contracts.map(c => (
            <div key={c.name} className="p-3 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-foreground truncate">{c.name}</div>
                <div className="text-[11px] font-mono text-muted-foreground truncate">{c.address}</div>
              </div>
              <button
                onClick={() => handleCopy(c.name, c.address)}
                className="p-1.5 rounded hover:bg-card text-muted-foreground hover:text-foreground transition flex-shrink-0"
                title="Copy Address"
              >
                {copiedKey === c.name ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 px-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-foreground">Historical Audit Records</h2>
            <p className="text-xs text-muted-foreground">Every consensus verdict, escrow deposit, and claim disbursement is cryptographically hashed.</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search ledger actions..."
              className="pl-8 pr-3 py-1.5 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary transition w-56"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-[11px] uppercase tracking-wider font-semibold bg-muted/20">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Rationale & Details</th>
                <th className="py-3 px-4">Sepolia Tx Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground text-xs">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-foreground whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-muted text-[11px]">
                        {log.actionType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground text-[11px] whitespace-nowrap">
                      {log.actor}
                    </td>
                    <td className="py-3 px-4 text-foreground max-w-md truncate">
                      {log.rationale}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-primary whitespace-nowrap">
                      {log.txHash ? (
                        <a
                          href={`https://sepolia.etherscan.io/tx/${log.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1"
                        >
                          <span>{log.txHash.slice(0, 10)}...</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">Internal</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
