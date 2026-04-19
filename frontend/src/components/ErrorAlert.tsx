import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

const ErrorAlert = ({ message, onRetry }: ErrorAlertProps) => (
  <div className="flex items-center gap-3 p-4 bg-[#FF4D4D15] border border-[#FF4D4D30]">
    <AlertCircle className="h-5 w-5 text-[#FF4D4D] shrink-0" />
    <p className="text-sm text-[#FF4D4D] flex-1 font-dm">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 px-3 py-1 text-xs bg-[#FF4D4D] text-[#0A0A0B] font-dm hover:brightness-110 transition-all"
      >
        <RefreshCw className="h-3 w-3" />
        Retry
      </button>
    )}
  </div>
);

export default ErrorAlert;
