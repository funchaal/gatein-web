import { useState, useRef } from "react";
import { GripVertical, ChevronUp, ChevronDown, Trash2, Edit2, Check, AlertCircle, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/useTheme";
import {
  ELEMENT_META,
  ATTENTION_COLORS,
  ATTENTION_COLOR_OPTIONS,
  HIGHLIGHT_COLORS,
  HIGHLIGHT_COLOR_OPTIONS,
  TAG_COLORS,
  COLOR_OPTIONS,
  ICON_OPTIONS
} from "../constants";

// Simple custom component to replace ValidatedInput to avoid import mismatches and provide robust inline error messages
function LocalValidatedInput({ label, value, onChange, placeholder, required, showError, mono }) {
  const hasError = required && showError && !value?.trim();
  return (
    <div className="space-y-1.5 w-full">
      <div className="flex justify-between items-center">
        <Label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{label} {required && "*"}</Label>
        {hasError && <span className="text-[10px] text-red-500 font-semibold">campo obrigatório</span>}
      </div>
      <Input
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className={`h-8 text-sm dark:bg-input/30 dark:border-gray-800 ${mono ? "font-mono" : ""
          } ${hasError
            ? "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
            : ""
          }`}
      />
    </div>
  );
}

export function TicketBuilderItem({ el, index, total, onChange, onDelete, onMove, onDropNew, hasError }) {
  const { isDark } = useTheme();
  const [expanded, setExpanded] = useState(!!el.isNew);
  const [draggable, setDraggable] = useState(false);
  const meta = ELEMENT_META[el.element];
  const dragRef = useRef(null);

  const update = (key, val) => onChange(index, { ...el, [key]: val });
  const MetaIcon = meta.Icon;

  const handleToggleExpand = () => {
    if (expanded && el.isNew) {
      update("isNew", false);
    }
    setExpanded(!expanded);
  };

  const showValidation = !el.isNew && hasError && !expanded;
  const showFieldError = !el.isNew && hasError;

  const bg = isDark ? (meta.darkBg || `${meta.color}20`) : meta.bg;
  const color = isDark ? (meta.darkColor || meta.color) : meta.color;

  return (
    <div
      ref={dragRef}
      draggable={draggable}
      onDragStart={e => { e.dataTransfer.setData("ticketElIndex", index); e.dataTransfer.effectAllowed = "move"; }}
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        e.preventDefault();
        const newTicketElement = e.dataTransfer.getData("newTicketElement");
        if (newTicketElement) {
          if (onDropNew) onDropNew(newTicketElement, index);
          return;
        }
        const from = parseInt(e.dataTransfer.getData("ticketElIndex"));
        if (!isNaN(from) && from !== index) onMove(from, index);
      }}
      className={`bg-white dark:bg-card border rounded-lg mb-3 overflow-hidden transition-colors ${showValidation ? 'border-red-300 dark:border-red-500/50' : 'border-gray-200 dark:border-gray-800 hover:border-[#F97316]/40'}`}
    >
      <div className={`flex items-center p-2.5 gap-3 border-b border-transparent ${expanded ? 'bg-gray-50 dark:bg-muted/30 border-gray-100 dark:border-gray-800' : ''} ${showValidation ? 'bg-red-50/50 dark:bg-red-950/20 hover:bg-red-50/80 dark:hover:bg-red-950/40' : 'hover:bg-gray-50 dark:hover:bg-muted/50'}`}>
        <div
          className="cursor-grab text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 -m-1"
          onMouseEnter={() => setDraggable(true)}
          onMouseLeave={() => setDraggable(false)}
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ background: bg, color: color }}>
          <MetaIcon className="w-3.5 h-3.5" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider min-w-[70px]" style={{ color: color }}>{meta.label}</span>
        <span className="text-xs text-gray-600 dark:text-gray-300 flex-1 truncate font-medium flex items-center gap-2">
          {el.element === "highlight_grid" ? `${(el.items || []).length} destaque(s)` : (el.title || el.label || el.field || el.text || "…")}
          {showValidation && <AlertCircle className="w-3 h-3 text-red-500" />}
        </span>
        <div className="flex gap-1 items-center">
          <button onClick={() => onMove(index, index - 1)} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30 transition-opacity cursor-pointer">
            <ChevronUp className="w-4 h-4" />
          </button>
          <button onClick={() => onMove(index, index + 1)} disabled={index === total - 1} className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30 transition-opacity cursor-pointer">
            <ChevronDown className="w-4 h-4" />
          </button>
          <button onClick={handleToggleExpand} className={`p-1 rounded transition-colors cursor-pointer ${expanded ? 'text-green-600 bg-green-100' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {expanded ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          </button>
          <button onClick={() => onDelete(index)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors cursor-pointer">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 flex flex-col gap-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-card">

          {/* ── SECTION ─────────────────────────────────────────── */}
          {el.element === "section" && (<>
            <LocalValidatedInput
              label="Título da Seção"
              value={el.title}
              onChange={e => update("title", e.target.value)}
              placeholder="ex: Informações do Veículo"
              required
              showError={showFieldError}
            />
            <div className="space-y-3 mt-4">
              <Label className="text-xs text-gray-500 font-semibold">Campos da Seção</Label>
              {(el.fields || []).map((fieldItem, fIdx) => (
                <div key={fIdx} className="p-3 border border-gray-100 dark:border-gray-800 rounded-lg flex flex-col gap-3 relative bg-gray-50/50 dark:bg-gray-800/50">
                  <button
                    onClick={() => {
                      const updatedFields = el.fields.filter((_, i) => i !== fIdx);
                      update("fields", updatedFields);
                    }}
                    className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <LocalValidatedInput
                    label="Nome do Campo (Label)"
                    value={fieldItem.label}
                    onChange={e => {
                      const updatedFields = [...el.fields];
                      updatedFields[fIdx] = { ...fieldItem, label: e.target.value };
                      update("fields", updatedFields);
                    }}
                    placeholder="ex: Placa do Cavalo"
                    required
                    showError={showFieldError}
                  />
                  <LocalValidatedInput
                    label="Campo no JSON (Field)"
                    value={fieldItem.field}
                    onChange={e => {
                      const updatedFields = [...el.fields];
                      updatedFields[fIdx] = { ...fieldItem, field: e.target.value };
                      update("fields", updatedFields);
                    }}
                    placeholder="ex: placa"
                    required
                    showError={showFieldError}
                    mono
                  />
                </div>
              ))}
              <button
                onClick={() => update("fields", [...(el.fields || []), { label: "", field: "" }])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-muted/10 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer mt-2"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Campo
              </button>
            </div>
          </>)}

          {/* ── DIVIDER ─────────────────────────────────────────── */}
          {el.element === "divider" && (
            <LocalValidatedInput
              label="Rótulo do Divisor (Opcional)"
              value={el.label}
              onChange={e => update("label", e.target.value)}
              placeholder="ex: Condições do container"
              required={false}
              showError={showFieldError}
            />
          )}

          {/* ── FIELD ───────────────────────────────────────────── */}
          {el.element === "field" && (<>
            <LocalValidatedInput
              label="Nome do Campo (Label)"
              value={el.label}
              onChange={e => update("label", e.target.value)}
              placeholder="ex: Placa do Cavalo"
              required
              showError={showFieldError}
            />
            <LocalValidatedInput
              label="Campo no JSON (Field)"
              value={el.field}
              onChange={e => update("field", e.target.value)}
              placeholder="ex: placa"
              required
              showError={showFieldError}
              mono
            />
          </>)}

          {/* ── TEXT ────────────────────────────────────────────── */}
          {el.element === "text" && (<>
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-gray-500 font-semibold">Fonte de Texto</Label>
              <div className="flex gap-4 text-xs font-semibold text-gray-600 mt-1 mb-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" checked={el.useField === false} onChange={() => onChange(index, { ...el, useField: false, field: "" })} />
                  <span>Texto Fixo</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" checked={el.useField !== false} onChange={() => onChange(index, { ...el, useField: true, text: "" })} />
                  <span>Campo Dinâmico</span>
                </label>
              </div>
            </div>
            {el.useField !== false ? (
              <LocalValidatedInput
                label="Campo no JSON (Field)"
                value={el.field}
                onChange={e => update("field", e.target.value)}
                placeholder="ex: transportadora"
                required
                showError={showFieldError}
                mono
              />
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Texto Fixo *</Label>
                <textarea
                  value={el.text || ""}
                  onChange={e => update("text", e.target.value)}
                  placeholder="Insira o texto livre..."
                  className="w-full h-20 text-sm p-2 border border-gray-300 dark:border-gray-800 rounded-md outline-none bg-white dark:bg-input/30"
                />
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Tamanho</Label>
                <select className="w-full h-8 px-2 text-xs border border-gray-300 dark:border-gray-800 rounded-md bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 outline-none"
                  value={el.size || "md"} onChange={e => update("size", e.target.value)}>
                  <option value="sm" className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100">Pequeno (sm)</option>
                  <option value="md" className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100">Médio (md)</option>
                  <option value="lg" className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100">Grande (lg)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Peso</Label>
                <select className="w-full h-8 px-2 text-xs border border-gray-300 dark:border-gray-800 rounded-md bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 outline-none"
                  value={el.weight || "normal"} onChange={e => update("weight", e.target.value)}>
                  <option value="normal" className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100">Normal</option>
                  <option value="medium" className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100">Médio</option>
                  <option value="bold" className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100">Negrito</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Alinhamento</Label>
                <select className="w-full h-8 px-2 text-xs border border-gray-300 dark:border-gray-800 rounded-md bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 outline-none"
                  value={el.align || "left"} onChange={e => update("align", e.target.value)}>
                  <option value="left" className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100">Esquerda</option>
                  <option value="center" className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100">Centralizado</option>
                  <option value="right" className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100">Direita</option>
                </select>
              </div>
            </div>
            <LocalValidatedInput
              label="Cor do Texto (Hex / CSS)"
              value={el.color}
              onChange={e => update("color", e.target.value)}
              placeholder="ex: #64748B ou slate-600"
              required={false}
            />
          </>)}

          {/* ── ATTENTION ────────────────────────────────────────── */}
          {el.element === "attention" && (<>
            <LocalValidatedInput
              label="Título do Alerta"
              value={el.title}
              onChange={e => update("title", e.target.value)}
              placeholder="ex: Vistoria Obrigatória"
              required
              showError={showFieldError}
            />
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-gray-500 font-semibold">Fonte da Mensagem</Label>
              <div className="flex gap-4 text-xs font-semibold text-gray-600 mt-1 mb-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" checked={el.useField === false} onChange={() => onChange(index, { ...el, useField: false, field: "" })} />
                  <span>Mensagem Fixa</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" checked={el.useField !== false} onChange={() => onChange(index, { ...el, useField: true, message: "" })} />
                  <span>Campo Dinâmico</span>
                </label>
              </div>
            </div>
            {el.useField !== false ? (
              <LocalValidatedInput
                label="Campo no JSON (Field)"
                value={el.field}
                onChange={e => update("field", e.target.value)}
                placeholder="ex: condicao_container"
                required
                showError={showFieldError}
                mono
              />
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Mensagem do Alerta *</Label>
                <textarea
                  value={el.message || ""}
                  onChange={e => update("message", e.target.value)}
                  placeholder="Insira a mensagem do alerta..."
                  className="w-full h-20 text-sm p-2 border border-gray-300 dark:border-gray-800 rounded-md outline-none bg-white dark:bg-input/30"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Cor de Alerta</Label>
              <div className="flex gap-2 flex-wrap mt-1">
                {ATTENTION_COLOR_OPTIONS.map(c => (
                  <button key={c} onClick={() => update("color", c)}
                    className={`px-3 py-1 rounded-md text-[11px] font-semibold cursor-pointer border-2 transition-all ${el.color === c ? 'shadow-sm' : 'opacity-70 hover:opacity-100 border-transparent'}`}
                    style={{
                      background: ATTENTION_COLORS[c].bg, color: ATTENTION_COLORS[c].text,
                      borderColor: el.color === c ? ATTENTION_COLORS[c].border : "transparent",
                    }}>{c}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Ícone do Alerta</Label>
              <select
                className="w-full h-8 px-2 text-sm border border-gray-300 dark:border-gray-800 rounded-md outline-none bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100"
                value={el.icon || "alert-circle-outline"} onChange={e => update("icon", e.target.value)}
              >
                {ICON_OPTIONS.map(i => <option key={i} value={i} className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100">{i}</option>)}
              </select>
            </div>
          </>)}

          {/* ── INSTRUCTION ──────────────────────────────────────── */}
          {el.element === "instruction" && (<>
            <LocalValidatedInput
              label="Título das Instruções"
              value={el.title}
              onChange={e => update("title", e.target.value)}
              placeholder="ex: INSTRUÇÕES DE ACESSO"
              required
              showError={showFieldError}
            />
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 font-semibold">Passos / Etapas</Label>
              {(el.steps || []).map((step, stepIdx) => (
                <div key={stepIdx} className="flex gap-2 items-center">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center shrink-0">{stepIdx + 1}</span>
                  <Input
                    value={step}
                    onChange={e => {
                      const updatedSteps = [...el.steps];
                      updatedSteps[stepIdx] = e.target.value;
                      update("steps", updatedSteps);
                    }}
                    placeholder="ex: Apresente o ticket na entrada"
                    className="h-8 text-sm dark:bg-input/30"
                  />
                  <button
                    onClick={() => {
                      const updatedSteps = el.steps.filter((_, sIdx) => sIdx !== stepIdx);
                      update("steps", updatedSteps);
                    }}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => update("steps", [...(el.steps || []), ""])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-muted/10 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer mt-2"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Passo
              </button>
            </div>
          </>)}

          {/* ── TAGS CONTAINER ───────────────────────────────────── */}
          {el.element === "tag_container" && (<>
            <LocalValidatedInput
              label="Rótulo do Grupo (Label)"
              value={el.label}
              onChange={e => update("label", e.target.value)}
              placeholder="ex: Acesso Permitido"
              required
              showError={showFieldError}
            />
            <div className="space-y-3">
              <Label className="text-xs text-gray-500 font-semibold">Gerenciamento de Tags</Label>
              {(el.tags || []).map((tag, tagIdx) => (
                <div key={tagIdx} className="p-3 border border-gray-100 dark:border-gray-800 rounded-lg flex flex-col gap-2 relative bg-gray-50/50 dark:bg-gray-800/50">
                  <button
                    onClick={() => {
                      const updatedTags = el.tags.filter((_, tIdx) => tIdx !== tagIdx);
                      update("tags", updatedTags);
                    }}
                    className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="grid grid-cols-2 gap-2 pr-8">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-gray-400">Texto da Tag *</Label>
                      <Input
                        value={tag.label || ""}
                        onChange={e => {
                          const updatedTags = [...el.tags];
                          updatedTags[tagIdx] = { ...tag, label: e.target.value };
                          update("tags", updatedTags);
                        }}
                        placeholder="ex: Balança 1"
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-gray-400">Ícone</Label>
                      <select
                        value={tag.icon || ""}
                        onChange={e => {
                          const updatedTags = [...el.tags];
                          updatedTags[tagIdx] = { ...tag, icon: e.target.value };
                          update("tags", updatedTags);
                        }}
                        className="w-full h-7 px-1 text-xs border border-gray-300 dark:border-gray-800 rounded bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 outline-none"
                      >
                        <option value="" className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100">— nenhum —</option>
                        {ICON_OPTIONS.map(i => <option key={i} value={i} className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100">{i}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-gray-400">Cor</Label>
                    <div className="flex gap-1.5 flex-wrap">
                      {COLOR_OPTIONS.map(c => (
                        <button
                          key={c}
                          onClick={() => {
                            const updatedTags = [...el.tags];
                            updatedTags[tagIdx] = { ...tag, color: c };
                            update("tags", updatedTags);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tag.color === c ? 'border-gray-800 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'}`}
                          style={{ background: TAG_COLORS[c].bg, color: TAG_COLORS[c].text }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => update("tags", [...(el.tags || []), { label: "", color: "blue", icon: "" }])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-muted/10 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer mt-2"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Tag
              </button>
            </div>
          </>)}

          {/* ── HIGHLIGHT GRID ───────────────────────────────────── */}
          {el.element === "highlight_grid" && (<>
            <LocalValidatedInput
              label="Título do Grid (Opcional)"
              value={el.label}
              onChange={e => update("label", e.target.value)}
              placeholder="ex: Área de Descarregamento"
              required={false}
              showError={showFieldError}
            />
            <div className="space-y-3">
              <Label className="text-xs text-gray-500 font-semibold">Destaques no Grid</Label>
              {(el.items || []).map((item, itemIdx) => (
                <div key={itemIdx} className="p-3 border border-gray-100 dark:border-gray-800 rounded-lg flex flex-col gap-3 relative bg-gray-50/50 dark:bg-gray-800/50">
                  <button
                    onClick={() => {
                      const updatedItems = el.items.filter((_, iIdx) => iIdx !== itemIdx);
                      update("items", updatedItems);
                    }}
                    className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <LocalValidatedInput
                    label="Rótulo (Label)"
                    value={item.label}
                    onChange={e => {
                      const updatedItems = [...el.items];
                      updatedItems[itemIdx] = { ...item, label: e.target.value };
                      update("items", updatedItems);
                    }}
                    placeholder="ex: Box"
                    required
                    showError={showFieldError}
                  />
                  <div className="flex flex-col gap-1">
                    <Label className="text-[10px] text-gray-400 font-semibold">Origem do Valor</Label>
                    <div className="flex gap-4 text-[11px] font-semibold text-gray-600">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" checked={item.useField === false} onChange={() => {
                          const updatedItems = [...el.items];
                          updatedItems[itemIdx] = { ...item, useField: false, field: "", value: "10" };
                          update("items", updatedItems);
                        }} />
                        <span>Valor Fixo</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" checked={item.useField !== false} onChange={() => {
                          const updatedItems = [...el.items];
                          updatedItems[itemIdx] = { ...item, useField: true, value: "", field: "box_coleta" };
                          update("items", updatedItems);
                        }} />
                        <span>Campo Dinâmico</span>
                      </label>
                    </div>
                  </div>
                  {item.useField !== false ? (
                    <LocalValidatedInput
                      label="Campo no JSON (Field)"
                      value={item.field}
                      onChange={e => {
                        const updatedItems = [...el.items];
                        updatedItems[itemIdx] = { ...item, field: e.target.value };
                        update("items", updatedItems);
                      }}
                      placeholder="ex: area_coleta"
                      required
                      showError={showFieldError}
                      mono
                    />
                  ) : (
                    <LocalValidatedInput
                      label="Valor Fixo"
                      value={item.value}
                      onChange={e => {
                        const updatedItems = [...el.items];
                        updatedItems[itemIdx] = { ...item, value: e.target.value };
                        update("items", updatedItems);
                      }}
                      placeholder="ex: 12"
                      required
                      showError={showFieldError}
                    />
                  )}
                  <LocalValidatedInput
                    label="Subtexto (Caption)"
                    value={item.caption}
                    onChange={e => {
                      const updatedItems = [...el.items];
                      updatedItems[itemIdx] = { ...item, caption: e.target.value };
                      update("items", updatedItems);
                    }}
                    placeholder="ex: Pátio Principal"
                    required={false}
                  />
                  <div className="space-y-1">
                    <Label className="text-[10px] text-gray-400 font-semibold">Cor do Destaque</Label>
                    <div className="flex gap-1.5 flex-wrap">
                      {HIGHLIGHT_COLOR_OPTIONS.map(c => (
                        <button
                          key={c}
                          onClick={() => {
                            const updatedItems = [...el.items];
                            updatedItems[itemIdx] = { ...item, color: c };
                            update("items", updatedItems);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer ${item.color === c ? 'border-gray-800 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'}`}
                          style={{ background: HIGHLIGHT_COLORS[c].bg, color: HIGHLIGHT_COLORS[c].text }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => update("items", [...(el.items || []), { label: "", color: "blue", useField: true, field: "" }])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-muted/10 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer mt-2"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Destaque
              </button>
            </div>
          </>)}

        </div>
      )}
    </div>
  );
}
