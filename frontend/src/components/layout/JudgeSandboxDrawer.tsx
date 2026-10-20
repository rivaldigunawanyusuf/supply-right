'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  Eye,
  Sliders,
  Sparkles,
  Lock,
  ExternalLink,
  Briefcase,
  Binary
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useViewMode } from '@/context/ViewModeContext';
import { useTheme } from '@/context/ThemeContext';
import { UserRole, TestVectorResult } from '@/types';

interface JudgeSandboxDrawerProps {
  onResetFixture?: () => void;
  isResetting?: boolean;
}

export const JudgeSandboxDrawer: React.FC<JudgeSandboxDrawerProps> = ({
  onResetFixture,
  isResetting,
}) => {
  const { activeRole, loginAsPersona } = useAuth();
  const { mode, toggleMode } = useViewMode();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'VECTORS' | 'PERSONAS' | 'TELEMETRY'>('VECTORS');
  const [runningTest, setRunningTest] = useState<string | null>(null);
  const [latestResult, setLatestResult] = useState<TestVectorResult | null>(null);
  const [allResults, setAllResults] = useState<TestVectorResult[]>([]);
  const [copiedSigner, setCopiedSigner] = useState(false);

  const signerAddress = '0x8a3C00000000000000000000000000000000Bde6';

  const copySigner = () => {
    navigator.clipboard.writeText(signerAddress);
    setCopiedSigner(true);
    setTimeout(() => setCopiedSigner(false), 2000);
  };

  const testVectors = [
    { id: 'TC-01', name: 'Happy Path Settlement', desc: 'Verified 80 mETH loss -> 16 mETH payout authorized' },
    { id: 'TC-02', name: 'Under-Collateralized', desc: 'Requested payout exceeds vault collateral -> Denied' },
    { id: 'TC-03', name: 'Unverified Claim', desc: 'Settlement attempted before SGS attestation -> Denied' },
    { id: 'TC-04', name: 'Nonce Replay Attack', desc: 'Duplicate keccak256 proposal replay -> Denied' },
    { id: 'TC-05', name: 'Attacker Impersonation', desc: 'Rogue wallet attempts settlement trigger -> Denied' },
    { id: 'TC-06', name: 'Prompt Injection Defense', desc: 'Untrusted invoice payload injection -> Firewall blocked' },
    { id: 'TC-07', name: 'Isolated Signer Hard Gate', desc: 'Signer module throws and refuses unsigned payload' },
    { id: 'TC-08', name: 'Missing Evidence Prompt', desc: 'AI queries missing warehouse documentation' },
    { id: 'TC-09', name: 'Atomic Rollback Guarantee', desc: 'State reverts if either payout or NFT mint fails' },
    { id: 'TC-10', name: 'State Reproducibility', desc: '100% deterministic testnet arithmetic' },
  ];

  const handleRunVector = async (testId: string) => {
    setRunningTest(testId);
    try {
      const res = await fetch(`/api/security/test-vector/${testId}`, { method: 'POST' });
      if (res.ok) {
        const result: TestVectorResult = await res.json();
        setLatestResult(result);
        setAllResults(prev => [result, ...prev.filter(r => r.testId !== testId)]);
      }
    } catch (err) {
      console.warn('Vector run failed', err);
    } finally {
      setRunningTest(null);
    }
  };

  const handleRunAll = async () => {
    setRunningTest('ALL');
    for (const tv of testVectors) {
      try {
        const res = await fetch(`/api/security/test-vector/${tv.id}`, { method: 'POST' });
        if (res.ok) {
          const result: TestVectorResult = await res.json();
          setAllResults(prev => [result, ...prev.filter(r => r.testId !== tv.id)]);
        }
      } catch {}
    }
    setRunningTest(null);
  };

  return (
    <>
      {/* Floating Bottom-Right HUD Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="flex items-center gap-2.5 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground shadow-dropdown backdrop-blur-md transition-all hover:shadow-lg hover:border-primary/40"
        >
          <span className={`h-2 w-2 rounded-full ${activeRole === 'JUDGE' ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`} />
          <ShieldAlert className={`h-4 w-4 ${activeRole === 'JUDGE' ? 'text-rose-500' : 'text-primary'}`} />
          <span>{activeRole === 'JUDGE' ? 'Judge Evaluation Console' : 'Judge Benchmark Lab'}</span>
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono font-bold text-muted-foreground border border-border">
            Topic F
          </span>
          {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Slide-Up Evaluation HUD Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 flex max-h-[80vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-border bg-card/95 shadow-dropdown backdrop-blur-xl">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Cpu className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">
                  Judge & Security Evaluation Suite
                </div>
                <div className="text-xs text-muted-foreground">
                  Fintechathon 2026 • Autonomous On-Chain Wallet (Topic F)
                </div>
              </div>
            </div>

            <button
              onClick={toggleMode}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-bold text-foreground shadow-subtle hover:bg-muted"
            >
              {mode === 'business' ? <Briefcase className="h-3 w-3 text-primary" /> : <Binary className="h-3 w-3 text-primary" />}
              <span>{mode === 'business' ? 'USD View' : 'Web3 Mode'}</span>
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-border bg-muted/20 px-4 py-2 gap-2 text-xs">
            <button
              onClick={() => setActiveTab('VECTORS')}
              className={`flex-1 rounded-lg py-1.5 font-bold transition-all ${
                activeTab === 'VECTORS'
                  ? 'bg-card text-primary shadow-subtle border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              10 Test Vectors (TC-01..10)
            </button>
            <button
              onClick={() => setActiveTab('PERSONAS')}
              className={`flex-1 rounded-lg py-1.5 font-bold transition-all ${
                activeTab === 'PERSONAS'
                  ? 'bg-card text-primary shadow-subtle border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Persona Simulator
            </button>
            <button
              onClick={() => setActiveTab('TELEMETRY')}
              className={`flex-1 rounded-lg py-1.5 font-bold transition-all ${
                activeTab === 'TELEMETRY'
                  ? 'bg-card text-primary shadow-subtle border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Zero-Trust Custody
            </button>
          </div>

          {/* Tab 1: 10 Test Vectors */}
          {activeTab === 'VECTORS' && (
            <div className="flex-1 overflow-y-auto p-5 max-h-[460px]">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="text-muted-foreground">
                  Execute reproducible test suites against Policy Engine:
                </span>
                <button
                  onClick={handleRunAll}
                  disabled={runningTest !== null}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
                >
                  <Play className="h-3 w-3" />
                  <span>{runningTest === 'ALL' ? 'Running...' : 'Run All 10 Vectors'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {testVectors.map(tv => {
                  const result = allResults.find(r => r.testId === tv.id);
                  const isRunning = runningTest === tv.id;
                  return (
                    <div
                      key={tv.id}
                      className={`flex flex-col justify-between rounded-xl border p-3 bg-muted/20 transition-all ${
                        result
                          ? result.passed
                            ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                            : 'border-destructive/40 bg-destructive/10'
                          : 'border-border'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-primary">{tv.id}</span>
                          {result && (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${result.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                              {result.passed ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              {result.passed ? 'PASS' : 'DENIED'}
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-foreground mt-1">{tv.name}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-tight">
                          {tv.desc}
                        </div>
                      </div>

                      <button
                        onClick={() => handleRunVector(tv.id)}
                        disabled={runningTest !== null}
                        className="mt-2.5 inline-flex items-center justify-center gap-1 rounded-md border border-border bg-card py-1 text-[11px] font-semibold text-foreground shadow-subtle hover:bg-muted disabled:opacity-50"
                      >
                        <Play className="h-2.5 w-2.5 text-primary" />
                        <span>{isRunning ? 'Testing...' : 'Test Vector'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Latest Result Banner */}
              {latestResult && (
                <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-3.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-primary">
                    <span>Output: {latestResult.testId} — {latestResult.name}</span>
                    <span className={latestResult.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}>
                      {latestResult.verdict?.verdict}
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground">{latestResult.explanation}</p>
                  {latestResult.signerResult?.txHash && (
                    <div className="mt-2 font-mono text-[10px] text-primary truncate">
                      Sepolia Tx: {latestResult.signerResult.txHash}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Persona Simulator */}
          {activeTab === 'PERSONAS' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
              <div className="text-xs text-muted-foreground mb-2">
                Instantly switch authorization context across the 5 trade lifecycle personas:
              </div>
              {[
                { role: 'BUYER', label: 'Buyer (Procurement)', desc: 'BrightBox Consumer Goods — Submits claim and confirms warehouse receipt', color: 'text-blue-600' },
                { role: 'SUPPLIER', label: 'Supplier (Manufacturing)', desc: 'PackagePro Domestic — Accepts PO, signs subrogation, logs shipments', color: 'text-amber-600' },
                { role: 'PROVIDER', label: 'Underwriter (Capital)', desc: 'Sentinel Trade Capital — Pre-funds 20% collateral in Performance Escrow', color: 'text-purple-600' },
                { role: 'VERIFIER', label: 'Logistics Inspector', desc: 'SGS Independent Verification — Attests to physical delivery deficit', color: 'text-emerald-600' },
                { role: 'JUDGE', label: 'Evaluator / Auditor', desc: 'Fintechathon Judge — Full unrestricted read/write audit and sandbox inspection', color: 'text-rose-600' },
              ].map(p => (
                <div
                  key={p.role}
                  className={`flex items-center justify-between rounded-xl border p-3 transition-all ${
                    activeRole === p.role ? 'border-primary/50 bg-primary/5 shadow-subtle' : 'border-border bg-card'
                  }`}
                >
                  <div>
                    <div className={`text-xs font-bold ${p.color}`}>{p.label}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{p.desc}</div>
                  </div>
                  <button
                    onClick={() => loginAsPersona(p.role as UserRole)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      activeRole === p.role ? 'bg-primary text-primary-foreground' : 'border border-border bg-muted/60 text-foreground hover:bg-muted'
                    }`}
                  >
                    {activeRole === p.role ? 'Active' : 'Switch'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Zero-Trust Hardware & Custody */}
          {activeTab === 'TELEMETRY' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-3 text-xs">
              <div className="rounded-xl border border-border bg-card p-3.5 shadow-subtle">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Isolated Signer (Zero-Trust Custody)
                </div>
                <div className="flex items-center justify-between font-mono text-xs text-primary font-bold mt-1">
                  <span>{signerAddress}</span>
                  <button onClick={copySigner} className="text-muted-foreground hover:text-foreground">
                    {copiedSigner ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Private keys reside exclusively in isolated signer daemon. Quarantined from LLM context and REST payloads.
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-3.5 shadow-subtle">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Policy Hard Gates & Chain
                </div>
                <div className="flex items-center gap-3 mt-1 font-bold text-foreground">
                  <span className="text-emerald-600 dark:text-emerald-400">7/7 Hard Gates Enforced</span>
                  <span className="text-muted-foreground">•</span>
                  <span>Sepolia (11155111)</span>
                </div>
              </div>

              {/* Reset Fixture Button */}
              <button
                onClick={onResetFixture}
                disabled={isResetting}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 py-2.5 text-xs font-bold text-destructive hover:bg-destructive/20 disabled:opacity-50"
              >
                <RotateCcw className={`h-3.5 w-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                <span>{isResetting ? 'Resetting Database...' : 'Reset to Canonical PO-2026-001 Baseline'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
