import { useState } from 'react';
import {
  Server, Search, Edit2, Trash2, X, Plus, AlertCircle, Link as LinkIcon, Info, Power, Loader2
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
import CompanyServiceModal from './components/CompanyServiceModal';

export default function CompanyServices() {
  const { data: servicesData, isLoading, isError } = useGetServicesQuery();
  const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();
  const [deleteServices] = useDeleteServicesMutation();
  const [updateServicesStatus] = useUpdateServicesStatusMutation();

  const isSaving = isCreating || isUpdating;

  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleOpenModal = (service = null) => {
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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        if (res && res.success === false) throw res; // Caso retorne 200 com success:false
        if (res?.message) toast.info(res.message);
        toast.success('Serviço atualizado com sucesso!');
      } else {
        const res = await createService(payload).unwrap();
        if (res && res.success === false) throw res; // Caso retorne 200 com success:false
        if (res?.message) toast.info(res.message);
        toast.success('Serviço criado com sucesso!');
      }
      handleCloseModal();
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
      toast.success('Serviço excluído.');
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
        <ActionButton
          onClick={() => handleOpenModal()}
        >
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
        handleOpenModal={handleOpenModal}
        handleDelete={handleDelete}
      />

      <CompanyServiceModal
        isModalOpen={isModalOpen}
        editingService={editingService}
        formData={formData}
        setFormData={setFormData}
        urlError={urlError}
        setUrlError={setUrlError}
        handleCloseModal={handleCloseModal}
        handleSubmit={handleSubmit}
        isSaving={isSaving}
      />
    </div>
  );
}
