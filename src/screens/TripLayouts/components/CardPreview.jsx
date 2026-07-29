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
  const displayTime = formatDate(get(data, "schedule.start_time") || data?.window_start);

  const { header, sub_header, body_rows } = config?.card_layout || {};

  const visibleBodyRows = (body_rows && body_rows.length > 0)
    ? body_rows.filter(row => {
        if (row.field === "origin_city" || row.field === "destination_city") {
          return false;
        }
        const val = row.field ? get(data, row.field) : null;
        return !!val;
      })
    : [];

  return (
    <div style={styles.container}>
      {/* --- Top Metadata Row (Tag on Left, Summarized Date on Right) --- */}
      <div style={styles.headerRow}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
          Sábado
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b", letterSpacing: "0.2px" }}>
          {displayTime || "27/06 18:00"}
        </span>
      </div>

      {config?.card_layout && (
        <>
          {/* Trip Destination Row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 8,
            marginTop: 4,
            fontSize: 14,
            fontFamily: "sans-serif"
          }}>
            <span style={{ marginRight: 6, fontSize: 14 }}>📍</span>
            <span style={{ fontWeight: 600, color: "#64748b", marginRight: 4 }}>Destino:</span>
            <span style={{ fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
              {get(data, "destination_city") || data?.custom_data?.destination_city || "Destino"}
            </span>
          </div>

          {/* --- Dynamic Header Components --- */}
          <CardHeaderElement header={header} subHeader={sub_header} data={data} status={status} statusColor={statusColor} />

          {/* --- Dynamic Body Rows --- */}
          {visibleBodyRows.length > 0 && (
            <div style={styles.bodyRowsContainer}>
              {visibleBodyRows.map((row, i) => (
                <CardRowElement key={i} row={row} data={data} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}