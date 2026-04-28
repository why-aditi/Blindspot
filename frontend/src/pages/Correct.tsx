import { useState } from 'react';
import { Sliders, AlertCircle, CheckCircle } from 'lucide-react';
import { correctBias } from '../api/client';
import type { CorrectionPayload } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

type Strategy = 'post' | 'pre' | 'in';

interface ScoreSnapshot {
  fair_score: number;
  demographic_parity: number;
  equalized_odds: number;
  individual_fairness: number;
  accuracy: number;
}
interface CorrectionResult {
  strategy: Strategy;
  before: ScoreSnapshot;
  after: ScoreSnapshot;
  tradeoff: { fairness_gain: number; accuracy_loss: number };
  corrected_predictions: number[] | null;
  sample_weights: number[] | null;
}

const CIRCUMFERENCE = 2 * Math.PI * 40;
function scoreColor(s: number) { return s >= 80 ? '#4DFFB4' : s >= 60 ? '#E8FF47' : '#FF4D4D'; }
function MiniGauge({ score, label }: { score: number; label: string }) {
  const col = scoreColor(score);
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke="#1E1E24" strokeWidth="8" fill="none" />
        <circle cx="50" cy="50" r="40" fill="none" strokeWidth="8" strokeLinecap="round"
          stroke={col}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px', transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="50" y="47" textAnchor="middle" dominantBaseline="middle" fill={col}
          fontFamily="Syne, sans-serif" fontWeight="700" fontSize="20">{score}</text>
        <text x="50" y="65" textAnchor="middle" fill="#6B6B7A" fontFamily="DM Sans, sans-serif" fontSize="9">FairScore™</text>
      </svg>
      <span className="font-syne font-bold text-sm" style={{ color: col }}>{label}</span>
    </div>
  );
}

const STRATEGY_META: Record<Strategy, { title: string; desc: string }> = {
  post: { title: 'Post-processing', desc: 'Adjusts prediction thresholds per group. No retraining required — works on any deployed model.' },
  pre:  { title: 'Pre-processing',  desc: 'Computes reweighing sample weights (AIF360 formula). Apply these when retraining your model.' },
  in:   { title: 'In-processing',   desc: 'Retrains with demographic parity constraints via Fairlearn ExponentiatedGradient.' },
};

const POST_SAMPLE: CorrectionPayload = {
  strategy: 'post',
  X_test: [[1,2,3],[4,5,6],[7,8,9],[2,3,4],[5,6,7],[3,4,5]],
  y_true: [1,0,1,0,1,0],
  y_pred: [1,1,0,1,0,0],
  sensitive_features: [0,1,0,1,0,1],
};
const PRE_SAMPLE: CorrectionPayload = {
  strategy: 'pre',
  X_test: [[1,2],[3,4]],
  y_true: [1,0],
  y_pred: [1,0],
  sensitive_features: [0,1],
  y_train: [1,0,1,1,0,0],
  sensitive_train: [0,1,0,1,0,1],
};
const IN_SAMPLE: CorrectionPayload = {
  strategy: 'in',
  X_train: [[1,2,3],[4,5,6],[7,8,9],[2,3,4],[5,6,7],[3,4,5],[1,3,5],[2,4,6],[0,1,2],[3,5,7]],
  y_train: [1,0,1,1,0,0,1,0,1,0],
  sensitive_train: [0,1,0,1,0,1,0,1,0,1],
  X_test: [[1,2,3],[4,5,6],[7,8,9],[2,3,4],[5,6,7],[3,4,5]],
  y_true: [1,0,1,0,1,0],
  y_pred: [1,1,0,1,0,0],
  sensitive_features: [0,1,0,1,0,1],
};

