import { useState, useEffect, useMemo } from 'react';
import {
  MapPin, Navigation, Maximize2, Save, AlertCircle, Loader2, Info
} from 'lucide-react';
import LeafletMap from '@/components/LeafletMap/LeafletMap';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ActionButton } from '@/components/ui/ActionButton';
import LoadingState from '@/components/LoadingState';
import { toast } from 'sonner';
import { useGetGeofenceQuery, useUpdateGeofenceMutation } from '@/services/api';
import { usePermissions } from '@/hooks/usePermissions';
import { DEFAULT_CENTER, DEFAULT_RADIUS } from './helpers';
import { colors } from "@/constants/colors";
import { ContainerHeader } from '@/components/ui/ContainerHeader';
import GeofenceCoordinatesCard from './components/GeofenceCoordinatesCard';
import GeofenceRadiusCard from './components/GeofenceRadiusCard';
import GeofenceMapCard from './components/GeofenceMapCard';

export default function Geofence() {
  const { can } = usePermissions();
  const canWrite = can('geofence', 'write');

  // Busca geofence ao montar — RTK Query cuida do cache
  const { data, isLoading, isError } = useGetGeofenceQuery();
  const [updateGeofence, { isLoading: isSaving }] = useUpdateGeofenceMutation();

  const [config, setConfig] = useState({
    center: DEFAULT_CENTER,
    radius: DEFAULT_RADIUS,
  });

  const [originalConfig, setOriginalConfig] = useState(null);

  // Popula o form quando os dados chegam
  useEffect(() => {
    if (!data) return;

    const { geofence, address } = data;

    const initialConfig = {
      center: {
        lat: geofence?.center?.lat ?? address?.lat ?? DEFAULT_CENTER.lat,
        lng: geofence?.center?.lng ?? address?.lng ?? DEFAULT_CENTER.lng,
      },
      radius: geofence?.radius ?? DEFAULT_RADIUS,
    };
    setConfig(initialConfig);
    setOriginalConfig(initialConfig);
  }, [data]);

  const hasChanges = useMemo(() => {
    if (!originalConfig) return false;
    return (
      config.center.lat !== originalConfig.center.lat ||
      config.center.lng !== originalConfig.center.lng ||
      config.radius !== originalConfig.radius
    );
  }, [config, originalConfig]);

  const isValid = typeof config.center.lat === 'number' && typeof config.center.lng === 'number' && config.radius > 0;
  const canSave = hasChanges && isValid;

  const handleMapClick = (latlng) => {
    if (!canWrite) return;
    setConfig((prev) => ({ ...prev, center: { lat: latlng.lat, lng: latlng.lng } }));
    toast.info(`Centro: ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`);
  };

  const handleSave = async () => {
    if (!canSave) return;
    try {
      await updateGeofence({
        geofence: { center: config.center, radius: config.radius },
      }).unwrap();
      setOriginalConfig(config); // Update original config after save
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primary + '1A' }}>
          <MapPin className="w-5 h-5" style={{ color: colors.primary }} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Configuração de Geofence</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Defina o perímetro de validação para check-in automático</p>
        </div>
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
          {/* Coordenadas */}
          <GeofenceCoordinatesCard
            config={config}
            setConfig={setConfig}
            canWrite={canWrite}
          />

          {/* Raio */}
          <GeofenceRadiusCard
            config={config}
            setConfig={setConfig}
            canWrite={canWrite}
            radiusInKm={radiusInKm}
            areaInKm2={areaInKm2}
          />

          {/* Salvar — só exibe se tiver permissão */}
          {canWrite && (
            <Card className="border-gray-200 dark:border-0 shadow-none">
              <CardContent className="p-4">
                <ActionButton
                  onClick={handleSave}
                  isLoading={isSaving}
                  disabled={!canSave}
                  className={`w-full ${!canSave ? "bg-gray-300 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-default border-gray-300 dark:border-gray-700" : ""}`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Configurações
                    </>
                  )}
                </ActionButton>
              </CardContent>
            </Card>
          )}
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
