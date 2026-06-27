import { get } from "../helpers";

const THEME = {
  slate900: '#0F172A',
  slate600: '#475569',
  slate400: '#94A3B8'
};

export function CardHeaderElement({ header, subHeader, data, status, statusColor }) {
  const styles = {
    container: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
    content: { flex: 1, marginTop: 12, display: "flex", flexDirection: "column", gap: 4, paddingRight: 8 },
    group: { marginBottom: 4 },
    label: { fontSize: 14, color: THEME.slate400, fontWeight: 500, marginBottom: 2, textTransform: "capitalize" },
    value: { fontSize: 26, fontWeight: 800, color: THEME.slate900, wordBreak: "break-word", lineHeight: 1.1 },
    empty: { fontSize: 14, color: "#CBD5E1", fontStyle: "italic", marginBottom: 4 },
    subGroup: { marginTop: 4 },
    subLabel: { fontSize: 14, color: THEME.slate400, fontWeight: 500, marginBottom: 2, textTransform: "capitalize" },
    subValue: { fontSize: 20, fontWeight: 500, color: THEME.slate600 },
    statusBadge: { padding: "4px 10px", borderRadius: 8, marginLeft: 12 },
    statusText: { fontSize: 11, fontWeight: 700, textTransform: "uppercase" },
  };

  const headerVal = header?.field ? get(data, header.field) : null;
  const subHeaderVal = subHeader?.field ? get(data, subHeader.field) : null;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
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
      {status && (
        <div style={{ ...styles.statusBadge, backgroundColor: statusColor + "20" }}>
          <span style={{ ...styles.statusText, color: statusColor }}>{status}</span>
        </div>
      )}
    </div>
  );
}

export function CardRowElement({ row, data }) {
  const styles = {
    container: { display: "flex", flexDirection: 'row', justifyContent: "space-between", alignItems: "center", marginBottom: 2, paddingBlock: 2 },
    label: { fontSize: 14, color: THEME.slate400, fontWeight: 500, textTransform: "capitalize" },
    value: { fontSize: 14, color: THEME.slate900, fontWeight: 600 }
  };

  const val = row.field ? get(data, row.field) : null;
  if (!val) return null;
  
  return (
    <div style={styles.container}>
      {row.label && <span style={styles.label}>{row.label}</span>}
      <span style={styles.value}>{val}</span>
    </div>
  );
}