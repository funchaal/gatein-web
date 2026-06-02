import { Key, AlertCircle, CheckCircle2, Copy, Terminal, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ApiKeyModal({ showModal, newApiKey, copied, handleCopyKey, handleCloseModal, generatedAt }) {
  if (!showModal || !newApiKey) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0D0D0D] rounded-2xl border border-gray-200 dark:border-[#262626] w-full max-w-2xl overflow-hidden">

        {/* Modal Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-[#262626]">
          <div className="p-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#262626] rounded-lg">
            <Key className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Nova chave gerada</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Copie e guarde em local seguro antes de fechar</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 border border-gray-200 dark:border-none rounded-xl bg-gray-50 dark:bg-gray-900">
            <AlertCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Esta é a única vez que a chave completa será exibida. Ela não poderá ser recuperada depois.
            </p>
          </div>

          {/* Key display */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Sua chave de API</p>
            <div className="relative">
              <div className="bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#262626] rounded-xl p-4 pr-12 font-mono text-sm text-gray-900 dark:text-gray-100 break-all leading-relaxed">
                {newApiKey}
              </div>
              <button
                onClick={handleCopyKey}
                className="absolute top-3 right-3 p-2 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#0D0D0D] hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-colors"
                title={copied ? 'Copiado!' : 'Copiar chave'}
              >
                {copied
                  ? <CheckCircle2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  : <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                }
              </button>
            </div>
            {copied && (
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Copiado para a área de transferência
              </p>
            )}
          </div>

          {/* How to use */}
          <div className="flex items-start gap-3 p-4 border border-gray-200 dark:border-[#262626] rounded-xl">
            <Terminal className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Como usar</p>
              <ol className="text-sm text-gray-500 dark:text-gray-400 space-y-1.5 list-decimal list-inside">
                <li>Armazene em variável de ambiente ou gerenciador de senhas</li>
                <li>Envie no header: <code className="font-mono text-xs bg-gray-100 dark:bg-[#1A1A1A] px-1.5 py-0.5 rounded border border-gray-200 dark:border-[#262626]">x-api-key: sua-chave</code></li>
                <li>Nunca publique em repositórios públicos</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-[#262626] bg-gray-50/50 dark:bg-transparent">
          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Gerada em {generatedAt}
          </p>
          <Button
            onClick={handleCloseModal}
            variant="outline"
            className="rounded-xl text-sm"
          >
            Fechar
          </Button>
        </div>

      </div>
    </div>
  );
}
