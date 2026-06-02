import { useState, useRef } from "react";
import { GripVertical, ChevronUp, ChevronDown, Trash2, Edit2, Check, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ValidatedInput } from "@/components/ui/validated-input";
import { ELEMENT_META, ALERT_COLORS, COLOR_OPTIONS, ICON_OPTIONS } from "../constants";
import { colors } from "@/constants/colors";

export function ModalBuilderItem({ el, index, total, onChange, onDelete, onMove, onDropNew, hasError }) {
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
        <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ background: meta.bg, color: meta.color }}>
          <MetaIcon className="w-3.5 h-3.5" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider min-w-[60px]" style={{ color: meta.color }}>{meta.label}</span>
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
          {el.element === "section" && (
            <ValidatedInput
              label="Título da Seção"
              value={el.title}
              onChange={e => update("title", e.target.value)}
              placeholder="ex: Detalhes da Carga"
              required
              showError={showFieldError}
            />
          )}

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
            <ValidatedInput
              label="Field (mensagem)"
              value={el.field}
              onChange={e => update("field", e.target.value)}
              placeholder="ex: aviso"
              required
              showError={showFieldError}
              mono
            />
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
                className="w-full h-8 px-2 text-sm border border-gray-300 dark:border-gray-800 rounded-md outline-none bg-white dark:bg-input/30"
                value={el.icon || ""} onChange={e => update("icon", e.target.value)}
              >
                <option value="">— nenhum —</option>
                {ICON_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
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