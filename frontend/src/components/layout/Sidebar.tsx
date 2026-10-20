'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileSpreadsheet,
  PlusCircle,
  Bot,
  ShieldAlert,
  History,
  LogOut,
  ShieldCheck,
  Building2,
  ExternalLink,
  Home,
  CheckCircle2,
  X,
  KeyRound,
  Users,
  Package,
  FlaskConical
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onCloseMobile }) => {
  const { user, activeRole, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'BUYER':
        return { label: 'Buyer (Procurement)', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800' };
      case 'SUPPLIER':
        return { label: 'Supplier (Vendor)', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' };
      case 'PROVIDER':
        return { label: 'Underwriter (Capital)', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800' };
      case 'VERIFIER':
        return { label: 'Inspector (Logistics)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' };
      case 'JUDGE':
      default:
        return { label: 'Evaluator (Auditor)', color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800' };
    }
  };

  const badge = getRoleBadgeStyle(activeRole);

  const isItemActive = (itemPath: string) => {
    if (itemPath === '/dashboard') {
      return pathname === '/dashboard';
    }
    if (itemPath === '/orders/new') {
      return pathname === '/orders/new';
    }
    if (itemPath.startsWith('/orders/')) {
      return Boolean(pathname?.startsWith('/orders/') && pathname !== '/orders/new');
    }
    return pathname === itemPath;
  };

  const mainNav = [
    { label: 'Overview & Orders', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Order Workspace', path: '/orders/PO-2026-001', icon: FileSpreadsheet },
    { label: 'Create Purchase Order', path: '/orders/new', icon: PlusCircle },
  ];

  const intelligenceNav = [
    { label: 'Settlement Copilot', path: '/copilot', icon: Bot },
    { label: 'Audit & Ledger Records', path: '/audit', icon: History },
  ];

  const judgeLabNav = [
    { label: 'Threat & Policy Lab', path: '/security-lab', icon: FlaskConical },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-screen max-h-screen w-64 min-w-[16rem] shrink-0 flex-col justify-between border-r border-border bg-card p-4 transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:z-30 lg:translate-x-0 overflow-hidden ${
        isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col flex-1 overflow-y-auto overscroll-contain pr-1">
        {/* Brand Header */}
        <div className="pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              onClick={() => onCloseMobile?.()}
              className="flex items-center gap-2.5 group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-card border border-border shadow-sm overflow-hidden p-0.5 transition-transform group-hover:scale-105 shrink-0">
                <img
                  src="/logo.png"
                  alt="SupplyRight AI"
                  width={32}
                  height={32}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <div className="text-base font-extrabold tracking-tight text-foreground">
                  SupplyRight<span className="text-primary font-bold">.ai</span>
                </div>
                <div className="text-[11px] font-medium text-muted-foreground">
                  Autonomous Escrow • Sepolia
                </div>
              </div>
            </Link>

            {/* Mobile Close Button */}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Active Persona Pill */}
          <div className="mt-3.5 rounded-lg border border-border bg-muted/40 p-2.5 text-xs space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="font-semibold text-foreground truncate">
                  {user?.companyName || 'BrightBox Consumer Goods'}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 whitespace-nowrap ${badge.color}`}>
                {activeRole}
              </span>
            </div>
            <div className="text-[10.5px] font-medium text-muted-foreground flex items-center justify-between border-t border-border/60 pt-1">
              <span className="truncate pr-1">
                {activeRole === 'BUYER' && 'Procurement & Escrow'}
                {activeRole === 'SUPPLIER' && 'Vendor Fulfillment & Factoring'}
                {activeRole === 'PROVIDER' && 'Underwriting & Vault Reserves'}
                {activeRole === 'VERIFIER' && 'SGS Quality Attestations'}
                {activeRole === 'JUDGE' && 'FinTechathon Evaluation Sandbox'}
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="mt-5 space-y-6">
          {/* Main Procurement Menu */}
          <div>
            <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
              Procurement & Orders
            </div>
            <nav className="space-y-1">
              {mainNav.map(item => {
                const isActive = isItemActive(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => onCloseMobile?.()}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary font-bold shadow-subtle border border-primary/20'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Operational Intelligence (Business Copilot & Ledger) */}
          <div>
            <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center justify-between">
              <span>Operational Intelligence</span>
            </div>
            <nav className="space-y-1">
              {intelligenceNav.map(item => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => onCloseMobile?.()}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary font-bold shadow-subtle border border-primary/20'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Hackathon Evaluation & Judge Sandbox (Dedicated Isolated Category) */}
          <div className="pt-3 border-t border-dashed border-border/80">
            <div className="px-2 mb-2 flex items-center justify-between gap-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider truncate ${
                activeRole === 'JUDGE' ? 'text-rose-600 dark:text-rose-400 font-extrabold' : 'text-muted-foreground/80'
              }`}>
                Evaluation & Lab
              </span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 whitespace-nowrap shrink-0">
                Topic F
              </span>
            </div>
            <nav className="space-y-1">
              {judgeLabNav.map(item => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => onCloseMobile?.()}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold shadow-subtle border border-rose-500/30'
                        : 'text-muted-foreground hover:bg-rose-500/5 hover:text-foreground border border-transparent'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-rose-500' : 'text-muted-foreground'}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="px-2 mt-1.5 text-[9.5px] text-muted-foreground/70 leading-tight">
              Deterministic attack vectors & Topic F verification harness for evaluators.
            </div>
          </div>

          {/* Direct Link to Login / Switch Role */}
          <div className="pt-2 border-t border-border/60 space-y-1">
            <Link
              href="/login"
              onClick={() => onCloseMobile?.()}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition-all border border-primary/20"
            >
              <KeyRound className="h-4 w-4 text-primary" />
              <span>Switch Persona / Sign In</span>
            </Link>

            {/* Quick link to Landing Page */}
            <Link
              href="/"
              onClick={() => onCloseMobile?.()}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <Home className="h-4 w-4 text-muted-foreground" />
              <span>Back to Landing Page</span>
            </Link>
          </div>
        </div>
      </div>

      {/* User Footer Card */}
      <div className="border-t border-border pt-3 mt-auto">
        <div className="flex items-center justify-between rounded-xl p-2 bg-muted/30">
          <Link
            href="/login"
            onClick={() => onCloseMobile?.()}
            className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity"
            title="Click to switch persona in Login Portal"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary text-xs shrink-0">
              {user?.name ? user.name[0] : 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-foreground truncate">
                {user?.name || 'Alice Walker'}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {user?.email || 'buyer@brightbox.io'}
              </div>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="text-muted-foreground transition-colors hover:text-destructive p-1.5 rounded-lg hover:bg-muted"
            title="Log out and go to Login Portal"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
