'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Send,
  Sparkles,
  Bot,
  ShieldAlert,
  User as UserIcon,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Cpu,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ChatMessage, PurchaseOrder } from '@/types';

export default function CopilotPage() {
  const router = useRouter();
  const { user, activeRole } = useAuth();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [selectedPoId, setSelectedPoId] = useState('PO-2026-001');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {}
  };

  const fetchChat = async (poId: string) => {
    try {
      const res = await fetch(`/api/orders/${poId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.chatMessages || []);
      }
    } catch {}
  };

  useEffect(() => {
    fetchOrders();
    fetchChat(selectedPoId);
  }, [selectedPoId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    setInputText('');
    setLoading(true);

    const tempUserMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      po_id: selectedPoId,
      sender_role: 'USER',
      sender_name: user?.name || 'User',
      content: text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poId: selectedPoId,
          message: text,
          userRole: activeRole,
          userName: user?.name
        })
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          id: `msg_res_${Date.now()}`,
          po_id: selectedPoId,
          sender_role: data.senderRole,
          sender_name: data.senderRole === 'SECURITY_FIREWALL' ? 'SupplyRight Security Firewall' : 'SupplyRight AI Copilot',
          content: data.message,
          suggested_actions_json: JSON.stringify(data.suggestedActions),
          security_alert_json: data.securityAlert ? JSON.stringify(data.securityAlert) : null,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMsg]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (act: any) => {
    if (typeof act === 'string') {
      handleSend(act);
      return;
    }
    const action = act?.action;
    const params = act?.params;
    if (action === 'VIEW_ORDER') {
      router.push(`/orders/${params?.poId || selectedPoId}`);
    } else if (action === 'RUN_TC02' || action === 'OPEN_SECURITY_LAB' || (typeof action === 'string' && action.startsWith('RUN_TC'))) {
      router.push('/security-lab');
    } else if (action === 'PROPOSE_CORRECTED') {
      handleSend(`Execute corrected payout proposal of ${params?.amount || 16.0} mETH`);
    } else if (action === 'ASSESS_RISK') {
      handleSend(`Run complete risk assessment and three-way match for ${params?.poId || selectedPoId}`);
    } else if (action === 'INSPECT_POLICY_GATES' || action === 'FUND_VAULT') {
      router.push(`/orders/${selectedPoId}`);
    } else if (act?.label) {
      handleSend(act.label);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-1 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Autonomous Trade Copilot
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Natural language interface for PO risk audits, claim feasibility queries, and policy gate compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground">Order Context:</label>
          <select
            value={selectedPoId}
            onChange={e => setSelectedPoId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-input bg-card text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          >
            {orders.map(o => (
              <option key={o.id} value={o.id}>
                {o.id} — {o.buyer_company}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chat Card */}
      <div className="flex-1 bg-card rounded-xl border border-border shadow-sm flex flex-col overflow-hidden min-h-0">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 text-muted-foreground">
              <Bot className="w-12 h-12 text-primary/40" />
              <div>
                <h3 className="text-sm font-bold text-foreground">SupplyRight Financial AI Copilot</h3>
                <p className="text-xs mt-1">
                  Ask questions about trade shortfall calculation, escrow health, or policy gate clearance.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 w-full text-left">
                {[
                  'What is the current shortfall and maximum payout on PO-2026-001?',
                  'Why does Policy Gate 7 prevent payouts higher than locked collateral?',
                  'How does the Three-Way Matching reconciler prevent supplier-buyer collusion?'
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="p-2.5 rounded-lg bg-muted/60 hover:bg-muted text-foreground text-xs border border-border transition text-left font-medium"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isUser = msg.sender_role === 'USER';
              const isFirewall = msg.sender_role === 'SECURITY_FIREWALL';

              return (
                <div key={i} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs ${
                        isFirewall ? 'bg-rose-600' : 'bg-primary'
                      }`}
                    >
                      {isFirewall ? <ShieldAlert className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                  )}

                  <div
                    className={`max-w-xl rounded-xl p-4 text-xs leading-relaxed space-y-2 ${
                      isUser
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : isFirewall
                        ? 'bg-rose-500/10 border border-rose-500/30 text-rose-950 dark:text-rose-200'
                        : 'bg-muted/60 border border-border text-foreground shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[10.5px] opacity-75 font-semibold">
                      <span>{msg.sender_name}</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {msg.suggested_actions_json && (
                      <div className="pt-2 flex flex-wrap gap-1.5 border-t border-border/50">
                        {(() => {
                          try {
                            const raw = JSON.parse(msg.suggested_actions_json || '[]');
                            const actionList = Array.isArray(raw) ? raw : [];
                            return actionList.map((act: any, aIdx: number) => {
                              const label = typeof act === 'string' ? act : (act?.label || act?.action || 'Action');
                              return (
                                <button
                                  key={aIdx}
                                  onClick={() => handleActionClick(act)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-card text-foreground border border-border text-[10.5px] font-semibold hover:bg-muted hover:border-primary/40 transition"
                                >
                                  <span>{label}</span>
                                  <ArrowRight className="h-3 w-3 text-primary" />
                                </button>
                              );
                            });
                          } catch {
                            return null;
                          }
                        })()}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0 text-foreground text-xs font-bold">
                      {user?.name ? user.name[0] : 'U'}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-border bg-card">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ask Copilot about risk parameters, legal covenants, or policy checks..."
              className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
