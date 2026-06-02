import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import LoadingState from '@/components/LoadingState';
import LeafletMap from '@/components/LeafletMap/LeafletMap';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Building2, Building, MapPin, Navigation, Settings2, Save, AlertCircle, Loader2 } from 'lucide-react';
import { useGetCompanyInfoQuery, useUpdateCompanyInfoMutation } from '@/services/api';
import { usePermissions } from '@/hooks/usePermissions';
import { ActionButton } from '@/components/ui/ActionButton';
import { colors } from "@/constants/colors";
import { ContainerHeader } from '@/components/ui/ContainerHeader';
import CompanyDataCard from './components/CompanyDataCard';
import CompanyAddressCard from './components/CompanyAddressCard';
import CompanyLocationCard from './components/CompanyLocationCard';
import CompanyCheckinCard from './components/CompanyCheckinCard';

export default function CompanyInfo() {
  const { can, isTerminal } = usePermissions();
  const canWrite = can('company_information', 'write');

  const { data, isLoading, isError } = useGetCompanyInfoQuery();
  const [updateCompanyInfo, { isLoading: isSaving }] = useUpdateCompanyInfoMutation();

  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);

  // Popula o form quando os dados chegam do servidor
  useEffect(() => {
    if (data) {
      setFormData(data);
      setOriginalData(data);
    }
  }, [data]);

  const hasChanges = useMemo(() => {
    if (!originalData || !formData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  }, [formData, originalData]);

  const isValid = !!formData?.name?.trim();
  const canSave = hasChanges && isValid;

  // --- Handlers ---
  const handleInputChange = (e) => {
    if (!canWrite) return;
    const { id, value } = e.target;

    // IDs no formato "address.street" atualizam o objeto aninhado
    if (id.startsWith('address.')) {
      const key = id.replace('address.', '');
      setFormData((prev) => ({ ...prev, address: { ...prev.address, [key]: value } }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleSwitchChange = (checked) => {
    if (!canWrite) return;
    setFormData((prev) => ({ ...prev, use_remote_checkin: checked }));
  };

  const handleMapClick = (latlng) => {
    if (!canWrite) return;
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, lat: latlng.lat, lng: latlng.lng },
    }));
    toast.info(`Localização: ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`);
  };

  const handleSave = async () => {
    if (!canSave) return;
    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        // use_remote_checkin e geofence só existem em terminais — o backend ignora para trucking
        ...(isTerminal && { use_remote_checkin: formData.use_remote_checkin }),
      };
      await updateCompanyInfo(payload).unwrap();
      setOriginalData(formData);
      toast.success('Configurações salvas com sucesso!');
    } catch (err) {
      const msg = err?.data?.detail?.message ?? 'Falha ao salvar configurações.';
      toast.error(msg);
    }
  };

  // ---------- Loading / Error ----------
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingState text="Carregando configurações..." />
      </div>
    );
  }

  if (isError || !formData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3 max-w-md">
          <div className="bg-red-50 dark:bg-red-950/30 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
            <Settings2 className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Erro ao carregar</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Não foi possível carregar as informações da empresa.</p>
        </div>
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="space-y-4 relative pb-8">
      {/* Header */}
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

      {/* Coordenadas GPS */}
      <CompanyLocationCard
        formData={formData}
        setFormData={setFormData}
        canWrite={canWrite}
      />

      {/* Check-in remoto — apenas terminais têm esse campo */}
      {isTerminal && (
        <CompanyCheckinCard
          formData={formData}
          setFormData={setFormData}
          canWrite={canWrite}
        />
      )}

    </div>
  );
}