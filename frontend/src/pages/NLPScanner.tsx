import { useState } from 'react';
import { ScanText } from 'lucide-react';
import { scanText } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

interface Flag {
  word: string;
  type: 'gender' | 'age' | 'caste' | 'socioeconomic';
  severity: 'medium' | 'high' | 'critical';
}
interface ScanResult {
  flags: Flag[];
  bias_score: number;
  flag_count: number;
  categories: string[];
  rewrite: string;
}

const SAMPLE_TEXT = `We are looking for a young and dynamic rockstar developer who is aggressive in their approach.
The ideal candidate is a digital native from an IIT or IIM background.
Must be from own community. We prefer candidates from a Brahmin background.
This is an unpaid internship for fresh graduates only.`;

const SEVERITY_STYLES: Record<Flag['severity'], string> = {
  critical: 'bg-danger/20 text-danger border border-danger/40',
  high:     'bg-accent/20 text-accent border border-accent/40',
  medium:   'bg-textMuted/10 text-textSecondary border border-bs-border',
};

const CATEGORY_LABELS: Record<string, string> = {
  gender: 'Gender-coded',
  age: 'Age Bias',
  caste: 'Caste Signal',
  socioeconomic: 'Socioeconomic',
};

const CIRCUMFERENCE = 2 * Math.PI * 44;
function BiasGauge({ score }: { score: number }) {
  // High bias_score = bad (red). Low = good (green).
  const displayScore = Math.round(score * 100);
  const color = score >= 0.6 ? '#FF4D4D' : score >= 0.3 ? '#E8FF47' : '#4DFFB4';
  const label = score >= 0.6 ? 'Biased' : score >= 0.3 ? 'Moderate' : 'Low Bias';
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="108" height="108" viewBox="0 0 108 108">
        <circle cx="54" cy="54" r="44" stroke="#1E1E24" strokeWidth="8" fill="none" />
        <circle cx="54" cy="54" r="44" fill="none" strokeWidth="8" strokeLinecap="round"
          stroke={color}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE - score * CIRCUMFERENCE}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '54px 54px', transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="54" y="50" textAnchor="middle" dominantBaseline="middle" fill={color}
          fontFamily="Syne, sans-serif" fontWeight="700" fontSize="22">{displayScore}%</text>
        <text x="54" y="68" textAnchor="middle" fill="#6B6B7A" fontFamily="DM Sans, sans-serif" fontSize="9">BERT score</text>
      </svg>
      <span className="font-syne font-bold text-sm" style={{ color }}>{label}</span>
    </div>
  );
}

const NLPScanner = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) { setError('Please enter some text to scan'); return; }
    setLoading(true); setError(null);
    try {
      const data = await scanText(text);
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setText(''); setResult(null); setError(null); };

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
      <div className="mb-8">
        <span className="text-accent font-syne text-xs tracking-[0.3em] uppercase">NLP BIAS SCANNER</span>
        <h1 className="font-syne font-bold text-3xl text-textPrimary mt-3 mb-2">Scan Text for Bias</h1>
        <p className="font-dm text-textMuted">
          Detect gender-coded language, age bias, caste signals, and socioeconomic markers in job descriptions, policies, and forms.
        </p>
      </div>

      {!result ? (
        <div className="bg-surface border border-bs-border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="font-syne font-bold text-sm text-textPrimary">Text to Scan</label>
                <button type="button" onClick={() => setText(SAMPLE_TEXT)}
                  className="text-xs text-accent font-dm hover:underline underline-offset-2">
                  Load sample JD
                </button>
              </div>
              <textarea
                value={text} onChange={e => setText(e.target.value)}
                rows={10}
                placeholder="Paste a job description, policy document, or any text here..."
                className="w-full px-4 py-3 bg-bg border border-bs-border text-textPrimary font-dm text-sm placeholder:text-textMuted focus:outline-none focus:border-accent transition-colors resize-none"
              />
              <p className="font-dm text-xs text-textMuted mt-1.5">
                {text.length} characters · BERT analysis limited to first 512 characters
              </p>
            </div>
            {error && <ErrorAlert message={error} />}
            <button type="submit" disabled={loading}
              className="w-full bg-accent text-bg font-syne font-bold py-4 px-6 hover:brightness-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? 'Scanning...' : 'Scan for Bias'}
            </button>
          </form>
          {loading && <LoadingSpinner />}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-syne font-bold text-2xl text-textPrimary">Scan Results</h2>
            <button onClick={handleReset}
              className="px-5 py-2 border border-bs-border text-textSecondary font-dm text-sm hover:border-accent hover:text-accent transition-colors">
              Scan Another
            </button>
          </div>

          {/* Score + summary */}
          <div className="bg-surface border border-bs-border p-8 flex flex-col md:flex-row items-center gap-10">
            <BiasGauge score={result.bias_score} />
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <ScanText className="h-5 w-5 text-accent" />
                <h3 className="font-syne font-bold text-xl text-textPrimary">Bias Analysis</h3>
              </div>
              <p className="font-dm text-textMuted text-sm">
                <span className="text-textPrimary font-bold">{result.flag_count}</span> bias signal{result.flag_count !== 1 ? 's' : ''} detected
                {result.categories.length > 0 && (
                  <> across <span className="text-textPrimary font-bold">{result.categories.length}</span> categor{result.categories.length !== 1 ? 'ies' : 'y'}</>
                )}
              </p>
              {result.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2">
                  {result.categories.map(cat => (
                    <span key={cat} className="text-xs font-dm px-2 py-1 bg-accent/10 text-accent border border-accent/20">
                      {CATEGORY_LABELS[cat] ?? cat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Flags */}
          {result.flags.length > 0 && (
            <div className="bg-surface border border-bs-border p-8">
              <h3 className="font-syne font-bold text-lg text-textPrimary mb-6">Flagged Words &amp; Phrases</h3>
              <div className="flex flex-wrap gap-3">
                {result.flags.map((flag, i) => (
                  <div key={i} className={`flex items-center gap-2 px-3 py-1.5 text-sm font-dm ${SEVERITY_STYLES[flag.severity]}`}>
                    <span className="font-mono">{flag.word}</span>
                    <span className="text-xs opacity-70">{CATEGORY_LABELS[flag.type] ?? flag.type}</span>
                    <span className="text-xs font-bold uppercase">{flag.severity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.flags.length === 0 && (
            <div className="bg-surface border border-clear/30 p-6">
              <p className="font-syne font-bold text-clear mb-1">No bias signals detected</p>
              <p className="font-dm text-sm text-textMuted">
                The rule-based scanner found no known bias patterns. Review the BERT score above for model-based assessment.
              </p>
            </div>
          )}

          {/* Rewrite */}
          <div className="bg-surface border border-bs-border p-8">
            <h3 className="font-syne font-bold text-lg text-textPrimary mb-2">Neutral Rewrite</h3>
            <p className="font-dm text-xs text-textMuted mb-4">Generated by Groq / Llama — review before use.</p>
            <div className="bg-bg border-l-2 border-accent p-5">
              <p className="font-dm text-sm text-textPrimary leading-relaxed whitespace-pre-wrap">{result.rewrite}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NLPScanner;
