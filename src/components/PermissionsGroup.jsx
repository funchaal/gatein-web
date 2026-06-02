import { Label } from "@/components/ui/label";

export default function PermissionsGroup({ label, permissionKey, options, value, onChange }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-gray-700">{label}</Label>
      <div className="flex gap-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          
          // Define cores baseadas no tipo de permissão
          const getColors = () => {
            if (option.value === 'edit') {
              return isSelected 
                ? 'bg-orange-500 text-white border-orange-600 shadow-md' 
                : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400 hover:bg-orange-50';
            }
            if (option.value === 'read') {
              return isSelected 
                ? 'bg-blue-500 text-white border-blue-600 shadow-md' 
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50';
            }
            // none
            return isSelected 
              ? 'bg-gray-500 text-white border-gray-600 shadow-md' 
              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50';
          };

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(permissionKey, option.value)}
              className={`
                flex-1 px-4 py-2.5 rounded-lg border-2 text-sm font-medium
                transition-all duration-200 transform
                ${getColors()}
                ${isSelected ? 'scale-105' : 'hover:scale-102'}
              `}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}