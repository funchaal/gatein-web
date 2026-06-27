import { useState, useCallback, useMemo } from "react";
import { useGetTicketLayoutsQuery, useUpsertTicketLayoutMutation, useDeleteTicketLayoutMutation, useGetLayoutsQuery } from "../../services/api";
import { Eye, Code, Database } from "lucide-react";
import { colors } from "@/constants/colors";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import LoadingState from "@/components/LoadingState";

// Import layout defaults and helper utilities
import { DEFAULT_EXAMPLE } from "./constants";
import { uid, defaultState, get } from "./helpers";
import { ExampleDataEditor, LayoutJsonEditor } from "../AppointmentLayouts/components/SharedComponents";

// Import modular sub-components
import LayoutList from "./components/LayoutList";
import LayoutEditorHeader from "./components/LayoutEditorHeader";
import TicketLayoutBuilder from "./components/TicketLayoutBuilder";
import LayoutPreviewPanel from "./components/LayoutPreviewPanel";

/**
 * Helper to remove React-specific local IDs and isNew flags before comparison/serialization
 */
const cleanLayoutData = (layoutArr) => {
  return (layoutArr || []).map(el => {
    const copy = { ...el };
    delete copy.id;
    delete copy.isNew;

    if (copy.element === "section" && copy.fields) {
      copy.fields = copy.fields.map(field => {
        const fieldCopy = { ...field };
        delete fieldCopy.id;
        delete fieldCopy.isNew;
        return fieldCopy;
      });
    }

    if (copy.element === "highlight_grid" && copy.items) {
      copy.items = copy.items.map(item => {
        const itemCopy = { ...item };
        delete itemCopy.id;
        delete itemCopy.isNew;
        return itemCopy;
      });
    }

    if (copy.element === "tag_container" && copy.tags) {
      copy.tags = copy.tags.map(tag => {
        const tagCopy = { ...tag };
        delete tagCopy.id;
        delete tagCopy.isNew;
        return tagCopy;
      });
    }

    return copy;
  });
};

function HeaderEditor({ apptCardLayout, onChange }) {
  const handleChange = (section, key, val) => {
    const updated = {
      ...apptCardLayout,
      [section]: {
        ...(apptCardLayout?.[section] || {}),
        [key]: val
      }
    };
    onChange(updated);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
        Cabeçalho do Ticket
      </div>
      <div className="text-[11px] text-gray-500 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded border border-gray-200 dark:border-gray-800 mb-2 leading-relaxed">
        <strong>Nota:</strong> Esta edição é apenas para fins de <strong>preview</strong>. O cabeçalho real do ticket virá automaticamente das informações do agendamento vinculado.
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">Rótulo (Primário)</label>
          <input 
            type="text" 
            className="w-full border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500" 
            value={apptCardLayout?.header?.label || ""} 
            onChange={e => handleChange("header", "label", e.target.value)} 
            placeholder="Ex: Motorista"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">Valor (Preview)</label>
          <input 
            type="text" 
            className="w-full border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500" 
            value={apptCardLayout?.header?.preview_value || ""} 
            onChange={e => handleChange("header", "preview_value", e.target.value)} 
            placeholder="Ex: Carlos Silva"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">Rótulo (Secundário)</label>
          <input 
            type="text" 
            className="w-full border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500" 
            value={apptCardLayout?.sub_header?.label || ""} 
            onChange={e => handleChange("sub_header", "label", e.target.value)} 
            placeholder="Ex: Placa"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">Valor (Preview)</label>
          <input 
            type="text" 
            className="w-full border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500" 
            value={apptCardLayout?.sub_header?.preview_value || ""} 
            onChange={e => handleChange("sub_header", "preview_value", e.target.value)} 
            placeholder="Ex: ABC-1234"
          />
        </div>
      </div>
    </div>
  );
}

