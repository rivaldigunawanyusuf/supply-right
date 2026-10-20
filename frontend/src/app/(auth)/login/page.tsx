'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Cpu,
  Layers,
  Key,
  ChevronLeft,
  Package,
  Factory,
  Shield,
  Search,
  Scale
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

export default function LoginPage() {
  const { login, register, loginAsPersona, allPersonas } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'personas' | 'signin' | 'register'>('personas');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState<UserRole>('BUYER');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Invalid email or password.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const success = await register({
      name,
      companyName,
      email,
      password,
      role
    });
    setLoading(false);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Registration failed. Email may already be in use.');
    }
  };

  const handlePersonaSelect = async (personaRole: UserRole) => {
    setLoading(true);
    const success = await loginAsPersona(personaRole);
    setLoading(false);
    if (success) {
      router.push('/dashboard');
    }
  };

  const personaMeta: Record<
    UserRole,
    { title: string; subtitle: string; desc: string; Icon: React.ComponentType<{ className?: string }>; badgeClass: string }
  > = {
    BUYER: {
      title: 'Elena Ramos',
      subtitle: 'BrightBox Consumer Goods',
      desc: 'SME Buyer ordering goods, logging dock receipts, and triggering autonomous shortfall recovery.',
      Icon: Package,
      badgeClass: 'bg-primary/10 text-primary border-primary/20'
    },
    SUPPLIER: {
      title: 'Marcus Chen',
      subtitle: 'PackagePro Domestic',
      desc: 'Packaging Manufacturer accepting contract terms, minting SupplyRightNFT, and logging shipments.',
      Icon: Factory,
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    },
    PROVIDER: {
      title: 'Sarah Jenkins',
      subtitle: 'Sentinel Protection Vault',
      desc: 'Institutional risk provider locking mETH collateral and automatically receiving refunds on settlement.',
      Icon: Shield,
      badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
    },
    VERIFIER: {
      title: 'Captain David Meyer',
      subtitle: 'SGS Global Logistics Inspection',
      desc: 'Accredited physical verifier attesting shortfall quantity without exposure to autonomous signing keys.',
      Icon: Search,
      badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    },
    JUDGE: {
      title: 'Hackathon Evaluator',
      subtitle: 'Topic F Benchmark Inspector',
      desc: 'Unrestricted access to run prompt-injection attacks, 10 security test vectors, and simulate edge cases.',
      Icon: Scale,
      badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
            <div className="w-10 h-10 rounded-xl bg-card border border-border shadow-sm flex items-center justify-center overflow-hidden p-0.5 transition-transform group-hover:scale-105 shrink-0">
              <img
                src="/logo.png"
                alt="SupplyRight AI"
                width={36}
                height={36}
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-foreground">
              SupplyRight<span className="text-primary font-bold">.ai</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            B2B Autonomous Settlement Portal
          </h1>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Choose a pre-provisioned enterprise role for live simulation or authenticate with custom corporate credentials.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex rounded-xl bg-muted p-1 max-w-md mx-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('personas')}
            className={`flex-1 py-2 rounded-lg transition ${
              activeTab === 'personas'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            One-Click Roles
          </button>
          <button
            onClick={() => setActiveTab('signin')}
            className={`flex-1 py-2 rounded-lg transition ${
              activeTab === 'signin'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Corporate Sign In
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 rounded-lg transition ${
              activeTab === 'register'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            New Registration
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium text-center max-w-md mx-auto">
            {error}
          </div>
        )}

        {/* Persona Switcher Tab */}
        {activeTab === 'personas' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(['BUYER', 'SUPPLIER', 'PROVIDER', 'VERIFIER'] as UserRole[]).map(r => {
              const meta = personaMeta[r];
              const IconComp = meta.Icon;
              return (
                <button
                  key={r}
                  onClick={() => handlePersonaSelect(r)}
                  disabled={loading}
                  className="bg-card hover:bg-muted/40 border border-border hover:border-primary/40 rounded-xl p-5 text-left transition-all shadow-sm hover:shadow-md flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-muted text-foreground">
                        <IconComp className="w-4 h-4 text-primary" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${meta.badgeClass}`}>
                        {r}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {meta.title}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                      {meta.subtitle}
                    </div>
                    <p className="text-[11.5px] text-muted-foreground/90 leading-relaxed">
                      {meta.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary pt-2 border-t border-border/50">
                    <span>Launch Role Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}

            {/* Special Judge Evaluator Card */}
            <div className="sm:col-span-2">
              <button
                onClick={() => handlePersonaSelect('JUDGE')}
                disabled={loading}
                className="w-full bg-card hover:bg-rose-500/5 border border-rose-500/30 hover:border-rose-500/50 rounded-xl p-5 text-left transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">
                      <Scale className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                      Topic F Hackathon Judge Evaluator
                    </span>
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    Benchmark Test Runner & Red-Team Adversarial Suite
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Inspect 7 Policy Hard Gates, run 10 attack vectors, and verify isolated signing key security.
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold shadow-sm self-start sm:self-auto flex-shrink-0">
                  <span>Enter Security Lab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Corporate Sign In Form */}
        {activeTab === 'signin' && (
          <div className="bg-card rounded-xl border border-border shadow-sm p-6 max-w-md mx-auto w-full">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Corporate Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to SupplyRight'}
              </button>
            </form>
          </div>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <div className="bg-card rounded-xl border border-border shadow-sm p-6 max-w-md mx-auto w-full">
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Alex Rivera"
                  className="w-full px-3.5 py-2 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                  Corporate Entity
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  required
                  placeholder="Apex Global Trading LLC"
                  className="w-full px-3.5 py-2 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                  Corporate Role
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                >
                  <option value="BUYER">Buyer (Procuring Goods)</option>
                  <option value="SUPPLIER">Supplier (Manufacturer / Exporter)</option>
                  <option value="PROVIDER">Underwriter (Trade Credit Escrow)</option>
                  <option value="VERIFIER">Logistics Inspector (SGS / Surveyor)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                  Corporate Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="alex@apex.com"
                  className="w-full px-3.5 py-2 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm transition disabled:opacity-50 mt-2"
              >
                {loading ? 'Creating Account...' : 'Register Corporate Entity'}
              </button>
            </form>
          </div>
        )}

        <div className="flex items-center justify-center gap-6 pt-2">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground font-semibold inline-flex items-center gap-1 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" /> Return to Public Landing Page
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <Link href="/dashboard" className="text-xs text-primary hover:text-primary/80 font-semibold inline-flex items-center gap-1 transition-colors">
            <span>Direct to Dashboard</span> <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
