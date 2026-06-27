import { ALERT_COLORS } from "../constants";
import { get } from "../helpers";
import { IconSvg } from "./SharedComponents";

const THEME = {
  slate900: '#0F172A',
  slate600: '#475569',
  slate400: '#94A3B8',
  white: '#FFFFFF'
};

export function ModalSectionElement({ title, fields, data }) {
  const styles = {
    container: { marginTop: 28, marginBottom: 8 },
    title: { fontSize: 14, fontWeight: 700, color: THEME.slate900, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        {title || "Seção"}
      </div>
      {(fields || []).map((f, i) => (
        <ModalFieldElement key={i} label={f.label} field={f.field} data={data} />
      ))}
    </div>
  );
}

export function ModalFieldElement({ label, field, data }) {
  const styles = {
    container: { paddingTop: 6, paddingBottom: 6, marginTop: 0, marginBottom: 0, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    label: { fontSize: 16, color: THEME.slate400, fontWeight: 500, marginBottom: 2, textTransform: "capitalize" },
    value: { fontSize: 16, color: '#334155', fontWeight: 600 }
  };

  const value = field ? get(data, field) : null;
  if (!value) return (
    <div style={styles.container}>
      <span style={styles.label}>{label}</span>
      <span style={{...styles.value, opacity: 0.5, fontSize: 14}}>[{field || 'vazio'}]</span>
    </div>
  );
  
  return (
    <div style={styles.container}>
      <span style={styles.label}>{label}</span>
      <span style={styles.value}>{value}</span>
    </div>
  );
}

export function ModalAlertElement({ color, icon, title, field, useField, message, data }) {
  const styles = {
    container: { borderRadius: 12, borderWidth: 1, borderStyle: 'solid', padding: 14, marginTop: 12, marginBottom: 12 },
    content: { display: 'flex', flexDirection: 'row', alignItems: 'flex-start' },
    iconContainer: { marginRight: 10, marginTop: 1, display: 'flex', flexShrink: 0 },
    textContainer: { flex: 1 },
    title: { fontSize: 14, fontWeight: 700, marginBottom: 3, textTransform: "capitalize" }
  };

  const value = (useField === false && message) ? message : (field ? get(data, field) : null);
  const colorScheme = ALERT_COLORS[color] || ALERT_COLORS.gray;
  
  if (!value) {
    return (
      <div style={{ ...styles.container, backgroundColor: colorScheme.bg, borderColor: colorScheme.bg, opacity: 0.7 }}>
        <div style={styles.content}>
          {icon && (
            <div style={styles.iconContainer}>
               <IconSvg name={icon || "information"} size={20} color={colorScheme.icon || colorScheme.text} />
            </div>
          )}
          <div style={styles.textContainer}>
            {title && <div style={{ ...styles.title, color: colorScheme.text }}>{title}</div>}
            <div style={{
              fontSize: 14,
              fontWeight: 500,
              lineHeight: "18px",
              color: colorScheme.text
            }}>[Alerta sem valor: {field || 'campo vazio'}]</div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ ...styles.container, backgroundColor: colorScheme.bg, borderColor: colorScheme.bg }}>
      <div style={styles.content}>
        {icon && (
          <div style={styles.iconContainer}>
             <IconSvg name={icon || "information"} size={20} color={colorScheme.icon || colorScheme.text} />
          </div>
        )}
        <div style={styles.textContainer}>
          {title && <div style={{ ...styles.title, color: colorScheme.text }}>{title}</div>}
          <div style={{
            fontSize: 14,
            fontWeight: 500,
            lineHeight: "18px",
            color: colorScheme.text
          }}>{value}</div>
        </div>
      </div>
    </div>
  );
}

export function ModalQRCodeElement({ title, caption, field, data }) {
  const styles = {
    empty: { textAlign: "center", marginTop: 30, color: THEME.slate400, fontSize: 15 },
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 30, paddingTop: 12, paddingBottom: 12 },
    title: { fontSize: 15, fontWeight: 700, color: THEME.slate900, marginTop: 16, marginBottom: 16, textTransform: "uppercase" },
    wrapper: { padding: 20, backgroundColor: THEME.white, borderRadius: 16, border: '1px solid #E2E8F0' },
    caption: { fontSize: 13, color: THEME.slate600, marginTop: 12, textAlign: 'center', fontWeight: 500 }
  };

  const value = field ? get(data, field) : null;
  if (!value) return <div style={styles.empty}>QR: campo vazio</div>;
  
  return (
    <div style={styles.container}>
      {title && <div style={styles.title}>{title}</div>}
      <div style={styles.wrapper}>
        <svg width={160} height={160} viewBox="0 0 10 10">
          {[0,1,2,3,4,5,6,7,8,9].map(r =>
            [0,1,2,3,4,5,6,7,8,9].map(c => {
              const isFixed = (r < 3 && c < 3) || (r < 3 && c > 6) || (r > 6 && c < 3);
              const isBorder = isFixed && (r === 0 || c === 0 || r === 2 || c === 2);
              const isCore = isFixed && r === 1 && c === 1;
              const isCoreBR = (r > 6 && c < 3) && r === 8 && c === 1;
              const isCoreTR = (r < 3 && c > 6) && r === 1 && c === 8;
              const rand = ((r * 17 + c * 13 + value.charCodeAt(Math.min(r*c, value.length-1))) % 3) === 0;
              const fill = isBorder || isCore || isCoreBR || isCoreTR ? THEME.slate900 : (!isFixed && rand ? THEME.slate900 : THEME.white);
              return <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill={fill} />;
            })
          )}
        </svg>
      </div>
      {caption && <div style={styles.caption}>{caption}</div>}
    </div>
  );
}