export default function TicketLayouts() {
  const [viewMode, setViewMode] = useState("list");
  const [layout, setLayout] = useState([]);
  const [exampleData, setExampleData] = useState(DEFAULT_EXAMPLE);
  const [activeTab, setActiveTab] = useState("builder");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveRef, setSaveRef] = useState("default");
  const [saveTitle, setSaveTitle] = useState("Layout Padrão");
  const [originalState, setOriginalState] = useState(null);
  const [apptCardLayoutCustom, setApptCardLayoutCustom] = useState(null);

  // Deletion modals state handling
  const [deletePrompt, setDeletePrompt] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Sync with backend API via RTK Query
  const { data: layoutsRes, isLoading: loadingLayouts } = useGetTicketLayoutsQuery();
  const { data: apptLayoutsRes } = useGetLayoutsQuery();
  const layouts = layoutsRes || [];
  const [upsertTicketLayout] = useUpsertTicketLayoutMutation();
  const [deleteTicketLayout] = useDeleteTicketLayoutMutation();

  const apptCardLayout = useMemo(() => {
    if (apptCardLayoutCustom) return apptCardLayoutCustom;
    const firstLayout = apptLayoutsRes?.[0]?.layout || apptLayoutsRes?.[0]?.layout_data;
    const cardLayout = firstLayout?.card_layout;
    if (cardLayout && Object.keys(cardLayout).length > 0) {
      return {
        ...cardLayout,
        header: {
          ...cardLayout.header,
          preview_value: get(exampleData, cardLayout.header?.field) || cardLayout.header?.preview_value || "Motorista Exemplo"
        },
        sub_header: {
          ...cardLayout.sub_header,
          preview_value: get(exampleData, cardLayout.sub_header?.field) || cardLayout.sub_header?.preview_value || "ABC-1234"
        }
      };
    }
    return {
      header: { field: "summary", preview_value: get(exampleData, "summary") || "TCLU2346456 20\"" },
      body_rows: [
        { field: "gate_assignment", label: "Gate" }
      ],
      sub_header: { label: "Veículo", field: "vehicle_plate", preview_value: get(exampleData, "vehicle_plate") || "ABC-1234" },
      status_tags: [
        { color: "blue", value: "SCHEDULED" }
      ]
    };
  }, [apptLayoutsRes, apptCardLayoutCustom, exampleData]);

  const isEditing = originalState ? !originalState.isNew : false;

  const cleanLayout = useCallback(() => {
    return {
      elements: cleanLayoutData(layout),
      example_data: exampleData,
      appt_card_layout: apptCardLayoutCustom
    };
  }, [layout, exampleData, apptCardLayoutCustom]);

  // Detect unsaved changes
  const hasChanges = useMemo(() => {
    if (!originalState) return false;
    const currentCleaned = cleanLayout();
    const currentJson = JSON.stringify(currentCleaned);
    return (
      saveTitle !== originalState.title ||
      saveRef !== originalState.ref ||
      currentJson !== originalState.layoutJson
    );
  }, [saveTitle, saveRef, cleanLayout, originalState]);

  // Real-time validation constraints checking
  const validation = useMemo(() => {
    const trimmedTitle = saveTitle.trim();
    const trimmedRef = saveRef.trim();
    const lowerTitle = trimmedTitle.toLowerCase();
    const lowerRef = trimmedRef.toLowerCase();

    // Check for duplicate names/keys
    const titleExists = layouts.some(
      (l) => (l.title || "").toLowerCase() === lowerTitle && l.ref !== originalState?.ref
    );
    const refExists = layouts.some(
      (l) => (l.ref || "").toLowerCase() === lowerRef && l.ref !== originalState?.ref
    );

    const errs = {
      elements: {},
      title: !trimmedTitle,
      ref: !trimmedRef,
      titleExists,
      refExists,
    };

    // Validate layout elements based on specific constraints
    layout.forEach((el) => {
      if (el.element === "section") {
        if (!el.title?.trim()) {
          errs.elements[el.id] = true;
        }
        if (el.fields && el.fields.length > 0) {
          if (el.fields.some(f => !f.label?.trim() || !f.field?.trim())) {
            errs.elements[el.id] = true;
          }
        }
      }
      if (el.element === "field" && (!el.label?.trim() || !el.field?.trim())) {
        errs.elements[el.id] = true;
      }
      if (el.element === "divider") {
        // always valid (label is optional)
      }
      if (el.element === "text") {
        const val = el.useField ? el.field : el.text;
        if (!val?.trim()) errs.elements[el.id] = true;
      }
      if (el.element === "attention") {
        const val = el.useField ? el.field : el.message;
        if (!el.title?.trim() || !val?.trim()) {
          errs.elements[el.id] = true;
        }
      }
      if (el.element === "instruction") {
        const steps = el.steps || [];
        if (!el.title?.trim() || steps.length === 0 || steps.some(s => !s?.trim())) {
          errs.elements[el.id] = true;
        }
      }
      if (el.element === "tag_container") {
        const tags = el.tags || [];
        if (!el.label?.trim() || tags.length === 0 || tags.some(t => !t.label?.trim())) {
          errs.elements[el.id] = true;
        }
      }
      if (el.element === "highlight_grid") {
        const items = el.items || [];
        if (items.length === 0 || items.some(item => {
          const val = item.useField ? item.field : item.value;
          return !item.label?.trim() || !val?.trim();
        })) {
          errs.elements[el.id] = true;
        }
      }
    });

    const hasErrors = errs.title || errs.ref || errs.titleExists || errs.refExists || Object.keys(errs.elements).length > 0;
    return { ...errs, isValid: !hasErrors };
  }, [saveTitle, saveRef, layout, layouts, originalState]);

  // CRUD Actions Handlers
  const handleEdit = (layoutItem) => {
    setSaveRef(layoutItem.ref);
    setSaveTitle(layoutItem.title || layoutItem.ref);
    const layoutDataRaw = layoutItem.layout || layoutItem.layout_data;
    
    // Support backward compatibility if it's just an array of elements
    const layoutElements = Array.isArray(layoutDataRaw) ? layoutDataRaw : (layoutDataRaw?.elements || []);
    const savedExampleData = !Array.isArray(layoutDataRaw) && layoutDataRaw?.example_data ? layoutDataRaw.example_data : DEFAULT_EXAMPLE;
    const savedApptCardLayout = !Array.isArray(layoutDataRaw) && layoutDataRaw?.appt_card_layout ? layoutDataRaw.appt_card_layout : null;

    // Map items to include local react-friendly IDs
    const loadedLayout = (layoutElements || []).map(el => {
      const copy = { ...el, id: el.id || uid() };

      if (copy.element === "section" && copy.fields) {
        copy.fields = copy.fields.map(field => ({ ...field, id: field.id || uid() }));
      }

      if (copy.element === "highlight_grid" && copy.items) {
        copy.items = copy.items.map(item => ({ ...item, id: item.id || uid() }));
      }
      if (copy.element === "tag_container" && copy.tags) {
        copy.tags = copy.tags.map(tag => ({ ...tag, id: tag.id || uid() }));
      }

      return copy;
    });

    setLayout(loadedLayout);
    setExampleData(savedExampleData);
    if (savedApptCardLayout) {
      setApptCardLayoutCustom(savedApptCardLayout);
    } else {
      setApptCardLayoutCustom(null); // Reset so it falls back to first layout
    }
    setOriginalState({
      title: layoutItem.title || layoutItem.ref,
      ref: layoutItem.ref,
      isNew: false,
      layoutJson: JSON.stringify({
        elements: cleanLayoutData(loadedLayout),
        example_data: savedExampleData,
        appt_card_layout: savedApptCardLayout
      })
    });
    setViewMode("editor");
  };

  const handleCreateNew = () => {
    setSaveRef("");
    setSaveTitle("");
    const freshLayout = defaultState();
    setLayout(freshLayout);
    setExampleData(DEFAULT_EXAMPLE);

    const defaultHeader = {
      header: {
        field: "summary",
        preview_value: "TCLU2346456 20\""
      },
      body_rows: [
        {
          field: "gate_assignment",
          label: "Gate"
        }
      ],
      sub_header: {
        field: "vehicle_plate",
        label: "Veículo",
        preview_value: "ABC-1234"
      },
      status_tags: [
        {
          color: "blue",
          value: "SCHEDULED"
        }
      ]
    };
    setApptCardLayoutCustom(defaultHeader);

    setOriginalState({
      title: "",
      ref: "",
      isNew: true,
      layoutJson: JSON.stringify({
        elements: cleanLayoutData(freshLayout),
        example_data: DEFAULT_EXAMPLE,
        appt_card_layout: defaultHeader
      })
    });
    setViewMode("editor");
  };

  const handleBackToList = () => {
    setViewMode("list");
  };

  const confirmDelete = async () => {
    if (!deletePrompt) return;
    if (deleteConfirmText !== deletePrompt) {
      toast.error("O texto não corresponde à referência do layout.");
      return;
    }
    try {
      await deleteTicketLayout(deletePrompt).unwrap();
      toast.success("Layout de ticket excluído com sucesso.");
      setDeletePrompt(null);
      setDeleteConfirmText("");
      if (saveRef === deletePrompt) {
        setSaveRef("new");
        setSaveTitle("Novo Layout");
        setLayout([]);
      }
    } catch (e) {
      toast.error("Erro ao deletar: " + (e?.data?.detail?.message || e.message));
    }
  };

  const handleSave = async () => {
    if (!validation.isValid) {
      toast.error("Existem campos obrigatórios não preenchidos.");
      return;
    }

    const wasNew = !isEditing;
    setSaving(true);

    try {
      const cleaned = cleanLayout();
      await upsertTicketLayout({ ref: saveRef, title: saveTitle, layout_data: cleaned }).unwrap();
      setSaved(true);
      setOriginalState({
        title: saveTitle,
        ref: saveRef,
        layoutJson: JSON.stringify(cleaned)
      });
      toast.success("Layout salvo com sucesso!");

      if (wasNew) {
        setViewMode("list");
      } else {
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (e) {
      toast.error(e?.data?.detail?.message || e.message || "Erro ao salvar layout");
    } finally {
      setSaving(false);
    }
  };

  // Element Builders Manipulation Handlers
  const addEl = (element, targetIndex = null) => {
    const defaults = {
      section: { element: "section", title: "", fields: [] },
      divider: { element: "divider", label: "" },
      field: { element: "field", label: "", field: "" },
      text: { element: "text", text: "", field: "", useField: false, size: "md", weight: "normal", align: "left", color: "" },
      attention: { element: "attention", title: "", message: "", field: "", useField: false, color: "orange", icon: "alert-circle-outline" },
      instruction: { element: "instruction", title: "", steps: [""] },
      tag_container: { element: "tag_container", label: "", tags: [{ label: "", color: "blue", icon: "" }] },
      highlight_grid: { element: "highlight_grid", label: "", items: [{ label: "", color: "blue", useField: true, field: "" }] }
    };

    setLayout(currentLayout => {
      const newItem = { id: uid(), ...defaults[element], isNew: true };

      // Inject unique local ids into inner arrays if present
      if (newItem.element === "highlight_grid" && newItem.items) {
        newItem.items = newItem.items.map(item => ({ ...item, id: uid() }));
      }
      if (newItem.element === "tag_container" && newItem.tags) {
        newItem.tags = newItem.tags.map(tag => ({ ...tag, id: uid() }));
      }

      if (targetIndex !== null) {
        const copy = [...currentLayout];
        copy.splice(targetIndex, 0, newItem);
        return copy;
      }
      return [...currentLayout, newItem];
    });
  };

  const updateEl = (i, val) => {
    setLayout(currentLayout => currentLayout.map((el, idx) => idx === i ? val : el));
  };

  const deleteEl = (i) => {
    setLayout(currentLayout => currentLayout.filter((_, idx) => idx !== i));
  };

  const moveEl = (from, to) => {
    if (to < 0 || to >= layout.length) return;
    setLayout(currentLayout => {
      const copy = [...currentLayout];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  };

  const handleJsonChange = (parsed) => {
    // If it's the old array format
    if (Array.isArray(parsed)) {
      setLayout(
        parsed.map(el => {
          const copy = { ...el, id: el.id || uid() };
          if (copy.element === "section" && copy.fields) {
            copy.fields = copy.fields.map(field => ({ ...field, id: field.id || uid() }));
          }
          if (copy.element === "highlight_grid" && copy.items) {
            copy.items = copy.items.map(item => ({ ...item, id: item.id || uid() }));
          }
          if (copy.element === "tag_container" && copy.tags) {
            copy.tags = copy.tags.map(tag => ({ ...tag, id: tag.id || uid() }));
          }
          return copy;
        })
      );
    } else if (parsed && typeof parsed === 'object') {
      // New format object
      if (parsed.elements && Array.isArray(parsed.elements)) {
        setLayout(
          parsed.elements.map(el => {
            const copy = { ...el, id: el.id || uid() };
            if (copy.element === "section" && copy.fields) {
              copy.fields = copy.fields.map(field => ({ ...field, id: field.id || uid() }));
            }
            if (copy.element === "highlight_grid" && copy.items) {
              copy.items = copy.items.map(item => ({ ...item, id: item.id || uid() }));
            }
            if (copy.element === "tag_container" && copy.tags) {
              copy.tags = copy.tags.map(tag => ({ ...tag, id: tag.id || uid() }));
            }
            return copy;
          })
        );
      }
      if (parsed.example_data) {
        setExampleData(parsed.example_data);
      }
      if (parsed.appt_card_layout !== undefined) {
        setApptCardLayoutCustom(parsed.appt_card_layout);
      }
    }
  };

  if (loadingLayouts) {
    return <div className="mt-20"><LoadingState text="Carregando layouts..." /></div>;
  }

  if (viewMode === "list") {
    return (
      <LayoutList
        layouts={layouts}
        handleEdit={handleEdit}
        handleCreateNew={handleCreateNew}
        deletePrompt={deletePrompt}
        setDeletePrompt={setDeletePrompt}
        deleteConfirmText={deleteConfirmText}
        setDeleteConfirmText={setDeleteConfirmText}
        confirmDelete={confirmDelete}
      />
    );
  }

  const jsonStr = JSON.stringify(cleanLayout(), null, 2);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Editor top navigation and action toolbar */}
      <LayoutEditorHeader
        handleBackToList={handleBackToList}
        isEditing={isEditing}
        saveRef={saveRef}
        saveTitle={saveTitle}
        setSaveTitle={setSaveTitle}
        setSaveRef={setSaveRef}
        validation={validation}
        handleSave={handleSave}
        saving={saving}
        saved={saved}
        hasChanges={hasChanges}
      />

      {/* Main split dashboard: workspace + live rendering device mockup */}
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">

        {/* Workspace panel */}
        <Card className="w-full lg:w-[calc(41.6%-12px)] shrink-0 flex flex-col h-[750px] border-gray-200 dark:border-0 shadow-none overflow-hidden">
          {/* Tab selectors */}
          <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-muted/30 p-2 gap-2 shrink-0">
            {[
              { key: "builder", icon: Eye, label: "Editor" },
              { key: "json", icon: Code, label: "JSON" },
              { key: "data", icon: Database, label: "Dados Base" },
            ].map(t => {
              const Icon = t.icon;
              const isActive = activeTab === t.key;
              return (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`flex flex-1 justify-center items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 cursor-pointer ${isActive ? "bg-white dark:bg-card border border-gray-200 dark:border-gray-800 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-muted/50 border border-transparent"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              )
            })}
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50/30 dark:bg-background/50">
            {activeTab === "builder" && (
              <div className="p-5 pb-32">
                <TicketLayoutBuilder
                  layout={layout}
                  addEl={addEl}
                  updateEl={updateEl}
                  deleteEl={deleteEl}
                  moveEl={moveEl}
                  validation={validation}
                />
              </div>
            )}

            {activeTab === "json" && (
              <div className="p-5 h-full flex flex-col gap-4">
                <LayoutJsonEditor jsonStr={jsonStr} onChange={handleJsonChange} />
              </div>
            )}

            {activeTab === "data" && (
              <div className="p-5 h-full flex flex-col gap-6">
                <div className="flex-1 flex flex-col min-h-0">
                  <ExampleDataEditor data={exampleData} onChange={setExampleData} />
                </div>
                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  <HeaderEditor 
                    apptCardLayout={apptCardLayout} 
                    onChange={setApptCardLayoutCustom} 
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Live preview device panel */}
        <LayoutPreviewPanel
          exampleData={exampleData}
          layout={layout}
          apptCardLayout={apptCardLayout}
        />
      </div>
    </div>
  );
}
