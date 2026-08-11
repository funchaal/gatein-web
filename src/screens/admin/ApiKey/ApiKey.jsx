import { useState } from 'react';
import { Key, Shield, Loader2, Trash2, Plus, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActionButton } from '@/components/ui/ActionButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  useGetApiKeysQuery,
  useGenerateApiKeyMutation,
  useDeleteApiKeyMutation,
} from '@/services/api';
import { colors } from "@/constants/colors";
import LoadingState from '@/components/LoadingState';
import ApiKeyInfoCards from './components/ApiKeyInfoCards';
import ApiKeyModal from './components/ApiKeyModal';

export default function ApiKey() {
  const { data: apiKeysData, isLoading: isLoadingKeys } = useGetApiKeysQuery();
  const [generateApiKey, { isLoading: isGenerating }] = useGenerateApiKeyMutation();
  const [deleteApiKey, { isLoading: isDeleting }] = useDeleteApiKeyMutation();

  const [deleteModalPrefix, setDeleteModalPrefix] = useState(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');

  const [newApiKey, setNewApiKey] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedAt, setGeneratedAt] = useState(null);

  const keys = apiKeysData?.keys || [];
  const totalKeys = apiKeysData?.total_keys || keys.length;
  const canCreate = apiKeysData?.can_create ?? (totalKeys < 2);

  if (isLoadingKeys) {
    return <LoadingState text="Carregando chaves de API..." />;
  }

  const handleGenerateKey = async () => {
    if (!canCreate) {
      toast.error('Limite de chaves atingido. Você pode ter no máximo 2 chaves de API ativas.');
      return;
    }

    try {
      const result = await generateApiKey().unwrap();
      setNewApiKey(result?.data?.api_key);
      setGeneratedAt(new Date().toLocaleString('pt-BR'));
      setShowModal(true);
      toast.success('Nova chave de API gerada!');
    } catch (err) {
      const msg = err?.data?.detail?.message || 'Erro ao gerar chave de API.';
      toast.error(msg);
    }
  };

  const handleOpenDeleteModal = (prefix) => {
    setDeleteModalPrefix(prefix);
    setDeleteConfirmInput('');
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmInput !== deleteModalPrefix) return;

    try {
      await deleteApiKey(deleteModalPrefix).unwrap();
      toast.success('Chave de API excluída com sucesso.');
      setDeleteModalPrefix(null);
      setDeleteConfirmInput('');
    } catch (err) {
      const msg = err?.data?.detail?.message || 'Erro ao excluir chave de API.';
      toast.error(msg);
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

      {/* Main Card */}
      <Card className="border-gray-200 dark:border-[#262626] shadow-none overflow-hidden rounded-2xl">
        <CardHeader className="border-b border-gray-100 dark:border-[#262626] bg-gray-50/50 dark:bg-transparent pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#262626] rounded-lg">
              <Shield className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Chave de API Privada ({totalKeys}/2)
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Use estas chaves para autenticar requisições de integração externas
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-5">
          {/* Subtle info notice inside container */}
          <div className="flex items-start gap-3 p-4 border border-gray-200 dark:border-none rounded-xl bg-gray-50 dark:bg-gray-900">
            <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p className="font-medium text-gray-700 dark:text-gray-300">Informações importantes</p>
              <p className="leading-relaxed">
                Evite ter mais de uma chave de API. Use duas apenas para trocar a chave antiga pela nova em produção.
              </p>
            </div>
          </div>

          {/* Action Row for generating key (styled like Staging Password screen) */}
          <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#262626] rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Gerar nova chave</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {canCreate
                  ? 'Cria uma nova chave de API para sua empresa (máximo 2)'
                  : 'Limite de 2 chaves atingido. Exclua uma para criar outra'}
              </p>
            </div>
            <ActionButton
              onClick={handleGenerateKey}
              isLoading={isGenerating}
              disabled={!canCreate || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Gerando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar nova chave
                </>
              )}
            </ActionButton>
          </div>

          {/* Keys list */}
          {isLoadingKeys ? (
            <div className="flex items-center justify-center py-8 text-gray-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Carregando chaves de API...
            </div>
          ) : keys.length === 0 ? (
            <div className="text-center py-8 px-4 border border-dashed border-gray-200 dark:border-[#262626] rounded-xl">
              <Key className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Nenhuma chave de API ativa</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Clique em "Criar nova chave" para gerar a primeira credencial.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((keyItem) => (
                <div
                  key={keyItem.prefix}
                  className="flex items-center justify-between gap-4 p-4 bg-gray-50/80 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#262626] rounded-xl flex-wrap"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-[#262626] rounded-lg flex-shrink-0">
                      <Key className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {keyItem.prefix}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 rounded-full">
                          Ativa
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Identificador: <code className="font-mono">{keyItem.prefix}</code>
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDeleteModal(keyItem.prefix)}
                    className="rounded-lg text-xs text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border-gray-200 dark:border-[#262626]"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Excluir
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-[#262626]" />

          {/* Info cards component */}
          <ApiKeyInfoCards />

        </CardContent>
      </Card>

      {/* Modal de exibição da nova chave */}
      <ApiKeyModal
        showModal={showModal}
        newApiKey={newApiKey}
        copied={copied}
        handleCopyKey={handleCopyKey}
        handleCloseModal={handleCloseModal}
        generatedAt={generatedAt}
      />

      {/* Modal de confirmação de exclusão com digitação do identificador */}
      {deleteModalPrefix && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0D0D0D] rounded-2xl border border-gray-200 dark:border-[#262626] w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Excluir chave de API</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Esta ação não poderá ser desfeita</p>
              </div>
            </div>

            <div className="p-3 border border-amber-200 dark:border-amber-900/40 bg-amber-50/80 dark:bg-amber-950/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <span>Atenção: Os sistemas que estiverem utilizando esta chave de API vão parar de funcionar imediatamente.</span>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Para confirmar a exclusão, digite exatamente o identificador da chave <strong className="font-mono text-gray-900 dark:text-gray-200 select-all">{deleteModalPrefix}</strong> no campo abaixo:
            </p>

            <Input
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              placeholder={deleteModalPrefix}
              className="font-mono text-sm rounded-xl"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteModalPrefix(null);
                  setDeleteConfirmInput('');
                }}
                className="rounded-xl text-xs"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleteConfirmInput !== deleteModalPrefix || isDeleting}
                className="rounded-xl text-xs"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Excluindo...
                  </>
                ) : (
                  'Confirmar exclusão'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}