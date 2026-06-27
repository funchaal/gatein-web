import { useState, useRef } from 'react';
import {
  Bell, Search, Edit2, Trash2, Plus, Image as ImageIcon, Calendar, Power, Loader2, Info, ArrowLeft, Smartphone, AlertCircle
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
  useGetCompanyInfoQuery,
} from '@/services/api';
import { ActionButton } from '@/components/ui/ActionButton';
import { colors } from "@/constants/colors";
import LoadingState from '@/components/LoadingState';

export default function Announcements() {
  const { data: announcementsData, isLoading, isError } = useGetAnnouncementsQuery();
  const { data: companyInfo } = useGetCompanyInfoQuery();
  const [createAnnouncement, { isLoading: isCreating }] = useCreateAnnouncementMutation();
  const [updateAnnouncement, { isLoading: isUpdating }] = useUpdateAnnouncementMutation();
  const [deleteAnnouncement] = useDeleteAnnouncementMutation();
  const [updateStatus] = useUpdateAnnouncementStatusMutation();

  const isSaving = isCreating || isUpdating;

  // ── SCREEN ROUTING STATES ───────────────────────────────────────────
  // Controls current active screen mode: "list" (showing all announcements) or "editor" (editing page)
  const [viewMode, setViewMode] = useState('list');
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    image_position: { x: 50, y: 50 },
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
      image_position: { x: 50, y: 50 },
      is_active: true,
      start_at: '',
      end_at: '',
    });
    setEditingAnnouncement(null);
  };

  const handleOpenEditor = (announcement = null) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      // Format datetimes to datetime-local string format (YYYY-MM-DDTHH:MM)
      const startLocal = announcement.start_at ? announcement.start_at.substring(0, 16) : '';
      const endLocal = announcement.end_at ? announcement.end_at.substring(0, 16) : '';
      setFormData({
        title: announcement.title ?? '',
        subtitle: announcement.subtitle ?? '',
        description: announcement.description ?? '',
        image_url: announcement.image_url ?? '',
        image_position: announcement.image_position ?? { x: 50, y: 50 },
        is_active: announcement.is_active ?? true,
        start_at: startLocal,
        end_at: endLocal,
      });
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
    const startY = e.clientY;
    const startPosY = formData.image_position?.y ?? 50;

    const handleDragMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      
      // Calculate changes.
      // Dragging down should decrease y percentage (reveals top of the image)
      // Dragging up should increase y percentage (reveals bottom of the image)
      const newY = Math.max(0, Math.min(100, Math.round(startPosY - (deltaY / rect.height) * 100)));

      setFormData(prev => ({
        ...prev,
        image_position: { x: 50, y: newY } // x stays centered at 50 to prevent horizontal gaps
      }));
    };

    const handleDragEnd = () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('O título é obrigatório.');
      return;
    }

    const payload = {
      title: formData.title,
      subtitle: formData.subtitle || null,
      description: formData.description || null,
      image_url: formData.image_url || null,
      image_position: formData.image_position,
      start_at: formData.start_at ? new Date(formData.start_at).toISOString() : null,
      end_at: formData.end_at ? new Date(formData.end_at).toISOString() : null,
    };
    if (!editingAnnouncement) {
      payload.is_active = formData.is_active;
    }

    try {
      if (editingAnnouncement) {
        await updateAnnouncement({ id: editingAnnouncement.id, ...payload }).unwrap();
        toast.success('Aviso atualizado com sucesso!');
      } else {
        await createAnnouncement(payload).unwrap();
        toast.success('Aviso criado com sucesso!');
      }
      handleCloseEditor();
    } catch (err) {
      toast.error('Erro ao salvar o aviso. Verifique os dados inseridos.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir de fato este aviso?')) return;
    try {
      await deleteAnnouncement(id).unwrap();
      toast.success('Aviso excluído com sucesso.');
    } catch (err) {
      toast.error('Erro ao excluir o aviso.');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await updateStatus({ id, is_active: !currentStatus }).unwrap();
      toast.success(`Aviso ${!currentStatus ? 'ativado' : 'desativado'} com sucesso.`);
    } catch (err) {
      toast.error('Erro ao alterar status do aviso.');
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

  // Coleta dados da empresa atual logada para renderizar o rodapé no preview
  const companyLogoUrl = companyInfo?.config?.logo || companyInfo?.config?.logo_url || companyInfo?.config?.icon_url || null;
  const companyName = companyInfo?.name || "Sua Empresa";
  const companyBranch = companyInfo?.address?.city ? `${companyInfo.address.city} - ${companyInfo.address.state || ""}` : "Unidade Principal";

  // ── VIEW: LIST MODE ────────────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primary + '1A' }}>
              <Bell className="w-5 h-5" style={{ color: colors.primary }} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Gerenciamento de Avisos</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Configure avisos informativos com imagens em destaque para os motoristas</p>
            </div>
          </div>
          <ActionButton onClick={() => handleOpenEditor()}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Aviso
          </ActionButton>
        </div>

        {/* Main Card List */}
        <Card className="border-gray-200 dark:border-0 shadow-none overflow-hidden">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-transparent">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Lista de Avisos</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {filtered.length} aviso{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
              <div className="relative w-72">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 dark:border-gray-800 bg-white dark:bg-[#121212] focus:border-orange-500 dark:focus:border-orange-500 focus:ring-0 focus-visible:ring-0 shadow-none focus:shadow-none focus-visible:shadow-none"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <LoadingState text="Carregando avisos..." />
            ) : isError ? (
              <div className="flex items-center justify-center py-12 gap-2 text-red-500">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">Erro ao carregar avisos.</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Nenhum aviso encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-3">Aviso (18:9 Preview)</th>
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
                              style={{ aspectRatio: '18 / 9' }}
                            >
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt="Thumb"
                                  className="absolute w-full h-[180%] max-w-none pointer-events-none"
                                  style={{
                                    top: `${-((item.image_position?.y ?? 50) / 100) * 80}%`,
                                    left: 0,
                                    objectFit: 'cover'
                                  }}
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
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
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
              {editingAnnouncement ? 'Editar Aviso' : 'Criar Novo Aviso'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {editingAnnouncement ? 'Atualize as informações do aviso selecionado' : 'Crie um aviso com imagem e controle de enquadramento vertical'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleCloseEditor} disabled={isSaving}>
            Cancelar
          </Button>
          <ActionButton onClick={handleSubmit} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Aviso
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
              <CardDescription>Defina o título, descrição, imagem de destaque e o status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-1">
                <Label htmlFor="title" className="text-sm font-semibold">Título *</Label>
                <Input
                  id="title"
                  required
                  maxLength={100}
                  placeholder="Ex: Novo fluxo de triagem"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="border-gray-300 dark:border-gray-800 bg-white dark:bg-[#121212]"
                />
                <div className="text-[10px] text-right text-gray-400">{formData.title.length}/100</div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="subtitle" className="text-sm font-semibold">Subtítulo</Label>
                <Input
                  id="subtitle"
                  maxLength={150}
                  placeholder="Ex: Válido a partir de 15/07"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="border-gray-300 dark:border-gray-800 bg-white dark:bg-[#121212]"
                />
                <div className="text-[10px] text-right text-gray-400">{formData.subtitle.length}/150</div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="description" className="text-sm font-semibold">Descrição (Máximo 250 caracteres)</Label>
                <textarea
                  id="description"
                  maxLength={250}
                  rows={4}
                  className="w-full flex min-h-[90px] rounded-md border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#121212] px-3 py-2 text-sm shadow-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:text-gray-200"
                  placeholder="Ex: Motoristas de carretas devem utilizar a faixa da esquerda..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <div className="text-[10px] text-right text-gray-400">{formData.description.length}/250</div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="image_url" className="text-sm font-semibold">URL da Imagem</Label>
                <Input
                  id="image_url"
                  placeholder="Insira o link da imagem (ex: Unsplash, CDN...)"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="border-gray-300 dark:border-gray-800 bg-white dark:bg-[#121212]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="start_at" className="text-sm font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" /> Início da Exibição
                  </Label>
                  <Input
                    id="start_at"
                    type="datetime-local"
                    value={formData.start_at}
                    onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                    className="border-gray-300 dark:border-gray-800 bg-white dark:bg-[#121212]"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="end_at" className="text-sm font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" /> Fim da Exibição
                  </Label>
                  <Input
                    id="end_at"
                    type="datetime-local"
                    value={formData.end_at}
                    onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                    className="border-gray-300 dark:border-gray-800 bg-white dark:bg-[#121212]"
                  />
                </div>
              </div>

              {!editingAnnouncement && (
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl mt-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_active" className="text-sm font-semibold">Ativar no Carrossel</Label>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Exibir o aviso aos motoristas conforme o cronograma</p>
                  </div>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Panel Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-white dark:bg-card border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden sticky top-6">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-orange-500" />
                Visualização no Aplicativo (18:9)
              </CardTitle>
              <CardDescription>Veja em tempo real como o banner será exibido no celular do motorista.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-[#121212]/30">
              {/* Phone Aspect Container */}
              <div
                ref={previewContainerRef}
                onMouseDown={handleDragStart}
                className="relative w-full overflow-hidden bg-gray-200 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-800 select-none shadow-lg cursor-move"
                style={{ aspectRatio: '18 / 9' }}
                title={formData.image_url ? 'Clique e arraste verticalmente para reposicionar a imagem' : ''}
              >
                {formData.image_url ? (
                  <img
                    src={formData.image_url}
                    alt="Aviso Preview"
                    className="absolute w-full h-[180%] max-w-none pointer-events-none select-none"
                    style={{
                      top: `${-((formData.image_position?.y ?? 50) / 100) * 80}%`,
                      left: 0,
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.opacity = 0;
                    }}
                    onLoad={(e) => {
                      e.target.style.opacity = 1;
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-[#1B1B1B]">
                    <ImageIcon className="w-8 h-8 mb-2 text-gray-300 dark:text-gray-600" />
                    <span className="text-xs">Insira a URL de uma imagem no formulário</span>
                  </div>
                )}

                {/* Elegant dark gradient overlay for text legibility */}
                <div 
                  className="absolute inset-0 pointer-events-none" 
                  style={{
                    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.45) 45%, transparent 100%)'
                  }}
                />

                {/* Text Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white pointer-events-none">
                  <h4 className="text-[15px] font-extrabold truncate tracking-tight">
                    {formData.title || 'Título do Aviso'}
                  </h4>
                  {formData.subtitle ? (
                    <p className="text-[11px] font-semibold opacity-90 truncate mt-0.5">
                      {formData.subtitle}
                    </p>
                  ) : null}
                  {formData.description ? (
                    <p className="text-[9px] opacity-75 mt-1.5 leading-normal line-clamp-2">
                      {formData.description}
                    </p>
                  ) : null}
                </div>
              </div>

              {formData.image_url && (
                <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  Arrastar a imagem verticalmente no preview ajusta o corte do banner.
                </span>
              )}

              {/* Complete Footer widget showing active company and next logos */}
              <div className="w-full mt-4 flex items-center justify-between px-1 bg-transparent">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-white flex items-center justify-center flex-shrink-0">
                    {companyLogoUrl ? (
                      <img src={companyLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-gray-400">{companyName.substring(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-gray-800 truncate leading-none">{companyName}</p>
                    <p className="text-[10px] text-gray-500 truncate mt-1 leading-none">{companyBranch}</p>
                  </div>
                </div>

                {/* Mock Next Queue logos - Container background removed, profile pictures are strictly white-bordered circles */}
                <div className="flex items-center flex-shrink-0">
                  <div className="flex items-center">
                    {[1, 2, 3].map((i) => (
                      <div 
                        key={i} 
                        className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center -ml-2 first:ml-0 overflow-hidden shadow-sm flex-shrink-0"
                      >
                        <span className="text-[8px] font-extrabold text-gray-400">C{i}</span>
                      </div>
                    ))}
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center -ml-2 overflow-hidden shadow-sm flex-shrink-0">
                      <span className="text-[10px] font-bold text-gray-400 leading-none">...</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
