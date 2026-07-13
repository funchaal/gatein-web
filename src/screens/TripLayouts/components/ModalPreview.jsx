import { resolveStatusColor, get, formatDateExtended } from "../helpers";
import { ModalSectionElement, ModalFieldElement, ModalAlertElement, ModalQRCodeElement } from "./ModalComponents";

/**
 * Renders a preview of how the appointment details modal will look on the mobile app.
 * Utilizes a sliding panel look with inline styles.
 */
export function ModalPreview({ data, config }) {
  const styles = {
    container: {
      background: "#ffffff", borderTopLeftRadius: 24, borderTopRightRadius: 24,
      overflow: "hidden", borderTop: "1px solid #E2E8F0",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      height: "100%", display: "flex", flexDirection: "column"
    },
    handleArea: { backgroundColor: 'white', paddingLeft: 24, paddingRight: 24, zIndex: 10 },
    handleContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 12, paddingBottom: 12, backgroundColor: 'white' },
    handle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2 },
    displayTime: { textAlign: 'center', fontSize: 15, fontWeight: 700, marginBottom: 25, marginTop: 5, color: '#475569' },
    scrollView: { paddingLeft: 24, paddingRight: 24, flex: 1, overflowY: "auto" },
    content: { paddingBottom: 20 },
    header: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 5, backgroundColor: 'white' },
    statusBadge: { paddingLeft: 12, paddingRight: 12, paddingTop: 6, paddingBottom: 6, borderRadius: 8 },
    statusText: { fontSize: 12, fontWeight: 700, textTransform: 'uppercase' },
    idText: { fontSize: 14, fontWeight: 500, color: '#94A3B8' },
    heroSection: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingBottom: 24, paddingTop: 16, backgroundColor: 'white', gap: 10 },
    headerGroup: { display: 'flex', flexDirection: 'column', alignSelf: 'stretch', gap: 0 },
    subHeaderGroup: { display: 'flex', flexDirection: 'column', alignSelf: 'stretch', gap: 0 },
    heroLabel: { fontSize: 16, color: '#94A3B8', width: 110, fontWeight: 500 },
    h1Default: { fontSize: 26, fontWeight: 800, color: '#0F172A' },
    h2Default: { fontSize: 20, fontWeight: 500, color: '#475569' },
    dividerContainer: { height: 1, borderTopWidth: 2, borderTopColor: '#d6d6d6', borderStyle: 'dashed', marginTop: 12, marginBottom: 16 },
    detailsSection: { backgroundColor: 'white', paddingBottom: 24, marginBottom: 20 }
  };

  const statusText = data?.status || "Desconhecido";
  const statusColor = resolveStatusColor(statusText, config?.card_layout?.status_tags);
  const displayTime = formatDateExtended(get(data, "schedule.start_time") || data?.schedule_start_time) || "quarta-feira, 13 de maio às 14:30";
  const displayId = data?.ref || "";
  const { header, sub_header } = config?.card_layout || {};
  const modalLayout = config?.modal_layout || [];

  const headerValue = header?.field ? get(data, header.field) : null;
  const subHeaderValue = sub_header?.field ? get(data, sub_header.field) : null;

  return (
    <>
      <style>{`
      .discreet-scroll::-webkit-scrollbar { width: 4px; }
      .discreet-scroll::-webkit-scrollbar-track { background: transparent; }
      .discreet-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    `}</style>
      <div style={styles.container}>
        {/* --- Modal Handle Area --- */}
        <div style={styles.handleArea}>
          <div style={styles.handleContainer}>
            <div style={styles.handle} />
          </div>
          <div style={styles.displayTime}>
            {displayTime}
          </div>
        </div>

        {/* --- Scrollable Content View --- */}
        <div className="discreet-scroll" style={styles.scrollView}>
          <div style={styles.content}>
            {/* --- Modal Header (Status and ID) --- */}
            <div style={styles.header}>
              <div style={{ ...styles.statusBadge, backgroundColor: statusColor + '20' }}>
                <span style={{ ...styles.statusText, color: statusColor }}>{statusText}</span>
              </div>
              <span style={styles.idText}>#{displayId}</span>
            </div>

            {/* --- Trip Route Tracker (Custom Visual element) --- */}
            {(() => {
              const origin = get(data, "origin_city") || "Macae - RJ";
              const destination = get(data, "destination_city") || "Santos - SP";
              return (
                <div style={{
                  width: "100%",
                  marginTop: 16,
                  marginBottom: 16,
                  boxSizing: "border-box",
                  fontFamily: "sans-serif"
                }}>
                  <div style={{
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: "700",
                    color: "#9778ff",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px"
                  }}>
                    Rota de Viagem
                  </div>
                  <div style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}>
                    <div style={{ flex: 3 }}>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", marginBottom: 2 }}>De</div>
                      <div style={{ fontSize: 13, fontWeight: "700", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{origin}</div>
                    </div>
                    <div style={{ flex: 4, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", padding: "0 8px" }}>
                      <div style={{ flex: 1, borderTop: "2px dashed #cbd5e1", height: 0 }} />
                      <span style={{ margin: "0 8px", fontSize: 16 }}>\U0001F69A</span>
                      <div style={{ flex: 1, borderTop: "2px dashed #cbd5e1", height: 0 }} />
                    </div>
                    <div style={{ flex: 3, textAlign: "right" }}>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", marginBottom: 2 }}>Para</div>
                      <div style={{ fontSize: 13, fontWeight: "700", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{destination}</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* --- Hero Section (Title & Subtitle) --- */}
            {config?.card_layout && (headerValue || subHeaderValue) && (
              <div style={styles.heroSection}>
                {headerValue && (
                  <div style={styles.headerGroup}>
                    {header.label && <div style={styles.heroLabel}>{header.label}</div>}
                    <div style={styles.h1Default}>{headerValue}</div>
                  </div>
                )}
                {subHeaderValue && (
                  <div style={styles.subHeaderGroup}>
                    {sub_header.label && <div style={styles.heroLabel}>{sub_header.label}</div>}
                    <div style={styles.h2Default}>{subHeaderValue}</div>
                  </div>
                )}
              </div>
            )}

            {config?.card_layout && <div style={styles.dividerContainer} />}

            {/* --- Details Section (Dynamic Layout Elements) --- */}
            <div style={styles.detailsSection}>
              {modalLayout.map((el, i) => {
                if (el.element === "section") return <ModalSectionElement key={i} title={el.title} fields={el.fields} data={data} />;
                if (el.element === "field") return <ModalFieldElement key={i} label={el.label} field={el.field} data={data} />;
                if (el.element === "alert") return <ModalAlertElement key={i} color={el.color} icon={el.icon} title={el.title} field={el.field} useField={el.useField} message={el.message} data={data} />;
                if (el.element === "qrcode") return <ModalQRCodeElement key={i} title={el.title} caption={el.caption} field={el.field} data={data} />;
                return null;
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}