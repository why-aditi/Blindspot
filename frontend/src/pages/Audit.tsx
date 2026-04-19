import { useState } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import { auditDataset } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

interface AuditResult {
  status: string;
  report: Record<string, unknown>;
}

interface ColumnData {
  distribution: Record<string, number>;
  imbalance_score: number;
}

interface ProxyRisks {
  [col: string]: number;
}

const Audit = () => {
  const [file, setFile] = useState<File | null>(null);
  const [protectedCols, setProtectedCols] = useState('');
  const [labelCol, setLabelCol] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) { setFile(e.target.files[0]); setError(null); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith('.csv') || f.name.endsWith('.json'))) {
      setFile(f); setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Please select a file to upload'); return; }
    if (!protectedCols || !labelCol) { setError('Please fill in all required fields'); return; }
    setLoading(true); setError(null);
    try {
      const response = await auditDataset(file, protectedCols, labelCol);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audit failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setFile(null); setProtectedCols(''); setLabelCol(''); setResult(null); setError(null); };

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
      <div className="mb-8">
        <span className="text-accent font-syne text-xs tracking-[0.3em] uppercase">DATASET AUDIT</span>
        <h1 className="font-syne font-bold text-3xl text-textPrimary mt-3 mb-2">Audit Dataset</h1>
        <p className="font-dm text-textMuted">
          Detect bias in your training data before model training
        </p>
      </div>

      {!result ? (
        <div className="bg-surface border border-bs-border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block font-syne font-bold text-sm text-textPrimary mb-3">
                Upload Dataset
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed p-10 text-center transition-colors ${
                  dragOver ? 'border-accent bg-accentDim' : 'border-bs-border hover:border-accent/40'
                }`}
              >
                <input type="file" accept=".csv,.json" onChange={handleFileChange} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
                  <Upload className={`h-10 w-10 ${file ? 'text-accent' : 'text-textMuted'}`} />
                  <span className="font-dm text-sm text-textMuted">
                    {file ? (
                      <span className="text-accent font-dm">{file.name}</span>
                    ) : (
                      <>Drop CSV or JSON here, or <span className="text-accent underline">browse</span></>
                    )}
                  </span>
                </label>
              </div>
            </div>

            {/* Protected Columns */}
            <div>
              <label className="block font-syne font-bold text-sm text-textPrimary mb-2">
                Protected Columns
              </label>
              <input
                type="text"
                value={protectedCols}
                onChange={(e) => setProtectedCols(e.target.value)}
                placeholder="e.g., gender, age, region"
                className="w-full px-4 py-3 bg-bg border border-bs-border text-textPrimary font-dm text-sm placeholder:text-textMuted focus:outline-none focus:border-accent transition-colors"
              />
              <p className="font-dm text-xs text-textMuted mt-1.5">Comma-separated list of protected attribute columns</p>
            </div>

            {/* Label Column */}
            <div>
              <label className="block font-syne font-bold text-sm text-textPrimary mb-2">
                Label Column
              </label>
              <input
                type="text"
                value={labelCol}
                onChange={(e) => setLabelCol(e.target.value)}
                placeholder="e.g., hired, approved, loan_status"
                className="w-full px-4 py-3 bg-bg border border-bs-border text-textPrimary font-dm text-sm placeholder:text-textMuted focus:outline-none focus:border-accent transition-colors"
              />
              <p className="font-dm text-xs text-textMuted mt-1.5">Name of the outcome/target column</p>
            </div>

            {error && <ErrorAlert message={error} />}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-bg font-syne font-bold py-4 px-6 hover:brightness-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Auditing...' : 'Run Audit'}
            </button>
          </form>

          {loading && <LoadingSpinner />}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-syne font-bold text-2xl text-textPrimary">Audit Results</h2>
            <button
              onClick={handleReset}
              className="px-5 py-2 border border-bs-border text-textSecondary font-dm text-sm hover:border-accent hover:text-accent transition-colors"
            >
              Audit Another Dataset
            </button>
          </div>

          {/* Report */}
          <div className="bg-surface border border-bs-border p-8 space-y-8">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              <h3 className="font-syne font-bold text-lg text-textPrimary">Bias Analysis Report</h3>
            </div>

            {Object.entries(result.report).map(([key, value]) => {
              if (key.startsWith('label_skew_')) return null;

              if (key === 'proxy_risks' && typeof value === 'object' && value !== null) {
                const risks = value as ProxyRisks;
                return (
                  <div key={key}>
                    <h4 className="font-syne font-bold text-sm text-textPrimary mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-danger" />
                      Proxy Variable Risks
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(risks).map(([col, risk]) => (
                        <div
                          key={col}
                          className={`p-4 border ${
                            typeof risk === 'number' && risk > 0.5
                              ? 'bg-dangerDim border-danger/30'
                              : 'bg-clearDim border-clear/30'
                          }`}
                        >
                          <p className="font-syne font-bold text-sm text-textPrimary">{col}</p>
                          <p className="font-dm text-xs text-textMuted mt-1">
                            Risk: {typeof risk === 'number' ? risk.toFixed(3) : String(risk)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              if (typeof value === 'object' && value !== null && 'distribution' in value) {
                const col = value as ColumnData;
                return (
                  <div key={key}>
                    <h4 className="font-syne font-bold text-sm text-textPrimary mb-3 capitalize">
                      {key} Distribution
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(col.distribution).map(([group, pct]) => (
                        <div key={group} className="flex items-center gap-3">
                          <span className="font-dm text-xs text-textMuted w-20">{group}</span>
                          <div className="flex-1 bg-bs-border h-2 overflow-hidden">
                            <div
                              className="bg-accent h-full transition-all"
                              style={{ width: `${(pct as number) * 100}%` }}
                            />
                          </div>
                          <span className="font-dm text-xs text-textSecondary w-12 text-right">
                            {((pct as number) * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-textMuted" />
                      <span className="font-dm text-xs text-textMuted">
                        Imbalance Score: {col.imbalance_score.toFixed(3)}
                      </span>
                      {col.imbalance_score > 0.3 ? (
                        <AlertTriangle className="h-4 w-4 text-danger" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-clear" />
                      )}
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Audit;
