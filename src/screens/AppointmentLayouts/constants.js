import { Menu, Type, AlertTriangle, QrCode } from "lucide-react";

export const ALERT_COLORS = {
  purple: { bg: "#F3E8FF", border: "#A855F7", text: "#7C3AED" },
  blue: { bg: "#DBEAFE", border: "#3B82F6", text: "#2563EB" },
  green: { bg: "#D1FAE5", border: "#10B981", text: "#059669" },
  yellow: { bg: "#FEF3C7", border: "#F59E0B", text: "#D97706" },
  red: { bg: "#FEE2E2", border: "#EF4444", text: "#DC2626" },
  gray: { bg: "#F3F4F6", border: "#9CA3AF", text: "#6B7280" },
};

export const ICON_OPTIONS = [
  "alert-circle", "check-bold", "check-circle", "information",
  "information-circle", "hand-right", "warning",
];

export const COLOR_OPTIONS = ["purple", "blue", "green", "yellow", "red", "gray"];

export const STATUS_COLORS = {
  agendado: "#3B82F6",
  confirmado: "#10B981",
  cancelado: "#EF4444",
  "em andamento": "#F59E0B",
  concluído: "#8B5CF6",
  pendente: "#6B7280",
};

export const ELEMENT_META = {
  section: { label: "Seção", color: "#8B5CF6", bg: "#EDE9FE", Icon: Menu },
  field: { label: "Campo", color: "#2563EB", bg: "#DBEAFE", Icon: Type },
  alert: { label: "Alerta", color: "#D97706", bg: "#FEF3C7", Icon: AlertTriangle },
  qrcode: { label: "QR Code", color: "#059669", bg: "#D1FAE5", Icon: QrCode },
};

export const DEFAULT_EXAMPLE = {
  terminal_id: "123e4567-e89b-12d3-a456-426614174000",
  ref: "AGEND-2024-1054",
  layout_ref: "LAYOUT_DESCARGA_GRAOS",
  user_tax_id: "12345678000195",
  operation_type: "DESCARGA",
  status: "SCHEDULED",
  summary: "Descarga de 35 toneladas de soja a granel",
  vehicle_plate: "ABC1D23",
  schedule_start_time: "2024-05-20T14:00:00Z",
  schedule_end_time: "2024-05-20T16:00:00Z",
  schedule_start_tolerance_min: 30,
  schedule_end_tolerance_min: 60,
  custom_data: {
    nome_motorista: "João da Silva",
    cnh_motorista: "12345678900",
    transportadora: "TransLog Logística",
    nota_fiscal: "987654"
  }
};