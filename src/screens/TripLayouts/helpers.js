import { STATUS_COLORS, ALERT_COLORS } from "./constants";

export function getStatusColor(status = "") {
  const key = status.toLowerCase();
  return STATUS_COLORS[key] || "#6B7280";
}

export function resolveStatusColor(status = "", statusTags = []) {
  if (statusTags && statusTags.length > 0) {
    const matchedTag = statusTags.find(t => t.value && t.value.toLowerCase() === status.toLowerCase());
    if (matchedTag && ALERT_COLORS[matchedTag.color]) {
      return ALERT_COLORS[matchedTag.color].text;
    }
  }
  return getStatusColor(status);
}

export function get(obj, path) {
  if (!obj || !path) return null;
  let val = path.split(".").reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : null), obj);
  if (val === null && obj.custom_data) {
    val = path.split(".").reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : null), obj.custom_data);
  }
  return val;
}

export function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month} ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}

export function formatDateExtended(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate();
    const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);
    const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(date);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${weekday}, ${day} de ${month} às ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}

let _id = 0;
export const uid = () => `el_${++_id}_${Math.random().toString(36).slice(2, 6)}`;

export function defaultState() {
  return {
    card_layout: {
      header: { label: "Resumo", field: "summary" },
      sub_header: { label: "Viagem", field: "ref" },
      status_tags: [
        { id: uid(), value: "PLANNED", color: "blue", isNew: true },
        { id: uid(), value: "IN_PROGRESS", color: "yellow", isNew: true },
        { id: uid(), value: "COMPLETED", color: "green", isNew: true }
      ],
      body_rows: [
        { id: uid(), label: "Placa", field: "vehicle_plate" },
        { id: uid(), label: "Origem", field: "origin_city" },
        { id: uid(), label: "Destino", field: "destination_city" },
      ],
    },
    modal_layout: [
      {
        id: uid(),
        element: "section",
        title: "Detalhes da Viagem",
        fields: [
          { id: uid(), label: "Resumo", field: "summary" },
          { id: uid(), label: "Placa", field: "vehicle_plate" },
          { id: uid(), label: "Origem", field: "origin_city" },
          { id: uid(), label: "Destino", field: "destination_city" }
        ]
      },
      {
        id: uid(),
        element: "section",
        title: "Carga e Cliente",
        fields: [
          { id: uid(), label: "Tipo de Carga", field: "cargo_type" },
          { id: uid(), label: "Peso da Carga", field: "cargo_weight" },
          { id: uid(), label: "Cliente", field: "customer_name" }
        ]
      },
      { id: uid(), element: "alert", title: "Instruções Especiais", field: "carrier_notes", color: "yellow", icon: "warning" },
    ],
  };
}
