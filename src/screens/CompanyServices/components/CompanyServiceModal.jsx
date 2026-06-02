import { Server, Edit2, X, Plus, Link as LinkIcon, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ActionButton } from '@/components/ui/ActionButton';
import { colors } from "@/constants/colors";

export default function CompanyServiceModal({
  isModalOpen,
  editingService,
  formData,
  setFormData,
  urlError,
  setUrlError,
  handleCloseModal,
  handleSubmit,
  isSaving
}) {
  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-card rounded-xl shadow-2xl dark:border dark:border-gray-800 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-card border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primary + '1A' }}>
              {editingService ? <Edit2 className="w-5 h-5" style={{ color: colors.primary }} /> : <Server className="w-5 h-5" style={{ color: colors.primary }} />}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {editingService ? 'Atualize as informações do serviço' : 'Preencha as informações do novo serviço'}
              </p>
            </div>
          </div>
          <button onClick={handleCloseModal} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <section className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-medium text-gray-700 dark:text-gray-300">Título do Serviço</Label>
              <Input
                id="title" name="title" type="text"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                placeholder="Ex: Webhook Integração ERP"
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-medium text-gray-700 dark:text-gray-300">Descrição (opcional)</Label>
              <Input
                id="description" name="description" type="text"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Descrição detalhada sobre este serviço..."
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url" className={`text-xs font-medium ${urlError ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>URL</Label>
              <div className="relative">
                <LinkIcon className={`absolute left-3 top-2.5 w-4 h-4 ${urlError ? 'text-red-400' : 'text-gray-400'}`} />
                <Input
                  id="url" name="url" type="url"
                  value={formData.url}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, url: e.target.value }));
                    if (urlError) setUrlError('');
                  }}
                  placeholder="https://api.empresa.com/webhook"
                  className={`pl-10 focus:ring-orange-500 ${urlError ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-orange-500'}`}
                  required
                />
              </div>
              {urlError ? (
                <p className="text-xs text-red-500 mt-1">{urlError}</p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Apenas URLs de domínios permitidos na plataforma.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon_url" className="text-xs font-medium text-gray-700 dark:text-gray-300">URL do Ícone (opcional)</Label>
              <Input
                id="icon_url" name="icon_url" type="url"
                value={formData.icon_url}
                onChange={(e) => setFormData((p) => ({ ...p, icon_url: e.target.value }))}
                placeholder="https://exemplo.com/icone.png"
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            {!editingService && (
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-none mt-4">
                <div>
                  <Label htmlFor="is_active" className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">Serviço Ativo</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Se ativado, começará a operar imediatamente após a criação.</p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData((p) => ({ ...p, is_active: !!checked }))}
                />
              </div>
            )}
          </section>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button type="button" onClick={handleCloseModal} variant="outline" className="border-gray-300 dark:border-gray-700">
              Cancelar
            </Button>
            <ActionButton
              type="submit"
              isLoading={isSaving}
              className="min-w-[140px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : editingService ? (
                <><Edit2 className="w-4 h-4 mr-2" /> Atualizar</>
              ) : (
                <><Plus className="w-4 h-4 mr-2" /> Criar Serviço</>
              )}
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
}
