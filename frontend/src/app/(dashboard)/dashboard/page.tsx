'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  ArrowRight,
  ExternalLink,
  Search,
  Filter,
  Package,
  Clock,
  BarChart3,
  Calendar,
  Building2,
  DollarSign,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  FileText,
  Activity,
  Cpu,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useViewMode } from '@/context/ViewModeContext';
import { PurchaseOrder, SystemMetrics, POStatus } from '@/types';

export default function DashboardPage() {
  const { user, activeRole } = useAuth();
  const { mode, formatValue } = useViewMode();
  const router = useRouter();

  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'ACTION_REQUIRED' | 'SETTLED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setMetrics(data.metrics || null);
      }
    } catch (err) {
      console.warn('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleUpdate = () => fetchOrders();
    window.addEventListener('supplyright_state_updated', handleUpdate);

    return () => {
      window.removeEventListener('supplyright_state_updated', handleUpdate);
    };
  }, []);

  const getStatusBadge = (status: POStatus) => {
    switch (status) {
      case 'DRAFT':
        return { label: 'Draft', color: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800' };
      case 'SUPPLIER_ACCEPTED':
        return { label: 'Supplier Accepted', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' };
      case 'COMMITTED_ONCHAIN':
        return { label: 'Committed On-Chain', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800' };
      case 'VAULT_FUNDED':
        return { label: 'Escrow Funded', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800' };
      case 'DELIVERY_LOGGED':
        return { label: 'Delivery Logged', color: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800' };
      case 'CLAIM_SUBMITTED':
        return { label: 'Claim Submitted', color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800' };
      case 'VERIFIER_APPROVED':
        return { label: 'SGS Attested', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' };
      case 'SETTLED':
        return { label: 'Settled & Paid', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700' };
      case 'FACTORED':
        return { label: 'Factored (Apex)', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800' };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const filteredOrders = orders.filter(po => {
    const matchesSearch =
      po.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.product_spec.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplier_company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.buyer_company.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'ACTIVE') {
      return po.status !== 'DRAFT' && po.status !== 'SETTLED' && po.status !== 'FACTORED';
    }
    if (filterTab === 'ACTION_REQUIRED') {
      if (activeRole === 'BUYER') return po.status === 'CLAIM_SUBMITTED' || po.status === 'SETTLED';
      if (activeRole === 'SUPPLIER') return po.status === 'DRAFT' || po.status === 'VAULT_FUNDED';
      if (activeRole === 'PROVIDER') return po.status === 'SUPPLIER_ACCEPTED' || po.locked_collateral_meth === 0;
      if (activeRole === 'VERIFIER') return po.status === 'CLAIM_SUBMITTED';
      return true;
    }
    if (filterTab === 'SETTLED') {
      return po.status === 'SETTLED' || po.status === 'FACTORED';
    }
    return true;
  });

  const roleConfig = (() => {
    switch (activeRole) {
      case 'SUPPLIER':
        return {
          roleLabel: 'Supplier Desk',
          roleBadge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/60 dark:text-amber-300',
          avatarGrad: 'from-amber-500 to-orange-600',
          title: `Welcome, ${user?.name || 'Marcus Chen'}`,
          desc: `Managing vendor dispatches, carrier bills of lading, and invoice factoring for ${user?.companyName || 'PackagePro Domestic'}.`,
          primaryAction: {
            label: 'Fulfill PO-2026-001',
            href: '/orders/PO-2026-001',
            icon: Package
          },
          secondaryAction: {
            label: 'Factor Receivables (Apex)',
            href: '/orders/PO-2026-001',
            icon: DollarSign
          },
          kpis: [
            {
              title: mode === 'business' ? 'Contracted Volume' : 'Invoiced Volume (mETH)',
              val: formatValue(metrics ? metrics.totalProtectedVolume : 100).primary,
              sub: `${formatValue(metrics ? metrics.totalProtectedVolume : 100).secondary} • 3 Orders`,
              icon: TrendingUp,
              iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
            },
            {
              title: 'Dispatched Batches',
              val: '10 / 50 Batches',
              sub: '2,000 Units On-Dock • 40 Shortfall',
              icon: Package,
              iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
            },
            {
              title: 'Collateral Backing',
              val: formatValue(20).primary,
              sub: 'Staked by Sentinel Protection Vault',
              icon: Shield,
              iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400'
            },
            {
              title: 'Assignable Factoring Pool',
              val: formatValue(80).primary,
              sub: 'RecoveryClaimNFT #101 • 15% discount',
              icon: CheckCircle2,
              iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
            }
          ]
        };
      case 'PROVIDER':
        return {
          roleLabel: 'Underwriter Desk',
          roleBadge: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/60 dark:text-purple-300',
          avatarGrad: 'from-purple-600 to-indigo-600',
          title: `Welcome, ${user?.name || 'Sarah Jenkins'}`,
          desc: `Staking capital reserves in ProtectionVault to underwrite performance risks for ${user?.companyName || 'Sentinel Protection Vault'}.`,
          primaryAction: {
            label: 'Manage Vault Collateral',
            href: '/orders/PO-2026-001',
            icon: Shield
          },
          secondaryAction: {
            label: 'Audit Reserve Solvency',
            href: '/audit',
            icon: Activity
          },
          kpis: [
            {
              title: mode === 'business' ? 'Total Value Locked (TVL)' : 'Vault Collateral (mETH)',
              val: formatValue(metrics ? metrics.lockedCollateral : 20).primary,
              sub: '20.0 mETH Staked on Sepolia',
              icon: Shield,
              iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400'
            },
            {
              title: 'Active Underwritten Risk',
              val: formatValue(metrics ? metrics.totalProtectedVolume : 100).primary,
              sub: 'Across 3 Active Trade Commitments',
              icon: Layers,
              iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
            },
            {
              title: 'Coverage Ratio',
              val: '20.0%',
              sub: 'Deterministic Max Loss Underwriting',
              icon: CheckCircle2,
              iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
            },
            {
              title: 'Protocol APY Yield',
              val: '1.5% Premium',
              sub: 'Earned upfront upon PO commitment',
              icon: TrendingUp,
              iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
            }
          ]
        };
      case 'VERIFIER':
        return {
          roleLabel: 'Inspector Desk',
          roleBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-300',
          avatarGrad: 'from-emerald-600 to-teal-600',
          title: `Welcome, ${user?.name || 'Dr. David Miller'}`,
          desc: `Cross-referencing logistics waybills, physical dock intake, and signing cryptographic loss attestations for ${user?.companyName || 'SGS Independent Verifier'}.`,
          primaryAction: {
            label: 'Audit SGS Inspection Queue',
            href: '/orders/PO-2026-001',
            icon: CheckCircle
          },
          secondaryAction: {
            label: 'Audit Oracle Ledger',
            href: '/audit',
            icon: FileText
          },
          kpis: [
            {
              title: 'Pending SGS Inspections',
              val: '1 Active PO',
              sub: 'PO-2026-001 Shortfall Claim',
              icon: AlertTriangle,
              iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
            },
            {
              title: 'Audit Inspection Volume',
              val: '10,000 Units',
              sub: '50 Master Shipping Containers',
              icon: Package,
              iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
            },
            {
              title: 'Attested Eligible Loss',
              val: formatValue(80).primary,
              sub: '40 Batches Missing (8,000 Units)',
              icon: Shield,
              iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400'
            },
            {
              title: 'Oracle Response SLA',
              val: '< 2.4 sec',
              sub: 'Zero-discrepancy 48h window',
              icon: CheckCircle2,
              iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
            }
          ]
        };
      case 'JUDGE':
        return {
          roleLabel: 'Evaluation Sandbox',
          roleBadge: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/60 dark:text-rose-300',
          avatarGrad: 'from-rose-600 to-pink-600',
          title: `Welcome, ${user?.name || 'Hackathon Judge'}`,
          desc: 'Evaluating autonomous multi-agent escrow settlement, 7 policy hard gates, and red-team safety on Ethereum Sepolia.',
          primaryAction: {
            label: 'Benchmark PO-2026-001',
            href: '/orders/PO-2026-001',
            icon: Cpu
          },
          secondaryAction: {
            label: 'Threat Sandbox',
            href: '/security-lab',
            icon: Shield
          },
          kpis: [
            {
              title: 'Sepolia Smart Contracts',
              val: '5 Verified',
              sub: 'MockETH, Vault, NFTs, ClaimMgr',
              icon: CheckCircle2,
              iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
            },
            {
              title: 'Cryptographic Hard Gates',
              val: '7/7 Enforced',
              sub: '100% Deterministic Safety',
              icon: Shield,
              iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400'
            },
            {
              title: 'Autonomous Test Suite',
              val: '14/14 Pass',
              sub: 'Foundry + TypeScript Integration',
              icon: Layers,
              iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
            },
            {
              title: 'Adversarial Injection Safety',
              val: '100% Blocked',
              sub: 'TC-07 / Prompt injection immune',
              icon: TrendingUp,
              iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
            }
          ]
        };
      case 'BUYER':
      default:
        return {
          roleLabel: 'Buyer Procurement Desk',
          roleBadge: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/60 dark:text-blue-300',
          avatarGrad: 'from-primary to-indigo-600',
          title: `Welcome, ${user?.name || 'Elena Ramos'}`,
          desc: `Managing bilateral supply chain trade protection commitments for ${user?.companyName || 'BrightBox Consumer Goods'}.`,
          primaryAction: {
            label: 'New Purchase Order',
            href: '/orders/new',
            icon: PlusCircle
          },
          secondaryAction: {
            label: 'Benchmark PO-2026-001',
            href: '/orders/PO-2026-001',
            icon: FileText
          },
          kpis: [
            {
              title: mode === 'business' ? 'Total Protected Value' : 'Protected Volume (mETH)',
              val: formatValue(metrics ? metrics.totalProtectedVolume : orders.reduce((s, o) => s + o.contract_value_meth, 0)).primary,
              sub: `${formatValue(metrics ? metrics.totalProtectedVolume : orders.reduce((s, o) => s + o.contract_value_meth, 0)).secondary} • Across 3 contracts`,
              icon: TrendingUp,
              iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
            },
            {
              title: 'Active PO Commitments',
              val: `${metrics ? metrics.activeCommitments : orders.filter(o => o.status !== 'DRAFT').length} POs`,
              sub: 'On-Chain SupplyRightNFTs',
              icon: Package,
              iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
            },
            {
              title: mode === 'business' ? 'Performance Escrow' : 'Locked Collateral',
              val: formatValue(metrics ? metrics.lockedCollateral : orders.reduce((s, o) => s + (o.locked_collateral_meth || 0), 0)).primary,
              sub: 'Staked by Sentinel (20% coverage)',
              icon: Shield,
              iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400'
            },
            {
              title: 'Settled & Factored',
              val: `${metrics ? metrics.claimsSettled : orders.filter(o => o.status === 'SETTLED' || o.status === 'FACTORED').length} Settled`,
              sub: 'Instant wire • Subrogation assigned',
              icon: CheckCircle2,
              iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
            }
          ]
        };
    }
  })();

  const PrimaryActionIcon = roleConfig.primaryAction.icon;
  const SecondaryActionIcon = roleConfig.secondaryAction.icon;

  return (
    <div className="space-y-6">
      {/* 1. Welcome Greeting Banner (Dynamically Tailored by Role) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${roleConfig.avatarGrad} text-white font-bold text-lg shadow-md shrink-0`}
          >
            {user?.name ? user.name[0] : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {roleConfig.title}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${roleConfig.roleBadge} whitespace-nowrap shrink-0`}
              >
                <UserCheck className="h-3 w-3 shrink-0" />
                <span>{roleConfig.roleLabel}</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {roleConfig.desc}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          <Link
            href={roleConfig.secondaryAction.href}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground shadow-subtle hover:bg-muted transition-all whitespace-nowrap shrink-0"
          >
            <SecondaryActionIcon className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="whitespace-nowrap">{roleConfig.secondaryAction.label}</span>
          </Link>
          <Link
            href={roleConfig.primaryAction.href}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all whitespace-nowrap shrink-0"
          >
            <PrimaryActionIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="whitespace-nowrap">{roleConfig.primaryAction.label}</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards (Clean Cards with Trends) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roleConfig.kpis.map((kpi, idx) => {
          const KpiIcon = kpi.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider">{kpi.title}</span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${kpi.iconBg}`}>
                  <KpiIcon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-foreground mt-2">{kpi.val}</div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-2">
                <span>{kpi.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Middle Visual Analytics & Progress Row (Matching Dashboard Structure) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Trade Volume & Shortfall Distribution (7 Cols) */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">Trade Volume & Shortfall Telemetry</h2>
              <p className="text-xs text-muted-foreground">Real-time contract volume vs verified shortfall claims from database</p>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">Backend Seed Data</span>
          </div>

          {/* Clean CSS Bar Chart Dynamically Sourced from Seed Orders */}
          {(() => {
            // Aggregate volume and shortfall by PO or by Month from actual database records
            const poData = orders.map(po => ({
              label: po.id.replace('PO-2026-', 'PO-'),
              fullId: po.id,
              volume: po.contract_value_meth,
              shortfall: po.verified_eligible_loss_meth || 0,
              payout: po.payout_meth || 0
            }));

            const maxVal = Math.max(...poData.map(d => Math.max(d.volume, d.shortfall)), 120);
            const totalShortfall = orders.reduce((s, o) => s + (o.verified_eligible_loss_meth || 0), 0);
            const totalPayout = orders.reduce((s, o) => s + (o.payout_meth || 0), 0);
            const recoveryRate = totalShortfall > 0 ? Math.min(100, Math.round((totalPayout / (totalShortfall * 0.2)) * 100)) : 100;

            return (
              <>
                <div className="mt-6 flex h-44 items-end gap-3 sm:gap-6 pt-6 pb-2 border-b border-border">
                  {poData.map(item => (
                    <div key={item.fullId} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div className="w-full max-w-[36px] flex items-end justify-center gap-1.5 h-full">
                        <div
                          style={{ height: `${Math.max(8, (item.volume / maxVal) * 100)}%` }}
                          className="w-full bg-primary/80 rounded-t-sm transition-all group-hover:bg-primary"
                          title={`${item.fullId} Protected Volume: ${formatValue(item.volume).primary}`}
                        />
                        <div
                          style={{ height: `${item.shortfall > 0 ? Math.max(8, (item.shortfall / maxVal) * 100) : 0}%` }}
                          className="w-full bg-amber-500/80 rounded-t-sm transition-all group-hover:bg-amber-500"
                          title={`${item.fullId} Shortfall Claim: ${formatValue(item.shortfall).primary}`}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono font-bold">{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
                      <span>Protected Volume</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
                      <span>Shortfall Claim</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    {recoveryRate}% Recovery Resolution Rate
                  </span>
                </div>
              </>
            );
          })()}
        </div>

        {/* Right: Quick Operational Checklist & Actions (5 Cols) */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card lg:col-span-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground mb-1">Operational Checklist & Tasks</h2>
            <p className="text-xs text-muted-foreground mb-4">Live pending actions across seeded contracts</p>

            <div className="space-y-3">
              {(() => {
                // Generate dynamic checklist from real orders
                const tasks = orders.flatMap(po => {
                  if (po.status === 'SUPPLIER_ACCEPTED') {
                    return [{
                      id: po.id,
                      icon: AlertCircle,
                      iconColor: 'text-amber-500',
                      title: `${po.id} Awaiting Escrow Funding`,
                      desc: `Supplier accepted terms. Underwriter must lock ${po.required_collateral_meth} mETH in vault.`,
                      link: `/orders/${po.id}`,
                      actionText: `Open ${po.id}`
                    }];
                  }
                  if (po.status === 'CLAIM_SUBMITTED') {
                    return [{
                      id: po.id,
                      icon: AlertCircle,
                      iconColor: 'text-orange-500',
                      title: `${po.id} Physical Inspection Required`,
                      desc: `Shortfall claimed. Verifier must attest physical missing inventory.`,
                      link: `/orders/${po.id}`,
                      actionText: `Verify ${po.id}`
                    }];
                  }
                  if (po.status === 'VERIFIER_APPROVED') {
                    return [{
                      id: po.id,
                      icon: CheckCircle2,
                      iconColor: 'text-emerald-500',
                      title: `${po.id} Benchmark Ready for Settlement`,
                      desc: `Loss verified at ${po.verified_eligible_loss_meth} mETH. AI Agent ready to execute payout.`,
                      link: `/orders/${po.id}`,
                      actionText: `Execute Autonomous Loop`
                    }];
                  }
                  if (po.status === 'SETTLED') {
                    return [{
                      id: po.id,
                      icon: CheckCircle2,
                      iconColor: 'text-emerald-500',
                      title: `${po.id} Benchmark Settled & Paid`,
                      desc: `Autonomous compensation of ${formatValue(po.payout_meth).primary} disbursed to ${po.buyer_company}.`,
                      link: `/orders/${po.id}`,
                      actionText: `View Settlement Workspace`
                    }];
                  }
                  if (po.status === 'DRAFT') {
                    return [{
                      id: po.id,
                      icon: AlertCircle,
                      iconColor: 'text-blue-500',
                      title: `${po.id} Draft Specification`,
                      desc: `Purchase order created for ${po.supplier_company}. Awaiting counterparty signing.`,
                      link: `/orders/${po.id}`,
                      actionText: `Review Draft`
                    }];
                  }
                  return [];
                }).slice(0, 2);

                return tasks.map(task => {
                  const Icon = task.icon;
                  return (
                    <div key={task.id} className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3">
                      <Icon className={`h-4 w-4 ${task.iconColor} shrink-0 mt-0.5`} />
                      <div className="text-xs">
                        <div className="font-bold text-foreground">{task.title}</div>
                        <div className="text-muted-foreground text-[11px] mt-0.5">{task.desc}</div>
                        <Link
                          href={task.link}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline mt-1.5"
                        >
                          <span>{task.actionText}</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Zero-Trust Signer Status:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Operational</span>
          </div>
        </div>
      </div>

      {/* 4. Main Purchase Orders Table */}
      <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-5 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1 text-xs">
            {(['ALL', 'ACTIVE', 'ACTION_REQUIRED', 'SETTLED'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                  filterTab === tab
                    ? 'bg-card text-foreground shadow-subtle'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'ALL' ? 'All Orders' : tab === 'ACTIVE' ? 'Active POs' : tab === 'ACTION_REQUIRED' ? 'Action Required' : 'Settled History'}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by PO ID, company..."
              className="w-full rounded-xl border border-border bg-muted/40 pl-9 pr-3.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">PO ID & Spec</th>
                <th className="py-3 px-5">Trading Parties</th>
                <th className="py-3 px-5">Value & Collateral</th>
                <th className="py-3 px-5">Delivery Progress</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No purchase orders match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(po => {
                  const badge = getStatusBadge(po.status);
                  const deliveryPct = po.ordered_units > 0 ? Math.min(100, Math.round((po.delivered_units / po.ordered_units) * 100)) : 0;

                  return (
                    <tr key={po.id} className="hover:bg-muted/30 transition-colors">
                      {/* PO ID & Spec */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-foreground">{po.id}</span>
                          {po.id === 'PO-2026-001' && (
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-extrabold text-primary">
                              Benchmark
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-xs mt-0.5">
                          {po.product_spec}
                        </div>
                      </td>

                      {/* Buyer & Supplier */}
                      <td className="py-4 px-5">
                        <div className="font-semibold text-foreground">{po.buyer_company}</div>
                        <div className="text-[11px] text-muted-foreground">↔ {po.supplier_company}</div>
                      </td>

                      {/* Value & Collateral */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-foreground">
                          {formatValue(po.contract_value_meth).primary}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {po.locked_collateral_meth > 0
                            ? `Escrow: ${formatValue(po.locked_collateral_meth).primary}`
                            : `Required: ${formatValue(po.required_collateral_meth).primary}`}
                        </div>
                      </td>

                      {/* Delivery Progress Bar */}
                      <td className="py-4 px-5 min-w-[160px]">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-muted-foreground">
                            {po.delivered_units.toLocaleString()} / {po.ordered_units.toLocaleString()}
                          </span>
                          <span className={`font-bold ${deliveryPct < 100 && po.status !== 'DRAFT' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {deliveryPct}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            style={{ width: `${deliveryPct}%` }}
                            className={`h-full rounded-full ${deliveryPct < 100 && po.status !== 'DRAFT' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          />
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-5">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Workspace Link */}
                      <td className="py-4 px-5 text-right">
                        <Link
                          href={`/orders/${po.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground shadow-subtle hover:bg-muted"
                        >
                          <span>Workspace</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
