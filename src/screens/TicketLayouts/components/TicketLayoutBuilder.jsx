import { Plus, Smartphone } from "lucide-react";
import { ELEMENT_META } from "../constants";
import { TicketBuilderItem } from "./TicketEditorComponents";
import { useTheme } from "@/hooks/useTheme";

/**
 * Component to build the Ticket Layout for the driver app.
 * Manages draggable elements representing sections and fields.
 */
export default function TicketLayoutBuilder({
  layout,
  addEl,
  updateEl,
  deleteEl,
  moveEl,
  validation,
}) {
  const { isDark } = useTheme();

  return (
    <section className="space-y-4">
      {/* --- Available Elements Section --- */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2 h-5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Elementos do Ticket
        </h3>
        {/* Add element buttons */}
        <div className="flex gap-2 flex-wrap bg-white dark:bg-card p-3 rounded-xl border border-gray-200 dark:border-gray-800">
          {Object.entries(ELEMENT_META).map(([key, meta]) => {
            const MetaIcon = meta.Icon;
            const bg = isDark ? (meta.darkBg || `${meta.color}20`) : meta.bg;
            const color = isDark ? (meta.darkColor || meta.color) : meta.color;
            return (
              <div
                key={key}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("newTicketElement", key);
                  e.dataTransfer.effectAllowed = "copy";
                }}
                onClick={() => addEl(key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-transform hover:scale-105 active:scale-95"
                style={{
                  background: bg,
                  color: color,
                  border: `1px solid ${color}40`,
                }}
              >
                <Plus className="w-3 h-3" />
                <MetaIcon className="w-3 h-3" />
                {meta.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Layout Drop Zone & Element List --- */}
      <div
        className="space-y-2 min-h-[300px]"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const newTicketElement = e.dataTransfer.getData("newTicketElement");
          if (newTicketElement) {
            addEl(newTicketElement); // add at the end
          }
        }}
      >
        {(layout || []).map((el, i) => (
          <TicketBuilderItem
            key={el.id}
            el={el}
            index={i}
            total={layout.length}
            onChange={updateEl}
            onDelete={deleteEl}
            onMove={moveEl}
            onDropNew={addEl}
            hasError={validation?.elements?.[el.id]}
          />
        ))}
        {(!layout || layout.length === 0) && (
          <div className="text-center py-20 bg-white dark:bg-card border border-gray-200 dark:border-gray-800 border-dashed rounded-xl">
            <Smartphone className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
              O layout está vazio
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Clique nos botões acima ou arraste elementos aqui para montar o ticket.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
