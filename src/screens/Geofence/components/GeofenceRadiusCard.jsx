import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Maximize2 } from 'lucide-react';
import { ContainerHeader } from '@/components/ui/ContainerHeader';
import { colors } from "@/constants/colors";

export default function GeofenceRadiusCard({ config, setConfig, canWrite, radiusInKm, areaInKm2 }) {
  return (
    <Card className="border-gray-200 dark:border-0 shadow-none overflow-hidden">
      <ContainerHeader
        icon={Maximize2}
        title="Raio de Atuação"
        description="Tamanho do perímetro"
        themeColor="purple"
      />
      <CardContent className="pt-4 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Distância</Label>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold" style={{ color: colors.primary }}>{config.radius}</span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">metros</span>
            </div>
          </div>

          <input
            type="range"
            min="100" max="5000" step="50"
            value={config.radius}
            disabled={!canWrite}
            onChange={(e) =>
              canWrite && setConfig((prev) => ({ ...prev, radius: parseInt(e.target.value) }))
            }
            className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ accentColor: colors.primary }}
          />

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Raio (km)</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{radiusInKm}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Área (km²)</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{areaInKm2}</p>
            </div>
          </div>

          {canWrite && (
            <div className="space-y-2 pt-2">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Presets Rápidos</Label>
              <div className="grid grid-cols-3 gap-2">
                {[500, 1000, 2000].map((r) => (
                  <button
                    key={r}
                    onClick={() => setConfig((prev) => ({ ...prev, radius: r }))}
                    className="px-3 py-2 text-xs font-medium bg-white dark:bg-card border border-gray-300 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-muted transition-colors dark:text-gray-300"
                  >
                    {r >= 1000 ? `${r / 1000}km` : `${r}m`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
