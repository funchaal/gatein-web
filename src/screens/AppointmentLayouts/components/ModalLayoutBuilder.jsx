import { Plus, Smartphone } from "lucide-react";
import { ELEMENT_META } from "../constants";
import { ModalBuilderItem } from "./ModalEditorComponents";

export default function ModalLayoutBuilder({
  layout,
  addModalEl,
  updateModalEl,
  deleteModalEl,
  moveModalEl,
  validation,
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2 h-5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Elementos do Modal
        </h3>
        {/* Add element buttons */}
        <div className="flex gap-2 flex-wrap bg-white dark:bg-card p-3 rounded-xl border border-gray-200 dark:border-gray-800">
          {Object.entries(ELEMENT_META).map(([key, meta]) => {
            const MetaIcon = meta.Icon;
            return (
              <div
                key={key}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("newModalElement", key);
                  e.dataTransfer.effectAllowed = "copy";
                }}
                onClick={() => addModalEl(key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                style={{
                  background: meta.bg,
                  color: meta.color,
                  border: `1px solid ${meta.color}40`,
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

      <div
        className="space-y-2"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const newModalElement = e.dataTransfer.getData("newModalElement");
          if (newModalElement) {
            addModalEl(newModalElement); // add at the end
          }
        }}
      >
        {layout.modal_layout.map((el, i) => (
          <ModalBuilderItem
            key={el.id}
            el={el}
            index={i}
            total={layout.modal_layout.length}
            onChange={updateModalEl}
            onDelete={deleteModalEl}
            onMove={moveModalEl}
            onDropNew={addModalEl}
            hasError={validation?.modalEls?.[el.id]}
          />
        ))}
        {layout.modal_layout.length === 0 && (
          <div className="text-center py-10 bg-white dark:bg-card border border-gray-200 dark:border-gray-800 border-dashed rounded-xl">
            <Smartphone className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Adicione elementos para construir o modal
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
