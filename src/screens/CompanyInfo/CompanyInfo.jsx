import { useState, useMemo } from 'react';
import { Building2, Save, AlertCircle, Loader2 } from 'lucide-react';
import { ActionButton } from '@/components/ui/ActionButton';
import LoadingState from '@/components/LoadingState';
import { toast } from 'sonner';
import { useGetCompanyInfoQuery, useUpdateCompanyInfoMutation } from '@/services/api';
import { usePermissions } from '@/hooks/usePermissions';
import { colors } from "@/constants/colors";
import CompanyDataCard from './components/CompanyDataCard';
import CompanyAddressCard from './components/CompanyAddressCard';
import SafetyIntegrationCard from './components/SafetyIntegrationCard';
import CompanyLocationCard from './components/CompanyLocationCard';

export default function CompanyInfo() {
  const { can, isTerminal } = usePermissions();
  const canWrite = can('company_information', 'write');

  // Busca dados da empresa ao montar — RTK Query cuida do cache
  const { data, isLoading, isError } = useGetCompanyInfoQuery();
  const [updateCompanyInfo, { isLoading: isSaving }] = useUpdateCompanyInfoMutation();

  const [userFormData, setUserFormData] = useState(null);

  const formData = userFormData || data;

  const updateFormData = (updater) => {
    setUserFormData((prev) => {
      const base = prev || data || {};
      return typeof updater === 'function' ? updater(base) : updater;
    });
  };

  const hasChanges = useMemo(() => {
    if (!userFormData || !data) return false;
    return JSON.stringify(userFormData) !== JSON.stringify(data);
  }, [userFormData, data]);

  const isValid = !!formData?.name?.trim();
  const canSave = hasChanges && isValid;

  // --- Handlers ---
  const handleInputChange = (e) => {
    if (!canWrite) return;
    const { id, value } = e.target;

    updateFormData((prev) => {
      if (id.startsWith('address.')) {
        const key = id.replace('address.', '');
        return { ...prev, address: { ...prev.address, [key]: value } };
      } else if (id.startsWith('safety_integration.')) {
        const key = id.replace('safety_integration.', '');
        return {
          ...prev,
          safety_integration: { ...prev.safety_integration, [key]: value }
        };
      } else {
        return { ...prev, [id]: value };
      }
    });
  };

  const handleSave = async () => {
    if (!canSave) return;
    try {
      await updateCompanyInfo(formData).unwrap();
      setUserFormData(null); // reseta estado local para sincronizar com RTK Query
      toast.success('Informações da empresa salvas com sucesso!');
    } catch {
      toast.error('Erro ao salvar informações da empresa.');
    }
  };

  // ---------- Loading / Error ----------
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingState text="Carregando dados da empresa..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-sm text-gray-600">Não foi possível carregar as informações da empresa.</p>
          <p className="text-xs text-gray-400">Tente recarregar a página.</p>
        </div>
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="space-y-6 relative pb-8">
      {/* Header Sticky */}
      <div className="sticky -top-6 z-20 bg-background/80 backdrop-blur-md -mx-6 px-6 -mt-6 pt-6 pb-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primary + '1A' }}>
            <Building2 className="w-5 h-5" style={{ color: colors.primary }} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Configurações da Empresa</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie as informações e configurações da sua empresa</p>
          </div>
        </div>

        {canWrite && (
          <div className="flex-shrink-0">
            <ActionButton
              onClick={handleSave}
              isLoading={isSaving}
              disabled={!canSave}
              className={`h-9 ${!canSave ? "bg-gray-300 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-default border-gray-300 dark:border-gray-700" : ""}`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 mr-2" />
                  Salvar Alterações
                </>
              )}
            </ActionButton>
          </div>
        )}
      </div>

      {/* Banner somente leitura */}
      {!canWrite && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Você tem acesso somente leitura neste módulo.
        </div>
      )}

      {/* Dados da Empresa */}
      <CompanyDataCard
        formData={formData}
        handleInputChange={handleInputChange}
        canWrite={canWrite}
      />

      {/* Endereço */}
      <CompanyAddressCard
        formData={formData}
        handleInputChange={handleInputChange}
        canWrite={canWrite}
      />

      {/* Integração de Segurança (Somente Terminais) */}
      {isTerminal && (
        <SafetyIntegrationCard
          formData={formData}
          handleInputChange={handleInputChange}
          canWrite={canWrite}
        />
      )}

      {/* Coordenadas GPS */}
      <CompanyLocationCard
        formData={formData}
        setFormData={updateFormData}
        canWrite={canWrite}
      />
    </div>
  );
}