import { useState, useRef } from 'react';
import {
  Bell, Search, Edit2, Trash2, Plus, Image as ImageIcon, Calendar, Loader2, Info, ArrowLeft, Smartphone, AlertCircle, Upload, X,
  ZoomIn, ZoomOut, RotateCcw, Move
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useUpdateAnnouncementStatusMutation,
  useDeleteAnnouncementMutation,
  useGetPresignedAnnouncementImageUrlMutation,
} from '@/services/api';
import { ActionButton } from '@/components/ui/ActionButton';
import { colors } from "@/constants/colors";
import LoadingState from '@/components/LoadingState';
import { compressToWebP, uploadToR2 } from '@/lib/imageUpload';

export const getAnnouncementImageStyle = (position, naturalSize) => {
  const scale = position?.scale ?? 1;
  const x = position?.x ?? 50;
  const y = position?.y ?? 50;

  const Ac = 14 / 9;
  const naturalW = naturalSize?.width || position?.natural_width || 14;
  const naturalH = naturalSize?.height || position?.natural_height || 9;
  const Aimg = naturalW && naturalH ? naturalW / naturalH : (position?.aspect_ratio || Ac);

  let widthRatio = 1;
  let heightRatio = 1;

  if (Aimg >= Ac) {
    heightRatio = scale;
    widthRatio = (Aimg / Ac) * scale;
  } else {
    widthRatio = scale;
    heightRatio = (Ac / Aimg) * scale;
  }

  const maxX = Math.max(0, (widthRatio - 1) / 2);
  const maxY = Math.max(0, (heightRatio - 1) / 2);

  const panX = ((x - 50) / 50) * maxX;
  const panY = ((y - 50) / 50) * maxY;

  const leftPercent = (0.5 - widthRatio / 2 + panX) * 100;
  const topPercent = (0.5 - heightRatio / 2 + panY) * 100;
  const widthPercent = widthRatio * 100;
  const heightPercent = heightRatio * 100;

  return {
    width: `${widthPercent}%`,
    height: `${heightPercent}%`,
    left: `${leftPercent}%`,
    top: `${topPercent}%`,
  };
};

function AnnouncementThumbnail({ imageUrl, position }) {
  const [naturalSize, setNaturalSize] = useState(null);

  const isLegacy = position?.scale === undefined && position?.aspect_ratio === undefined && position?.y !== undefined && position?.y !== 50;

  if (isLegacy) {
    return (
      <img
        src={imageUrl}
        alt="Thumb"
        className="absolute w-full h-[180%] max-w-none pointer-events-none"
        style={{
          top: `${-((position.y / 100) * 80)}%`,
          left: 0,
          objectFit: 'cover'
        }}
      />
    );
  }

  const style = getAnnouncementImageStyle(position, naturalSize);

  return (
    <img
      src={imageUrl}
      alt="Thumb"
      className="absolute max-w-none pointer-events-none"
      style={{
        ...style,
        objectFit: 'cover',
      }}
      onLoad={(e) => {
        setNaturalSize({
          width: e.target.naturalWidth,
          height: e.target.naturalHeight,
        });
      }}
    />
  );
}

