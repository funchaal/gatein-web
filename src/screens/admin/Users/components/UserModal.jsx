import { User, Mail, Lock, UserPlus, Edit2, Trash2, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionButton } from '@/components/ui/ActionButton';
import { colors } from "@/constants/colors";
import PermissionRow from './PermissionRow';

export default function UserModal({
  isModalOpen,
  editingUser,
  formData,
  setFormData,
  permissions,
  setPermissions,
  modules,
  allUsers = [],
  handleCloseModal,
  handleSubmit,
  handleDelete,
  usernameError,
  setUsernameError,
  isSaving,
  canSave
}) {
  const currentUser = useSelector((state) => state.auth.user);

  if (!isModalOpen) return null;

  const trimmedUsername = formData.username?.trim().toLowerCase() || '';
  const isEditingSameUsername = editingUser && editingUser.username?.toLowerCase() === trimmedUsername;
  
  const isUsernameTakenInList = Boolean(
    trimmedUsername &&
    allUsers.some(
      (u) =>
        u.username?.toLowerCase() === trimmedUsername &&
        (!editingUser || String(u.id) !== String(editingUser.id))
    )
  );

  const isUsernameTaken = isUsernameTakenInList || Boolean(usernameError);
  const isSaveDisabled = !canSave || isUsernameTaken;

  const isSelf = currentUser && editingUser && (
    (editingUser.id && currentUser.id && String(editingUser.id) === String(currentUser.id)) ||
    (editingUser.username && currentUser.username && editingUser.username === currentUser.username)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-card rounded-xl shadow-2xl dark:border dark:border-gray-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-white dark:bg-card border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primary + '1A' }}>
              {editingUser
                ? <Edit2 className="w-5 h-5" style={{ color: colors.primary }} />
                : <UserPlus className="w-5 h-5" style={{ color: colors.primary }} />}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {editingUser ? 'Editar Usuário' : 'Criar Novo Usuário'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {editingUser ? 'Atualize as informações abaixo' : 'Preencha as informações do novo usuário'}
              </p>
            </div>
          </div>
          <button onClick={handleCloseModal} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
          {/* Dados básicos */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-500 rounded-full block" />
              Informações Básicas
            </h3>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-medium text-gray-700 dark:text-gray-300">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <Input
                  id="name" name="name" type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: João Silva"
                  className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs font-medium text-gray-700 dark:text-gray-300">Usuário (login)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <Input
                    id="username" name="username" type="text"
                    value={formData.username}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, username: e.target.value }));
                      if (setUsernameError) setUsernameError('');
                    }}
                    placeholder="user@example.com"
                    className={`pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${isUsernameTaken ? 'border-red-500 focus:border-red-500' : ''}`}
                    required
                  />
                </div>
                {trimmedUsername && (
                  <div className="mt-1 flex items-center">
                    {isUsernameTaken ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800/60">
                        <AlertCircle className="w-3 h-3" />
                        {usernameError || 'Nome de usuário já existe'}
                      </span>
                    ) : isEditingSameUsername ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                        Nome de usuário atual
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                        <CheckCircle2 className="w-3 h-3" />
                        Nome de usuário disponível
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Senha {editingUser && <span className="text-gray-400">(vazio = manter)</span>}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <Input
                    id="password" name="password" type="password"
                    value={formData.password}
                    onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                    placeholder={editingUser ? '••••••••' : 'Mínimo 8 caracteres'}
                    className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    required={!editingUser}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Nível de acesso */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span className="w-1 h-4 bg-purple-500 rounded-full block" />
              Nível de Acesso
            </h3>
            <div className="flex items-start gap-3 p-4 border border-gray-200 dark:border-none rounded-xl bg-gray-50 dark:bg-gray-900">
              <Checkbox
                id="is_admin"
                checked={formData.is_admin}
                onCheckedChange={(checked) => setFormData((p) => ({ ...p, is_admin: !!checked }))}
                className="mt-0.5"
              />
              <div>
                <label htmlFor="is_admin" className="text-sm font-medium text-gray-800 dark:text-gray-200 cursor-pointer">
                  Tornar Administrador
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Admins têm acesso total a todos os módulos disponíveis para este tipo de empresa — as permissões abaixo são ignoradas.
                </p>
              </div>
            </div>
          </section>

          {/* Permissões granulares */}
          {!formData.is_admin && modules.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span className="w-1 h-4 bg-green-500 rounded-full block" />
                Permissões por Módulo
              </h3>
              <div className="bg-gray-50/50 dark:bg-[#1B1B1B] border border-gray-200 dark:border-none rounded-xl px-4 py-2">
                {modules.map(({ key, label }) => (
                  <PermissionRow
                    key={key}
                    label={label}
                    permKey={key}
                    value={permissions[key] ?? 'none'}
                    onChange={(k, v) => setPermissions((p) => ({ ...p, [k]: v }))}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
            <div>
              {editingUser && !isSelf && handleDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    handleDelete(editingUser.id);
                    handleCloseModal();
                  }}
                  disabled={isSaving}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Usuário
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" onClick={handleCloseModal} variant="outline" className="border-gray-300 dark:border-gray-700">
                Cancelar
              </Button>
              <ActionButton
                type="submit"
                isLoading={isSaving}
                disabled={isSaveDisabled}
                className={`min-w-[140px] ${isSaveDisabled ? "bg-gray-300 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-default border-gray-300 dark:border-gray-700" : ""}`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : editingUser ? (
                  <><Edit2 className="w-4 h-4 mr-2" /> Atualizar</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2" /> Criar Usuário</>
                )}
              </ActionButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
