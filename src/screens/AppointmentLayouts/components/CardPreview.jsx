import { resolveStatusColor, get, formatDate } from "../helpers";
import { CardHeaderElement, CardRowElement } from "./CardComponents";

/**
 * Renders a preview of how the appointment card will look on the mobile app list screen.
 * Structure matches the mobile AppointmentCard exactly:
 *   Row 1 — topTagRow:      day label (left)  + date/time (right)
 *   Row 2 — companyRow:     company logo placeholder + company name
 *   Row 3 — statusAndRefRow: status badge (left) + #ref (right)
 *   Row 4 — titlesRow:      dynamic header + subheader (from config)
 *   Row 5 — footerContainer: body rows (from config)
 */
export function CardPreview({ data, config }) {
  const status = data?.status || "Agendado";
  const statusColor = resolveStatusColor(status);
  const displayTime = formatDate(get(data, "schedule.start_time") || data?.window_start);
  const displayId = data?.ref;

  const { header, sub_header, body_rows } = config?.card_layout || {};

  return (
    <div style={{
      background: "#fff",
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      border: "1px solid #E2E8F0",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>

      {/* ── Row 1: topTagRow ── day label left + date right ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Hoje</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b", letterSpacing: "0.2px" }}>
          {displayTime || "13/05 14:30"}
        </span>
      </div>

      {/* ── Row 2: companyRow ── logo placeholder + company name ── */}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 12, backgroundColor: "#e2e8f0",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginRight: 6, fontSize: 9, fontWeight: "bold", color: "#64748b",
          flexShrink: 0,
        }}>TM</div>
        <span style={{ fontSize: 12, fontWeight: 500, color: "#64748b", flex: 1 }}>Terminal</span>
      </div>

      {/* ── Row 3: statusAndRefRow ── status badge left + #ref right ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ paddingLeft: 10, paddingRight: 10, paddingTop: 4, paddingBottom: 4, borderRadius: 8, backgroundColor: statusColor + "20" }}>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: statusColor }}>
            {status}
          </span>
        </div>
        {displayId && (
          <span style={{ fontSize: 14, fontWeight: 500, color: "#94A3B8" }}>#{displayId}</span>
        )}
      </div>

      {/* ── Rows 4–5: dynamic card layout (header + body rows) ── */}
      {config?.card_layout && (
        <>
          {/* Row 4: titlesRow — header + subheader */}
          <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 2 }}>
            <CardHeaderElement header={header} subHeader={sub_header} data={data} />
          </div>

          {/* Row 5: footerContainer — body rows */}
          {body_rows && body_rows.length > 0 && (
            <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
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