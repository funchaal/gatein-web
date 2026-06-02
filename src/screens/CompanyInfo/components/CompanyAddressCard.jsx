import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { ContainerHeader } from '@/components/ui/ContainerHeader';

export default function CompanyAddressCard({ formData, handleInputChange, canWrite }) {
  return (
    <Card className="border-gray-200 dark:border-0 shadow-none overflow-hidden">
      <ContainerHeader
        icon={MapPin}
        title="Endereço"
        description="Localização física da empresa"
        themeColor="blue"
      />
      <CardContent className="pt-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="address.street" className="text-xs font-medium text-gray-700 dark:text-gray-300">Rua</Label>
            <Input id="address.street" value={formData.address?.street ?? ''} onChange={handleInputChange} readOnly={!canWrite} className="" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address.number" className="text-xs font-medium text-gray-700 dark:text-gray-300">Número</Label>
            <Input id="address.number" value={formData.address?.number ?? ''} onChange={handleInputChange} readOnly={!canWrite} className="" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="address.city" className="text-xs font-medium text-gray-700 dark:text-gray-300">Cidade</Label>
            <Input id="address.city" value={formData.address?.city ?? ''} onChange={handleInputChange} readOnly={!canWrite} className="" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address.state" className="text-xs font-medium text-gray-700 dark:text-gray-300">Estado</Label>
            <Input id="address.state" value={formData.address?.state ?? ''} onChange={handleInputChange} readOnly={!canWrite} className="" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="address.zip" className="text-xs font-medium text-gray-700 dark:text-gray-300">CEP</Label>
            <Input id="address.zip" value={formData.address?.zip ?? ''} onChange={handleInputChange} readOnly={!canWrite} className="" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address.country" className="text-xs font-medium text-gray-700 dark:text-gray-300">País</Label>
            <Input id="address.country" value={formData.address?.country ?? ''} onChange={handleInputChange} readOnly={!canWrite} className="" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
