import { useState, useRef } from 'react';
import { Lightbulb, Upload } from 'lucide-react';
import { explainDecision } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

interface Reason { feature: string; impact: number; }
interface ExplainResult {
  top_reasons: Reason[];
  counterfactuals: Record<string, unknown>[];
  plain_english: string;
}

const SAMPLE_INSTANCE = JSON.stringify(
  { age: 35, employment_type: 0, credit_score: 580, region: 1 },
  null, 2
);

// Mirrors the 80-row dataset in backend/routers/samples.py so the CSV is
// always available without a backend round-trip.
const SAMPLE_CSV = `age,employment_type,credit_score,region,approved
22,0,680,1,1
25,1,720,0,1
30,0,760,1,1
35,1,680,1,1
40,1,700,0,1
45,0,740,1,1
50,1,780,1,1
55,1,660,0,1
28,0,690,0,1
33,1,750,1,1
38,0,720,0,1
43,1,770,1,1
48,1,680,0,1
23,0,700,1,1
27,1,740,0,1
31,0,760,1,1
36,1,690,1,1
41,0,720,0,1
46,1,750,1,1
51,1,770,0,1
26,0,680,1,1
29,1,700,0,1
34,0,740,1,1
39,1,760,0,1
44,1,780,1,1
49,0,690,1,1
24,1,720,0,1
32,0,750,1,1
37,1,760,1,1
42,1,700,0,1
47,0,680,1,0
52,1,740,0,1
21,0,760,1,1
28,1,720,0,1
35,0,700,1,0
42,1,780,0,1
49,0,660,1,1
56,1,690,0,1
31,0,750,1,1
38,1,770,0,1
22,1,640,0,1
28,0,630,1,0
35,1,650,1,1
41,0,620,0,0
47,1,635,1,1
33,0,645,0,0
29,1,655,1,1
52,0,625,0,0
25,1,640,0,1
44,0,615,1,0
37,1,650,0,1
31,0,635,1,0
48,1,645,0,1
26,0,620,1,0
39,1,655,1,1
55,0,630,0,0
43,1,640,1,1
34,0,625,0,0
27,1,650,0,1
46,0,635,1,0
22,0,580,1,0
25,1,600,0,0
30,0,520,1,0
35,1,590,1,0
40,1,560,0,0
45,0,540,1,0
50,1,580,0,0
55,0,510,1,0
28,1,595,0,0
33,0,550,1,0
38,1,570,0,0
43,0,530,1,0
48,1,590,0,1
23,0,500,0,0
27,1,580,1,0
31,0,545,0,0
36,1,560,1,0
41,0,510,0,0
46,1,595,1,0
51,0,570,0,0`;

