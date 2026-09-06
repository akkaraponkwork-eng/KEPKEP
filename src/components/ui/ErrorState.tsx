import { ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: ReactNode;
}

export function ErrorState({ title, description, actionLabel, onAction, action }: ErrorStateProps) {
  return (
    <div className="w-full p-6 bg-red-50 border border-red-100 rounded-xl flex items-start gap-4">
      <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h3 className="text-red-900 font-semibold mb-1">{title}</h3>
        <p className="text-red-700 text-sm mb-4">{description}</p>
        
        {action ? (
          action
        ) : actionLabel && onAction ? (
          <button 
            onClick={onAction}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors focus:ring-4 focus:ring-red-100"
          >
            <RotateCcw className="w-4 h-4" />
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
