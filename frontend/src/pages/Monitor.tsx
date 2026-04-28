import { useState, useRef } from 'react';
import { Activity, AlertTriangle, CheckCircle, Upload } from 'lucide-react';
import { monitorFairness } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

interface MonitorReport {
  drift_detected: boolean;
  drift_share: number;
  n_drifted_features: number;
  report_available: boolean;
  error?: string;
}
interface MonitorResult {
  status: string;
  report: MonitorReport;
}

const Monitor = () => {
  const refRef = useRef<HTMLInputElement>(null);
  const curRef = useRef<HTMLInputElement>(null);
  const [refFile, setRefFile] = useState<File | null>(null);
  const [curFile, setCurFile] = useState<File | null>(null);
  const [targetCol, setTargetCol] = useState('');
  const [predCol, setPredCol] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MonitorResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refFile) { setError('Please upload the reference (training) data CSV'); return; }
    if (!curFile) { setError('Please upload the current (live) data CSV'); return; }
    if (!targetCol.trim()) { setError('Please provide the target column name'); return; }
    if (!predCol.trim()) { setError('Please provide the prediction column name'); return; }

    setLoading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append('reference_file', refFile);
      fd.append('current_file', curFile);
      fd.append('target_col', targetCol);
      fd.append('pred_col', predCol);
      const data = await monitorFairness(fd);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Monitoring failed');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    const refCsv = `age,credit_score,region,employment_type,label,prediction
35,680,1,0,1,1
42,720,0,1,1,1
28,580,1,0,0,0
51,640,1,1,1,1
23,510,0,0,0,0
38,700,1,0,1,1
45,610,0,1,0,0
32,750,1,0,1,1
29,560,0,0,0,1
47,690,1,1,1,1`;
    const curCsv = `age,credit_score,region,employment_type,label,prediction
