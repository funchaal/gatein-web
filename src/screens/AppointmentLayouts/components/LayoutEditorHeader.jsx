import { ArrowLeft, LayoutTemplate, Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/ui/ActionButton";
import { Input } from "@/components/ui/input";
import { colors } from "@/constants/colors";

export default function LayoutEditorHeader({
  handleBackToList,
  isEditing,
  saveRef,
  saveTitle,
  setSaveTitle,
  setSaveRef,
  validation,
  handleSave,
  saving,
  saved,
  hasChanges,
}) {
  return (
    <div className="bg-white dark:bg-card border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between relative shadow-none">
      {/* Left Side: Navigation and Context */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackToList}
          className="-ml-2 h-9 w-9 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-full shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {/* <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: colors.primary + '1A' }}>
          <LayoutTemplate className="w-5 h-5" style={{ color: colors.primary }} />
        </div> */}

        <div className="flex flex-col justify-center">
          <span className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            {isEditing ? (
              <>
                Editando layout{" "}
                <em className="text-gray-900 dark:text-gray-100 italic bg-gray-100 dark:bg-gray-800 rounded">
                  {saveRef}
                </em>
              </>
            ) : (
              "Novo Layout"
            )}
          </span>
        </div>
      </div>

      {/* Right Side: Inputs and Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1 justify-end">
        <div className="flex flex-col relative w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider whitespace-nowrap ${validation.title || validation.titleExists ? "text-red-500" : "text-gray-500 dark:text-gray-400"
                }`}
            >
              Título:
            </span>
            <Input
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder="Ex: Layout Padrão"
              className={`text-sm font-mono transition-colors placeholder:text-gray-400/70 dark:placeholder:text-gray-600/50 w-full sm:w-48 bg-white dark:bg-transparent ${validation.title || validation.titleExists ? "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20" : ""
                }`}
            />
          </div>
          {validation.titleExists && (
            <span className="absolute -bottom-4 right-0 text-[10px] text-red-500 font-semibold">
              '{saveTitle.trim()}' já está em uso.
            </span>
          )}
        </div>
        <div className="flex flex-col relative w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider whitespace-nowrap ${validation.ref || validation.refExists ? "text-red-500" : "text-gray-500 dark:text-gray-400"
                }`}
            >
              Ref:
            </span>
            <Input
              value={saveRef}
              onChange={(e) => setSaveRef(e.target.value)}
              placeholder="Ex: default_layout"
              disabled={isEditing}
              className={`text-sm font-mono transition-colors placeholder:text-gray-400/70 dark:placeholder:text-gray-600/50 w-full sm:w-48 bg-white dark:bg-transparent disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-900 ${(validation.ref || validation.refExists) && !isEditing ? "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20" : ""
                }`}
            />
          </div>
          {validation.refExists && !isEditing && (
            <span className="absolute -bottom-4 right-0 text-[10px] text-red-500 font-semibold">
              '{saveRef.trim()}' já está em uso.
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <ActionButton
            onClick={handleSave}
            isLoading={saving}
            disabled={!validation.isValid || !hasChanges}
            className={`h-9 font-semibold px-5 transition-colors ${!validation.isValid || !hasChanges
                ? "bg-gray-300 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-default border-gray-300 dark:border-gray-700"
                : ""
              }`}
          >
            {saving ? (
              "Salvando..."
            ) : saved ? (
              <>
                <Check className="w-4 h-4 mr-2" /> Salvo
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Salvar
              </>
            )}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
