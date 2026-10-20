'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PlusCircle,
  Shield,
  Building2,
  Calendar,
  Sparkles,
  ArrowRight,
  Package,
  Layers,
  AlertCircle,
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CreateOrderPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [supplierCompany, setSupplierCompany] = useState('PackagePro Domestic');
  const [productSpec, setProductSpec] = useState('Custom-printed corrugated shipping containers (350x250x180mm), high-durability Kraft');
  const [orderedUnits, setOrderedUnits] = useState('10000');
  const [orderedBatches, setOrderedBatches] = useState('50');
  const [contractValueMeth, setContractValueMeth] = useState('100.0');
  const [coverageRateBps, setCoverageRateBps] = useState('2000'); // 20%
  const [deadline, setDeadline] = useState('2026-11-15T00:00:00Z');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live calculations
  const numValue = parseFloat(contractValueMeth) || 0;
  const numCoverageBps = parseInt(coverageRateBps, 10) || 2000;
  const coveragePct = numCoverageBps / 100;
  const requiredCollateral = Number((numValue * (numCoverageBps / 10000)).toFixed(2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: user?.id || 'usr_buyer_1',
          buyerCompany: user?.companyName || 'BrightBox Consumer Goods',
          buyerWallet: user?.walletAddress || '0x1111111111111111111111111111111111111111',
          supplierCompany,
          productSpec,
          orderedUnits: parseInt(orderedUnits, 10),
          orderedBatches: parseInt(orderedBatches, 10),
          contractValueMeth: numValue,
          coverageRateBps: numCoverageBps,
          deadline
        })
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/orders/${data.order.id}`);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to create order on ledger');
      }
    } catch (err: any) {
      setError(err.message || 'Network error communicating with API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Create Purchase Order & Risk Vault
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure bilateral commercial terms, SKU volume thresholds, and autonomous underwriting covenants.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Card */}
        <div className="lg:col-span-7 bg-card rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Purchase Order Terms & Specifications</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Designated Supplier Name
              </label>
              <input
                type="text"
                value={supplierCompany}
                onChange={e => setSupplierCompany(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                placeholder="e.g. PackagePro Domestic"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Product Specifications & SKU Matrix
              </label>
              <textarea
                rows={3}
                value={productSpec}
                onChange={e => setProductSpec(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                placeholder="Describe material grade, delivery SLA, batch packaging specs..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Ordered Quantity (Units)
                </label>
                <input
                  type="number"
                  value={orderedUnits}
                  onChange={e => setOrderedUnits(e.target.value)}
                  required
                  min={1}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Batches
                </label>
                <input
                  type="number"
                  value={orderedBatches}
                  onChange={e => setOrderedBatches(e.target.value)}
                  required
                  min={1}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Contract Value (mETH)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={contractValueMeth}
                  onChange={e => setContractValueMeth(e.target.value)}
                  required
                  min={0.1}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Protection Rate (bps)
                </label>
                <select
                  value={coverageRateBps}
                  onChange={e => setCoverageRateBps(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                >
                  <option value="1000">10% Coverage (1,000 bps) — Low</option>
                  <option value="2000">20% Coverage (2,000 bps) — Standard</option>
                  <option value="3000">30% Coverage (3,000 bps) — High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Contract Fulfillment Deadline (UTC)
              </label>
              <input
                type="text"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-mono"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold shadow-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Committing PO to Cryptographic Ledger...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    Register Purchase Order & Launch Escrow
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Underwriting & Policy Gate Preview */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Underwriting & Reserve Matrix</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border border-border/50">
                <span className="text-muted-foreground font-medium">Gross Contract Value</span>
                <span className="font-mono font-bold text-foreground">{numValue.toFixed(1)} mETH</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border border-border/50">
                <span className="text-muted-foreground font-medium">Protection Factor</span>
                <span className="font-semibold text-primary">{coveragePct.toFixed(0)}%</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div>
                  <span className="text-xs font-bold text-primary block">Required Escrow Reserve</span>
                  <span className="text-[10px] text-muted-foreground">Locked by Underwriter</span>
                </div>
                <span className="font-mono text-base font-extrabold text-primary">
                  {requiredCollateral.toFixed(1)} mETH
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border border-border/50">
                <span className="text-muted-foreground font-medium">Max Guaranteed Indemnity</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{requiredCollateral.toFixed(1)} mETH</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-[11.5px] text-muted-foreground space-y-2 leading-relaxed">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Shield className="w-3.5 h-3.5 text-primary" /> Zero-Trust Gate 7 Guarantee
              </div>
              <p>
                In case of supplier shortfall, autonomous settlement will be capped at:
              </p>
              <div className="p-2 rounded bg-card border border-border font-mono text-[11px] text-foreground">
                min(ShortfallLoss × {coveragePct}%, {requiredCollateral} mETH)
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Workflow Steps After Creation</h4>
            <ul className="text-xs space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Supplier formally accepts PO specifications and milestone commitments.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Protection Provider pre-funds {requiredCollateral} mETH into on-chain vault.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Physical deliveries are audited against PO specs via Three-Way Matching.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
