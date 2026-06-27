import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Navigation } from 'lucide-react';
import LeafletMap from '@/components/LeafletMap/LeafletMap';
import { toast } from 'sonner';
import { ContainerHeader } from '@/components/ui/ContainerHeader';

export default function CompanyLocationCard({ formData, setFormData, canWrite }) {
  const handleMapClick = (latlng) => {
    if (!canWrite) return;
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, lat: latlng.lat, lng: latlng.lng },
    }));
    toast.info(`Localização: ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`);
  };

  return (
    <Card className="border-gray-200 dark:border-0 shadow-none overflow-hidden">
      <ContainerHeader
        icon={Navigation}
        title="Coordenadas GPS"
        description={canWrite ? 'Clique no mapa para definir a localização' : 'Localização da empresa'}
        themeColor="green"
      />
      <CardContent className="p-0">
        <div className="w-full border-b border-gray-100 dark:border-gray-800">
          <LeafletMap
            lat={formData.address?.lat ?? -15.77972}
            lng={formData.address?.lng ?? -47.92972}
            onMapClick={handleMapClick}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
          <div className="space-y-1.5">
            <Label htmlFor="address.lat" className="text-xs font-medium text-gray-700 dark:text-gray-300">Latitude</Label>
            <Input
              id="address.lat"
              type="number"
              value={formData.address?.lat ?? ''}
              onChange={(e) => {
                if (canWrite) {
                  setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, lat: parseFloat(e.target.value) || 0 }
                  }));
                }
              }}
              readOnly={!canWrite}
              step="any"
              className={`font-mono text-sm ${!canWrite ? 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400' : ''}`}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address.lng" className="text-xs font-medium text-gray-700 dark:text-gray-300">Longitude</Label>
            <Input
              id="address.lng"
              type="number"
              value={formData.address?.lng ?? ''}
              onChange={(e) => {
                if (canWrite) {
                  setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, lng: parseFloat(e.target.value) || 0 }
                  }));
                }
              }}
              readOnly={!canWrite}
              step="any"
              className={`font-mono text-sm ${!canWrite ? 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400' : ''}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
