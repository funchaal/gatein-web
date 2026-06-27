import { LayoutTemplate, Plus, Trash2, Edit2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/ui/ActionButton";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { colors } from "@/constants/colors";

export default function LayoutList({
  layouts,
  handleEdit,
  handleCreateNew,
  deletePrompt,
  setDeletePrompt,
  deleteConfirmText,
  setDeleteConfirmText,
  confirmDelete,
  isDeleting = false,
}) {
  return (
    <div className="max-w-7xl mx-auto pb-12 relative">
      <div className="sticky -top-6 z-20 bg-background/80 backdrop-blur-md -mx-6 px-6 -mt-6 pt-6 pb-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primary + '1A' }}>
            <LayoutTemplate className="w-5 h-5" style={{ color: colors.primary }} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Ticket Layouts</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Configure como os motoristas visualizam seus tickets de acesso no check-in</p>
          </div>
        </div>
        <ActionButton onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" /> Novo Layout de Ticket
        </ActionButton>
      </div>

      <Card className="overflow-hidden shadow-none border-none bg-transparent">
        <CardContent className="p-0">
          <div className="flex flex-col gap-3">
            {layouts.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-none rounded-xl bg-gray-50/50 dark:bg-[#1B1B1B]">
                Nenhum layout de ticket encontrado. Clique em "Novo Layout de Ticket" para começar.
              </div>
            ) : (
              layouts.map((l) => (
                <div
                  key={l.ref}
                  className="p-4 flex items-center justify-between border border-gray-200 dark:border-none rounded-xl bg-gray-50/50 dark:bg-[#1B1B1B] hover:bg-gray-100 dark:hover:bg-[#222222] transition-colors"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{l.title || l.ref}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-0.5">{l.ref}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(l)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletePrompt(l.ref);
                        setDeleteConfirmText("");
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {deletePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-card dark:border dark:border-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold">Excluir Layout de Ticket</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Esta ação não pode ser desfeita. Para confirmar a exclusão, digite a referência exata do layout (<strong>{deletePrompt}</strong>) no campo abaixo:
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={deletePrompt}
              className="font-mono text-sm"
              disabled={isDeleting}
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setDeletePrompt(null);
                  setDeleteConfirmText("");
                }}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteConfirmText !== deletePrompt || isDeleting}
                className={
                  deleteConfirmText === deletePrompt && !isDeleting
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-red-300 text-white cursor-not-allowed"
                }
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Excluindo...
                  </>
                ) : (
                  "Confirmar Exclusão"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
