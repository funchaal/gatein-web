import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CardBuilderItem, StatusTagBuilderItem } from "./CardEditorComponents";
import { RequiredTag } from "./SharedComponents";

export default function CardLayoutBuilder({
  layout,
  updateHeader,
  updateSubHeader,
  addStatusTag,
  updateStatusTag,
  deleteStatusTag,
  moveStatusTag,
  addRow,
  updateRow,
  deleteRow,
  moveRow,
  validation,
}) {
  return (
    <>
      {/* Header */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2 h-5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Header Principal
          <RequiredTag visible={validation.header} />
        </h3>
        <div className="bg-white dark:bg-card p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500 dark:text-gray-400">Label (opcional)</Label>
            <Input
              className="h-9 dark:bg-input/30 dark:border-gray-800 focus:border-primary focus:ring-primary"
              value={layout.card_layout.header?.label || ""}
              onChange={(e) => updateHeader("label", e.target.value)}
              placeholder="ex: Motorista"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500 dark:text-gray-400">Field (caminho)</Label>
            <Input
              className={`h-9 font-mono dark:bg-input/30 dark:border-gray-800 focus:border-primary focus:ring-primary ${
                validation.header ? "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20" : ""
              }`}
              value={layout.card_layout.header?.field || ""}
              onChange={(e) => updateHeader("field", e.target.value)}
              placeholder="ex: motorista"
            />
          </div>
        </div>
      </section>

      {/* SubHeader */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2 h-5">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Sub-Header
          <RequiredTag visible={validation.subHeader} />
        </h3>
        <div className="bg-white dark:bg-card p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500 dark:text-gray-400">Label (opcional)</Label>
            <Input
              className="h-9 dark:bg-input/30 dark:border-gray-800 focus:border-primary focus:ring-primary"
              value={layout.card_layout.sub_header?.label || ""}
              onChange={(e) => updateSubHeader("label", e.target.value)}
              placeholder="ex: Placa"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500 dark:text-gray-400">Field (caminho)</Label>
            <Input
              className={`h-9 font-mono dark:bg-input/30 dark:border-gray-800 focus:border-primary focus:ring-primary ${
                validation.subHeader ? "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20" : ""
              }`}
              value={layout.card_layout.sub_header?.field || ""}
              onChange={(e) => updateSubHeader("field", e.target.value)}
              placeholder="ex: placa"
            />
          </div>
        </div>
      </section>

      {/* Status Tags */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2 h-5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Tags de Status
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={addStatusTag}
            className="h-8 text-xs font-semibold dark:text-gray-300 dark:border-gray-700 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-200 dark:hover:border-teal-800"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Tag
          </Button>
        </div>
        <div className="space-y-2">
          {(layout.card_layout.status_tags || []).map((tag, i) => (
            <StatusTagBuilderItem
              key={tag.id}
              tag={tag}
              index={i}
              total={(layout.card_layout.status_tags || []).length}
              onChange={updateStatusTag}
              onDelete={deleteStatusTag}
              onMove={moveStatusTag}
              hasError={validation.statusTags?.[tag.id]}
            />
          ))}
          {(layout.card_layout.status_tags || []).length === 0 && (
            <div className="text-center py-4 bg-white dark:bg-card border border-gray-200 dark:border-gray-800 border-dashed rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nenhuma tag de status customizada.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Body rows */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2 h-5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Linhas do Rodapé
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={addRow}
            className="h-8 text-xs font-semibold text-gray-600 dark:text-gray-300 dark:border-gray-700 hover:text-primary dark:hover:text-primary hover:border-primary/50 dark:hover:border-primary/50"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Linha
          </Button>
        </div>
        <div className="space-y-2">
          {layout.card_layout.body_rows.map((row, i) => (
            <CardBuilderItem
              key={row.id}
              row={row}
              index={i}
              total={layout.card_layout.body_rows.length}
              onChange={updateRow}
              onDelete={deleteRow}
              onMove={moveRow}
              hasError={validation.cardRows[row.id]}
            />
          ))}
          {layout.card_layout.body_rows.length === 0 && (
            <div className="text-center py-8 bg-white dark:bg-card border border-gray-200 dark:border-gray-800 border-dashed rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma linha adicionada.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