function ImpactBar({ feature, impact }: Reason) {
  const pct = Math.min(Math.abs(impact) * 250, 100);
  const color = impact >= 0 ? '#4DFFB4' : '#FF4D4D';
  const sign = impact >= 0 ? '+' : '';
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="font-dm text-sm text-textPrimary">{feature}</span>
        <span className="font-mono text-sm font-bold" style={{ color }}>
          {sign}{impact.toFixed(3)}
        </span>
      </div>
      <div className="h-2 bg-bs-border overflow-hidden">
        <div className="h-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

const Explain = () => {
  const modelRef = useRef<HTMLInputElement>(null);
  const trainRef = useRef<HTMLInputElement>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [trainFile, setTrainFile] = useState<File | null>(null);
  const [xInstance, setXInstance] = useState('');
  const [featureCols, setFeatureCols] = useState('');
  const [outcomeCol, setOutcomeCol] = useState('');
  const [continuousCols, setContinuousCols] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExplainResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelFile) { setError('Please upload a model file (.pkl / .joblib)'); return; }
    if (!trainFile) { setError('Please upload the training data CSV'); return; }
    if (!xInstance.trim()) { setError('Please provide the instance JSON'); return; }
    if (!featureCols.trim()) { setError('Please provide feature column names'); return; }
    if (!outcomeCol.trim()) { setError('Please provide the outcome column name'); return; }

    setLoading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append('model_file', modelFile);
      fd.append('X_train_file', trainFile);
      fd.append('X_instance', xInstance);
      fd.append('feature_cols', featureCols);
      fd.append('outcome_col', outcomeCol);
      fd.append('continuous_features', continuousCols);
      const data = await explainDecision(fd);
      setResult(data.explanation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Explanation failed');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = async () => {
    setError(null);
    setXInstance(SAMPLE_INSTANCE);
    setFeatureCols('age,employment_type,credit_score,region');
    setOutcomeCol('approved');
    setContinuousCols('age,credit_score');

    // CSV is embedded — always loads instantly, no backend needed.
    setTrainFile(new File([SAMPLE_CSV], 'sample_train.csv', { type: 'text/csv' }));

    // Model is a static asset in public/samples/ — loads from the same origin as
    // the page, no backend required.
    try {
      const modelRes = await fetch('/samples/sample_model.pkl');
      if (modelRes.ok) {
        const blob = await modelRes.blob();
        setModelFile(new File([blob], 'sample_model.pkl', { type: 'application/octet-stream' }));
      } else {
        setError(`Could not load sample model (HTTP ${modelRes.status})`);
      }
    } catch {
      setError('Could not load sample model file');
    }
  };

  const handleReset = () => {
    setModelFile(null); setTrainFile(null); setXInstance(''); setFeatureCols('');
    setOutcomeCol(''); setContinuousCols(''); setResult(null); setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
      <div className="mb-8">
        <span className="text-accent font-syne text-xs tracking-[0.3em] uppercase">XAI ENGINE</span>
        <h1 className="font-syne font-bold text-3xl text-textPrimary mt-3 mb-2">Explain Decision</h1>
        <p className="font-dm text-textMuted">
          Upload your model and data to get SHAP feature attribution, DiCE counterfactuals, and a plain-English explanation.
        </p>
      </div>

      {!result ? (
        <div className="bg-surface border border-bs-border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Model file */}
              <div>
                <label className="font-syne font-bold text-sm text-textPrimary block mb-2">
                  Model File <span className="text-textMuted font-dm font-normal">(.pkl / .joblib)</span>
                </label>
                <button
                  type="button"
                  onClick={() => modelRef.current?.click()}
                  className="w-full border border-bs-border px-4 py-3 text-left text-sm font-dm text-textMuted hover:border-accent transition-colors flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {modelFile ? modelFile.name : 'Click to upload model'}
                </button>
                <input ref={modelRef} type="file" accept=".pkl,.joblib" className="hidden"
                  onChange={e => e.target.files?.[0] && setModelFile(e.target.files[0])} />
              </div>
              {/* Training data */}
              <div>
                <label className="font-syne font-bold text-sm text-textPrimary block mb-2">
                  Training Data <span className="text-textMuted font-dm font-normal">(CSV with outcome column)</span>
                </label>
                <button
                  type="button"
                  onClick={() => trainRef.current?.click()}
                  className="w-full border border-bs-border px-4 py-3 text-left text-sm font-dm text-textMuted hover:border-accent transition-colors flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {trainFile ? trainFile.name : 'Click to upload CSV'}
                </button>
                <input ref={trainRef} type="file" accept=".csv" className="hidden"
                  onChange={e => e.target.files?.[0] && setTrainFile(e.target.files[0])} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="font-syne font-bold text-sm text-textPrimary block mb-2">Feature Columns</label>
                <input
                  value={featureCols} onChange={e => setFeatureCols(e.target.value)}
                  placeholder="age,credit_score,region"
                  className="w-full px-4 py-2.5 bg-bg border border-bs-border text-textPrimary font-dm text-sm placeholder:text-textMuted focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="font-syne font-bold text-sm text-textPrimary block mb-2">Outcome Column</label>
                <input
                  value={outcomeCol} onChange={e => setOutcomeCol(e.target.value)}
                  placeholder="approved"
                  className="w-full px-4 py-2.5 bg-bg border border-bs-border text-textPrimary font-dm text-sm placeholder:text-textMuted focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="font-syne font-bold text-sm text-textPrimary block mb-2">
                  Continuous Features <span className="text-textMuted font-normal">(for DiCE)</span>
                </label>
                <input
                  value={continuousCols} onChange={e => setContinuousCols(e.target.value)}
                  placeholder="age,credit_score"
                  className="w-full px-4 py-2.5 bg-bg border border-bs-border text-textPrimary font-dm text-sm placeholder:text-textMuted focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-syne font-bold text-sm text-textPrimary">Instance to Explain (JSON)</label>
                <button type="button" onClick={loadSample}
                  className="text-xs text-accent font-dm hover:underline underline-offset-2">
                  Load sample
                </button>
              </div>
              <textarea
                value={xInstance} onChange={e => setXInstance(e.target.value)}
                rows={5}
                placeholder='{"age": 35, "credit_score": 580}'
                className="w-full px-4 py-3 bg-bg border border-bs-border text-textPrimary font-mono text-sm placeholder:text-textMuted focus:outline-none focus:border-accent transition-colors resize-none"
              />
            </div>

            {error && <ErrorAlert message={error} />}

            <button type="submit" disabled={loading}
              className="w-full bg-accent text-bg font-syne font-bold py-4 px-6 hover:brightness-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? 'Explaining...' : 'Explain This Decision'}
            </button>
          </form>
          {loading && <LoadingSpinner />}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-syne font-bold text-2xl text-textPrimary">Explanation Results</h2>
            <button onClick={handleReset}
              className="px-5 py-2 border border-bs-border text-textSecondary font-dm text-sm hover:border-accent hover:text-accent transition-colors">
              Explain Another
            </button>
          </div>

          {/* Plain English */}
          <div className="bg-surface border-l-2 border-accent p-6">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-accent" />
              <span className="font-syne font-bold text-sm text-accent uppercase tracking-wider">Plain English</span>
            </div>
            <p className="font-dm text-textPrimary leading-relaxed">{result.plain_english}</p>
          </div>

          {/* Feature Attribution */}
          <div className="bg-surface border border-bs-border p-8">
            <h3 className="font-syne font-bold text-lg text-textPrimary mb-2">Feature Attribution (SHAP)</h3>
            <p className="font-dm text-xs text-textMuted mb-6">
              Green = pushed decision positive &nbsp;·&nbsp; Red = pushed decision negative
            </p>
            <div className="space-y-5">
              {result.top_reasons.map(r => <ImpactBar key={r.feature} {...r} />)}
            </div>
          </div>

          {/* Counterfactuals */}
          {result.counterfactuals.length > 0 && (
            <div className="bg-surface border border-bs-border p-8">
              <h3 className="font-syne font-bold text-lg text-textPrimary mb-2">Counterfactuals (DiCE)</h3>
              <p className="font-dm text-xs text-textMuted mb-6">
                If the instance had these values instead, the decision would be reversed.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-dm">
                  <thead>
                    <tr className="border-b border-bs-border">
                      {Object.keys(result.counterfactuals[0]).map(k => (
                        <th key={k} className="text-left py-2 pr-6 font-syne text-xs text-textMuted uppercase tracking-wider">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.counterfactuals.map((cf, i) => (
                      <tr key={i} className="border-b border-bs-border/50">
                        {Object.values(cf).map((v, j) => (
                          <td key={j} className="py-2.5 pr-6 text-textPrimary font-mono">
                            {typeof v === 'number' ? Number(v).toFixed(2) : String(v)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result.counterfactuals.length === 0 && (
            <div className="bg-surface border border-bs-border p-6">
              <h3 className="font-syne font-bold text-lg text-textPrimary mb-2">Counterfactuals (DiCE)</h3>
              <p className="font-dm text-sm text-textMuted">
                No counterfactuals generated — ensure continuous_features are specified and the training CSV includes the outcome column.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Explain;
