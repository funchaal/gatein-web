import {
  Grid3X3, Split, Menu, Type, AlertTriangle, ListOrdered, Tag, AlignLeft
} from "lucide-react";

export const ATTENTION_COLORS = {
  orange: { bg: "#FFEDD5", border: "#FB923C", text: "#9A3412", iconColor: "#EA580C" },
  red: { bg: "#FEE2E2", border: "#F87171", text: "#991B1B", iconColor: "#DC2626" },
  yellow: { bg: "#FEF3C7", border: "#FACC15", text: "#854D0E", iconColor: "#CA8A04" },
  blue: { bg: "#DBEAFE", border: "#60A5FA", text: "#1D4ED8", iconColor: "#2563EB" },
  gray: { bg: "#F3F4F6", border: "#D1D5DB", text: "#374151", iconColor: "#6B7280" },
};

export const HIGHLIGHT_COLORS = {
  blue: { bg: "#BFDBFE", border: "#93C5FD", text: "#1D4ED8" },
  green: { bg: "#A7F3D0", border: "#6EE7B7", text: "#15803D" },
  amber: { bg: "#FDE68A", border: "#FCD34D", text: "#B45309" },
  slate: { bg: "#E2E8F0", border: "#CBD5E1", text: "#334155" },
};

export const TAG_COLORS = {
  purple: { bg: "#7C3AED20", text: "#7C3AED" },
  blue: { bg: "#3B82F620", text: "#3B82F6" },
  green: { bg: "#10B98120", text: "#10B981" },
  yellow: { bg: "#EAB30820", text: "#EAB308" },
  red: { bg: "#EF444420", text: "#EF4444" },
  gray: { bg: "#64748B20", text: "#64748B" },
};

export const COLOR_OPTIONS = ["purple", "blue", "green", "yellow", "red", "gray"];
export const ATTENTION_COLOR_OPTIONS = ["orange", "red", "yellow", "blue", "gray"];
export const HIGHLIGHT_COLOR_OPTIONS = ["blue", "green", "amber", "slate"];

export const ICON_OPTIONS = [
  "alert-circle-outline", "check-bold", "check-circle-outline", "information-outline",
  "clipboard-check-outline", "scale", "warehouse", "office-building", "package-variant", "magnify"
];

export const ELEMENT_META = {
  highlight_grid: { label: "Grid Destaques", color: "#8B5CF6", bg: "#EDE9FE", darkColor: "#C084FC", darkBg: "#8B5CF620", Icon: Grid3X3 },
  divider: { label: "Divisor", color: "#6B7280", bg: "#F3F4F6", darkColor: "#9CA3AF", darkBg: "#6B728020", Icon: Split },
  section: { label: "Seção", color: "#2563EB", bg: "#DBEAFE", darkColor: "#60A5FA", darkBg: "#2563EB20", Icon: Menu },
  field: { label: "Campo", color: "#059669", bg: "#D1FAE5", darkColor: "#34D399", darkBg: "#05966920", Icon: Type },
  attention: { label: "Aviso / Alerta", color: "#D97706", bg: "#FEF3C7", darkColor: "#FBBF24", darkBg: "#D9770620", Icon: AlertTriangle },
  instruction: { label: "Instruções", color: "#EC4899", bg: "#FCE7F3", darkColor: "#F472B6", darkBg: "#EC489920", Icon: ListOrdered },
  tag_container: { label: "Tags", color: "#14B8A6", bg: "#CCFBF1", darkColor: "#2DD4BF", darkBg: "#14B8A620", Icon: Tag }
};

export const DEFAULT_EXAMPLE = {
  ref: "AG-2026-003",
  status: "CHECKED_IN",
  created_at: "2026-06-25T14:30:00Z",
  schedule_start_time: "2026-06-25T16:30:00Z",
  motorista: "Carlos de Oliveira Souza",
  placa: "ABC-1234",
  placa_carreta: "XYZ-9876",
  transportadora: "Logística TransBrasil S/A",
  tipo_operacao: "CARREGAMENTO_SOJA",
  armador: "Maersk Line",
  booking: "BKG-99281726",
  previsao_navio: "2026-06-28T07:00:00Z",
  condicao_container: "Lacre intacto. Sem avarias estruturais observadas.",
  area_coleta: "Quadra C",
  gate_pass_token: "PASS-9021-SOJA",
};
