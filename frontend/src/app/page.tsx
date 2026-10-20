'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Lock,
  Cpu,
  Layers,
  Sparkles,
  ChevronRight,
  Sun,
  Moon,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Building2,
  DollarSign,
  Scale,
  RefreshCw,
  Box,
  Truck,
  ClipboardCheck,
  Menu,
  X,
  User,
  KeyRound
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useViewMode } from '@/context/ViewModeContext';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const { mode, toggleMode, formatValue } = useViewMode();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Interactive Calculator State
  const [calcOrderValue, setCalcOrderValue] = useState(100000);
  const [calcOrderedUnits, setCalcOrderedUnits] = useState(10000);
  const [calcDeliveredUnits, setCalcDeliveredUnits] = useState(2000);
  const [calcCoverageRate, setCalcCoverageRate] = useState(20);

  // Derived calculations
  const shortfallUnits = Math.max(0, calcOrderedUnits - calcDeliveredUnits);
  const shortfallPct = calcOrderedUnits > 0 ? (shortfallUnits / calcOrderedUnits) : 0;
  const verifiedLoss = calcOrderValue * shortfallPct;
  const maxCollateral = calcOrderValue * (calcCoverageRate / 100);
  const calculatedPayout = Math.min(verifiedLoss * (calcCoverageRate / 100), maxCollateral);
  const remainingRefund = Math.max(0, maxCollateral - calculatedPayout);
  const subrogationClaim = verifiedLoss;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* 1. Global Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-card border border-border/80 shadow-xs overflow-hidden p-1 transition-transform group-hover:scale-105 shrink-0">
              <img
                src="/logo.png"
                alt="SupplyRight AI Logo"
                width={32}
                height={32}
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-lg font-black tracking-tight text-foreground">
              SupplyRight<span className="text-primary font-bold">.ai</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-1 lg:gap-2 text-sm font-medium md:flex">
            <a
              href="#how-it-works"
              className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#three-way-matching"
              className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              Three-Way Matching
            </a>
            <a
              href="#calculator"
              className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              Simulator
            </a>
            <a
              href="#security"
              className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              Zero-Trust Security
            </a>
            <Link
              href="/audit"
              className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              Audit Ledger
            </Link>
          </nav>

          {/* Action Buttons & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-400" />}
            </button>

            {/* Direct Sign In Button */}
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
            >
              <User className="h-4 w-4 text-primary" />
              <span>Sign In</span>
            </Link>

            {/* Launch App Button */}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-95 whitespace-nowrap"
            >
              <span>Launch Portal</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground transition-all hover:bg-muted hover:text-foreground md:hidden"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="border-b border-border bg-card/98 px-4 py-4 md:hidden shadow-lg backdrop-blur-md transition-all">
            <nav className="flex flex-col gap-2 text-sm font-medium">
              <a
                href="#how-it-works"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                How It Works
              </a>
              <a
                href="#three-way-matching"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Three-Way Matching
              </a>
              <a
                href="#calculator"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Simulator
              </a>
              <a
                href="#security"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Zero-Trust Security
              </a>
              <Link
                href="/audit"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                On-Chain Audit Ledger
              </Link>
              <Link
                href="/security-lab"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Security & Threat Lab
              </Link>

              <div className="pt-3 border-t border-border flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/60 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  <KeyRound className="h-4 w-4 text-primary" />
                  <span>Sign In / Select Role</span>
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  <span>Launch Enterprise Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* Soft background ambient gradient */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Main Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl sm:leading-[1.12]">
              Autonomous Trade Protection & Real-Time Settlement for{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-primary bg-clip-text text-transparent">
                Global Supply Chains
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Eliminate 90–180 day supplier non-delivery disputes. SupplyRight AI combines multi-source
              <strong> Three-Way Matching</strong>, independent <strong>7 Policy Hard Gates</strong>, and institutional
              performance escrows to disburse verified compensation payouts in seconds.
            </p>

            {/* Hero CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/95 hover:scale-[1.02]"
              >
                <span>Launch Enterprise Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/orders/PO-2026-001"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-base font-semibold text-foreground shadow-sm transition-all hover:bg-muted hover:border-muted-foreground/30"
              >
                <FileCheck2 className="h-4 w-4 text-primary" />
                <span>Simulate Benchmark PO-2026-001</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="mt-16 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:grid-cols-4 sm:p-8">
            <div className="border-r border-border/60 pr-4 last:border-none">
              <div className="text-2xl font-black text-foreground sm:text-3xl">$100,000</div>
              <div className="mt-1 text-xs font-medium text-muted-foreground">PO Benchmark Contract Value</div>
            </div>
            <div className="border-r border-border/60 pr-4 last:border-none">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 sm:text-3xl">&lt; 30 Seconds</div>
              <div className="mt-1 text-xs font-medium text-muted-foreground">Autonomous Settlement (vs 90d)</div>
            </div>
            <div className="border-r border-border/60 pr-4 last:border-none">
              <div className="text-2xl font-black text-primary sm:text-3xl">7/7 Hard Gates</div>
              <div className="mt-1 text-xs font-medium text-muted-foreground">Deterministic Policy Gating</div>
            </div>
            <div className="pr-4">
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 sm:text-3xl">$0 Risk</div>
              <div className="mt-1 text-xs font-medium text-muted-foreground">Zero-Hallucination Isolated Signer</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Three-Way Matching Section (Resolving Collusion & Garbage-In, Garbage-Out) */}
      <section id="three-way-matching" className="border-y border-border bg-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
              Anti-Collusion Architecture
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Three-Way Matching Eliminates Fraud & False Claims
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Traditional trade finance collapses when buyers and warehouse inspectors collude. SupplyRight AI
              triangulates purchase commitments with carrier factory gate dispatch manifests and accredited intake tallies.
            </p>
          </div>

          {/* 3 Matching Pillars */}
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {/* Pillar 1: Purchase Order */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-4">
                <Box className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step 1 • Procurement</span>
              <h3 className="mt-1 text-lg font-bold text-foreground">Purchase Order Spec</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Registered on-chain with exact batch counts (10,000 units), milestone deadlines, and mutual UNCITRAL MLETR subrogation assignment.
              </p>
              <div className="mt-4 rounded-lg bg-muted p-3 text-xs font-mono text-foreground">
                PO #PO-2026-001 • 10,000 boxes
              </div>
            </div>

            {/* Pillar 2: Carrier BOL */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mb-4">
                <Truck className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step 2 • Logistics</span>
              <h3 className="mt-1 text-lg font-bold text-foreground">Carrier Dispatch (BOL)</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Carrier telemetry (DHL Freight) logs exact units released at factory gate (2,000 units). Proves factory under-delivery independently.
              </p>
              <div className="mt-4 rounded-lg bg-muted p-3 text-xs font-mono text-foreground">
                BOL #DHL-8892 • 2,000 picked up
              </div>
            </div>

            {/* Pillar 3: SGS Verification */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-4">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step 3 • Verification</span>
              <h3 className="mt-1 text-lg font-bold text-foreground">SGS Receiving Intake</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Accredited physical intake inspector attests arrival tally at buyer warehouse dock. Attestation hash signed to ClaimManager.sol.
              </p>
              <div className="mt-4 rounded-lg bg-muted p-3 text-xs font-mono text-foreground">
                SGS #REC-402 • 8,000 shortfall
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Live Interactive Shortfall & Payout Simulator */}
      <section id="calculator" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Interactive Financial Engine
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Simulate Trade Protection Payouts in Real Time
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Drag the sliders below to test how the Zero-Hallucination Policy Engine calculates payouts, collateral bounds, and assignable subrogation claims.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-12 items-start">
            {/* Sliders Control Card (Left 7 Cols) */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm lg:col-span-7">
              <h3 className="text-base font-bold text-foreground mb-6 flex items-center justify-between">
                <span>Contract & Delivery Parameters</span>
                <span className="text-xs font-normal text-muted-foreground">Dynamic Simulation</span>
              </h3>

              <div className="space-y-6">
                {/* 1. Order Contract Value */}
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-muted-foreground">Total Purchase Order Value</span>
                    <span className="text-foreground">${calcOrderValue.toLocaleString()} USD</span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="500000"
                    step="5000"
                    value={calcOrderValue}
                    onChange={e => setCalcOrderValue(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                    <span>$10,000</span>
                    <span>$500,000</span>
                  </div>
                </div>

                {/* 2. Ordered Units */}
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-muted-foreground">Contracted Quantity</span>
                    <span className="text-foreground">{calcOrderedUnits.toLocaleString()} units</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="50000"
                    step="1000"
                    value={calcOrderedUnits}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setCalcOrderedUnits(val);
                      if (calcDeliveredUnits > val) setCalcDeliveredUnits(val);
                    }}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>

                {/* 3. Delivered Units */}
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-muted-foreground">Actual Units Delivered at Dock</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {calcDeliveredUnits.toLocaleString()} units ({((calcDeliveredUnits / calcOrderedUnits) * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={calcOrderedUnits}
                    step="500"
                    value={calcDeliveredUnits}
                    onChange={e => setCalcDeliveredUnits(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                    <span>0 (Total Failure)</span>
                    <span>{calcOrderedUnits.toLocaleString()} (Full Delivery)</span>
                  </div>
                </div>

                {/* 4. Protection Coverage Rate */}
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-muted-foreground">Protection Coverage Rate</span>
                    <span className="text-primary font-bold">{calcCoverageRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={calcCoverageRate}
                    onChange={e => setCalcCoverageRate(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                    <span>10% (Low Escrow)</span>
                    <span>50% (High Guarantee)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Live Breakdown (Right 5 Cols) */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:p-8 lg:col-span-5">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Deterministic Settlement Output
              </span>
              <h3 className="mt-1 text-xl font-extrabold text-foreground">Financial Arithmetic</h3>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-card p-3.5 border border-border">
                  <span className="text-xs font-medium text-muted-foreground">Delivery Shortfall Deficit</span>
                  <span className="text-sm font-bold text-destructive">
                    {shortfallUnits.toLocaleString()} units ({((shortfallPct) * 100).toFixed(0)}%)
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-card p-3.5 border border-border">
                  <span className="text-xs font-medium text-muted-foreground">Verified Eligible Loss</span>
                  <span className="text-sm font-bold text-foreground">
                    ${verifiedLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-card p-3.5 border border-border">
                  <span className="text-xs font-medium text-muted-foreground">Performance Escrow (Staked)</span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    ${maxCollateral.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
                  </span>
                </div>

                {/* Primary Payout Highlight */}
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4">
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    Instant Buyer Compensation Payout
                  </div>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    ${calculatedPayout.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    min(Loss × Coverage, Collateral) = Instant wire to buyer
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-card p-3.5 border border-border">
                  <span className="text-xs font-medium text-muted-foreground">Underwriter Escrow Refund</span>
                  <span className="text-sm font-bold text-foreground">
                    ${remainingRefund.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-card p-3.5 border border-border">
                  <span className="text-xs font-medium text-muted-foreground">Subrogation NFT Certificate</span>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    ${subrogationClaim.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
                  </span>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
              >
                <span>Execute Scenario in Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Zero-Trust Architecture: 3-Tier Separation of Powers */}
      <section id="security" className="border-t border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
              Zero-Trust Security Architecture
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Zero-Trust Architecture & Separation of Powers
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Giving an AI direct access to private keys or smart contract execution creates existential risk.
              SupplyRight AI enforces a strict three-tier quarantine where code is law.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 mb-4">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Tier 1: Cognitive Agent</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Reads multi-source delivery proofs and formulates typed proposal JSONs. Has ZERO access to private keys or arbitrary execution tools.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 mb-4">
                <Scale className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Tier 2: 7 Policy Hard Gates</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Deterministic code outside the LLM. Verifies Sepolia Chain ID, target allowlist, function selectors, role authority, nonce freshness, and SGS attestation.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 mb-4">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Tier 3: Isolated Signer</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Quarantined signing daemon that only signs transactions accompanied by a cryptographically signed ALLOW verdict from the Policy Engine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Enterprise Ecosystem Partners */}
      <section className="py-16 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Multi-Party Commercial Participants & Institutional Partners
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-80">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Building2 className="h-4 w-4 text-primary" /> BrightBox Consumer Goods (Buyer)
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Box className="h-4 w-4 text-amber-500" /> PackagePro Domestic (Supplier)
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <ShieldCheck className="h-4 w-4 text-purple-500" /> Sentinel Trade Capital (Underwriter)
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <ClipboardCheck className="h-4 w-4 text-emerald-500" /> SGS Logistics Inspection (Verifier)
            </div>
          </div>
        </div>
      </section>

      {/* 7. Call to Action Banner */}
      <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ready to Protect Your Commercial Supply Chain?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-primary-foreground/80">
            Simulate a purchase order, test prompt injection security defenses, or view atomic settlement on Ethereum Sepolia.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-background px-6 py-3 text-sm font-bold text-foreground shadow-md transition-all hover:bg-background/90"
            >
              <span>Launch B2B Portal</span>
              <ArrowRight className="h-4 w-4 text-primary" />
            </Link>
            <Link
              href="/security-lab"
              className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/30 bg-primary-foreground/10 px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary-foreground/20"
            >
              <span>Security & Threat Lab</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Modern Footer */}
      <footer className="border-t border-border bg-card py-12 text-sm text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-card border border-border shadow-xs overflow-hidden p-0.5 shrink-0">
              <img src="/logo.png" alt="SupplyRight AI" width={24} height={24} className="h-full w-full object-contain" />
            </div>
            <span className="font-bold text-foreground">SupplyRight.ai</span>
            <span>• Autonomous On-Chain Protection Engine</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 text-xs">
            <Link href="/login" className="hover:text-primary font-semibold transition-colors">Sign In / Role Access</Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Workspace</Link>
            <Link href="/audit" className="hover:text-foreground transition-colors">Audit Ledger</Link>
            <Link href="/security-lab" className="hover:text-foreground transition-colors">Compliance Lab</Link>
            <a href="https://sepolia.etherscan.io" target="_blank" rel="noreferrer" className="hover:text-foreground inline-flex items-center gap-1 transition-colors">
              <span>Sepolia Etherscan</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
