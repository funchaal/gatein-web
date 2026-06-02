import { User, Edit2, Trash2, Search, AlertCircle, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import LoadingState from '@/components/LoadingState';
import PermissionBadge from './PermissionBadge';

export default function UsersTable({
  filtered, isLoading, isError, searchTerm, setSearchTerm,
  modules, handleOpenModal, handleDelete
}) {
  return (
    <Card className="border-gray-200 dark:border-0 shadow-none overflow-hidden">
      <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-transparent">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Lista de Usuários</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {filtered.length} usuário{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 dark:border-gray-800 bg-white dark:bg-[#121212] focus:border-orange-500 dark:focus:border-orange-500 focus:ring-0 focus-visible:ring-0 shadow-none focus:shadow-none focus-visible:shadow-none"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <LoadingState text="Carregando usuários..." />
        ) : isError ? (
          <div className="flex items-center justify-center py-12 gap-2 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">Erro ao carregar usuários.</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-3">Usuário</th>
                  <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-3">Login</th>
                  <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-3">Tipo</th>
                  <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-3">Permissões</th>
                  <th className="text-right text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{user.username}</td>
                    <td className="px-6 py-4">
                      {user.is_admin ? (
                        <span className="inline-flex items-center justify-center h-6 gap-1.5 px-2.5 text-xs font-semibold bg-purple-100/70 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded-full">
                          <Shield className="w-3.5 h-3.5" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center h-6 px-2.5 text-xs font-semibold bg-gray-100/70 dark:bg-gray-800/45 text-gray-700 dark:text-gray-300 rounded-full">
                          Usuário
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {/* Mostra só os módulos relevantes pro tipo de empresa */}
                        {modules.slice(0, 3).map(({ key, label }) => {
                          const val = user.permissions?.[key] ?? 'none';
                          if (val === 'none') return null;
                          return (
                            <div
                              key={key}
                              className="inline-flex items-center h-6 gap-1.5 bg-gray-100/60 dark:bg-[#1A1A1C] rounded-full pl-2.5 pr-1 text-xs"
                            >
                              <span className="font-medium text-gray-600 dark:text-gray-400 text-[11px] leading-none">
                                {label}
                              </span>
                              <span className="w-[3px] h-[3px] bg-gray-300 dark:bg-gray-700 rounded-full" />
                              <PermissionBadge value={val} />
                            </div>
                          );
                        })}
                        {user.is_admin && (
                          <span className="h-6 px-2.5 text-[10px] font-semibold bg-purple-100/70 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded-full uppercase tracking-wider inline-flex items-center justify-center gap-1">
                            <Shield className="w-3 h-3" /> Acesso total
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
