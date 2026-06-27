export function get(obj, path) {
  if (!obj || !path) return null;
  return path.split(".").reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : null), obj);
}

export function formatDate(dateString, showYear = false) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const options = {
      day: "2-digit",
      month: "long",
      hour: "2-digit",
      minute: "2-digit"
    };

    if (showYear) {
      options.year = "numeric";
    } else {
      options.weekday = "long";
    }

    return new Intl.DateTimeFormat("pt-BR", options).format(date);
  } catch {
    return dateString;
  }
}

export const capitalizeFirst = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const capitalizeWords = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/\b\w/g, l => l.toUpperCase());
};

let _id = 0;
export const uid = () => `ticket_el_${++_id}_${Math.random().toString(36).slice(2, 6)}`;

export function defaultState() {
  return [
    {
      id: uid(),
      element: "tag_container",
      label: "Controles do Terminal",
      tags: [
        { id: uid(), label: "Vistoriado", color: "green", icon: "check-circle-outline" },
        { id: uid(), label: "Balança Opcional", color: "blue", icon: "scale" }
      ]
    },
    {
      id: uid(),
      element: "highlight_grid",
      label: "Detalhes Logísticos",
      items: [
        { id: uid(), label: "Área/Pátio", useField: true, field: "area_coleta", color: "green", caption: "Local de operação" }
      ]
    },
    {
      id: uid(),
      element: "attention",
      title: "Vistoria Obrigatória",
      useField: true,
      field: "condicao_container",
      color: "orange",
      icon: "alert-circle-outline"
    },
    {
      id: uid(),
      element: "section",
      title: "Operação"
    },
    {
      id: uid(),
      element: "field",
      label: "Motorista",
      field: "motorista"
    },
    {
      id: uid(),
      element: "field",
      label: "Placa",
      field: "placa"
    },
    {
      id: uid(),
      element: "field",
      label: "Transportadora",
      field: "transportadora"
    },
    {
      id: uid(),
      element: "instruction",
      title: "INSTRUÇÕES DE ACESSO",
      steps: [
        "Apresente a ordem de coleta impressa na guarita.",
        "Aguarde a vistoria do container pelo inspetor."
      ]
    }
  ];
}
