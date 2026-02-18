import Link from 'next/link';
import { Zap, TrendingUp, BarChart2, Shield, ChevronRight, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: TrendingUp,
    title: 'Smart Trade Logging',
    desc: 'Log every position with auto P&L calculation, leverage tracking, and strategy tagging.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  {
    icon: BarChart2,
    title: 'Deep Analytics',
    desc: 'Win rate, profit factor, drawdown analysis, and asset-level performance breakdowns.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    desc: 'JWT auth with refresh tokens, bcrypt hashing, role-based access control.',
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,229,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.4)]">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold font-display tracking-wider">TRADEBOARD</p>
            <p className="text-[10px] text-cyan-400 font-mono tracking-[0.3em]">X</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="text-sm font-medium bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 text-center px-6 pt-24 pb-20 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium px-4 py-2 rounded-full mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          AI-Powered Trading Intelligence Platform
        </div>

        <h1 className="text-5xl sm:text-7xl font-black font-display tracking-tight text-foreground mb-6">
          TRADE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">SMARTER.</span>
          <br />
          ANALYZE <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">DEEPER.</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          The professional-grade trading journal built for serious traders. Track your crypto, forex, and stock positions with real-time analytics and AI-powered insights.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-bold px-8 py-3.5 rounded-xl hover:shadow-[0_0_40px_rgba(0,229,255,0.4)] transition-all duration-300 hover:scale-105"
          >
            Start Trading Free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/auth/login"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground border border-border/60 hover:border-border px-8 py-3.5 rounded-xl transition-all"
          >
            Sign In
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-8 mt-16 border-t border-white/[0.06] pt-12 max-w-lg mx-auto">
          {[
            { value: '99.9%', label: 'Uptime' },
            { value: 'Free', label: 'To Start' },
            { value: '∞', label: 'Trade Logs' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold font-mono text-cyan-400">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="glass-card p-6 group hover:border-white/10 transition-all duration-300">
                <div className={`h-10 w-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
