import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Settings2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { ContainerHeader } from '@/components/ui/ContainerHeader';

export default function CompanyCheckinCard({ formData, setFormData, canWrite }) {
  const handleSwitchChange = (checked) => {
    if (!canWrite) return;
    setFormData((prev) => ({ ...prev, use_remote_checkin: checked }));
  };

  return (
    <Card className="border-gray-200 dark:border-0 shadow-none overflow-hidden">
      <ContainerHeader
        icon={Settings2}
        title="Configurações de Check-in"
        description="Como os usuários podem fazer check-in"
        themeColor="purple"
      />
      <CardContent className="pt-4">
        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <Switch
            id="use_remote_checkin"
            checked={formData.use_remote_checkin ?? false}
            onCheckedChange={handleSwitchChange}
            disabled={!canWrite}
            className="data-[state=checked]:bg-orange-600"
          />
          <div>
            <Label htmlFor="use_remote_checkin" className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
              Ativar check-in remoto via Geofence
            </Label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Permite check-in automático ao entrar na área definida
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
