'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { CopilotDrawer } from '@/components/layout/CopilotDrawer';
import { JudgeSandboxDrawer } from '@/components/layout/JudgeSandboxDrawer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const router = useRouter();

  const handleResetFixture = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        window.dispatchEvent(new Event('supplyright_state_updated'));
      }
    } catch {
      console.warn('Reset failed');
    } finally {
      setIsResetting(false);
    }
  };

  const handleCopilotAction = (action: string, params?: any) => {
    if (action === 'VIEW_ORDER' && params?.poId) {
      router.push(`/orders/${params.poId}`);
    } else if (action === 'OPEN_SECURITY_LAB' || action.startsWith('RUN_TC')) {
      router.push('/security-lab');
    } else if (action === 'NAVIGATE_DASHBOARD') {
      router.push('/dashboard');
    } else if (action === 'INSPECT_POLICY_GATES' || action === 'ASSESS_RISK') {
      router.push('/orders/PO-2026-001');
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-200 relative">
      {/* Mobile Sidebar Overlay Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Responsive drawer on mobile, static on desktop) */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden">
        <TopBar
          onToggleCopilot={() => setIsCopilotOpen(prev => !prev)}
          isCopilotOpen={isCopilotOpen}
          onResetFixture={handleResetFixture}
          isResetting={isResetting}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Slide-out AI Copilot Drawer */}
      <CopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onActionTrigger={handleCopilotAction}
      />

      {/* Floating Judge & Security Evaluation Sandbox (Topic F) */}
      <JudgeSandboxDrawer
        onResetFixture={handleResetFixture}
        isResetting={isResetting}
      />
    </div>
  );
}
