import { Search, Edit2, Trash2, Server, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import LoadingState from '@/components/LoadingState';

export default function CompanyServicesTable({
  filtered, isLoading, isError, searchTerm, setSearchTerm,
  handleToggleStatus, handleOpenModal, handleDelete
}) {
  return (
    <Card className="border-gray-200 dark:border-0 shadow-none overflow-hidden">
      <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-transparent">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Lista de Serviços</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {filtered.length} serviço{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 dark:border-gray-800 bg-white dark:bg-[#121212] focus:border-orange-500 dark:focus:border-orange-500 focus:ring-0 focus-visible:ring-0 shadow-none focus:shadow-none focus-visible:shadow-none"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <LoadingState text="Carregando serviços..." />
        ) : isError ? (
          <div className="flex items-center justify-center py-12 gap-2 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">Erro ao carregar serviços.</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Server className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Nenhum serviço encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-3">Serviço</th>
                  <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-3">URL Base</th>
                  <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-3">Domínio Permitido</th>
                  <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filtered.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 flex-shrink-0">
                          {service.icon_url && (
                            <img 
                              src={service.icon_url} 
                              alt={service.title} 
                              className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700 absolute inset-0 z-10 bg-white dark:bg-[#121212]" 
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          )}
                          <div className="w-9 h-9 bg-gradient-to-br from-gray-100 dark:from-gray-800 to-gray-200 dark:to-gray-900 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 font-semibold text-xs border border-gray-200 dark:border-gray-700 absolute inset-0 z-0">
                            {service.title ? service.title.substring(0, 2).toUpperCase() : <Server className="w-4 h-4" />}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{service.title}</p>
                          {service.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] truncate" title={service.description}>
                              {service.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-[250px] truncate" title={service.url}>
                      <a href={service.url} target="_blank" rel="noreferrer" className="hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline inline-flex items-center gap-1">
                        {service.url}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      {service.is_domain_active ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400" title="Domínio desativado pela administração">
                          Desativado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Switch
                        checked={service.is_active}
                        onCheckedChange={() => handleToggleStatus(service.id, service.is_active)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(service)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
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
