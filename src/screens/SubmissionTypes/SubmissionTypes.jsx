import React, { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  ArrowLeft,
  Save,
  FileText,
  Paperclip,
  Check,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ShieldAlert,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ActionButton } from "@/components/ui/ActionButton";
import {
  useGetSubmissionTypesQuery,
  useUpsertSubmissionTypeMutation,
  useDeleteSubmissionTypeMutation,
} from "@/services/api";
import LoadingState from "@/components/LoadingState";
import { colors } from "@/constants/colors";

const uid = () => Math.random().toString(36).substr(2, 9);

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "_")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

const defaultTypeState = () => ({
  title: "",
  ref: "",
  allow_edit: true,
  accepts_attachment: false,
  multiple_attachments: false,
  allowed_formats: ["image", "pdf"],
  attachment_required: false,
  fields: [
    {
      id: uid(),
      label: "",
      description: "",
      type: "text",
      multiline: false,
      required: true,
      regex: "",
      placeholder: "",
    },
  ],
});

export default function SubmissionTypes() {
  const [viewMode, setViewMode] = useState("list"); // "list" | "editor"
  const [formState, setFormState] = useState(defaultTypeState);
  const [originalRef, setOriginalRef] = useState(null);
  const [deletePrompt, setDeletePrompt] = useState(null);

  const { data: submissionTypes, isLoading } = useGetSubmissionTypesQuery();
  const [upsertSubmissionType, { isLoading: isSaving }] = useUpsertSubmissionTypeMutation();
  const [deleteSubmissionType, { isLoading: isDeleting }] = useDeleteSubmissionTypeMutation();

  const isEditing = Boolean(originalRef);

  // Real-time validation
  const validation = useMemo(() => {
    const trimmedTitle = formState.title.trim();
    const trimmedRef = formState.ref.trim();

    const titleExists = (submissionTypes || []).some(
      (st) => st.title.toLowerCase() === trimmedTitle.toLowerCase() && st.ref !== originalRef
    );
    const refExists = (submissionTypes || []).some(
      (st) => st.ref.toLowerCase() === trimmedRef.toLowerCase() && st.ref !== originalRef
    );

    // Rule: must have at least 1 required field OR attachment_required must be true
    const hasRequiredField = formState.fields.some((f) => f.required && f.label.trim() !== "");
    const attachmentValid = formState.accepts_attachment && formState.attachment_required;
    const hasAtLeastOneRequired = hasRequiredField || attachmentValid;

    // Check invalid fields
    const invalidFields = {};
    formState.fields.forEach((f) => {
      if (!f.label || !f.label.trim()) {
        invalidFields[f.id] = "Label é obrigatório";
      }
    });

    const isValid =
      Boolean(trimmedTitle) &&
      Boolean(trimmedRef) &&
      !titleExists &&
      !refExists &&
      hasAtLeastOneRequired &&
      Object.keys(invalidFields).length === 0;

    return {
      trimmedTitle,
      trimmedRef,
      titleExists,
      refExists,
      hasAtLeastOneRequired,
      invalidFields,
      isValid,
    };
  }, [formState, submissionTypes, originalRef]);

  const handleCreateNew = () => {
    setFormState(defaultTypeState());
    setOriginalRef(null);
    setViewMode("editor");
  };

  const handleEdit = (item) => {
    setFormState({
      title: item.title,
      ref: item.ref,
      allow_edit: item.allow_edit ?? true,
      accepts_attachment: item.accepts_attachment ?? false,
      multiple_attachments: item.multiple_attachments ?? false,
      allowed_formats: item.allowed_formats || ["image", "pdf"],
      attachment_required: item.attachment_required ?? false,
      fields: (item.fields || []).map((f) => ({
        id: uid(),
        label: f.label || "",
        description: f.description || "",
        type: f.type || "text",
        multiline: f.multiline || false,
        required: f.required ?? false,
        regex: f.regex || "",
        placeholder: f.placeholder || "",
      })),
    });
    setOriginalRef(item.ref);
    setViewMode("editor");
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormState((prev) => ({
      ...prev,
      title,
      ref: !originalRef ? slugify(title) : prev.ref,
    }));
  };

  const addFieldRow = () => {
    setFormState((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        { id: uid(), label: "", description: "", type: "text", multiline: false, required: false, regex: "", placeholder: "" },
      ],
    }));
  };

  const updateFieldRow = (id, key, val) => {
    setFormState((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === id ? { ...f, [key]: val } : f)),
    }));
  };

  const removeFieldRow = (id) => {
    setFormState((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== id),
    }));
  };

  const moveFieldRow = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= formState.fields.length) return;
    setFormState((prev) => {
      const copy = [...prev.fields];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return { ...prev, fields: copy };
    });
  };

  const toggleAllowedFormat = (format) => {
    setFormState((prev) => {
      const current = prev.allowed_formats || [];
      const updated = current.includes(format)
        ? current.filter((f) => f !== format)
        : [...current, format];
      return { ...prev, allowed_formats: updated };
    });
  };

  const handleSave = async () => {
    if (!validation.isValid) {
      if (!validation.hasAtLeastOneRequired) {
        toast.error("É necessário ter ao menos um campo obrigatório ou o anexo ser obrigatório para salvar!");
      } else {
        toast.error("Preencha todos os campos obrigatórios da configuração.");
      }
      return;
    }

    try {
      await upsertSubmissionType({
        title: formState.title.trim(),
        ref: formState.ref.trim(),
        allow_edit: formState.allow_edit,
        accepts_attachment: formState.accepts_attachment,
        multiple_attachments: formState.multiple_attachments,
        allowed_formats: formState.allowed_formats,
        attachment_required: formState.attachment_required,
        fields: formState.fields.map((f) => ({
          label: f.label.trim(),
          description: f.description ? f.description.trim() : undefined,
          type: f.type,
          multiline: f.multiline || false,
          required: f.required,
          regex: f.regex ? f.regex.trim() : undefined,
          placeholder: f.placeholder ? f.placeholder.trim() : undefined,
        })),
      }).unwrap();

      toast.success("Tipo de envio salvo com sucesso!");
      setViewMode("list");
    } catch (err) {
      toast.error(err?.data?.detail?.message || "Erro ao salvar tipo de envio.");
    }
  };

  const confirmDelete = async () => {
    if (!deletePrompt) return;
    try {
      await deleteSubmissionType(deletePrompt.ref).unwrap();
      toast.success("Tipo de envio excluído com sucesso.");
      setDeletePrompt(null);
    } catch (err) {
      toast.error(err?.data?.detail?.message || "Erro ao excluir.");
    }
  };

  if (isLoading) {
    return <LoadingState text="Carregando tipos de envio..." />;
  }

  // --- LIST VIEW ---
  if (viewMode === "list") {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primary + "1A" }}>
              <Send className="w-5 h-5" style={{ color: colors.primary }} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Tipos de Envio</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure os tipos de envio e documentos que os motoristas podem entregar para sua empresa
              </p>
            </div>
          </div>
          <ActionButton onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Tipo de Envio
          </ActionButton>
        </div>

        {/* Content Cards */}
        {(!submissionTypes || submissionTypes.length === 0) ? (
          <Card className="border-gray-200 dark:border-0 shadow-none">
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
                Nenhum tipo de envio configurado
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                Sua empresa ainda não possui tipos de envio personalizados. O app utilizará o envio padrão ("Enviar outra coisa").
              </p>
              <ActionButton onClick={handleCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Tipo
              </ActionButton>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {submissionTypes.map((item) => (
              <Card
                key={item.id}
                className="border-gray-200 dark:border-0 shadow-none hover:border-orange-300 dark:hover:border-orange-500/30 transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {item.title}
                    </CardTitle>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono">
                      {item.ref}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>{item.fields?.length || 0} campos configurados</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <span>
                        {item.accepts_attachment
                          ? `${item.multiple_attachments ? "Múltiplos anexos" : "Um anexo"} (${item.allowed_formats?.join(", ") || "todos"}) ${item.attachment_required ? "• Obrigatório" : ""}`
                          : "Não aceita anexos"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.allow_edit ? "bg-green-500" : "bg-amber-500"}`} />
                      <span>{item.allow_edit ? "Permite edição pelo motorista" : "Envio definitivo (não editável)"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-lg transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletePrompt(item)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete confirmation modal */}
        {deletePrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="max-w-md w-full p-6 space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-lg font-bold">Excluir Tipo de Envio</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Tem certeza que deseja excluir o tipo de envio <strong>"{deletePrompt.title}"</strong>? Esta ação não afetará os envios já realizados.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setDeletePrompt(null)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Excluindo..." : "Sim, Excluir"}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // --- EDITOR VIEW ---
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Editor Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isEditing ? `Editar: ${formState.title}` : "Novo Tipo de Envio"}
            </h1>
            <p className="text-xs text-gray-500">Configure os campos e regras de anexo para este tipo de envio</p>
          </div>
        </div>

        <ActionButton
          onClick={handleSave}
          disabled={isSaving || !validation.isValid}
          isLoading={isSaving}
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Salvando..." : "Salvar Configuração"}
        </ActionButton>
      </div>

      {/* Rule validation alert */}
      {!validation.hasAtLeastOneRequired && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3 text-amber-800 dark:text-amber-200 text-sm">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600" />
          <div>
            <strong>Regra de validação:</strong> É necessário ter ao menos <strong>um campo obrigatório</strong> ou selecionar <strong>anexo obrigatório</strong> para que este tipo possa ser salvo.
          </div>
        </div>
      )}

      {/* 1. Basic Info Card */}
      <Card className="border-gray-200 dark:border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">1. Informações Básicas</CardTitle>
          <CardDescription className="text-xs">Identificação do tipo de envio no sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-gray-500">Título do Envio *</Label>
              <Input
                type="text"
                value={formState.title}
                onChange={handleTitleChange}
                placeholder="Ex: Envio de CNH, Comprovante de Entrega"
              />
              {validation.titleExists && (
                <p className="text-xs text-red-500 mt-1">Já existe um tipo com este título.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-gray-500">Referência / Slug *</Label>
              <Input
                type="text"
                value={formState.ref}
                disabled={isEditing}
                onChange={(e) => setFormState((prev) => ({ ...prev, ref: slugify(e.target.value) }))}
                placeholder="envio_cnh"
                className="font-mono"
              />
              {validation.refExists && (
                <p className="text-xs text-red-500 mt-1">Já existe um tipo com esta referência.</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formState.allow_edit}
                onChange={(e) => setFormState((prev) => ({ ...prev, allow_edit: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Permitir que o motorista edite este envio após o envio inicial
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 2. Attachments Config Card */}
      <Card className="border-gray-200 dark:border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">2. Configurações de Anexo</CardTitle>
          <CardDescription className="text-xs">Regras para upload de arquivos pelo motorista</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formState.accepts_attachment}
                onChange={(e) => setFormState((prev) => ({ ...prev, accepts_attachment: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Este tipo de envio aceita anexos</span>
          </div>

          {formState.accepts_attachment && (
            <div className="pl-6 space-y-4 border-l-2 border-orange-200 dark:border-orange-900/50 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="multiple_att"
                    checked={formState.multiple_attachments}
                    onChange={(e) => setFormState((prev) => ({ ...prev, multiple_attachments: e.target.checked }))}
                    className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                  />
                  <label htmlFor="multiple_att" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    Permitir múltiplos anexos (senão aceita apenas 1)
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="att_req"
                    checked={formState.attachment_required}
                    onChange={(e) => setFormState((prev) => ({ ...prev, attachment_required: e.target.checked }))}
                    className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                  />
                  <label htmlFor="att_req" className="text-sm font-bold text-orange-600 dark:text-orange-400 cursor-pointer">
                    Anexo é obrigatório
                  </label>
                </div>
              </div>

              <div>
                <Label className="block text-xs font-bold uppercase text-gray-500 mb-2">Formatos Permitidos</Label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => toggleAllowedFormat("image")}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                      formState.allowed_formats.includes("image")
                        ? "bg-orange-50 dark:bg-orange-950/40 border-orange-500 text-orange-600 dark:text-orange-400"
                        : "border-gray-200 dark:border-gray-800 text-gray-500"
                    }`}
                  >
                    <Check className={`w-4 h-4 ${formState.allowed_formats.includes("image") ? "opacity-100" : "opacity-0"}`} />
                    Imagem (Geral)
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleAllowedFormat("pdf")}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                      formState.allowed_formats.includes("pdf")
                        ? "bg-orange-50 dark:bg-orange-950/40 border-orange-500 text-orange-600 dark:text-orange-400"
                        : "border-gray-200 dark:border-gray-800 text-gray-500"
                    }`}
                  >
                    <Check className={`w-4 h-4 ${formState.allowed_formats.includes("pdf") ? "opacity-100" : "opacity-0"}`} />
                    Documento PDF
                  </button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Form Fields Builder Card */}
      <Card className="border-gray-200 dark:border-0 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">3. Campos do Formulário</CardTitle>
            <CardDescription className="text-xs">Adicione os campos que o motorista deverá preencher</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addFieldRow}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Adicionar Campo
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {formState.fields.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center py-6">Nenhum campo adicionado. Clique no botão acima para adicionar.</p>
          ) : (
            <div className="space-y-4">
              {formState.fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="bg-gray-50/50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 text-xs font-bold flex items-center justify-center text-gray-600 dark:text-gray-300">
                        {idx + 1}
                      </span>
                      <Input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateFieldRow(field.id, "label", e.target.value)}
                        placeholder="Nome do Campo (ex: Número da CNH, Placa)"
                        className="flex-1 font-semibold"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveFieldRow(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveFieldRow(idx, 1)}
                        disabled={idx === formState.fields.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFieldRow(field.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <Label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Tipo de Dado</Label>
                      <select
                        value={field.type}
                        onChange={(e) => updateFieldRow(field.id, "type", e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-background text-xs"
                      >
                        <option value="text">Texto livre</option>
                        <option value="number">Apenas números</option>
                      </select>
                    </div>

                    <div>
                      <Label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Validação Regex (Opcional)</Label>
                      <Input
                        type="text"
                        value={field.regex}
                        onChange={(e) => updateFieldRow(field.id, "regex", e.target.value)}
                        placeholder="Ex: ^\d{11}$"
                        className="font-mono text-xs"
                      />
                    </div>

                    <div>
                      <Label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Placeholder (Exemplo)</Label>
                      <Input
                        type="text"
                        value={field.placeholder}
                        onChange={(e) => updateFieldRow(field.id, "placeholder", e.target.value)}
                        placeholder="Ex: Digite o número"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <Label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                      Descrição / Instrução de Ajuda (Opcional)
                    </Label>
                    <Input
                      type="text"
                      value={field.description || ""}
                      onChange={(e) => updateFieldRow(field.id, "description", e.target.value)}
                      placeholder="Ex: Informe os 11 dígitos do CPF sem pontos ou traços"
                      className="text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`req_${field.id}`}
                        checked={field.required}
                        onChange={(e) => updateFieldRow(field.id, "required", e.target.checked)}
                        className="w-3.5 h-3.5 text-orange-500 rounded border-gray-300"
                      />
                      <label htmlFor={`req_${field.id}`} className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                        Campo Obrigatório
                      </label>
                    </div>

                    {field.type === "text" && (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`multi_${field.id}`}
                          checked={field.multiline || false}
                          onChange={(e) => updateFieldRow(field.id, "multiline", e.target.checked)}
                          className="w-3.5 h-3.5 text-orange-500 rounded border-gray-300"
                        />
                        <label htmlFor={`multi_${field.id}`} className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                          Múltiplas linhas (Caixa de texto grande)
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
