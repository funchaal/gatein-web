import { useState, useMemo, useCallback } from 'react';
import {
  MapPin, Save, AlertCircle, Loader2, Info
} from 'lucide-react';
import { ActionButton } from '@/components/ui/ActionButton';
import LoadingState from '@/components/LoadingState';
import { toast } from 'sonner';
import { useGetGeofenceQuery, useUpdateGeofenceMutation } from '@/services/api';
import { usePermissions } from '@/hooks/usePermissions';
import { DEFAULT_CENTER, DEFAULT_RADIUS } from './helpers';
import { colors } from "@/constants/colors";
import GeofenceCoordinatesCard from './components/GeofenceCoordinatesCard';
import GeofenceRadiusCard from './components/GeofenceRadiusCard';
import GeofenceMapCard from './components/GeofenceMapCard';
import GeofenceCheckinCard from './components/GeofenceCheckinCard';

export default function Geofence() {
  const { can } = usePermissions();
  const canWrite = can('geofence', 'write');

  // Busca geofence ao montar — RTK Query cuida do cache
  const { data, isLoading, isError } = useGetGeofenceQuery();
  const [updateGeofence, { isLoading: isSaving }] = useUpdateGeofenceMutation();

  const [userConfig, setUserConfig] = useState(null);

  const serverConfig = useMemo(() => {
    if (!data) return { center: DEFAULT_CENTER, radius: DEFAULT_RADIUS, use_remote_checkin: false };
    const { geofence, address, use_remote_checkin } = data;
    return {
      center: {
        lat: geofence?.center?.lat ?? address?.lat ?? DEFAULT_CENTER.lat,
        lng: geofence?.center?.lng ?? address?.lng ?? DEFAULT_CENTER.lng,
      },
      radius: geofence?.radius ?? DEFAULT_RADIUS,
      use_remote_checkin: use_remote_checkin ?? false,
    };
  }, [data]);

  const config = userConfig || serverConfig;

  const updateConfig = useCallback((updater) => {
    setUserConfig((prev) => {
      const base = prev || serverConfig;
      return typeof updater === 'function' ? updater(base) : updater;
    });
  }, [serverConfig]);

  const hasChanges = useMemo(() => {
    if (!userConfig) return false;
    return JSON.stringify(userConfig) !== JSON.stringify(serverConfig);
  }, [userConfig, serverConfig]);

  const isValid = typeof config.center.lat === 'number' && typeof config.center.lng === 'number' && config.radius > 0;
  const canSave = hasChanges && isValid;

  const handleMapClick = useCallback((latlng) => {
    if (!canWrite) return;
    updateConfig((prev) => ({ ...prev, center: { lat: latlng.lat, lng: latlng.lng } }));
    toast.info(`Centro: ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`);
  }, [canWrite, updateConfig]);

  const handleSave = async () => {
    if (!canSave) return;
    try {
      await updateGeofence({
        geofence: { center: config.center, radius: config.radius },
        use_remote_checkin: config.use_remote_checkin,
      }).unwrap();
      setUserConfig(null); // Reseta para o estado sincronizado com RTK Query
      toast.success('Geofence salva com sucesso!');
    } catch {
      toast.error('Erro ao salvar geofence.');
    }
  };

  const radiusInKm = (config.radius / 1000).toFixed(2);
  const areaInKm2 = (Math.PI * Math.pow(config.radius / 1000, 2)).toFixed(2);

  // ---------- Loading / Error ----------
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingState text="Carregando geofence..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-sm text-gray-600">Não foi possível carregar a geofence.</p>
          <p className="text-xs text-gray-400">Tente recarregar a página.</p>
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
            <MapPin className="w-5 h-5" style={{ color: colors.primary }} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Configuração de Geofence</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Defina o perímetro de validação para check-in automático</p>
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
        <div className="flex items-start gap-3 p-4 border border-gray-200 dark:border-none rounded-xl bg-gray-50/50 dark:bg-[#1B1B1B]">
          <AlertCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Você tem acesso somente leitura neste módulo.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Controles */}
        <div className="space-y-6">
          {/* Check-in Remoto */}
          <GeofenceCheckinCard
            useRemoteCheckin={config.use_remote_checkin}
            setUseRemoteCheckin={(val) => updateConfig((prev) => ({ ...prev, use_remote_checkin: val }))}
            canWrite={canWrite}
          />

          {/* Coordenadas */}
          <GeofenceCoordinatesCard
            config={config}
            setConfig={updateConfig}
            canWrite={canWrite}
          />

          {/* Raio */}
          <GeofenceRadiusCard
            config={config}
            setConfig={updateConfig}
            canWrite={canWrite}
            radiusInKm={radiusInKm}
            areaInKm2={areaInKm2}
          />
        </div>

        {/* Mapa */}
        <div className="lg:col-span-2">
          <GeofenceMapCard
            config={config}
            handleMapClick={handleMapClick}
            canWrite={canWrite}
          />
        </div>
      </div>

      {/* Info Footer */}
      <div className="flex items-start gap-3 p-4 border border-gray-200 dark:border-none rounded-xl bg-gray-50/50 dark:bg-[#1B1B1B]">
        <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Dicas Importantes</p>
          <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5 list-disc list-inside">
            <li>O check-in automático será validado apenas dentro do perímetro definido</li>
            <li>Raios maiores podem incluir áreas indesejadas — ajuste conforme necessário</li>
            <li>Clique no mapa para reposicionar o centro do perímetro</li>
            <li>As alterações só têm efeito após clicar em "Salvar Configurações"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