const Correct = () => {
  const [strategy, setStrategy] = useState<Strategy>('post');
  const [jsonData, setJsonData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CorrectionResult | null>(null);

  const loadSample = () => {
    const sample = strategy === 'pre' ? PRE_SAMPLE : strategy === 'in' ? IN_SAMPLE : { ...POST_SAMPLE, strategy };
    setJsonData(JSON.stringify(sample, null, 2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonData.trim()) { setError('Please enter the JSON data'); return; }
    setLoading(true); setError(null);
    try {
      const data = JSON.parse(jsonData) as CorrectionPayload;
      data.strategy = strategy;
      const res = await correctBias(data);
      setResult(res);
    } catch (err) {
      setError(err instanceof SyntaxError ? 'Invalid JSON' : err instanceof Error ? err.message : 'Correction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setJsonData(''); setResult(null); setError(null); };

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
      <div className="mb-8">
        <span className="text-accent font-syne text-xs tracking-[0.3em] uppercase">BIAS CORRECTION</span>
        <h1 className="font-syne font-bold text-3xl text-textPrimary mt-3 mb-2">Correct Bias</h1>
        <p className="font-dm text-textMuted">
          Apply algorithmic bias correction. See the fairness-accuracy tradeoff in real time.
        </p>
      </div>

      {/* Strategy tabs */}
      <div className="flex border-b border-bs-border mb-8">
        {(Object.keys(STRATEGY_META) as Strategy[]).map(s => (
          <button key={s} onClick={() => { setStrategy(s); setResult(null); setError(null); }}
            className={`px-6 py-3 font-syne font-bold text-sm transition-colors border-b-2 -mb-px ${
              strategy === s
                ? 'text-accent border-accent'
                : 'text-textMuted border-transparent hover:text-textPrimary'
            }`}>
            {STRATEGY_META[s].title}
          </button>
        ))}
      </div>
      <p className="font-dm text-sm text-textMuted mb-6">{STRATEGY_META[strategy].desc}</p>

      {!result ? (
        <div className="bg-surface border border-bs-border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="font-syne font-bold text-sm text-textPrimary">
                  Model Data (JSON)
                  {strategy === 'pre' && <span className="font-dm font-normal text-textMuted ml-2">— include y_train + sensitive_train</span>}
                  {strategy === 'in'  && <span className="font-dm font-normal text-textMuted ml-2">— include X_train + y_train + sensitive_train</span>}
                </label>
                <button type="button" onClick={loadSample}
                  className="text-xs text-accent font-dm hover:underline underline-offset-2">
                  Load sample data
                </button>
              </div>
              <textarea
                value={jsonData} onChange={e => setJsonData(e.target.value)}
                rows={14}
                placeholder={`{\n  "X_test": [[1.0, 2.0], ...],\n  "y_true": [1, 0, ...],\n  "y_pred": [1, 0, ...],\n  "sensitive_features": [0, 1, ...]\n}`}
                className="w-full px-4 py-3 bg-bg border border-bs-border text-textPrimary font-mono text-sm placeholder:text-textMuted focus:outline-none focus:border-accent transition-colors resize-none"
              />
            </div>
            {error && <ErrorAlert message={error} />}
            <button type="submit" disabled={loading}
              className="w-full bg-accent text-bg font-syne font-bold py-4 px-6 hover:brightness-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? 'Correcting...' : `Apply ${STRATEGY_META[strategy].title}`}
            </button>
          </form>
          {loading && <LoadingSpinner />}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-syne font-bold text-2xl text-textPrimary">Correction Results</h2>
            <button onClick={handleReset}
              className="px-5 py-2 border border-bs-border text-textSecondary font-dm text-sm hover:border-accent hover:text-accent transition-colors">
              Correct Another
            </button>
          </div>

          {/* Before / After gauges */}
          <div className="bg-surface border border-bs-border p-8 flex flex-col md:flex-row items-center gap-10">
            <MiniGauge score={result.before.fair_score} label="Before" />
            <div className="flex flex-col items-center gap-1 text-center">
              <Sliders className="h-6 w-6 text-accent" />
              <span className="font-syne font-bold text-sm text-textMuted uppercase tracking-wider">
                {STRATEGY_META[result.strategy].title}
              </span>
              <div className="mt-2 space-y-1">
                <p className="font-syne font-bold text-2xl" style={{ color: result.tradeoff.fairness_gain >= 0 ? '#4DFFB4' : '#FF4D4D' }}>
                  {result.tradeoff.fairness_gain >= 0 ? '+' : ''}{result.tradeoff.fairness_gain} fairness
                </p>
                <p className="font-dm text-sm text-textMuted">
                  {result.tradeoff.accuracy_loss > 0
                    ? `−${result.tradeoff.accuracy_loss}% accuracy`
                    : result.tradeoff.accuracy_loss === 0 ? 'No accuracy change' : `+${Math.abs(result.tradeoff.accuracy_loss)}% accuracy`}
                </p>
              </div>
            </div>
            <MiniGauge score={result.after.fair_score} label="After" />
          </div>

          {/* Metric comparison */}
          <div className="bg-surface border border-bs-border p-8">
            <h3 className="font-syne font-bold text-lg text-textPrimary mb-6">Metric Comparison</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {(['demographic_parity', 'equalized_odds', 'individual_fairness', 'accuracy'] as const).map(k => {
                const b = result.before[k];
                const a = result.after[k];
                const improved = a >= b;
                return (
                  <div key={k} className="space-y-1">
                    <p className="font-syne text-xs text-textMuted uppercase tracking-wider">
                      {k.replace(/_/g, ' ')}
                    </p>
                    <p className="font-mono text-2xl font-bold text-textPrimary">{a.toFixed(3)}</p>
                    <p className={`font-dm text-xs flex items-center gap-1 ${improved ? 'text-clear' : 'text-danger'}`}>
                      {improved ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      was {b.toFixed(3)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Corrected predictions */}
          {result.corrected_predictions && (
            <div className="bg-surface border border-bs-border p-8">
              <h3 className="font-syne font-bold text-lg text-textPrimary mb-3">Corrected Predictions</h3>
              <p className="font-mono text-sm text-textMuted break-all">
                [{result.corrected_predictions.slice(0, 50).join(', ')}{result.corrected_predictions.length > 50 ? ', …' : ''}]
              </p>
            </div>
          )}

          {/* Sample weights (pre-processing) */}
          {result.sample_weights && (
            <div className="bg-surface border border-bs-border p-8">
              <h3 className="font-syne font-bold text-lg text-textPrimary mb-2">Sample Weights</h3>
              <p className="font-dm text-xs text-textMuted mb-3">
                Pass these weights to your model's <code className="font-mono">fit(sample_weight=...)</code> call when retraining.
              </p>
              <p className="font-mono text-sm text-textMuted break-all">
                [{result.sample_weights.slice(0, 30).join(', ')}{result.sample_weights.length > 30 ? ', …' : ''}]
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Correct;
