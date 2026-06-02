import { resolveStatusColor, get, formatDate } from "../helpers";
import { CardHeaderElement, CardRowElement } from "./CardComponents";

export function CardPreview({ data, config }) {
  const styles = {
    container: {
      background: "#fff", borderRadius: 20, padding: 16,
      margin: "12px 12px 0", border: "1px solid #E2E8F0",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },
    headerRow: {
      display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10
    },
    displayTime: {
      fontSize: 13, fontWeight: 700, color: "#475569", letterSpacing: 0.2
    },
    displayId: {
      fontSize: 13, fontWeight: 500, color: "#94A3B8"
    },
    bodyRowsContainer: {
      borderTop: "1px solid #F1F5F9", paddingTop: 12, display: "flex", flexDirection: "column", gap: 4
    }
  };

  const status = data?.status || "Desconhecido";
  const statusColor = resolveStatusColor(status, config?.card_layout?.status_tags);
  const displayTime = formatDate(get(data, "schedule.start_time") || data?.schedule_start_time);
  const displayId = data?.ref;

  const { header, sub_header, body_rows } = config?.card_layout || {};

  return (
    <div style={styles.container}>
      {/* header row */}
      <div style={styles.headerRow}>
        <span style={styles.displayTime}>{displayTime || "13/05 14:30"}</span>
        <span style={styles.displayId}>#{displayId}</span>
      </div>

      {config?.card_layout && (
        <>
          <CardHeaderElement header={header} subHeader={sub_header} data={data} status={status} statusColor={statusColor} />

          {body_rows && body_rows.length > 0 && (
            <div style={styles.bodyRowsContainer}>
              {body_rows.map((row, i) => (
                <CardRowElement key={i} row={row} data={data} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}