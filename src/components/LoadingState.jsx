import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { colors } from '@/constants/colors';

export default function LoadingState({ text = 'Carregando...', className, fullScreen = false }) {
  const content = (
    <div className={cn("flex flex-col items-center justify-center w-full p-8 text-slate-400 dark:text-slate-500", className)}>
      <Loader2 
        className="w-8 h-8 animate-spin mb-3" 
        style={{ color: colors.primary }} 
        strokeWidth={2.5} 
      />
      {text && (
        <p className="text-sm font-medium tracking-wide">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-gray-950/50 backdrop-blur-sm flex items-center justify-center fixed inset-0 z-[100]">
        {content}
      </div>
    );
  }

  return content;
}
