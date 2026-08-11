import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { colors } from '@/constants/colors';

export default function LoadingState({ text = 'Carregando...', className, fullScreen = false }) {
  const content = (
    <div className={cn("flex flex-col items-center justify-center w-full min-h-[60vh] p-8 text-gray-900 dark:text-gray-100", className)}>
      <Loader2 
        className="w-8 h-8 animate-spin mb-3 text-orange-500" 
        strokeWidth={2.5} 
      />
      {text && (
        <p className="text-sm font-medium tracking-wide text-gray-600 dark:text-gray-300 drop-shadow-sm">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-950/60 backdrop-blur-sm flex items-center justify-center fixed inset-0 z-[100]">
        {content}
      </div>
    );
  }

  return content;
}

