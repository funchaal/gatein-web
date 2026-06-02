import { useState } from 'react';
import {
  User, Mail, Lock, Shield, AlertCircle, CheckCircle2,
  UserPlus, Edit2, Trash2, Search, X, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActionButton } from '@/components/ui/ActionButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import LoadingState from '@/components/LoadingState';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '@/services/api';
import { usePermissions } from '@/hooks/usePermissions';
import { colors } from "@/constants/colors";

import { MODULES_BY_TYPE, buildDefaultPermissions } from './helpers';
import UsersTable from './components/UsersTable';
import UserModal from './components/UserModal';

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export default function Users() {
  const { companyType } = usePermissions();
  const modules = MODULES_BY_TYPE[companyType] ?? [];

  const { data: usersData, isLoading, isError } = useGetUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const isSaving = isCreating || isUpdating;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '', username: '', password: '', is_admin: false,
  });
  const [permissions, setPermissions] = useState(buildDefaultPermissions(modules));

  const hasChanges = !editingUser || (
    formData.name !== (editingUser.name ?? '') ||
    formData.username !== (editingUser.username ?? '') ||
    formData.password !== '' ||
    formData.is_admin !== (editingUser.is_admin ?? false) ||
    modules.some(({ key }) => (permissions[key] ?? 'none') !== (editingUser.permissions?.[key] ?? 'none'))
  );

  const isValid = formData.name.trim() !== '' && formData.username.trim() !== '' && (editingUser ? true : formData.password.trim() !== '');
  const canSave = hasChanges && isValid;

  // --- Form helpers ---
  const resetForm = () => {
    setFormData({ name: '', username: '', password: '', is_admin: false });
    setPermissions(buildDefaultPermissions(modules));
    setEditingUser(null);
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name ?? '',
        username: user.username ?? '',
        password: '',
        is_admin: user.is_admin ?? false,
      });
      // Garante que todos os módulos atuais aparecem no form, mesmo que o
      // usuário salvo não tenha o módulo (ex: empresa mudou de tipo)
      setPermissions({ ...buildDefaultPermissions(modules), ...(user.permissions ?? {}) });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); resetForm(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;
    const payload = { ...formData, permissions };
    // Remove senha vazia no update (backend ignora se ausente)
    if (editingUser && !payload.password) delete payload.password;

    try {
      if (editingUser) {
        await updateUser({ id: editingUser.id, ...payload }).unwrap();
        toast.success('Usuário atualizado com sucesso!');
      } else {
        await createUser(payload).unwrap();
        toast.success('Usuário criado com sucesso!');
      }
      handleCloseModal();
    } catch (err) {
      const msg = err?.data?.detail?.message ?? 'Erro ao salvar usuário.';
      toast.error(msg);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await deleteUser(userId).unwrap();
      toast.success('Usuário excluído.');
    } catch (err) {
      const msg = err?.data?.detail?.message ?? 'Erro ao excluir usuário.';
      toast.error(msg);
    }
  };

  // --- Filtro ---
  const users = usersData ?? [];
  const filtered = users.filter((u) => {
    const s = searchTerm.toLowerCase();
    return u.name?.toLowerCase().includes(s) || u.username?.toLowerCase().includes(s);
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primary + '1A' }}>
            <User className="w-5 h-5" style={{ color: colors.primary }} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Gerenciamento de Usuários</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie usuários e suas permissões</p>
          </div>
        </div>
        <ActionButton
          onClick={() => handleOpenModal()}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Usuário
        </ActionButton>
      </div>

      <UsersTable
        filtered={filtered}
        isLoading={isLoading}
        isError={isError}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        modules={modules}
        handleOpenModal={handleOpenModal}
        handleDelete={handleDelete}
      />

      <UserModal
        isModalOpen={isModalOpen}
        editingUser={editingUser}
        formData={formData}
        setFormData={setFormData}
        permissions={permissions}
        setPermissions={setPermissions}
        modules={modules}
        handleCloseModal={handleCloseModal}
        handleSubmit={handleSubmit}
        isSaving={isSaving}
        canSave={canSave}
      />
    </div>
  );
}
