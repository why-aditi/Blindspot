import { useState } from 'react';
import { Gauge, AlertCircle, CheckCircle } from 'lucide-react';
import { scoreModel } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

interface ScoreResult {
  fair_score: number;
  demographic_parity: number;
  equalized_odds: number;
  individual_fairness: number;
}

const SAMPLE = {
  X_test: [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0], [7.0, 8.0, 9.0], [2.0, 3.0, 4.0]],
  y_true: [1, 0, 1, 0],
  y_pred: [1, 0, 0, 1],
  sensitive_features: [0, 1, 0, 1],
};

function scoreColor(score: number) {
  if (score >= 80) return '#4DFFB4';
  if (score >= 60) return '#E8FF47';
  return '#FF4D4D';
}

function scoreLabel(score: number) {
  if (score >= 80) return 'Fair';
  if (score >= 60) return 'Moderate';
  return 'Biased';
}

const METRICS = [
  { key: 'demographic_parity',  label: 'Demographic Parity',  weight: '40%', desc: 'Equal positive prediction rates across groups' },
  { key: 'equalized_odds',      label: 'Equalized Odds',       weight: '40%', desc: 'Equal TPR and FPR across groups' },
  { key: 'individual_fairness', label: 'Individual Fairness',  weight: '20%', desc: 'Similar individuals receive similar predictions' },
] as const;

const BANDS = [
  { range: '80–100', label: 'Fair',     color: 'text-clear',  bg: 'bg-clearDim border-clear/30',  desc: 'Model demonstrates good fairness across all metrics' },
  { range: '60–79',  label: 'Moderate', color: 'text-accent', bg: 'bg-accentDim border-accent/30', desc: 'Model has some fairness issues that should be reviewed' },
  { range: '0–59',   label: 'Biased',   color: 'text-danger', bg: 'bg-dangerDim border-danger/30', desc: 'Model shows significant bias and requires correction' },
];

const CIRCUMFERENCE = 2 * Math.PI * 56;

const FairScore = () => {
  const [jsonData, setJsonData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScoreResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonData.trim()) { setError('Please enter the JSON data'); return; }
    setLoading(true); setError(null);
    try {
      const data = JSON.parse(jsonData);
      const response = await scoreModel(data);
      setResult(response);
    } catch (err) {
      setError(err instanceof SyntaxError ? 'Invalid JSON format' : err instanceof Error ? err.message : 'Scoring failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setJsonData(''); setResult(null); setError(null); };

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
      <div className="mb-8">
        <span className="text-accent font-syne text-xs tracking-[0.3em] uppercase">FAIRSCORE API</span>
        <h1 className="font-syne font-bold text-3xl text-textPrimary mt-3 mb-2">Score Model</h1>
        <p className="font-dm text-textMuted">
          Evaluate your model's fairness with a single score (0–100)
        </p>
      </div>

      {!result ? (
        <div className="bg-surface border border-bs-border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="font-syne font-bold text-sm text-textPrimary">Model Data (JSON)</label>
                <button
                  type="button"
                  onClick={() => setJsonData(JSON.stringify(SAMPLE, null, 2))}
                  className="text-xs text-accent font-dm hover:underline underline-offset-2"
                >
                  Load sample data
                </button>
              </div>
              <textarea
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                rows={12}
                placeholder={`{\n  "X_test": [[1.0, 2.0], [3.0, 4.0]],\n  "y_true": [1, 0],\n  "y_pred": [1, 0],\n  "sensitive_features": [0, 1]\n}`}
                className="w-full px-4 py-3 bg-bg border border-bs-border text-textPrimary font-mono text-sm placeholder:text-textMuted focus:outline-none focus:border-accent transition-colors resize-none"
              />
              <p className="font-dm text-xs text-textMuted mt-1.5">
                Provide X_test, y_true, y_pred, and sensitive_features arrays
              </p>
            </div>

            {error && <ErrorAlert message={error} />}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-bg font-syne font-bold py-4 px-6 hover:brightness-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Scoring...' : 'Calculate FairScore'}
            </button>
          </form>

          {loading && <LoadingSpinner />}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-syne font-bold text-2xl text-textPrimary">Fairness Results</h2>
            <button
              onClick={handleReset}
              className="px-5 py-2 border border-bs-border text-textSecondary font-dm text-sm hover:border-accent hover:text-accent transition-colors"
            >
              Score Another Model
            </button>
          </div>

          {/* Overall Score — gauge */}
          <div className="bg-surface border border-bs-border p-10 flex flex-col md:flex-row items-center gap-10">
            <div className="relative shrink-0">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="56" stroke="#1E1E24" strokeWidth="10" fill="none" />
                <circle
                  cx="70" cy="70" r="56"
                  fill="none"
                  strokeWidth="10"
                  strokeLinecap="round"
                  stroke={scoreColor(result.fair_score)}
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={CIRCUMFERENCE - (result.fair_score / 100) * CIRCUMFERENCE}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px', transition: 'stroke-dashoffset 1.2s ease' }}
                />
                <text x="70" y="67" textAnchor="middle" dominantBaseline="middle" fill={scoreColor(result.fair_score)} fontFamily="Syne, sans-serif" fontWeight="700" fontSize="32">
                  {result.fair_score}
                </text>
                <text x="70" y="92" textAnchor="middle" fill="#6B6B7A" fontFamily="DM Sans, sans-serif" fontSize="11">
                  FairScore™
                </text>
              </svg>
            </div>

            <div className="flex flex-col gap-3 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Gauge className="h-5 w-5 text-accent" />
                <h3 className="font-syne font-bold text-xl text-textPrimary">Overall Fair Score</h3>
              </div>
              <p className="font-syne font-bold text-3xl" style={{ color: scoreColor(result.fair_score) }}>
                {scoreLabel(result.fair_score)}
              </p>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                {result.fair_score >= 80
                  ? <CheckCircle className="h-4 w-4 text-clear" />
                  : <AlertCircle className="h-4 w-4 text-danger" />}
                <span className="font-dm text-sm text-textMuted">
                  {result.fair_score >= 80
                    ? 'Model demonstrates good fairness'
                    : 'Model may have fairness issues'}
                </span>
              </div>
            </div>
          </div>

          {/* Component Breakdown */}
          <div className="bg-surface border border-bs-border p-8">
            <h3 className="font-syne font-bold text-lg text-textPrimary mb-6">Component Breakdown</h3>
            <div className="space-y-6">
              {METRICS.map(({ key, label, weight, desc }) => {
                const raw = result[key];
                const pct = raw * 100;
                const col = scoreColor(pct);
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-syne font-bold text-sm text-textPrimary">{label}</span>
                        <span className="font-dm text-xs text-textMuted ml-2">({weight})</span>
                      </div>
                      <span className="font-mono text-sm font-bold" style={{ color: col }}>
                        {raw.toFixed(3)}
                      </span>
                    </div>
                    <div className="h-2 bg-bs-border overflow-hidden">
                      <div
                        className="h-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: col }}
                      />
                    </div>
                    <p className="font-dm text-xs text-textMuted mt-1.5">{desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interpretation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-bs-border">
            {BANDS.map(({ range, label, color, bg, desc }) => (
              <div key={range} className={`bg-surface p-6 border ${bg}`}>
                <div className={`font-syne font-bold text-base mb-1 ${color}`}>
                  {range}: {label}
                </div>
                <p className="font-dm text-xs text-textMuted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FairScore;