export default function Announcements() {
  const { data: announcementsData, isLoading, isError } = useGetAnnouncementsQuery();
  const [createAnnouncement, { isLoading: isCreating }] = useCreateAnnouncementMutation();
  const [updateAnnouncement, { isLoading: isUpdating }] = useUpdateAnnouncementMutation();
  const [deleteAnnouncement] = useDeleteAnnouncementMutation();
  const [updateStatus] = useUpdateAnnouncementStatusMutation();
  const [getPresignedAnnouncementUrl] = useGetPresignedAnnouncementImageUrlMutation();

  // ── LOCAL IMAGE STATE ──────────────────────────────────────────────────
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const isSaving = isCreating || isUpdating || isUploadingImage;

  // ── SCREEN ROUTING STATES ───────────────────────────────────────────
  const [viewMode, setViewMode] = useState('list');
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [imgNaturalSize, setImgNaturalSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    image_position: { x: 50, y: 50, scale: 1 },
    url: '',
    is_active: true,
    start_at: '',
    end_at: '',
  });

  const previewContainerRef = useRef(null);

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image_url: '',
      image_position: { x: 50, y: 50, scale: 1 },
      url: '',
      is_active: true,
      start_at: '',
      end_at: '',
    });
    setImgNaturalSize({ width: 0, height: 0 });
    setSelectedImageFile(null);
    setEditingAnnouncement(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato inválido. Selecione uma imagem PNG, JPEG ou WebP.');
      return;
    }
    const localUrl = URL.createObjectURL(file);
    setSelectedImageFile(file);
    setImgNaturalSize({ width: 0, height: 0 });
    setFormData((prev) => ({
      ...prev,
      image_url: localUrl,
      image_position: { x: 50, y: 50, scale: 1 },
    }));
  };

  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setFormData((prev) => ({ ...prev, image_url: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenEditor = (announcement = null) => {
    setSelectedImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (announcement) {
      setEditingAnnouncement(announcement);
      const startLocal = announcement.start_at ? announcement.start_at.substring(0, 16) : '';
      const endLocal = announcement.end_at ? announcement.end_at.substring(0, 16) : '';
      const pos = announcement.image_position || {};
      setFormData({
        title: announcement.title ?? '',
        subtitle: announcement.subtitle ?? '',
        description: announcement.description ?? '',
        image_url: announcement.image_url ?? '',
        image_position: {
          x: pos.x ?? 50,
          y: pos.y ?? 50,
          scale: pos.scale ?? 1,
          aspect_ratio: pos.aspect_ratio,
        },
        url: announcement.url ?? '',
        is_active: announcement.is_active ?? true,
        start_at: startLocal,
        end_at: endLocal,
      });
      setImgNaturalSize({ width: 0, height: 0 });
    } else {
      resetForm();
    }
    setViewMode('editor');
  };

  const handleCloseEditor = () => {
    setViewMode('list');
    resetForm();
  };

  const handleDragStart = (e) => {
    if (!previewContainerRef.current || !formData.image_url) return;
    e.preventDefault();

    const rect = previewContainerRef.current.getBoundingClientRect();
    const startX = e.clientX ?? e.touches?.[0]?.clientX;
    const startY = e.clientY ?? e.touches?.[0]?.clientY;
    if (startX === undefined || startY === undefined) return;

    setIsDragging(true);

    const startPosX = formData.image_position?.x ?? 50;
    const startPosY = formData.image_position?.y ?? 50;
    const scale = formData.image_position?.scale ?? 1;

    const Ac = 14 / 9;
    const naturalW = imgNaturalSize.width || formData.image_position?.natural_width || 14;
    const naturalH = imgNaturalSize.height || formData.image_position?.natural_height || 9;
    const Aimg = naturalW && naturalH ? naturalW / naturalH : (formData.image_position?.aspect_ratio || Ac);

    let widthRatio = 1;
    let heightRatio = 1;
    if (Aimg >= Ac) {
      heightRatio = scale;
      widthRatio = (Aimg / Ac) * scale;
    } else {
      widthRatio = scale;
      heightRatio = (Ac / Aimg) * scale;
    }

    const maxXRatio = Math.max(0, (widthRatio - 1) / 2);
    const maxYRatio = Math.max(0, (heightRatio - 1) / 2);

    const handleDragMove = (moveEvent) => {
      const currentX = moveEvent.clientX ?? moveEvent.touches?.[0]?.clientX;
      const currentY = moveEvent.clientY ?? moveEvent.touches?.[0]?.clientY;
      if (currentX === undefined || currentY === undefined) return;

      const deltaX = currentX - startX;
      const deltaY = currentY - startY;

      let newX = startPosX;
      if (maxXRatio > 0 && rect.width > 0) {
        const deltaXPos = (deltaX / (rect.width * maxXRatio)) * 50;
        newX = Math.max(0, Math.min(100, Math.round(startPosX + deltaXPos)));
      }

      let newY = startPosY;
      if (maxYRatio > 0 && rect.height > 0) {
        const deltaYPos = (deltaY / (rect.height * maxYRatio)) * 50;
        newY = Math.max(0, Math.min(100, Math.round(startPosY + deltaYPos)));
      }

      setFormData((prev) => ({
        ...prev,
        image_position: {
          ...prev.image_position,
          x: newX,
          y: newY,
        },
      }));
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };

    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleDragMove);
    window.addEventListener('touchend', handleDragEnd);
  };

  const handleWheel = (e) => {
    if (!formData.image_url) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    setFormData((prev) => {
      const currentScale = prev.image_position?.scale ?? 1;
      const newScale = Math.max(1, Math.min(3, Math.round((currentScale + delta) * 100) / 100));
      return {
        ...prev,
        image_position: {
          ...prev.image_position,
          scale: newScale,
        },
      };
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    let finalImageUrl = formData.image_url || null;

    // Direct Cloudflare R2 Upload ONLY if a new file was selected locally
    if (selectedImageFile) {
      setIsUploadingImage(true);
      try {
        // 1. Compress image to WebP (max width 1080px)
        const compressedBlob = await compressToWebP(selectedImageFile, 1080, 0.5);

        // 2. Obtain pre-signed upload URL from backend
        const { upload_url, public_url } = await getPresignedAnnouncementUrl().unwrap();

        // 3. PUT directly to R2
        await uploadToR2(upload_url, compressedBlob, 'image/webp');

        finalImageUrl = public_url;
      } catch (err) {
        console.error('Upload Error:', err);
        toast.error(`Erro ao fazer upload da imagem: ${err.message || 'Falha no envio'}`);
        setIsUploadingImage(false);
        return;
      } finally {
        setIsUploadingImage(false);
      }
    }

    let generatedTitle = formData.title;
    if (!generatedTitle || !generatedTitle.trim()) {
      if (finalImageUrl) {
        const urlParts = finalImageUrl.split('/');
        const filename = urlParts[urlParts.length - 1].split('?')[0].substring(0, 30);
        generatedTitle = `Anúncio (${filename})`;
      } else {
        generatedTitle = `Anúncio`;
      }
    }

    const payload = {
      title: generatedTitle,
      subtitle: null,
      description: null,
      image_url: finalImageUrl,
      image_position: formData.image_position,
      url: formData.url || null,
      is_active: formData.is_active,
      start_at: (!formData.is_active && formData.start_at) ? new Date(formData.start_at).toISOString() : null,
      end_at: formData.end_at ? new Date(formData.end_at).toISOString() : null,
    };

    try {
      if (editingAnnouncement) {
        await updateAnnouncement({ id: editingAnnouncement.id, ...payload }).unwrap();
        toast.success('Anúncio atualizado com sucesso!');
      } else {
        await createAnnouncement(payload).unwrap();
        toast.success('Anúncio criado com sucesso!');
      }
      handleCloseEditor();
    } catch {
      toast.error('Erro ao salvar o anúncio. Verifique os dados inseridos.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir de fato este anúncio?')) return;
    try {
      await deleteAnnouncement(id).unwrap();
      toast.success('Anúncio excluído com sucesso.');
      if (viewMode === 'editor') {
        handleCloseEditor();
      }
    } catch {
      toast.error('Erro ao excluir o anúncio.');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await updateStatus({ id, is_active: !currentStatus }).unwrap();
      toast.success(`Anúncio ${!currentStatus ? 'ativado' : 'desativado'} com sucesso.`);
    } catch {
      toast.error('Erro ao alterar status do anúncio.');
    }
  };

  const announcements = announcementsData || [];
  const filtered = announcements.filter((a) => {
    const term = searchTerm.toLowerCase();
    return a.title?.toLowerCase().includes(term) || a.subtitle?.toLowerCase().includes(term);
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ── VIEW: LIST MODE ────────────────────────────────────────────────
  if (viewMode === 'list') {
    if (isLoading) {
      return <LoadingState text="Carregando anúncios..." />;
    }

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primary + '1A' }}>
              <Bell className="w-5 h-5" style={{ color: colors.primary }} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Gerenciamento de Anúncios</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Configure anúncios informativos com imagens em destaque para os motoristas</p>
            </div>
          </div>
          <ActionButton onClick={() => handleOpenEditor()}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Anúncio
          </ActionButton>
        </div>

        {/* Main Card List */}
        <Card className="border-gray-200 dark:border-0 shadow-none overflow-hidden">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-transparent">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Lista de Anúncios</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {filtered.length} anúncio{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
              <div className="relative w-72">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  placeholder="Buscar por título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <LoadingState text="Carregando anúncios..." />
            ) : isError ? (
              <div className="flex items-center justify-center py-12 gap-2 text-red-500">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">Erro ao carregar anúncios.</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Nenhum anúncio encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-3">Anúncio (14:9 Preview)</th>
                      <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-3">Início</th>
                      <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-3">Fim</th>
                      <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-3">Ativo</th>
                      <th className="text-right text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 max-w-xs md:max-w-md">
                          <div className="flex gap-4 items-center">
                            <div
                              className="w-24 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden relative border border-gray-200 dark:border-gray-800 flex-shrink-0"
                              style={{ aspectRatio: '14 / 9' }}
                            >
                              {item.image_url ? (
                                <AnnouncementThumbnail
                                  imageUrl={item.image_url}
                                  position={item.image_position}
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <ImageIcon className="w-4 h-4 text-gray-400" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{item.title}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.subtitle || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                          {formatDate(item.start_at)}
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                          {formatDate(item.end_at)}
                        </td>
                        <td className="px-6 py-4">
                          <Switch
                            checked={item.is_active}
                            onCheckedChange={() => handleToggleStatus(item.id, item.is_active)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditor(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── VIEW: EDITOR MODE ──────────────────────────────────────────────
  return (
    <>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Editor Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCloseEditor}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {editingAnnouncement ? 'Editar Anúncio' : 'Criar Novo Anúncio'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {editingAnnouncement ? 'Atualize as informações do anúncio selecionado' : 'Crie um anúncio com imagem e controle de enquadramento vertical'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {editingAnnouncement && (
              <Button
                variant="destructive"
                onClick={() => handleDelete(editingAnnouncement.id)}
                disabled={isSaving}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Anúncio
              </Button>
            )}
            <Button variant="outline" onClick={handleCloseEditor} disabled={isSaving}>
              Cancelar
            </Button>
            <ActionButton onClick={handleSubmit} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar Anúncio
            </ActionButton>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Editor Form Panel */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="bg-white dark:bg-card border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-base font-semibold">Configuração do Conteúdo</CardTitle>
                <CardDescription>Defina a imagem de destaque, cronograma e o status.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">

                {/* ── Image Upload ── */}
                <div className="space-y-1">
                  <Label className="text-sm font-semibold">Imagem do Anúncio</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="flex items-start gap-3">
                    {/* Thumbnail preview */}
                    <div
                      className="w-24 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative group cursor-pointer"
                      style={{ aspectRatio: '14 / 9' }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {formData.image_url ? (
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.opacity = 0; }}
                        />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1 flex flex-col gap-2">
                      {formData.image_url && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="truncate max-w-[220px]">
                            {selectedImageFile ? selectedImageFile.name : formData.image_url.split('/').pop()}
                          </span>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="flex-shrink-0 ml-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Remover imagem"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed text-sm font-medium transition-colors"
                        style={{
                          borderColor: colors.primary + '80',
                          color: colors.primary,
                        }}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {formData.image_url ? 'Substituir imagem' : 'Selecionar imagem'}
                      </button>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">
                        PNG, JPEG ou WebP — o upload será feito ao salvar o anúncio.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="url" className="text-sm font-semibold">URL de Redirecionamento (Opcional)</Label>
                  <Input
                    id="url"
                    placeholder="Insira um link para redirecionamento ao clicar (ex: site, regulamento...)"
                    value={formData.url || ''}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl mb-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_active" className="text-sm font-semibold">Ativar imediatamente</Label>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Exibir o anúncio aos motoristas a partir de agora</p>
                  </div>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => {
                      setFormData((prev) => ({
                        ...prev,
                        is_active: checked,
                        start_at: checked ? '' : prev.start_at,
                      }));
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="start_at" className="text-sm font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-200" /> Início da Exibição
                    </Label>
                    <Input
                      id="start_at"
                      type="datetime-local"
                      value={formData.is_active ? '' : formData.start_at}
                      disabled={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                      className="[&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="end_at" className="text-sm font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-200" /> Fim da Exibição
                    </Label>
                    <Input
                      id="end_at"
                      type="datetime-local"
                      value={formData.end_at}
                      onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                      className="[&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Preview Panel Column */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-white dark:bg-card border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden sticky top-6">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-orange-500" />
                  Visualização no Aplicativo (14:9)
                </CardTitle>
                <CardDescription>Veja em tempo real como o banner será exibido no celular do motorista.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-6 bg-white dark:bg-card">
                {/* Phone Aspect Container */}
                <div
                  ref={previewContainerRef}
                  onMouseDown={handleDragStart}
                  onTouchStart={handleDragStart}
                  onWheel={handleWheel}
                  className={`relative w-full overflow-hidden bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 select-none shadow-lg transition-shadow ${
                    formData.image_url
                      ? isDragging
                        ? 'cursor-grabbing'
                        : 'cursor-grab hover:ring-2 hover:ring-orange-500/40'
                      : ''
                  }`}
                  style={{ aspectRatio: '14 / 9' }}
                  title={formData.image_url ? 'Clique e arraste para reposicionar a imagem' : ''}
                >
                  {formData.image_url ? (
                    <img
                      src={formData.image_url}
                      alt="Aviso Preview"
                      className="absolute max-w-none pointer-events-none select-none"
                      style={getAnnouncementImageStyle(formData.image_position, imgNaturalSize)}
                      onError={(e) => {
                        e.target.style.opacity = 0;
                      }}
                      onLoad={(e) => {
                        e.target.style.opacity = 1;
                        const nw = e.target.naturalWidth;
                        const nh = e.target.naturalHeight;
                        setImgNaturalSize({ width: nw, height: nh });
                        if (nw && nh) {
                          setFormData((prev) => ({
                            ...prev,
                            image_position: {
                              ...prev.image_position,
                              aspect_ratio: Math.round((nw / nh) * 1000) / 1000,
                            },
                          }));
                        }
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-900">
                      <ImageIcon className="w-8 h-8 mb-2 text-gray-300 dark:text-gray-600" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Selecione uma imagem no formulário</span>
                    </div>
                  )}

                  {/* Segmented Progress Bar */}
                  <div className="absolute bottom-4 left-5 right-5 flex justify-between gap-[5px] h-[5px] pointer-events-none items-center">
                    <div className="flex-1 bg-white/35 rounded-full overflow-hidden h-full">
                      <div className="bg-white h-full w-full rounded-full" />
                    </div>
                    <div className="flex-1 bg-white/35 rounded-full overflow-hidden h-full">
                      <div className="bg-white h-full w-[60%] rounded-full animate-pulse" />
                    </div>
                    <div className="flex-1 bg-white/35 rounded-full overflow-hidden h-full">
                      <div className="bg-white h-full w-0 rounded-full" />
                    </div>
                  </div>
                </div>

                {formData.image_url && (
                  <div className="w-full flex flex-col gap-3 pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                        <Move className="w-3.5 h-3.5 text-orange-500" />
                        Enquadramento & Zoom
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            image_position: {
                              ...prev.image_position,
                              x: 50,
                              y: 50,
                              scale: 1,
                            },
                          }));
                        }}
                        className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 hover:underline font-medium cursor-pointer"
                        title="Restaurar posição central e zoom 100%"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Centralizar
                      </button>
                    </div>

                    {/* Zoom slider bar */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            image_position: {
                              ...prev.image_position,
                              scale: Math.max(1, Math.round(((prev.image_position?.scale ?? 1) - 0.1) * 100) / 100),
                            },
                          }));
                        }}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Diminuir Zoom"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>

                      <input
                        type="range"
                        min="1.0"
                        max="3.0"
                        step="0.05"
                        value={formData.image_position?.scale ?? 1}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setFormData((prev) => ({
                            ...prev,
                            image_position: {
                              ...prev.image_position,
                              scale: val,
                            },
                          }));
                        }}
                        className="flex-1 accent-orange-500 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            image_position: {
                              ...prev.image_position,
                              scale: Math.min(3, Math.round(((prev.image_position?.scale ?? 1) + 0.1) * 100) / 100),
                            },
                          }));
                        }}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Aumentar Zoom"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>

                      <span className="text-xs font-mono font-medium text-gray-600 dark:text-gray-300 w-12 text-right">
                        {Math.round((formData.image_position?.scale ?? 1) * 100)}%
                      </span>
                    </div>

                    <span className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 flex-shrink-0" />
                      Arraste a imagem em qualquer direção para posicionar. Use o slider ou o scroll do mouse para regular o zoom.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
