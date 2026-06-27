import { useState, useRef } from "react";
import { GripVertical, ChevronUp, ChevronDown, Trash2, Edit2, Check, AlertCircle, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ValidatedInput } from "@/components/ui/validated-input";
import { ELEMENT_META, ALERT_COLORS, COLOR_OPTIONS, ICON_OPTIONS } from "../constants";
import { colors } from "@/constants/colors";
import { useTheme } from "@/hooks/useTheme";

export function ModalBuilderItem({ el, index, total, onChange, onDelete, onMove, onDropNew, hasError }) {
  const { isDark } = useTheme();
  const [expanded, setExpanded] = useState(!!el.isNew);
  const [draggable, setDraggable] = useState(false);
  const meta = ELEMENT_META[el.element];
  const dragRef = useRef(null);

  const update = (key, val) => onChange(index, { ...el, [key]: val });
  const MetaIcon = meta.Icon;

  const handleToggleExpand = () => {
    if (expanded && el.isNew) {
      // Persist the "has been opened/interacted" flag into layout state so it
      // survives tab switches (local state would reset on unmount).
      update("isNew", false);
    }
    setExpanded(!expanded);
  };

  // Show validation indicator only after the item has been opened at least once
  // (isNew cleared) and it still has errors, and is currently collapsed.
  const showValidation = !el.isNew && hasError && !expanded;

  // showError for inline fields: only after first open (isNew cleared)
  const showFieldError = !el.isNew && hasError;

  const bg = isDark ? (meta.darkBg || `${meta.color}20`) : meta.bg;
  const color = isDark ? (meta.darkColor || meta.color) : meta.color;

  return (
    <div
      ref={dragRef}
      draggable={draggable}
      onDragStart={e => { e.dataTransfer.setData("modalIndex", index); e.dataTransfer.effectAllowed = "move"; }}
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        e.preventDefault();
        const newModalElement = e.dataTransfer.getData("newModalElement");
        if (newModalElement) {
          if (onDropNew) onDropNew(newModalElement, index);
          return;
        }
        const from = parseInt(e.dataTransfer.getData("modalIndex"));
        if (!isNaN(from) && from !== index) onMove(from, index);
      }}
      className={`bg-white dark:bg-card border rounded-lg mb-3 overflow-hidden transition-colors ${showValidation ? 'border-red-300' : 'border-gray-200 dark:border-gray-800 hover:border-[#F97316]/40'}`}
    >
      <div className={`flex items-center p-2.5 gap-3 border-b border-transparent ${expanded ? 'bg-gray-50 dark:bg-muted/30 border-gray-100 dark:border-gray-800' : ''} ${showValidation ? 'bg-red-50/50 hover:bg-red-50/80' : 'hover:bg-gray-50 dark:hover:bg-muted/50'}`}>
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
        <span className="text-[11px] font-bold uppercase tracking-wider min-w-[60px]" style={{ color: color }}>{meta.label}</span>
        <span className="text-xs text-gray-600 dark:text-gray-300 flex-1 truncate font-medium flex items-center gap-2">
          {el.title || el.label || el.field || "…"}
          {showValidation && <AlertCircle className="w-3 h-3 text-red-500" />}
        </span>
        <div className="flex gap-1 items-center">
          <button onClick={() => onMove(index, index - 1)} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30 transition-opacity">
            <ChevronUp className="w-4 h-4" />
          </button>
          <button onClick={() => onMove(index, index + 1)} disabled={index === total - 1} className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30 transition-opacity">
            <ChevronDown className="w-4 h-4" />
          </button>
          <button onClick={handleToggleExpand} className={`p-1 rounded transition-colors ${expanded ? 'text-green-600 bg-green-100' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {expanded ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          </button>
          <button onClick={() => onDelete(index)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 flex flex-col gap-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-card">

          {/* ── SECTION ─────────────────────────────────────────── */}
          {el.element === "section" && (<>
            <ValidatedInput
              label="Título da Seção"
              value={el.title}
              onChange={e => update("title", e.target.value)}
              placeholder="ex: Detalhes da Carga"
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
                    className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ValidatedInput
                    label="Nome do Campo (Label)"
                    value={fieldItem.label}
                    onChange={e => {
                      const updatedFields = [...el.fields];
                      updatedFields[fIdx] = { ...fieldItem, label: e.target.value };
                      update("fields", updatedFields);
                    }}
                    placeholder="ex: Peso Bruto"
                    required
                    showError={showFieldError}
                  />
                  <ValidatedInput
                    label="Campo no JSON (Field)"
                    value={fieldItem.field}
                    onChange={e => {
                      const updatedFields = [...el.fields];
                      updatedFields[fIdx] = { ...fieldItem, field: e.target.value };
                      update("fields", updatedFields);
                    }}
                    placeholder="ex: gross_weight"
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

          {/* ── FIELD ───────────────────────────────────────────── */}
          {el.element === "field" && (<>
            <ValidatedInput
              label="Label"
              value={el.label}
              onChange={e => update("label", e.target.value)}
              placeholder="ex: Peso Total"
              required
              showError={showFieldError}
            />
            <ValidatedInput
              label="Field (caminho no JSON)"
              value={el.field}
              onChange={e => update("field", e.target.value)}
              placeholder="ex: peso_total"
              required
              showError={showFieldError}
              mono
            />
          </>)}

          {/* ── ALERT ───────────────────────────────────────────── */}
          {el.element === "alert" && (<>
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
              <ValidatedInput
                label="Campo no JSON (Field)"
                value={el.field}
                onChange={e => update("field", e.target.value)}
                placeholder="ex: aviso"
                required
                showError={showFieldError}
                mono
              />
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Mensagem Fixa *</Label>
                <textarea
                  value={el.message || ""}
                  onChange={e => update("message", e.target.value)}
                  placeholder="Insira a mensagem do alerta..."
                  className="w-full h-20 text-sm p-2 border border-gray-300 dark:border-gray-800 rounded-md outline-none bg-white dark:bg-input/30"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500 dark:text-gray-400">Título (opcional)</Label>
              <Input className="h-8 text-sm dark:bg-input/30 dark:border-gray-800" style={{ '--tw-ring-color': colors.primary, '--tw-border-color': colors.primary }} value={el.title || ''} onChange={e => update("title", e.target.value)} placeholder="ex: Atenção" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500 dark:text-gray-400">Cor</Label>
              <div className="flex gap-2 flex-wrap mt-1">
                {COLOR_OPTIONS.map(c => (
                  <button key={c} onClick={() => update("color", c)}
                    className={`px-3 py-1 rounded-md text-[11px] font-semibold cursor-pointer border-2 transition-all ${el.color === c ? 'shadow-sm' : 'opacity-70 hover:opacity-100 border-transparent'}`}
                    style={{
                      background: ALERT_COLORS[c].bg, color: ALERT_COLORS[c].text,
                      borderColor: el.color === c ? ALERT_COLORS[c].border : "transparent",
                    }}>{c}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500 dark:text-gray-400">Ícone (opcional)</Label>
              <select
                className="w-full h-8 px-2 text-sm border border-gray-300 dark:border-gray-800 rounded-md outline-none bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100"
                value={el.icon || ""} onChange={e => update("icon", e.target.value)}
              >
                <option value="" className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100">— nenhum —</option>
                {ICON_OPTIONS.map(i => <option key={i} value={i} className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100">{i}</option>)}
              </select>
            </div>
          </>)}

          {/* ── QRCODE ──────────────────────────────────────────── */}
          {el.element === "qrcode" && (<>
            <ValidatedInput
              label="Field (conteúdo do QR)"
              value={el.field}
              onChange={e => update("field", e.target.value)}
              placeholder="ex: access_token"
              required
              showError={showFieldError}
              mono
            />
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500 dark:text-gray-400">Título (opcional)</Label>
              <Input className="h-8 text-sm dark:bg-input/30 dark:border-gray-800" value={el.title || ''} onChange={e => update("title", e.target.value)} placeholder="ex: Código de Acesso" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500 dark:text-gray-400">Caption (opcional)</Label>
              <Input className="h-8 text-sm dark:bg-input/30 dark:border-gray-800" value={el.caption || ''} onChange={e => update("caption", e.target.value)} placeholder="ex: Apresente na portaria" />
            </div>
          </>)}

        </div>
      )}
    </div>
  );
}