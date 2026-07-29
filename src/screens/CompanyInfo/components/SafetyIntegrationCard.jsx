import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import { ContainerHeader } from '@/components/ui/ContainerHeader';

export default function SafetyIntegrationCard({ formData, handleInputChange, canWrite }) {
  const safetyIntegration = formData.safety_integration || {
    active: false,
    video_url: '',
    form_url: '',
    blocks_checkin: false
  };

  const handleSwitchChange = (field, checked) => {
    if (!canWrite) return;
    // Emulate an event object
    handleInputChange({
      target: {
        id: `safety_integration.${field}`,
        value: checked
      }
    });
  };

  return (
    <Card className="border-gray-200 dark:border-0 shadow-none overflow-hidden mt-4">
      <ContainerHeader
        icon={ShieldCheck}
        title="Integração de Segurança Online"
        description="Configuração de vídeo e perguntas obrigatórias para motoristas"
        themeColor="blue"
      />
      <CardContent className="pt-4 space-y-5">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div>
            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Ativar Integração de Segurança</Label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Exige que motoristas assistam ao vídeo de integração no aplicativo.</p>
          </div>
          <Switch
            checked={safetyIntegration.active}
            onCheckedChange={(checked) => handleSwitchChange('active', checked)}
            disabled={!canWrite}
          />
        </div>

        {safetyIntegration.active && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-1.5">
              <Label htmlFor="safety_integration.video_url" className="text-xs font-medium text-gray-700 dark:text-gray-300">URL do Vídeo (Obrigatório)</Label>
              <Input
                id="safety_integration.video_url"
                placeholder="Ex: https://www.youtube.com/watch?v=..."
                value={safetyIntegration.video_url || ''}
                onChange={handleInputChange}
                readOnly={!canWrite}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="safety_integration.form_url" className="text-xs font-medium text-gray-700 dark:text-gray-300">URL do Formulário (Opcional)</Label>
              <Input
                id="safety_integration.form_url"
                placeholder="Ex: https://forms.gle/..."
                value={safetyIntegration.form_url || ''}
                onChange={handleInputChange}
                readOnly={!canWrite}
              />
              <p className="text-[10px] text-gray-500">Se preenchido, o motorista precisará responder as perguntas após o vídeo.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <div>
                <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Bloquear Check-in Remoto</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Não permite que o motorista faça check-in se a integração estiver pendente.</p>
              </div>
              <Switch
                checked={safetyIntegration.blocks_checkin}
                onCheckedChange={(checked) => handleSwitchChange('blocks_checkin', checked)}
                disabled={!canWrite}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
