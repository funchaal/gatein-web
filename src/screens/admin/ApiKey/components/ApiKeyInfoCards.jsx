import { Server, Clock } from 'lucide-react';

export default function ApiKeyInfoCards() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 border border-gray-200 dark:border-[#262626] rounded-xl">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-3">
          <Server className="w-3.5 h-3.5" />
          Onde armazenar
        </p>
        <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5">
          <li className="flex items-start gap-1.5"><span className="text-gray-300 dark:text-gray-600 mt-0.5">—</span>Variáveis de ambiente, nunca no código</li>
          <li className="flex items-start gap-1.5"><span className="text-gray-300 dark:text-gray-600 mt-0.5">—</span>Gerenciador de senhas ou vault seguro</li>
          <li className="flex items-start gap-1.5"><span className="text-gray-300 dark:text-gray-600 mt-0.5">—</span>Fora de repositórios públicos</li>
        </ul>
      </div>
      <div className="p-4 border border-gray-200 dark:border-[#262626] rounded-xl">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-3">
          <Clock className="w-3.5 h-3.5" />
          Boas práticas
        </p>
        <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5">
          <li className="flex items-start gap-1.5"><span className="text-gray-300 dark:text-gray-600 mt-0.5">—</span>Use HTTPS em todas as requisições</li>
          <li className="flex items-start gap-1.5"><span className="text-gray-300 dark:text-gray-600 mt-0.5">—</span>Rotacione a cada 90 dias</li>
          <li className="flex items-start gap-1.5"><span className="text-gray-300 dark:text-gray-600 mt-0.5">—</span>Gere nova se suspeitar de vazamento</li>
        </ul>
      </div>
    </div>
  );
}
