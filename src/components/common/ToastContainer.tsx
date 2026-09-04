import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
      {toasts.map((toast) => {
        let bg = 'bg-slate-900 dark:bg-slate-800 border-slate-700 text-white';
        let icon = <Info className="w-4 h-4 text-sky-400 shrink-0" />;

        if (toast.type === 'success') {
          bg = 'bg-emerald-950/90 border-emerald-600/50 text-emerald-100';
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
        } else if (toast.type === 'error') {
          bg = 'bg-rose-950/90 border-rose-600/50 text-rose-100';
          icon = <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-950/90 border-amber-600/50 text-amber-100';
          icon = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2.5 p-3 rounded-xl border shadow-xl backdrop-blur-md text-xs font-medium ${bg} transition-all`}
          >
            {icon}
            <div className="flex-1 leading-snug">{toast.message}</div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
