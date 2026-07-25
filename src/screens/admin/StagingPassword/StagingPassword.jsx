import { useState } from 'react';
import { FlaskConical, AlertCircle, Copy, CheckCircle2, RefreshCw, Shield, Loader2, Info, Lock, Building2 } from 'lucide-react';
import { ActionButton } from '@/components/ui/ActionButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useGenerateStagingPasswordMutation, useGetStagingPasswordStatusQuery } from '@/services/api';
import { colors } from "@/constants/colors";

export default function StagingPassword() {
  const [generateStagingPassword, { isLoading, error }] = useGenerateStagingPasswordMutation();
  const { data: statusData, refetch: refetchStatus } = useGetStagingPasswordStatusQuery();

  const [generatedPassword, setGeneratedPassword] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedAt, setGeneratedAt] = useState(null);

  const handleGenerate = async () => {
    const confirmed = window.confirm(
      'Atenção! Gerar uma nova senha de homologação revogará a senha anterior imediatamente. Deseja continuar?'
    );
    if (!confirmed) return;

    try {
      const result = await generateStagingPassword().unwrap();
      setGeneratedPassword(result?.data?.staging_password);
      setGeneratedAt(new Date().toLocaleString('pt-BR'));
      setShowPassword(true);
      refetchStatus();
    } catch (err) {
      const msg = err?.data?.detail?.message ?? 'Erro ao gerar senha de homologação.';
      toast.error(msg);
    }
  };

  const handleCopy = async () => {
    if (!generatedPassword) return;
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      toast.success('Senha copiada para a área de transferência!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Erro ao copiar senha.');
    }
  };

  const handleDismiss = () => {
    setShowPassword(false);
    setGeneratedPassword(null);
    setCopied(false);
  };

  const errorMessage = error?.data?.detail?.message ?? 'Erro ao gerar senha.';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primary + '1A' }}>
          <FlaskConical className="w-5 h-5" style={{ color: colors.primary }} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Senha de Homologação</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gerencie a senha mestra para acesso do app em ambiente de teste
          </p>
        </div>
      </div>

      {/* Error inline */}
      {error && (
        <div className="flex items-start gap-3 p-4 border border-gray-200 dark:border-none rounded-xl bg-gray-50 dark:bg-gray-900">
          <AlertCircle className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Erro ao gerar senha</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Senha gerada — alerta temporário */}
      {showPassword && generatedPassword && (
        <div className="p-4 border border-amber-200 dark:border-amber-900/50 rounded-xl bg-amber-50 dark:bg-amber-950/30 space-y-3">
          <div className="flex items-start gap-3">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                Senha gerada — salve agora!
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                Esta senha não será exibida novamente. Copie e compartilhe com a equipe de QA.
              </p>
            </div>
          </div>

          {/* Password display */}
          <div className="flex items-center gap-2 p-3 bg-white dark:bg-[#111] border border-amber-200 dark:border-amber-900/40 rounded-lg font-mono text-sm break-all">
            <span className="flex-1 text-gray-900 dark:text-gray-100 select-all">
              {generatedPassword}
            </span>
            <button
              id="staging-copy-btn"
              onClick={handleCopy}
              className="flex-shrink-0 p-1.5 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
              title="Copiar senha"
            >
              {copied
                ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                : <Copy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              }
            </button>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-amber-500 dark:text-amber-600">Gerada em: {generatedAt}</p>
            <button
              onClick={handleDismiss}
              className="text-xs text-amber-600 dark:text-amber-500 underline hover:no-underline"
            >
              Fechar
            </button>
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
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Senha Mestra de Homologação
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Usada pelo app de teste junto ao CPF do motorista
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-5">

          {/* Info notice */}
          <div className="flex items-start gap-3 p-4 border border-gray-200 dark:border-none rounded-xl bg-gray-50 dark:bg-gray-900">
            <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Como funciona</p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1.5 list-disc list-inside">
                <li>A senha é vinculada exclusivamente à sua empresa</li>
                <li>O testador usa CPF + esta senha para entrar no app de homologação</li>
                <li>O token gerado filtra todos os dados automaticamente pela sua empresa</li>
                <li>Ao gerar uma nova senha, a anterior é revogada imediatamente</li>
                <li>A senha é exibida <strong>apenas uma vez</strong> — não é armazenada em texto</li>
              </ul>
            </div>
          </div>

          {/* Status atual */}
          {statusData && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#262626] rounded-xl">
              <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {statusData.has_password
                    ? 'Sua empresa já possui uma senha de homologação ativa.'
                    : 'Nenhuma senha de homologação gerada ainda.'}
                </p>
                {statusData.updated_at && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Última geração: {new Date(statusData.updated_at).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
              <span
                className={`flex-shrink-0 w-2 h-2 rounded-full ${statusData.has_password ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
              />
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-[#262626]" />

          {/* Action row */}
          <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#262626] rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {statusData?.has_password ? 'Regerear senha' : 'Gerar senha'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {statusData?.has_password
                  ? 'Invalida a senha atual e cria uma nova'
                  : 'Cria a senha mestra para este ambiente de homologação'}
              </p>
            </div>
            <ActionButton
              id="staging-generate-btn"
              onClick={handleGenerate}
              isLoading={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Gerando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {statusData?.has_password ? 'Regenerar senha' : 'Gerar senha'}
                </>
              )}
            </ActionButton>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
