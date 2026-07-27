import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Camera } from 'lucide-react';
import { ContainerHeader } from '@/components/ui/ContainerHeader';
import { toast } from 'sonner';
import ImageUploadModal from '@/components/ui/ImageUploadModal';
import {
  useGetPresignedCompanyLogoUrlMutation,
  useUpdateCompanyLogoMutation,
} from '@/services/api';
import { colors } from '@/constants/colors';

export default function CompanyDataCard({ formData, handleInputChange, canWrite }) {
  const [logoModalOpen, setLogoModalOpen] = useState(false);

  const [getPresignedUrl] = useGetPresignedCompanyLogoUrlMutation();
  const [updateCompanyLogo] = useUpdateCompanyLogoMutation();

  // Current logo URL — prioritise logo_url field (set by upload flow), fallback to config
  const currentLogoUrl =
    formData?.logo_url ||
    formData?.config?.logo_url ||
    formData?.config?.logo ||
    null;

  const companyInitials = formData?.name
    ? formData.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : '?';

  // ── Presign handler passed to the modal ──────────────────────────────────
  const handlePresign = async (contentType) => {
    const result = await getPresignedUrl(contentType).unwrap();
    return result; // { upload_url, image_path, public_url }
  };

  // ── Called after successful R2 upload ─────────────────────────────────────
  const handleUploadSuccess = async (publicUrl) => {
    try {
      await updateCompanyLogo({ logo_url: publicUrl }).unwrap();
      toast.success('Logo da empresa atualizada com sucesso!');
    } catch {
      toast.error('Imagem enviada, mas houve um erro ao salvar a URL. Tente novamente.');
    }
  };

  return (
    <>
      <Card className="border-gray-200 dark:border-0 shadow-none overflow-hidden">
        <ContainerHeader
          icon={Building}
          title="Dados da Empresa"
          description="Dados oficiais da sua empresa"
          themeColor="indigo"
        />
        <CardContent className="pt-4">
          <div className="flex items-start gap-6 flex-wrap">

            {/* ── Logo / Avatar ── */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="relative group">
                {/* Circle avatar */}
                <div
                  className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-100 dark:bg-gray-800 flex-shrink-0"
                  style={{ minWidth: 80, minHeight: 80 }}
                >
                  {currentLogoUrl ? (
                    <img
                      src={currentLogoUrl}
                      alt="Logo da empresa"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span className="text-xl font-bold text-gray-500 dark:text-gray-400 select-none">
                      {companyInitials}
                    </span>
                  )}
                </div>

                {/* Edit overlay (only if canWrite) */}
                {canWrite && (
                  <button
                    onClick={() => setLogoModalOpen(true)}
                    className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                    title="Editar foto do perfil da empresa"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                )}
              </div>

              {canWrite && (
                <button
                  onClick={() => setLogoModalOpen(true)}
                  className="text-xs font-medium transition-colors"
                  style={{ color: colors.primary }}
                >
                  Editar foto
                </button>
              )}
            </div>

            {/* ── Fields ── */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Nome da Empresa</Label>
                <Input
                  id="name"
                  value={formData.name ?? ''}
                  onChange={handleInputChange}
                  readOnly={!canWrite}
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
          </div>
        </CardContent>
      </Card>

      {/* ── Upload Modal ── */}
      <ImageUploadModal
        isOpen={logoModalOpen}
        onClose={() => setLogoModalOpen(false)}
        mode="profile"
        onPresign={handlePresign}
        onSuccess={handleUploadSuccess}
      />
    </>
  );
}
