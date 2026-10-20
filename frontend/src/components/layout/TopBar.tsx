'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  RotateCcw,
  Bot,
  Shield,
  Copy,
  Check,
  Sun,
  Moon,
  Briefcase,
  Binary,
  Menu,
  User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useViewMode } from '@/context/ViewModeContext';
import { UserRole } from '@/types';

interface TopBarProps {
  onToggleCopilot: () => void;
  isCopilotOpen: boolean;
  onResetFixture?: () => void;
  isResetting?: boolean;
  onToggleMobileSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleCopilot,
  isCopilotOpen,
  onResetFixture,
  isResetting,
  onToggleMobileSidebar,
}) => {
  const { activeRole, loginAsPersona, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { mode, toggleMode } = useViewMode();
  const [copied, setCopied] = useState(false);

  const signerAddress = '0x8a3C00000000000000000000000000000000Bde6';

  const copyAddress = () => {
    navigator.clipboard.writeText(signerAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const personas: { role: UserRole; label: string; desc: string; activeColor: string }[] = [
    { role: 'BUYER', label: 'Buyer', desc: 'BrightBox', activeColor: 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300' },
    { role: 'SUPPLIER', label: 'Supplier', desc: 'PackagePro', activeColor: 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300' },
    { role: 'PROVIDER', label: 'Underwriter', desc: 'Sentinel', activeColor: 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300' },
    { role: 'VERIFIER', label: 'Inspector', desc: 'SGS', activeColor: 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300' },
    { role: 'JUDGE', label: 'Judge', desc: 'Sandbox', activeColor: 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300' },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/95 backdrop-blur-md px-3 sm:px-6 shadow-subtle transition-colors duration-200 gap-2">
      {/* Left: Mobile Toggle & Role Simulator */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Drawer Button */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        {/* Brand preview on small screens */}
        <div className="flex items-center gap-1.5 lg:hidden shrink-0">
          <img src="/logo.png" alt="Logo" width={28} height={28} className="h-7 w-7 rounded-lg object-contain border border-border shrink-0" />
          <span className="text-xs font-bold text-foreground hidden sm:inline">SupplyRight</span>
        </div>

        {/* Desktop Role Pills (Shown on lg+) */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Role:
          </span>
          <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/50 p-1">
            {personas.map(p => {
              const isSelected = activeRole === p.role;
              return (
                <button
                  key={p.role}
                  onClick={() => loginAsPersona(p.role)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all whitespace-nowrap ${
                    isSelected
                      ? `${p.activeColor} shadow-sm border font-bold ring-1 ring-primary/20`
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/40 border border-transparent'
                  }`}
                >
                  <span>{p.label}</span>
                  <span className="hidden 2xl:inline text-[10px] opacity-70">({p.desc})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact Role Selector Dropdown (Shown on screens < lg) */}
        <div className="flex lg:hidden items-center">
          <select
            value={activeRole}
            onChange={(e) => loginAsPersona(e.target.value as UserRole)}
            className="rounded-lg border border-border bg-card px-2 py-1 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
            aria-label="Select role simulation"
          >
            {personas.map(p => (
              <option key={p.role} value={p.role}>
                {p.label} ({p.desc})
              </option>
            ))}
          </select>
        </div>

        {/* Dual Mode Switcher (Business USD vs Web3 Telemetry) */}
        <button
          onClick={toggleMode}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold transition-all ${
            mode === 'business'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
          }`}
          title="Toggle between Business ($ USD) and Blockchain Telemetry (Web3)"
        >
          {mode === 'business' ? <Briefcase className="h-3 w-3 shrink-0" /> : <Binary className="h-3 w-3 shrink-0" />}
          <span className="hidden sm:inline">{mode === 'business' ? 'Business View ($)' : 'Telemetry (Web3)'}</span>
          <span className="sm:hidden">{mode === 'business' ? '$ USD' : 'Web3'}</span>
        </button>
      </div>

      {/* Right: Actions, Theme Toggle, Copilot, Signer Telemetry */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Signer Custody Status Pill (Only on large desktop 2xl to prevent squishing) */}
        <div className="hidden 2xl:flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground shrink-0">
          <span className="text-[11px] font-semibold">
            {mode === 'business' ? 'Custody Agent:' : 'Signer:'}
          </span>
          <span className="font-mono text-primary font-bold">
            {mode === 'business' ? 'Zero-Trust Active' : '0x8a3C...Bde6'}
          </span>
          <button
            onClick={copyAddress}
            className="text-muted-foreground transition-colors hover:text-foreground"
            title="Copy Isolated Signer Address"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* 7 Policy Gates Badge */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400 shrink-0">
          <Shield className="h-3.5 w-3.5" />
          <span>7/7 Hard Gates</span>
        </div>

        {/* Reset Fixture Button */}
        <button
          onClick={onResetFixture}
          disabled={isResetting}
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground shadow-subtle transition-all hover:bg-muted hover:text-foreground disabled:opacity-50 shrink-0"
          title="Reset database fixture to PO-2026-001 canonical state"
        >
          <RotateCcw className={`h-3.5 w-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">{isResetting ? 'Resetting...' : 'Reset Fixture'}</span>
        </button>

        {/* Direct Link to Login / Auth Portal */}
        <Link
          href="/login"
          className="hidden md:flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all shrink-0"
          title="Go to Authentication & Persona Portal"
        >
          <User className="h-3.5 w-3.5 text-primary" />
          <span>Sign In</span>
        </Link>

        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:bg-muted hover:text-foreground shrink-0"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-400" />}
        </button>

        {/* AI Wallet Copilot Toggle Button - NEVER TRUNCATES */}
        <button
          onClick={onToggleCopilot}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all shadow-sm whitespace-nowrap ${
            isCopilotOpen
              ? 'bg-primary text-primary-foreground shadow-primary/20'
              : 'border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20'
          }`}
        >
          <Bot className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">AI Wallet Copilot</span>
          <span className="sm:hidden">Copilot</span>
        </button>
      </div>
    </header>
  );
};
