import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { ContainerHeader } from '@/components/ui/ContainerHeader';
import LeafletMap from '@/components/LeafletMap/LeafletMap';

export default function GeofenceMapCard({ config, handleMapClick, canWrite }) {
  return (
    <Card className="border-gray-200 dark:border-0 shadow-none overflow-hidden h-full flex flex-col">
      <ContainerHeader
        icon={MapPin}
        title="Visualização do Perímetro"
        description={canWrite ? 'Clique no mapa para ajustar a localização central' : 'Visualização somente leitura'}
        themeColor="blue"
        action={
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-green-700 dark:text-green-400">Ativo</span>
          </div>
        }
      />
      <CardContent className="p-0 flex-1">
        <LeafletMap
          lat={config.center.lat}
          lng={config.center.lng}
          radius={config.radius}
          onMapClick={handleMapClick}
        />
      </CardContent>
    </Card>
  );
}
