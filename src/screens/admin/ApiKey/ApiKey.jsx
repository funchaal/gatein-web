import { useState } from 'react';
import { Key, AlertCircle, Copy, CheckCircle2, RefreshCw, Shield, Loader2, Server, Clock, Terminal, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActionButton } from '@/components/ui/ActionButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useGenerateApiKeyMutation } from '@/services/api';
import { colors } from "@/constants/colors";
import ApiKeyInfoCards from './components/ApiKeyInfoCards';
import ApiKeyModal from './components/ApiKeyModal';

export default function ApiKey() {
  const [generateApiKey, { isLoading, error }] = useGenerateApiKeyMutation();

  const [newApiKey, setNewApiKey] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedAt, setGeneratedAt] = useState(null);

  const handleGenerateKey = async () => {
    const confirmed = window.confirm(
      'Atenção! Gerar uma nova chave invalidará a chave anterior. Deseja continuar?'
    );
    if (!confirmed) return;

    try {
      const result = await generateApiKey().unwrap();
      setNewApiKey(result?.data?.api_key);
      setGeneratedAt(new Date().toLocaleString('pt-BR'));
      setShowModal(true);
    } catch {
      toast.error('Erro ao gerar chave de API.');
    }
  };

  const handleCopyKey = async () => {
    if (!newApiKey) return;
    try {
      await navigator.clipboard.writeText(newApiKey);
      setCopied(true);
      toast.success('Chave copiada para a área de transferência!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Erro ao copiar chave.');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewApiKey(null);
    setCopied(false);
  };

  const errorMessage = error?.data?.detail?.message ?? 'Erro ao gerar chave.';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primary + '1A' }}>
          <Key className="w-5 h-5" style={{ color: colors.primary }} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">API Private Key</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie sua chave de API para integrações</p>
        </div>
      </div>

      {/* Error inline */}
      {error && (
        <div className="flex items-start gap-3 p-4 border border-gray-200 dark:border-none rounded-xl bg-gray-50 dark:bg-gray-900">
          <AlertCircle className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Erro ao gerar chave</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Card */}
      <Card className="border-gray-200 dark:border-[#262626] shadow-none overflow-hidden rounded-2xl">
        <CardHeader className="border-b border-gray-100 dark:border-[#262626] bg-gray-50/50 dark:bg-transparent pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#262626] rounded-lg">
              <Shield className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Chave de API Privada</CardTitle>
              <CardDescription className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Use esta chave para autenticar requisições de integração
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-5">

          {/* Info notice */}
          <div className="flex items-start gap-3 p-4 border border-gray-200 dark:border-none rounded-xl bg-gray-50 dark:bg-gray-900">
            <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Informações importantes</p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1.5 list-disc list-inside">
                <li>A chave autentica requisições externas ao sistema</li>
                <li>Ao gerar uma nova, a anterior é invalidada imediatamente</li>
                <li>A nova chave é exibida apenas uma vez após a geração</li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-[#262626]" />

          {/* Action row */}
          <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#262626] rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Gerar nova chave</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Invalida a chave atual e cria uma nova</p>
            </div>
            <ActionButton onClick={handleGenerateKey} isLoading={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Gerando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Gerar nova chave
                </>
              )}
            </ActionButton>
          </div>

          {/* Two mini info cards */}
          <ApiKeyInfoCards />

        </CardContent>
      </Card>

      {/* Modal */}
      <ApiKeyModal
        showModal={showModal}
        newApiKey={newApiKey}
        copied={copied}
        handleCopyKey={handleCopyKey}
        handleCloseModal={handleCloseModal}
        generatedAt={generatedAt}
      />
    </div>
  );
}