import { Link } from 'react-router-dom';
import { FileText, Gauge, ArrowRight, Shield, AlertTriangle } from 'lucide-react';

const statCards = [
  { icon: Shield,        label: 'Datasets Audited', value: '0', sub: 'Start by auditing your first dataset' },
  { icon: Gauge,         label: 'Models Scored',    value: '0', sub: 'Evaluate your model\'s fairness' },
  { icon: AlertTriangle, label: 'Bias Issues Found', value: '0', sub: 'No issues detected yet' },
];

const actions = [
  {
    to: '/audit', icon: FileText,
    title: 'Audit Dataset',
    desc: 'Detect bias in your training data',
  },
  {
    to: '/score', icon: Gauge,
    title: 'Score Model',
    desc: 'Evaluate your model\'s fairness',
  },
];

const Dashboard = () => (
  <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
    {/* Header */}
    <div className="mb-12">
      <span className="text-accent font-syne text-xs tracking-[0.3em] uppercase">OVERVIEW</span>
      <h1 className="font-syne font-bold text-4xl text-textPrimary mt-3 mb-3">
        Welcome to Blindspot
      </h1>
      <p className="font-dm text-textMuted text-lg">
        AI bias detection, explanation, and correction platform
      </p>
    </div>

    {/* Quick Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-bs-border mb-12">
      {statCards.map(({ icon: Icon, label, value, sub }) => (
        <div key={label} className="bg-surface p-8 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-accent" />
            <span className="font-syne font-bold text-sm text-textSecondary">{label}</span>
          </div>
          <p className="font-syne font-bold text-5xl text-textPrimary">{value}</p>
          <p className="font-dm text-xs text-textMuted">{sub}</p>
        </div>
      ))}
    </div>

    {/* Quick Actions */}
    <div className="mb-12">
      <h2 className="font-syne font-bold text-xl text-textPrimary mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map(({ to, icon: Icon, title, desc }) => (
          <Link
            key={to}
            to={to}
            className="group bg-surface border border-bs-border p-6 flex items-center justify-between hover:border-accent/40 hover:bg-surfaceHover transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accentDim">
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-syne font-bold text-base text-textPrimary group-hover:text-accent transition-colors">
                  {title}
                </h3>
                <p className="font-dm text-sm text-textMuted mt-0.5">{desc}</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-textMuted group-hover:text-accent transition-colors" />
          </Link>
        ))}
      </div>
    </div>

    {/* About */}
    <div className="bg-surface border border-bs-border p-8">
      <h2 className="font-syne font-bold text-lg text-textPrimary mb-3">About Blindspot</h2>
      <p className="font-dm text-textMuted mb-6 leading-relaxed">
        Blindspot is a full-lifecycle AI fairness platform that helps teams audit datasets,
        score model fairness, explain individual decisions, and correct bias before deployment.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        {[
          { emoji: '🔍', title: 'Audit', body: 'Detect bias in training data' },
          { emoji: '📊', title: 'Score', body: 'Evaluate model fairness (0-100)' },
          { emoji: '🛡️', title: 'Protect', body: 'Prevent discriminatory AI systems' },
        ].map(({ emoji, title, body }) => (
          <div key={title}>
            <h4 className="font-syne font-bold text-textPrimary mb-1">{emoji} {title}</h4>
            <p className="font-dm text-textMuted">{body}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Dashboard;
