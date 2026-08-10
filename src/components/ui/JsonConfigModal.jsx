import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ActionButton } from '@/components/ui/ActionButton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Code, Copy, Check, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function JsonConfigModal({
  isOpen,
  onClose,
  title = 'Código de Configuração (JSON)',
  description = 'Visualize, copie ou cole a estrutura JSON para sincronizar configurações entre ambientes.',
  data,
  onApply,
  canWrite = true,
}) {
  const [jsonText, setJsonText] = useState('');
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // Formata o JSON inicial ao abrir ou quando o objeto data mudar
  useEffect(() => {
    if (isOpen) {
      const formatted = data ? JSON.stringify(data, null, 2) : '{}';
      setJsonText(formatted);
      setValidationError(null);
      setCopied(false);
    }
  }, [isOpen, data]);

  // Valida o JSON em tempo real conforme o usuário digita/cola
  const handleTextChange = (e) => {
    const text = e.target.value;
    setJsonText(text);
    setCopied(false);

    if (!text.trim()) {
      setValidationError('O conteúdo JSON não pode estar vazio.');
      return;
    }

    try {
      JSON.parse(text);
      setValidationError(null);
    } catch (err) {
      setValidationError(`Sintaxe JSON inválida: ${err.message}`);
    }
  };

  // Copia o JSON para a área de transferência
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
      toast.success('Código JSON copiado com sucesso!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar código JSON.');
    }
  };

  // Restaura o JSON formatado a partir dos dados atuais da página
  const handleReset = () => {
    const formatted = data ? JSON.stringify(data, null, 2) : '{}';
    setJsonText(formatted);
    setValidationError(null);
    toast.info('Código restaurado para a versão atual do formulário.');
  };

  // Valida e aplica o JSON no formulário local
  const handleApply = () => {
    if (validationError) return;

    try {
      const parsed = JSON.parse(jsonText);
      if (typeof parsed !== 'object' || parsed === null) {
        setValidationError('O JSON deve ser um objeto válido (dicionário).');
        return;
      }

      onApply(parsed);
      onClose();
      toast.success('Configurações aplicadas no formulário! Clique em "Salvar Alterações" para salvar no banco.');
    } catch (err) {
      setValidationError(`Erro ao aplicar JSON: ${err.message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800 shadow-2xl p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
              <DialogDescription className="text-xs text-gray-500 dark:text-gray-400">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Toolbar superior com ações */}
        <div className="flex items-center justify-between gap-2 pt-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Estrutura de dados (JSON)
          </span>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-8 text-xs gap-1.5 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              title="Restaurar para os dados originais"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Restaurar
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-8 text-xs gap-1.5 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copiar JSON
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Editor JSON */}
        <div className="relative mt-2">
          <Textarea
            value={jsonText}
            onChange={handleTextChange}
            readOnly={!canWrite}
            placeholder="Cole o código JSON aqui..."
            rows={14}
            className={`w-full font-mono text-xs p-4 rounded-xl leading-relaxed resize-none focus-visible:ring-1 transition-all ${
              validationError
                ? 'bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 focus-visible:ring-red-500'
                : 'bg-gray-950 text-emerald-400 border-gray-800 focus-visible:ring-indigo-500'
            }`}
          />
        </div>

        {/* Mensagem de Erro de Validação */}
        {validationError && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="break-all">{validationError}</span>
          </div>
        )}

        {/* Informação sobre Somente Leitura */}
        {!canWrite && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Você está em modo somente leitura neste módulo. Apenas cópia é permitida.
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-gray-100 dark:border-gray-800/80">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="h-9 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Cancelar
          </Button>

          {canWrite && (
            <ActionButton
              type="button"
              onClick={handleApply}
              disabled={!!validationError || !jsonText.trim()}
              className="h-9 text-xs"
            >
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Aplicar no Formulário
            </ActionButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
