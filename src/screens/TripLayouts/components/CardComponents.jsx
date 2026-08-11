import { get } from "../helpers";

const THEME = {
  slate900: '#0F172A',
  slate600: '#475569',
  slate400: '#94A3B8'
};

/**
 * Renders the title block (header + sub_header) of the card.
 * Status badge is rendered separately in CardPreview to match mobile layout order.
 */
export function CardHeaderElement({ header, subHeader, data }) {
  const styles = {
    container: { marginBottom: 2, gap: 2, display: "flex", flexDirection: "column" },
    group: { display: "flex", flexDirection: "column", gap: 0 },
    label: { fontSize: 14, color: THEME.slate400, fontWeight: 500, marginBottom: 0, textTransform: "capitalize" },
    value: { fontSize: 26, fontWeight: 800, color: THEME.slate900, wordBreak: "break-word" },
    empty: { fontSize: 14, color: "#CBD5E1", fontStyle: "italic" },
    subGroup: { display: "flex", flexDirection: "column", gap: 0 },
    subLabel: { fontSize: 14, color: THEME.slate400, fontWeight: 500, marginBottom: 0, textTransform: "capitalize" },
    subValue: { fontSize: 20, fontWeight: 500, color: THEME.slate600, wordBreak: "break-word" },
  };

  const headerVal = header?.field && header.field.trim()
    ? (get(data, header.field) || data?.[header.field] || `[${header.field}]`)
    : null;

  const subHeaderVal = subHeader?.field && subHeader.field.trim()
    ? (get(data, subHeader.field) || data?.[subHeader.field] || `[${subHeader.field}]`)
    : null;

  return (
    <div style={styles.container}>
      {headerVal ? (
        <div style={styles.group}>
          {header.label && <div style={styles.label}>{header.label}</div>}
          <div style={styles.value}>{headerVal}</div>
        </div>
      ) : (
        <div style={styles.empty}>Header vazio</div>
      )}
      {subHeaderVal && (
        <div style={styles.subGroup}>
          {subHeader.label && <div style={styles.subLabel}>{subHeader.label}</div>}
          <div style={styles.subValue}>{subHeaderVal}</div>
        </div>
      )}
    </div>
  );
}

export function CardRowElement({ row, data }) {
  const styles = {
    container: { display: "flex", flexDirection: 'row', justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: 2, paddingBlock: 2 },
    label: { fontSize: 14, color: THEME.slate400, fontWeight: 500, textTransform: "capitalize", flex: 1, maxWidth: "50%", wordBreak: "break-word" },
    value: { fontSize: 14, color: THEME.slate900, fontWeight: 600, flex: 1, maxWidth: "50%", textAlign: "right", wordBreak: "break-word" }
  };

  if (!row?.field || !row.field.trim()) return null;

  const val = get(data, row.field) || data?.[row.field] || `[${row.field}]`;
  
  return (
    <div style={styles.container}>
      {row.label && <span style={styles.label}>{row.label}</span>}
      <span style={styles.value}>{val}</span>
    </div>
  );
}