58,480,2,0,1,0
63,510,2,1,0,1
55,440,2,0,1,0
61,500,2,1,0,0
70,460,2,0,1,0
52,530,2,1,0,1
67,420,2,0,1,0
59,490,2,1,0,0
72,410,2,0,1,1
56,520,2,1,0,0`;
    setRefFile(new File([refCsv], 'reference.csv', { type: 'text/csv' }));
    setCurFile(new File([curCsv], 'current.csv', { type: 'text/csv' }));
    setTargetCol('label');
    setPredCol('prediction');
  };

  const handleReset = () => {
    setRefFile(null); setCurFile(null); setTargetCol(''); setPredCol(''); setResult(null); setError(null);
  };

  const report = result?.report;

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
      <div className="mb-8">
        <span className="text-accent font-syne text-xs tracking-[0.3em] uppercase">FAIRNESS MONITOR</span>
        <h1 className="font-syne font-bold text-3xl text-textPrimary mt-3 mb-2">Monitor Model Fairness</h1>
        <p className="font-dm text-textMuted">
          Compare reference data against current predictions to detect data drift and fairness degradation over time.
        </p>
      </div>

      {!result ? (
        <div className="bg-surface border border-bs-border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Reference file */}
              <div>
                <label className="font-syne font-bold text-sm text-textPrimary block mb-2">
                  Reference Data <span className="text-textMuted font-dm font-normal">(training / baseline CSV)</span>
                </label>
                <button type="button" onClick={() => refRef.current?.click()}
                  className="w-full border border-bs-border px-4 py-3 text-left text-sm font-dm text-textMuted hover:border-accent transition-colors flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  {refFile ? refFile.name : 'Click to upload reference CSV'}
                </button>
                <input ref={refRef} type="file" accept=".csv" className="hidden"
                  onChange={e => e.target.files?.[0] && setRefFile(e.target.files[0])} />
              </div>
              {/* Current file */}
              <div>
                <label className="font-syne font-bold text-sm text-textPrimary block mb-2">
                  Current Data <span className="text-textMuted font-dm font-normal">(live predictions CSV)</span>
                </label>
                <button type="button" onClick={() => curRef.current?.click()}
                  className="w-full border border-bs-border px-4 py-3 text-left text-sm font-dm text-textMuted hover:border-accent transition-colors flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  {curFile ? curFile.name : 'Click to upload current CSV'}
                </button>
                <input ref={curRef} type="file" accept=".csv" className="hidden"
                  onChange={e => e.target.files?.[0] && setCurFile(e.target.files[0])} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-syne font-bold text-sm text-textPrimary block mb-2">Target Column</label>
                <input value={targetCol} onChange={e => setTargetCol(e.target.value)}
                  placeholder="label"
                  className="w-full px-4 py-2.5 bg-bg border border-bs-border text-textPrimary font-dm text-sm placeholder:text-textMuted focus:outline-none focus:border-accent transition-colors" />
              </div>
              <div>
                <label className="font-syne font-bold text-sm text-textPrimary block mb-2">Prediction Column</label>
                <input value={predCol} onChange={e => setPredCol(e.target.value)}
                  placeholder="prediction"
                  className="w-full px-4 py-2.5 bg-bg border border-bs-border text-textPrimary font-dm text-sm placeholder:text-textMuted focus:outline-none focus:border-accent transition-colors" />
              </div>
            </div>

            <div className="bg-bg border border-bs-border p-4 flex items-center justify-between gap-4">
              <p className="font-dm text-xs text-textMuted">
                <span className="text-textSecondary font-bold">CSV format:</span> Both files must contain columns with the same names.
                The reference file is your training/baseline data; the current file is your live model predictions.
              </p>
              <button type="button" onClick={loadSample}
                className="shrink-0 text-xs text-accent font-dm hover:underline underline-offset-2 whitespace-nowrap">
                Load sample data
              </button>
            </div>

            {error && <ErrorAlert message={error} />}

            <button type="submit" disabled={loading}
              className="w-full bg-accent text-bg font-syne font-bold py-4 px-6 hover:brightness-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? 'Generating Report...' : 'Run Drift Analysis'}
            </button>
          </form>
          {loading && <LoadingSpinner />}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-syne font-bold text-2xl text-textPrimary">Monitor Report</h2>
            <button onClick={handleReset}
              className="px-5 py-2 border border-bs-border text-textSecondary font-dm text-sm hover:border-accent hover:text-accent transition-colors">
              Run Another
            </button>
          </div>

          {/* Drift status */}
          <div className={`bg-surface border p-8 flex flex-col md:flex-row items-center gap-8 ${
            report?.drift_detected ? 'border-danger/40' : 'border-clear/30'
          }`}>
            <div className="shrink-0">
              {report?.drift_detected
                ? <AlertTriangle className="h-14 w-14 text-danger" />
                : <CheckCircle className="h-14 w-14 text-clear" />}
            </div>
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Activity className="h-5 w-5 text-accent" />
                <h3 className="font-syne font-bold text-xl text-textPrimary">
                  {report?.drift_detected ? 'Data Drift Detected' : 'No Significant Drift'}
                </h3>
              </div>
              <p className="font-dm text-textMuted text-sm">
                {report?.drift_detected
                  ? 'Your live data distribution has shifted significantly from the reference. Model fairness may have degraded. Review flagged features and consider retraining.'
                  : 'Live data distribution matches the reference within acceptable thresholds. Model is operating in its expected data regime.'}
              </p>
              {report?.error && (
                <p className="font-dm text-xs text-danger">{report.error}</p>
              )}
            </div>
          </div>

          {/* Drift metrics */}
          {!report?.error && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-bs-border">
              {[
                { label: 'Drift Status', value: report?.drift_detected ? 'Drifted' : 'Stable',
                  color: report?.drift_detected ? 'text-danger' : 'text-clear' },
                { label: 'Drift Share', value: `${((report?.drift_share ?? 0) * 100).toFixed(1)}%`,
                  color: (report?.drift_share ?? 0) > 0.3 ? 'text-danger' : 'text-clear' },
                { label: 'Drifted Features', value: String(report?.n_drifted_features ?? 0),
                  color: (report?.n_drifted_features ?? 0) > 0 ? 'text-accent' : 'text-clear' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-surface p-8">
                  <p className="font-syne text-xs text-textMuted uppercase tracking-wider mb-3">{label}</p>
                  <p className={`font-syne font-bold text-3xl ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Report availability */}
          {report?.report_available && (
            <div className="bg-surface border border-bs-border p-6">
              <h3 className="font-syne font-bold text-lg text-textPrimary mb-2">Evidently Report</h3>
              <p className="font-dm text-sm text-textMuted">
                An HTML report has been saved to <code className="font-mono text-accent">backend/reports/latest.html</code>.
                Open it in your browser for the full interactive drift &amp; classification breakdown.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Monitor;
