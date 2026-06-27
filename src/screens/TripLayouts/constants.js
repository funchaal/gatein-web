import { Menu, Type, AlertTriangle, QrCode } from "lucide-react";

export const ALERT_COLORS = {
  purple: { bg: "#F3E8FF", border: "#F3E8FF", text: "#7C3AED", icon: "#7C3AED" },
  blue: { bg: "#DBEAFE", border: "#DBEAFE", text: "#1D4ED8", icon: "#2563EB" },
  green: { bg: "#D1FAE5", border: "#D1FAE5", text: "#059669", icon: "#10B981" },
  yellow: { bg: "#FEF3C7", border: "#FEF3C7", text: "#854D0E", icon: "#CA8A04" },
  red: { bg: "#FEE2E2", border: "#FEE2E2", text: "#991B1B", icon: "#DC2626" },
  gray: { bg: "#F3F4F6", border: "#F3F4F6", text: "#374151", icon: "#6B7280" },
};

export const ICON_OPTIONS = [
  "alert-circle", "check-bold", "check-circle", "information",
  "information-circle", "hand-right", "warning",
];

export const COLOR_OPTIONS = ["purple", "blue", "green", "yellow", "red", "gray"];

export const STATUS_COLORS = {
  planned: "#3B82F6",
  in_progress: "#F59E0B",
  completed: "#10B981",
  cancelled: "#EF4444",
};

export const ELEMENT_META = {
  section: { label: "Seção", color: "#8B5CF6", bg: "#EDE9FE", darkColor: "#A78BFA", darkBg: "#8B5CF620", Icon: Menu },
  field: { label: "Campo", color: "#2563EB", bg: "#DBEAFE", darkColor: "#60A5FA", darkBg: "#2563EB20", Icon: Type },
  alert: { label: "Alerta", color: "#D97706", bg: "#FEF3C7", darkColor: "#FBBF24", darkBg: "#D9770620", Icon: AlertTriangle },
  qrcode: { label: "QR Code", color: "#059669", bg: "#D1FAE5", darkColor: "#34D399", darkBg: "#05966920", Icon: QrCode },
};

export const DEFAULT_EXAMPLE = {
  trucking_company_id: "123e4567-e89b-12d3-a456-426614174000",
  ref: "VIAGEM-9001",
  layout_ref: "standard_trip",
  vehicle_plate: "ABC1D23",
  status: "PLANNED",
  summary: "Transporte de Carga de Soja",
  schedule_start_time: "2026-06-27T08:00:00Z",
  schedule_end_time: "2026-06-27T16:00:00Z",
  schedule_start_tolerance_min: 30,
  schedule_end_tolerance_min: 60,
  custom_data: {
    origin_city: "Macaé - RJ",
    destination_city: "Santos - SP",
    cargo_type: "Sacos de Soja",
    cargo_weight: "28.5 tons",
    customer_name: "AgroBrasil Ltda",
    carrier_notes: "Entregar na doca norte."
  }
};
