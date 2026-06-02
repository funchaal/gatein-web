import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Navigation } from 'lucide-react';
import { ContainerHeader } from '@/components/ui/ContainerHeader';

export default function GeofenceCoordinatesCard({ config, setConfig, canWrite }) {
  return (
    <Card className="border-gray-200 dark:border-0 shadow-none overflow-hidden">
      <ContainerHeader
        icon={Navigation}
        title="Coordenadas Centrais"
        description="Centro do perímetro"
        themeColor="green"
      />
      <CardContent className="pt-4 space-y-4">
        {[
          { id: 'latitude', label: 'Latitude', key: 'lat' },
          { id: 'longitude', label: 'Longitude', key: 'lng' },
        ].map(({ id, label, key }) => (
          <div key={id} className="space-y-2">
            <Label htmlFor={id} className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</Label>
            <Input
              id={id}
              type="number"
              value={config.center[key]}
              onChange={(e) =>
                canWrite && setConfig((prev) => ({
                  ...prev,
                  center: { ...prev.center, [key]: parseFloat(e.target.value) || 0 },
                }))
              }
              readOnly={!canWrite}
              step="0.0001"
              className="font-mono text-sm focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
