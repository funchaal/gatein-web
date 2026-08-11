import {
  Calendar, Share2, Info, AlertTriangle, AlertCircle,
  CheckCircle2, Check, ClipboardCheck, Scale, Warehouse, Building2, Package, Search
} from "lucide-react";
import { get, formatDate, capitalizeFirst } from "../helpers";
import { ATTENTION_COLORS, HIGHLIGHT_COLORS, TAG_COLORS } from "../constants";

// Icon mapper to translate Material icons to Lucide icons
function TicketIcon({ name, className, size = 16, style }) {
  const map = {
    "alert-circle-outline": AlertCircle,
    "check-bold": CheckCircle2,
    "check-circle-outline": CheckCircle2,
    "information-outline": Info,
    "clipboard-check-outline": ClipboardCheck,
    "scale": Scale,
    "warehouse": Warehouse,
    "office-building": Building2,
    "package-variant": Package,
    "magnify": Search,
  };
  const IconComp = map[name] || Info;
  return <IconComp className={className} size={size} style={style} />;
}

export default function TicketPreview({ data, config }) {
  const displayId = data?.ref || "—";
  const displayTime = data?.window_start || data?.created_at
    ? formatDate(data?.window_start || data?.created_at, true)
    : "25 de junho de 2026 16:30";

  const displayCreatedAt = data?.created_at
    ? formatDate(data.created_at, true)
    : "25 de junho de 2026 14:30";
  const layout = config || [];

  return (
    <div className="bg-white text-slate-800 rounded-[36px] overflow-hidden flex flex-col h-full select-none"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      <style>{`
        /* Hide scrollbars */
        .ticket-scroll {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none;  /* IE and Edge */
        }
        .ticket-scroll::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }

        /* Divider styling */
        .divider-wrapper {
          margin-top: 18px;
          margin-bottom: 18px;
          width: 100%;
        }
        .divider-labeled {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 8px;
          width: 100%;
        }
        .divider-line {
          height: 1px;
          background-color: #E2E8F0;
          flex: 1;
        }
        .divider-label {
          font-size: 12px;
          font-weight: 700;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          white-space: nowrap;
        }

        /* Field styling */
        .field-row {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
          padding-top: 6px;
          padding-bottom: 6px;
          margin-top: 0;
          margin-bottom: 0;
          width: 100%;
        }
        .field-label {
          font-size: 16px;
          color: #94A3B8;
          font-weight: 500;
          margin-bottom: 2px;
          text-transform: capitalize;
          flex: 1;
          max-width: 50%;
          word-break: break-word;
        }
        .field-value {
          font-size: 16px;
          font-weight: 600;
          color: #334155;
          flex: 1;
          max-width: 50%;
          text-align: right;
          word-break: break-word;
        }

        /* Section styling */
        .section-wrapper {
          margin-top: 28px;
          margin-bottom: 8px;
          width: 100%;
        }
        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        /* Tag styling */
        .tag-container {
          margin-top: 24px;
          margin-bottom: 12px;
          width: 100%;
        }
        .tag-container-label {
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
        }
        .tag-row {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 8px;
          width: 100%;
        }
        .tag {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding-left: 12px;
          padding-right: 12px;
          padding-top: 6px;
          padding-bottom: 6px;
          border-radius: 8px;
          max-width: 100%;
        }
        .tag-text {
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 1;
          text-transform: uppercase;
        }

        /* Attention box styling */
        .attention-box {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          border-radius: 12px;
          border-width: 1px;
          border-style: solid;
          padding: 14px;
          margin-top: 24px;
          margin-bottom: 12px;
          width: 100%;
        }
        .attention-title {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 3px;
          text-transform: capitalize;
        }
        .attention-text {
          font-size: 14px;
          font-weight: 500;
          line-height: 18px;
        }

        /* Instruction styling */
        .instruction-wrapper {
          margin-top: 24px;
          margin-bottom: 12px;
          width: 100%;
        }
        .instruction-title {
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 12px;
          margin-bottom: 20px;
        }
        .instruction-step {
          display: flex;
          flex-direction: row;
          align-items: center;
          margin-bottom: 12px;
          width: 100%;
        }
        .instruction-bullet-icon {
          width: 28px;
          height: 28px;
          border-radius: 14px;
          background-color: #F9731620;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          flex-shrink: 0;
        }
        .instruction-step-text {
          flex: 1;
          font-size: 14px;
          color: #334155;
          line-height: 20px;
          font-weight: 500;
        }

        /* Text Element styling */
        .free-text {
          color: #475569;
          line-height: 20px;
          margin-top: 12px;
          margin-bottom: 12px;
          width: 100%;
        }

        /* Highlight Box styling */
        .highlight-box {
          border-radius: 14px;
          border-width: 1.5px;
          border-style: solid;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex: 1;
          min-width: 0;
          margin: 0;
        }
        .highlight-label {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 6px;
          opacity: 0.7;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .highlight-value {
          font-size: 32px;
          font-weight: 900;
          letter-spacing: -0.5px;
          line-height: 1.1;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .highlight-caption {
          font-size: 13px;
          font-weight: 500;
          margin-top: 4px;
          opacity: 0.7;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Highlight Grid styling */
        .grid-wrapper {
          margin-top: 24px;
          margin-bottom: 12px;
          width: 100%;
        }
        .grid {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 8px;
          width: 100%;
        }
      `}</style>

      {/* Ticket Body Content */}
      <div className="flex-1 overflow-y-auto ticket-scroll bg-white"
        style={{
          paddingBottom: "16px",
          paddingLeft: "24px",
          paddingRight: "24px",
          paddingTop: "60px",
        }}
      >
        {/* pageHeader */}
        <div style={{ paddingBottom: "8px", paddingTop: "8px", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <span style={{ fontSize: "17px", fontWeight: "700", color: "#475569" }}>Ticket de Acesso</span>
        </div>

        {/* Top Info Container */}
        <div style={{ paddingTop: "16px", paddingBottom: "8px", backgroundColor: "#ffffff" }}>

          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "13px", color: "#94A3B8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Agendamento
            </span>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "#64748B" }}>
              #{displayId}
            </span>
          </div>
        </div>

        {/* Hero Section / renderCardHeader */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", paddingVertical: "20px", paddingTop: "8px", backgroundColor: "#ffffff", gap: "10px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignSelf: "stretch", gap: "0" }}>
            <span style={{ fontSize: "16px", color: "#94A3B8", width: "110px", fontWeight: "500" }}>Header</span>
            <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0F172A", lineHeight: "1.25" }}>[Herdado do agendamento]</h1>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignSelf: "stretch", gap: "0" }}>
            <span style={{ fontSize: "16px", color: "#94A3B8", width: "110px", fontWeight: "500" }}>Sub-header</span>
            <h2 style={{ fontSize: "20px", fontWeight: "500", color: "#475569", lineHeight: "1.25" }}>[Herdado do agendamento]</h2>
          </div>
        </div>

        {/* Time Container */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: "15px", marginTop: "16px", borderRadius: "12px" }}>
          <Calendar className="w-[18px] h-[18px] text-[#475569] shrink-0" />
          <span style={{ fontSize: "16px", fontWeight: "600", color: "#475569", marginLeft: "6px" }}>{displayTime}</span>
        </div>

        {/* Top Perforation Line */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginVertical: "12px" }}>
          <div style={{ flex: 1, height: "1px", borderTopWidth: "2px", borderTopColor: "#d6d6d6", borderStyle: "dashed" }} />
        </div>

        {/* Dynamic elements */}
        <div style={{ paddingVertical: "8px", backgroundColor: "#ffffff" }}>
          {layout.map((el, i) => {
            // Render Divider
            if (el.element === "divider") {
              if (el.label) {
                return (
                  <div key={i} className="divider-wrapper">
                    <div className="divider-labeled">
                      <div className="divider-line" />
                      <span className="divider-label">{el.label}</span>
                      <div className="divider-line" />
                    </div>
                  </div>
                );
              }
              return (
                <div key={i} className="divider-wrapper">
                  <div className="divider-line" />
                </div>
              );
            }

            // Render Section
            if (el.element === "section") {
              const fieldsToRender = (el.fields || []).map((f, fIdx) => {
                if (!f.field || !f.field.trim()) return null;
                const val = get(data, f.field) || data?.[f.field] || `[${f.field}]`;
                return (
                  <div key={`sec-field-${fIdx}`} className="field-row">
                    <span className="field-label">{f.label || f.field}</span>
                    <span className="field-value">{val}</span>
                  </div>
                );
              }).filter(Boolean);

              if (fieldsToRender.length === 0 && !el.title) return null;

              return (
                <div key={i} className="section-wrapper">
                  {el.title && <div className="section-title">{el.title}</div>}
                  {fieldsToRender}
                </div>
              );
            }

            // Render Field
            if (el.element === "field") {
              if (!el.field || !el.field.trim()) return null;
              const val = get(data, el.field) || data?.[el.field] || `[${el.field}]`;
              return (
                <div key={i} className="field-row">
                  <span className="field-label">{el.label || el.field}</span>
                  <span className="field-value">{val}</span>
                </div>
              );
            }

            // Render Text
            if (el.element === "text") {
              let val = null;
              if (el.useField) {
                if (!el.field || !el.field.trim()) return null;
                val = get(data, el.field) || data?.[el.field] || `[${el.field}]`;
              } else {
                val = el.text;
                if (!val || !val.trim()) return null;
              }

              const fontSize = el.size === "sm" ? 13 : el.size === "md" ? 15 : el.size === "lg" ? 18 : 14;
              const fontWeight = el.weight === "bold" ? "700" : el.weight === "medium" ? "500" : "400";

              return (
                <div key={i} className="free-text" style={{
                  fontSize: `${fontSize}px`,
                  fontWeight: fontWeight,
                  textAlign: el.align || "left",
                  color: el.color || "#475569"
                }}>
                  {val}
                </div>
              );
            }

            // Render Attention Box
            if (el.element === "attention") {
              let val = null;
              if (el.useField !== false && (el.useField || el.field)) {
                if (!el.field || !el.field.trim()) return null;
                val = get(data, el.field) || data?.[el.field] || `[${el.field}]`;
              } else {
                val = el.message;
                if (!val || !val.trim()) return null;
              }

              const colorKey = el.color || "orange";
              const colorscheme = ATTENTION_COLORS[colorKey] || ATTENTION_COLORS.orange;

              return (
                <div key={i} className="attention-box" style={{
                  backgroundColor: colorscheme.bg,
                  borderColor: colorscheme.bg
                }}>
                  <TicketIcon name={el.icon || "alert-circle-outline"} size={20} style={{ color: colorscheme.iconColor, marginTop: "1px" }} className="shrink-0" />
                  <div style={{ flex: 1, marginLeft: "10px" }}>
                    {el.title && <div className="attention-title" style={{ color: colorscheme.text }}>{el.title}</div>}
                    <div className="attention-text" style={{ color: colorscheme.text }}>{val}</div>
                  </div>
                </div>
              );
            }

            // Render Instruction List
            if (el.element === "instruction") {
              const steps = (el.steps || []).filter(step => step && step.trim());
              if (steps.length === 0) return null;
              return (
                <div key={i} className="instruction-wrapper">
                  {el.title && <div className="instruction-title">{el.title}</div>}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {steps.map((step, stepIdx) => (
                      <div key={stepIdx} className="instruction-step">
                        <div className="instruction-bullet-icon">
                          <Check size={18} color="#F97316" />
                        </div>
                        <div className="instruction-step-text">
                          {capitalizeFirst(step)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // Render Tag Container
            if (el.element === "tag_container") {
              const tagsToRender = (el.tags || []).map((tag, tagIdx) => {
                let tagText = tag.label;
                if (!tagText || !tagText.trim()) {
                  if (tag.field && tag.field.trim()) {
                    tagText = get(data, tag.field) || data?.[tag.field] || `[${tag.field}]`;
                  } else {
                    return null;
                  }
                }
                const col = TAG_COLORS[tag.color] || TAG_COLORS.gray;
                return (
                  <span key={tagIdx} className="tag" style={{ backgroundColor: col.bg }}>
                    {tag.icon && <TicketIcon name={tag.icon} size={15} style={{ color: col.text, marginRight: "4px" }} className="shrink-0" />}
                    <span className="tag-text" style={{ color: col.text }}>
                      {tagText.toUpperCase()}
                    </span>
                  </span>
                );
              }).filter(Boolean);

              if (tagsToRender.length === 0) return null;

              return (
                <div key={i} className="tag-container">
                  {el.label && <div className="tag-container-label">{el.label}</div>}
                  <div className="tag-row">
                    {tagsToRender}
                  </div>
                </div>
              );
            }

            // Render Highlight Grid
            if (el.element === "highlight_grid") {
              const itemsToRender = (el.items || []).map((item, itemIdx) => {
                let val = null;
                if (item.useField) {
                  if (!item.field || !item.field.trim()) return null;
                  val = get(data, item.field) || data?.[item.field] || `[${item.field}]`;
                } else {
                  val = item.value;
                  if (!val || !val.trim()) return null;
                }
                const col = HIGHLIGHT_COLORS[item.color] || HIGHLIGHT_COLORS.slate;
                return (
                  <div key={itemIdx} className="highlight-box" style={{ backgroundColor: col.bg, borderColor: col.bg }}>
                    {item.label && <span className="highlight-label" style={{ color: col.text }}>{item.label}</span>}
                    <span className="highlight-value" style={{ color: col.text }}>{val}</span>
                    {item.caption && <span className="highlight-caption" style={{ color: col.text }}>{item.caption}</span>}
                  </div>
                );
              }).filter(Boolean);

              if (itemsToRender.length === 0) return null;

              return (
                <div key={i} className="grid-wrapper">
                  {el.label && <div className="section-title" style={{ marginBottom: "12px" }}>{el.label}</div>}
                  <div className="grid">
                    {itemsToRender}
                  </div>
                </div>
              );
            }

            return null;
          })}

          {data?.created_at && (
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center", marginTop: "16px", paddingBottom: "8px" }}>
              <Info size={12} color="#94A3B8" />
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#94A3B8", marginLeft: "4px" }}>
                ticket gerado em {displayCreatedAt}
              </span>
            </div>
          )}
        </div>

      </div>

      {/* Share Button container fixed at bottom (mimics MainAsyncButton) */}
      <div className="px-6 pb-6 pt-3 bg-white border-t border-slate-100 shrink-0">
        <button
          className="w-full h-[56px] bg-[#F97316] text-white rounded-[12px] text-[16px] font-bold flex items-center justify-center transition-colors cursor-pointer hover:bg-[#EA580C]"
          onClick={() => alert(`Mock Share: agendamento #${displayId}`)}
        >
          <span>Compartilhar</span>
        </button>
      </div>
    </div>
  );
}
