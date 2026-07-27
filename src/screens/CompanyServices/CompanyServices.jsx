import { useState } from 'react';
import {
  Server, Search, Edit2, Trash2, ArrowLeft, Plus, AlertCircle, Link as LinkIcon, Info, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  useGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServicesMutation,
  useUpdateServicesStatusMutation,
} from '@/services/api';
import { extractErrorMessage } from './helpers';
import LoadingState from '@/components/LoadingState';
import { ActionButton } from '@/components/ui/ActionButton';
import { colors } from "@/constants/colors";
import CompanyServicesTable from './components/CompanyServicesTable';

export default function CompanyServices() {
  const { data: servicesData, isLoading, isError } = useGetServicesQuery();
  const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();
  const [deleteServices] = useDeleteServicesMutation();
  const [updateServicesStatus] = useUpdateServicesStatusMutation();

  const isSaving = isCreating || isUpdating;

  const [viewMode, setViewMode] = useState('list');
  const [editingService, setEditingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    icon_url: '',
    is_active: true,
  });
  const [urlError, setUrlError] = useState('');

  const resetForm = () => {
    setFormData({ title: '', description: '', url: '', icon_url: '', is_active: true });
    setEditingService(null);
    setUrlError('');
  };

  const handleOpenEditor = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        title: service.title ?? '',
        description: service.description ?? '',
        url: service.url ?? '',
        icon_url: service.icon_url ?? '',
        is_active: service.is_active ?? true,
      });
    } else {
      resetForm();
    }
    setViewMode('editor');
  };

  const handleCloseEditor = () => {
    setViewMode('list');
    resetForm();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const payload = {
      title: formData.title,
      description: formData.description || null,
      url: formData.url,
      icon_url: formData.icon_url || null,
    };
    if (!editingService) {
      payload.is_active = formData.is_active;
    }

    try {
      setUrlError('');
      if (editingService) {
        const res = await updateService({ id: editingService.id, ...payload }).unwrap();
        if (res && res.success === false) throw res;
        if (res?.message) toast.info(res.message);
        toast.success('Serviço atualizado com sucesso!');
      } else {
        const res = await createService(payload).unwrap();
        if (res && res.success === false) throw res;
        if (res?.message) toast.info(res.message);
        toast.success('Serviço criado com sucesso!');
      }
      handleCloseEditor();
    } catch (err) {
      if (err?.data?.detail?.code === 'DOMAIN_NOT_ALLOWED') {
        setUrlError(err.data.detail.message || 'O domínio não está cadastrado.');
      } else {
        toast.error(extractErrorMessage(err, 'Erro ao salvar serviço.'));
      }
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Tem certeza que deseja excluir este serviço?')) return;
    try {
      await deleteServices({ service_ids: [serviceId] }).unwrap();
      toast.success('Serviço excluído com sucesso.');
      if (viewMode === 'editor') {
        handleCloseEditor();
      }
    } catch (err) {
      let msg = 'Erro ao excluir serviço.';
      if (err?.data?.detail?.message) msg = err.data.detail.message;
      else if (typeof err?.data?.detail === 'string') msg = err.data.detail;
      else if (err?.data?.message) msg = err.data.message;
      else if (err?.message) msg = err.message;
      else if (err?.data) msg = JSON.stringify(err.data);
      toast.error(msg);
    }
  };

  const handleToggleStatus = async (serviceId, currentStatus) => {
    try {
      const res = await updateServicesStatus({
        service_ids: [serviceId],
        is_active: !currentStatus
      }).unwrap();
      if (res.message) toast.info(res.message);
      else toast.success(`Serviço ${!currentStatus ? 'ativado' : 'desativado'} com sucesso.`);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Erro ao alterar status do serviço.'));
    }
  };

  const services = servicesData || [];
  const filtered = services.filter((s) => {
    const term = searchTerm.toLowerCase();
    return s.title?.toLowerCase().includes(term) || s.url?.toLowerCase().includes(term);
  });

  // ── VIEW: LIST MODE ────────────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primary + '1A' }}>
              <Server className="w-5 h-5" style={{ color: colors.primary }} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Gerenciamento de Serviços</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie integrações e serviços externos</p>
            </div>
          </div>
          <ActionButton onClick={() => handleOpenEditor()}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Serviço
          </ActionButton>
        </div>

        <CompanyServicesTable
          filtered={filtered}
          isLoading={isLoading}
          isError={isError}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleToggleStatus={handleToggleStatus}
          handleOpenModal={handleOpenEditor}
          handleOpenEditor={handleOpenEditor}
          handleDelete={handleDelete}
        />
      </div>
    );
  }

  // ── VIEW: EDITOR MODE ──────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Editor Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCloseEditor}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {editingService ? 'Editar Serviço' : 'Criar Novo Serviço'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {editingService ? 'Atualize as informações do serviço selecionado' : 'Preencha as informações do novo serviço'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {editingService && (
            <Button
              variant="destructive"
              onClick={() => handleDelete(editingService.id)}
              disabled={isSaving}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Serviço
            </Button>
          )}
          <Button variant="outline" onClick={handleCloseEditor} disabled={isSaving}>
            Cancelar
          </Button>
          <ActionButton onClick={handleSubmit} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Serviço
          </ActionButton>
        </div>
      </div>

      {/* Editor Form Card */}
      <Card className="bg-white dark:bg-card border border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="text-base font-semibold">Informações do Serviço</CardTitle>
          <CardDescription>Configure o título, descrição, URL base e ícone da integração.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold">Título do Serviço</Label>
              <Input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                placeholder="Ex: Webhook Integração ERP"
                className="border-gray-300 dark:border-gray-800 bg-white dark:bg-[#121212]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">Descrição (opcional)</Label>
              <Input
                id="description"
                name="description"
                type="text"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Descrição detalhada sobre este serviço..."
                className="border-gray-300 dark:border-gray-800 bg-white dark:bg-[#121212]"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="url"
                className={`text-sm font-semibold ${urlError ? 'text-red-600 dark:text-red-400' : ''}`}
              >
                URL Base
              </Label>
              <div className="relative">
                <LinkIcon className={`absolute left-3 top-2.5 w-4 h-4 ${urlError ? 'text-red-400' : 'text-gray-400'}`} />
                <Input
                  id="url"
                  name="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, url: e.target.value }));
                    if (urlError) setUrlError('');
                  }}
                  placeholder="https://api.empresa.com/webhook"
                  className={`pl-10 border-gray-300 dark:border-gray-800 bg-white dark:bg-[#121212] ${urlError ? 'border-red-300 focus:border-red-500' : ''}`}
                  required
                />
              </div>
              {urlError ? (
                <p className="text-xs text-red-500 mt-1">{urlError}</p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-gray-400" /> Apenas URLs de domínios permitidos na plataforma.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon_url" className="text-sm font-semibold">URL do Ícone (opcional)</Label>
              <Input
                id="icon_url"
                name="icon_url"
                type="url"
                value={formData.icon_url}
                onChange={(e) => setFormData((p) => ({ ...p, icon_url: e.target.value }))}
                placeholder="https://exemplo.com/icone.png"
                className="border-gray-300 dark:border-gray-800 bg-white dark:bg-[#121212]"
              />
            </div>

            {!editingService && (
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl mt-4">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active" className="text-sm font-semibold">Serviço Ativo</Label>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Se ativado, começará a operar imediatamente após a criação.
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData((p) => ({ ...p, is_active: !!checked }))}
                />
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

