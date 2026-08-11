import { resolveStatusColor, get, formatDate } from "../helpers";
import { CardHeaderElement, CardRowElement } from "./CardComponents";

/**
 * Renders a preview of how the trip card will look on the mobile app list screen.
 * Structure matches the mobile AppointmentCard (with isTrip=true) exactly:
 *   Row 1 — topTagRow:       day label (left)  + date/time (right)
 *   Row 2 — companyRow:      company logo placeholder + trucking company name
 *   Row 3 — statusAndRefRow: status badge (left) + #ref (right)
 *   Row 4 — titlesRow:       trip destination row + dynamic header + subheader
 *   Row 5 — footerContainer: remaining body rows (excluding origin/destination city)
 *
 * Trip-specific accent: left border 4px solid #9778ff (purple).
 * Note: borderLeft is set via explicit side properties to avoid CSS shorthand override.
 */
export function CardPreview({ data, config }) {
  const status = data?.status || "Programado";
  const statusColor = resolveStatusColor(status);
  const displayTime = formatDate(get(data, "schedule.start_time") || data?.window_start);

  const { header, sub_header, body_rows } = config?.card_layout || {};

  const destination = get(data, "destination_city") || data?.custom_data?.destination_city || "Destino";

  const visibleBodyRows = (body_rows && body_rows.length > 0)
    ? body_rows.filter(row => {
        if (row.field === "origin_city" || row.field === "destination_city") return false;
        return row.field && row.field.trim() !== "";
      })
    : [];

  return (
    <div style={{
      background: "#fff",
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      /* Trip accent: explicit side properties so borderLeft (#9778ff) is not overridden */
      borderTop: "1px solid #E2E8F0",
      borderRight: "1px solid #E2E8F0",
      borderBottom: "1px solid #E2E8F0",
      borderLeft: "4px solid #9778ff",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>

      {/* ── Row 1: topTagRow ── day label left + date right ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Sábado</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b", letterSpacing: "0.2px" }}>
          {displayTime || "27/06 18:00"}
        </span>
      </div>

      {/* ── Row 2: companyRow ── trucking company logo placeholder + name ── */}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 12, backgroundColor: "#e2e8f0",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginRight: 6, fontSize: 9, fontWeight: "bold", color: "#64748b",
          flexShrink: 0,
        }}>TR</div>
        <span style={{ fontSize: 12, fontWeight: 500, color: "#64748b", flex: 1 }}>Transportadora</span>
      </div>

      {/* ── Row 3: statusAndRefRow ── status badge left + #ref right ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ paddingLeft: 10, paddingRight: 10, paddingTop: 4, paddingBottom: 4, borderRadius: 8, backgroundColor: statusColor + "20" }}>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: statusColor }}>
            {status}
          </span>
        </div>
        {data?.ref && (
          <span style={{ fontSize: 14, fontWeight: 500, color: "#94A3B8" }}>#{data.ref}</span>
        )}
      </div>

      {/* ── Rows 4–5: dynamic card layout ── */}
      {config?.card_layout && (
        <>
          {/* Row 4: titlesRow — destination + header + subheader */}
          <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 2 }}>

            {/* Trip destination row */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
              <span style={{ marginRight: 4, fontSize: 15, color: "#9778ff" }}>📍</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#64748b", marginRight: 4 }}>Destino:</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                {destination}
              </span>
            </div>

            <CardHeaderElement header={header} subHeader={sub_header} data={data} />
          </div>

          {/* Row 5: footerContainer — remaining body rows */}
          {visibleBodyRows.length > 0 && (
            <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
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