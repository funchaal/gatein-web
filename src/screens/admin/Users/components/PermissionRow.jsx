import { PERMISSION_OPTIONS } from '../helpers';

export default function PermissionRow({ label, permKey, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-[#262626] last:border-0">
      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{label}</span>
      <div className="flex gap-1.5">
        {PERMISSION_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(permKey, opt.value)}
            className={`px-2.5 py-1 text-xs rounded-full border font-medium transition-all duration-200 ${
              value === opt.value
                ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                : 'bg-white dark:bg-[#0D0D0D] border-gray-300 dark:border-[#262626] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1A1A] hover:border-orange-400 dark:hover:border-orange-500'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
