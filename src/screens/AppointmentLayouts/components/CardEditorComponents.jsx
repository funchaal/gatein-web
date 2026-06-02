import { useState } from "react";
import { GripVertical, ChevronUp, ChevronDown, Trash2, Edit2, Check, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ValidatedInput } from "@/components/ui/validated-input";
import { ALERT_COLORS, COLOR_OPTIONS } from "../constants";
import { colors } from "@/constants/colors";

// ── Card Body Row Item ────────────────────────────────────────────────────────

export function CardBuilderItem({ row, index, total, onChange, onDelete, onMove, hasError }) {
  const [expanded, setExpanded] = useState(!!row.isNew);
  const [draggable, setDraggable] = useState(false);

  const handleToggleExpand = () => {
    if (expanded && row.isNew) {
      // Persist the interaction into layout state so it survives tab switches.
      onChange(index, { ...row, isNew: false });
    }
    setExpanded(!expanded);
  };

  // Show validation indicator only after the item has been opened at least once
  // (isNew cleared) and it still has errors, and is currently collapsed.
  const showValidation = !row.isNew && hasError && !expanded;

  // showError for inline fields: only after first open (isNew cleared)
  const showFieldError = !row.isNew && hasError;

  return (
    <div
      draggable={draggable}
      onDragStart={e => { e.dataTransfer.setData("rowIndex", index); }}
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        e.preventDefault();
        const from = parseInt(e.dataTransfer.getData("rowIndex"));
        if (!isNaN(from) && from !== index) onMove(from, index);
      }}
      className={`bg-white dark:bg-card border rounded-lg mb-2 transition-colors group overflow-hidden ${showValidation ? 'border-red-300' : 'border-gray-200 dark:border-gray-800 hover:border-[#F97316]/40'}`}
    >
      <div className={`flex items-center p-2.5 gap-3 border-b border-transparent ${expanded ? 'bg-gray-50 dark:bg-muted/30 border-gray-100 dark:border-gray-800' : ''} ${showValidation ? 'bg-red-50/50 hover:bg-red-50/80' : 'hover:bg-gray-50 dark:hover:bg-muted/50'}`}>
        <div
          className="cursor-grab text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 -m-1"
          onMouseEnter={() => setDraggable(true)}
          onMouseLeave={() => setDraggable(false)}
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <span className={`text-[11px] font-bold tracking-wider ${showValidation ? 'text-red-500' : ''}`} style={showValidation ? {} : { color: colors.primary }}>LINHA {index + 1}</span>
        <span className="text-xs text-gray-600 dark:text-gray-300 flex-1 truncate font-medium flex items-center gap-2">
          {row.label || row.field ? `${row.label || '[Sem label]'} (${row.field || 'sem-field'})` : "..."}
          {showValidation && <AlertCircle className="w-3 h-3 text-red-500" />}
        </span>
        <div className="flex gap-1 items-center">
          <button onClick={() => onMove(index, index - 1)} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30">
            <ChevronUp className="w-4 h-4" />
          </button>
          <button onClick={() => onMove(index, index + 1)} disabled={index === total - 1} className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30">
            <ChevronDown className="w-4 h-4" />
          </button>
          <button onClick={handleToggleExpand} className={`p-1 rounded transition-colors ${expanded ? 'text-green-600 bg-green-100' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {expanded ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          </button>
          <button onClick={() => onDelete(index)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-card">
          <div className="grid grid-cols-2 gap-4">
            <ValidatedInput
              label="Label"
              value={row.label}
              onChange={e => onChange(index, { ...row, label: e.target.value })}
              placeholder="ex: Transportadora"
              required
              showError={showFieldError}
            />
            <ValidatedInput
              label="Field (caminho)"
              value={row.field}
              onChange={e => onChange(index, { ...row, field: e.target.value })}
              placeholder="ex: transportadora"
              required
              showError={showFieldError}
              mono
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Status Tag Item ───────────────────────────────────────────────────────────

/**
 * A collapsible status tag editor that mirrors the CardBuilderItem UX:
 * - Collapsed: shows a live preview pill of the tag (value + color) + edit/delete controls
 * - Expanded: uppercase value input, color palette, live preview of the pill
 * - Orange hover border, red OBRIGATÓRIO badge on empty value after first open
 */
export function StatusTagBuilderItem({ tag, index, total, onChange, onDelete, onMove, hasError }) {
  const [expanded, setExpanded] = useState(!!tag.isNew);
  const [draggable, setDraggable] = useState(false);

  const colors = ALERT_COLORS[tag.color] || ALERT_COLORS.blue;

  const handleToggleExpand = () => {
    if (expanded && tag.isNew) {
      onChange(index, { ...tag, isNew: false });
    }
    setExpanded(!expanded);
  };

  const showValidation = !tag.isNew && hasError && !expanded;
  const showFieldError = !tag.isNew && hasError;

  // Exact replica of the statusBadge + statusText styles from CardComponents.jsx
  const TagPreview = () => (
    <div style={{ padding: "4px 10px", borderRadius: 8, backgroundColor: colors.text + "20", flexShrink: 0 }}>
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: colors.text }}>
        {tag.value || "PRÉVIA"}
      </span>
    </div>
  );

  return (
    <div
      draggable={draggable}
      onDragStart={e => { e.dataTransfer.setData("tagIndex", index); }}
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        e.preventDefault();
        const from = parseInt(e.dataTransfer.getData("tagIndex"));
        if (!isNaN(from) && from !== index) onMove(from, index);
      }}
      className={`bg-white dark:bg-card border rounded-lg mb-2 transition-colors overflow-hidden ${showValidation ? 'border-red-300' : 'border-gray-200 dark:border-gray-800 hover:border-[#F97316]/40'}`}
    >
      {/* ── Header row (always visible) ── */}
      <div className={`flex items-center p-2.5 gap-3 border-b border-transparent ${expanded ? 'bg-gray-50 dark:bg-muted/30 border-gray-100 dark:border-gray-800' : ''} ${showValidation ? 'bg-red-50/50 hover:bg-red-50/80' : 'hover:bg-gray-50 dark:hover:bg-muted/50'}`}>
        <div
          className="cursor-grab text-gray-400 hover:text-gray-600 p-1 -m-1"
          onMouseEnter={() => setDraggable(true)}
          onMouseLeave={() => setDraggable(false)}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Live preview pill */}
        <TagPreview />

        <span className="text-xs text-gray-500 dark:text-gray-400 flex-1 truncate">
          {tag.value ? tag.value : <span className="italic text-gray-400 dark:text-gray-500">sem valor</span>}
          {showValidation && <AlertCircle className="w-3 h-3 text-red-500 inline ml-1.5" />}
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

      {/* ── Expanded edit form ── */}
      {expanded && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-card flex flex-col gap-4">
          {/* Value input (always uppercased) + live preview side by side */}
          <div className="flex gap-4 items-end">
            <ValidatedInput
              className="flex-1"
              label="Valor Exato"
              value={tag.value}
              onChange={e => onChange(index, { ...tag, value: e.target.value.toUpperCase() })}
              placeholder="ex: AGENDADO"
              required
              showError={showFieldError}
            />
            {/* Live preview in edit mode */}
            <div className="space-y-1.5 pb-0.5">
              <Label className="text-xs text-gray-400">Prévia</Label>
              <TagPreview />
            </div>
          </div>

          {/* Color palette */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500 dark:text-gray-400">Cor</Label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map(c => {
                const col = ALERT_COLORS[c];
                return (
                  <button
                    key={c}
                    onClick={() => onChange(index, { ...tag, color: c })}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold border-2 transition-all ${tag.color === c ? 'shadow-md scale-105' : 'opacity-60 hover:opacity-90 hover:scale-105 border-transparent'}`}
                    style={{
                      background: col.bg,
                      color: col.text,
                      borderColor: tag.color === c ? col.border : "transparent",
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}