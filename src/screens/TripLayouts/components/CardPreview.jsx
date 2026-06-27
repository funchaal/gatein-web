import { resolveStatusColor, get, formatDate } from "../helpers";
import { CardHeaderElement, CardRowElement } from "./CardComponents";

/**
 * Renders a preview of how the appointment card will look on the mobile app list screen.
 * Uses inline styles to approximate the native look.
 */
export function CardPreview({ data, config }) {
  const styles = {
    container: {
      background: "#fff", borderRadius: 20, padding: 16, borderLeft: "4px solid #9778ff",
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
      {/* --- Top Metadata Row (Time and ID) --- */}
      <div style={styles.headerRow}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16 }}>🚚</span>
          <span style={styles.displayTime}>{displayTime || "13/05 14:30"}</span>
        </span>
        <span style={styles.displayId}>#{displayId}</span>
      </div>

      {config?.card_layout && (
        <>
          {/* Trip Route Row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
            marginTop: 4,
            fontSize: 14,
            fontWeight: 700,
            color: "#1e293b",
            fontFamily: "sans-serif"
          }}>
            <span style={{ maxWidth: "40%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {get(data, "origin_city") || data?.custom_data?.origin_city || "Origem"}
            </span>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px" }}>
              <div style={{ flex: 1, borderTop: "1px solid #cbd5e1", height: 0 }} />
              <span style={{ margin: "0 4px", fontSize: 14 }}>🚚</span>
              <div style={{ flex: 1, borderTop: "1px solid #cbd5e1", height: 0 }} />
            </div>
            <span style={{ maxWidth: "40%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>
              {get(data, "destination_city") || data?.custom_data?.destination_city || "Destino"}
            </span>
          </div>

          {/* --- Dynamic Header Components --- */}
          <CardHeaderElement header={header} subHeader={sub_header} data={data} status={status} statusColor={statusColor} />

          {/* --- Dynamic Body Rows --- */}
          {body_rows && body_rows.length > 0 && (
            <div style={styles.bodyRowsContainer}>
              {body_rows.map((row, i) => {
                if (row.field === "origin_city" || row.field === "destination_city") {
                  return null;
                }
                return <CardRowElement key={i} row={row} data={data} />;
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}