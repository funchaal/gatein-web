export default function PermissionBadge({ value }) {
  const styles = {
    'read/write': 'bg-orange-100/70 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400',
    write:        'bg-orange-100/70 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400',
    read:         'bg-blue-100/70 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
    none:         'bg-gray-100/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400',
  };
  const labels = { 'read/write': 'Ver+Editar', write: 'Editar', read: 'Ver', none: 'Nenhuma' };
  return (
    <span className={`h-[18px] px-1.5 text-[10px] font-semibold rounded-full uppercase tracking-wider inline-flex items-center justify-center ${styles[value] ?? styles.none}`}>
      {labels[value] ?? value}
    </span>
  );
}

