import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Building } from 'lucide-react';
import { ContainerHeader } from '@/components/ui/ContainerHeader';

export default function CompanyDataCard({ formData, handleInputChange, canWrite }) {
  return (
    <Card className="border-gray-200 dark:border-0 shadow-none overflow-hidden">
      <ContainerHeader
        icon={Building}
        title="Dados da Empresa"
        description="Dados oficiais da sua empresa"
        themeColor="indigo"
      />
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Nome da Empresa</Label>
            <Input
              id="name"
              value={formData.name ?? ''}
              onChange={handleInputChange}
              readOnly={!canWrite}
              className=""
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">CNPJ</Label>
            {/* tax_id é desabilitado — o backend não aceita alteração */}
            <Input
              value={formData.tax_id ?? ''}
              disabled
              disabledHoverMessage="Não é possível alterar o CNPJ"
              className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-mono text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
