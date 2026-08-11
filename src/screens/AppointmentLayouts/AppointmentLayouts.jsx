import { useState, useCallback, useMemo } from "react";
import { useGetLayoutsQuery, useUpsertLayoutMutation, useDeleteLayoutMutation } from "../../services/api";
import { Eye, Code, Database } from "lucide-react";
import { colors } from "@/constants/colors";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import LoadingState from "@/components/LoadingState";

// Import layout defaults and initialization helper functions
import { DEFAULT_EXAMPLE } from "./constants";
import { uid, defaultState } from "./helpers";
import { ExampleDataEditor, LayoutJsonEditor } from "./components/SharedComponents";

// Import modular extracted sub-components
import LayoutList from "./components/LayoutList";
import LayoutEditorHeader from "./components/LayoutEditorHeader";
import CardLayoutBuilder from "./components/CardLayoutBuilder";
import ModalLayoutBuilder from "./components/ModalLayoutBuilder";
import LayoutPreviewPanel from "./components/LayoutPreviewPanel";

/**
 * Helper to remove intermediate React-specific local IDs and properties before comparison or serialization.
 */
const cleanLayoutData = (layoutObj) => {
  return {
    card_layout: {
      header: layoutObj?.card_layout?.header || {},
      sub_header: layoutObj?.card_layout?.sub_header || {},
      body_rows: (layoutObj?.card_layout?.body_rows || []).map((row) => {
        const copy = { ...row };
        delete copy.id;
        delete copy.isNew;
        return copy;
      }),
    },
    modal_layout: (layoutObj?.modal_layout || []).map((el) => {
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
      return copy;
    }),
  };
};

/**
 * Main Layout Editor screen. Acts as the orchestrator and single source of truth (controller)
 * for managing, creating, editing, and previewing application layout schemas.
 */
export default function AppointmentLayouts() {
  // ── SCREEN ROUTING STATES ───────────────────────────────────────────
  // Controls current active screen mode: "list" (showing all layouts) or "editor" (editing a layout)
  const [viewMode, setViewMode] = useState("list");

  // ── CORE DATA STATES ────────────────────────────────────────────────
  // The layout schema configuration state (includes card_layout and modal_layout)
  const [layout, setLayout] = useState(defaultState);

  // The JSON data representation of a mock entity to simulate real-time render preview
  const [exampleData, setExampleData] = useState(DEFAULT_EXAMPLE);

  // ── EDITOR CONTROLS & NAVIGATION ────────────────────────────────────
  // Active tab within the left panel: "builder" (editor workspace), "json" (raw schema), "data" (custom preview data editor)
  const [activeTab, setActiveTab] = useState("builder");

  // Selection of preview mockups on right panel: "card" (only card), "modal" (only modal detail overlay), "both" (side-by-side)
  const [previewMode, setPreviewMode] = useState("card");

  // Track upsert/save network state and trigger visual feedbacks
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Schema metadata attributes currently undergoing modification
  const [saveRef, setSaveRef] = useState("default");
  const [saveTitle, setSaveTitle] = useState("Layout Padrão");

  // Track the original state when the editor was opened or saved to detect changes
  const [originalState, setOriginalState] = useState(null);

  /**
   * Utility selector formatting the state schema: removes intermediate react-specific local IDs 
   * (e.g. elements list `id`) before packaging payload for serialization / JSON delivery.
   */
  const cleanLayout = useCallback(() => {
    return {
      ...cleanLayoutData(layout),
      example_data: exampleData,
    };
  }, [layout, exampleData]);

  // ── DETECT UNSAVED CHANGES ──────────────────────────────────────────
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

  // Tab selector inside Builder tab: "card" (configure card list) or "modal" (configure details sheet)
  const [section, setSection] = useState("card");

  // Deletion modals state handling
  const [deletePrompt, setDeletePrompt] = useState(null); // holds reference of layout targeted for deletion
  const [deleteConfirmText, setDeleteConfirmText] = useState(""); // input to double-verify before deletion

  // ── API DATA SYNC (RTK QUERY) ──────────────────────────────────────
  // Fetch layouts list from backend API
  const { data: layoutsRes, isLoading: loadingLayouts } = useGetLayoutsQuery();
  const layouts = useMemo(() => layoutsRes || [], [layoutsRes]);

  // Hooks to create/modify and delete layout schemas
  const [upsertLayout] = useUpsertLayoutMutation();
  const [deleteLayout] = useDeleteLayoutMutation();

  // Determine mode from the original state tracking
  const isEditing = originalState ? !originalState.isNew : false;

  // ── DATA VALIDATION MEMO ──────────────────────────────────────────
  // Computes validation constraints in real-time. Highlights missing required properties.
  const validation = useMemo(() => {
    const trimmedTitle = saveTitle.trim();
    const trimmedRef = saveRef.trim();
    const lowerTitle = trimmedTitle.toLowerCase();
    const lowerRef = trimmedRef.toLowerCase();

    // Check for duplicates (case-insensitive)
    const titleExists = layouts.some(
      (l) => (l.title || "").toLowerCase() === lowerTitle && l.ref !== originalState?.ref
    );
    const refExists = layouts.some(
      (l) => (l.ref || "").toLowerCase() === lowerRef && l.ref !== originalState?.ref
    );

    const errs = {
      cardRows: {},
      modalEls: {},
      title: !trimmedTitle,
      ref: !trimmedRef,
      titleExists,
      refExists,
      header: false,
      subHeader: false
    };

    // Header field path must be specified
    if (!layout.card_layout.header?.field?.trim()) errs.header = true;

    // If SubHeader is visually active (label provided), its object-path field must also be specified
    if (layout.card_layout.sub_header?.label && !layout.card_layout.sub_header?.field?.trim()) errs.subHeader = true;

    // Body footer rows must have both user-facing label and data source field path
    layout.card_layout.body_rows.forEach((r) => {
      if (!r.field?.trim() || !r.label?.trim()) errs.cardRows[r.id] = true;
    });

    // Detail Modal elements verification based on their structural requirements
    layout.modal_layout.forEach((el) => {
      if (el.element === "section") {
        if (!el.title?.trim()) errs.modalEls[el.id] = true;
        if (el.fields && el.fields.length > 0) {
          if (el.fields.some(f => !f.label?.trim() || !f.field?.trim())) {
            errs.modalEls[el.id] = true;
          }
        }
      }
      if (el.element === "field" && (!el.label?.trim() || !el.field?.trim())) errs.modalEls[el.id] = true;
      if (el.element === "alert" && !el.field?.trim()) errs.modalEls[el.id] = true;
      if (el.element === "qrcode" && !el.field?.trim()) errs.modalEls[el.id] = true;
    });

    // Check if there are any validation errors registered across elements
    const hasErrors = errs.title || errs.ref || errs.titleExists || errs.refExists || errs.header || errs.subHeader ||
      Object.keys(errs.cardRows).length > 0 || Object.keys(errs.modalEls).length > 0;

    return { ...errs, isValid: !hasErrors };
  }, [saveTitle, saveRef, layout, layouts, originalState]);

  // ── CORE ACTION HANDLERS ───────────────────────────────────────────

  /**
   * Loads an existing layout data schema into editor state, switching views.
   */
  const handleEdit = (layoutItem) => {
    setSaveRef(layoutItem.ref);
    setSaveTitle(layoutItem.title || layoutItem.ref);
    const layoutData = layoutItem.layout || layoutItem.layout_data || {};

    // Fill editing state and append generated unique local IDs to handle lists/drag-drop
    const loadedLayout = {
      card_layout: {
        header: layoutData.card_layout?.header || {},
        sub_header: layoutData.card_layout?.sub_header || {},
        body_rows: layoutData.card_layout?.body_rows || [],
      },
      modal_layout: (layoutData.modal_layout || []).map(m => {
        const copy = { ...m, id: m.id || uid() };
        if (copy.element === "section" && copy.fields) {
          copy.fields = copy.fields.map(f => ({ ...f, id: f.id || uid() }));
        }
        return copy;
      })
    };

    setLayout(loadedLayout);
    setExampleData(layoutData.example_data || DEFAULT_EXAMPLE);
    setOriginalState({
      title: layoutItem.title || layoutItem.ref,
      ref: layoutItem.ref,
      isNew: false,
      layoutJson: JSON.stringify({
        ...cleanLayoutData(loadedLayout),
        example_data: layoutData.example_data || DEFAULT_EXAMPLE,
      })
    });
    setViewMode("editor");
  };

  /**
   * Initializes state variables to define a new layout from standard presets.
   */
  const handleCreateNew = () => {
    setSaveRef("");
    setSaveTitle("");
    const freshLayout = defaultState();
    setLayout(freshLayout);
    setExampleData(DEFAULT_EXAMPLE);
    setOriginalState({
      title: "",
      ref: "",
      isNew: true,
      layoutJson: JSON.stringify({
        ...cleanLayoutData(freshLayout),
        example_data: DEFAULT_EXAMPLE,
      })
    });
    setViewMode("editor");
  };

  /**
   * Navigates back to the main list dashboard.
   */
  const handleBackToList = () => {
    setViewMode("list");
  };

  /**
   * Verifies confirmation phrase and issues API DELETE query, purging the record.
   */
  const confirmDelete = async () => {
    if (!deletePrompt) return;
    if (deleteConfirmText !== deletePrompt) {
      toast.error("O texto não corresponde à referência do layout.");
      return;
    }
    try {
      await deleteLayout(deletePrompt).unwrap();
      toast.success("Layout excluído com sucesso.");
      setDeletePrompt(null);
      setDeleteConfirmText("");

      // If we deleted the layout we were currently editing, reset current workspace
      if (saveRef === deletePrompt) {
        setSaveRef("new");
        setSaveTitle("Novo Layout");
        setLayout(defaultState());
      }
    } catch (e) {
      toast.error("Erro ao deletar: " + (e?.data?.detail?.message || e.message));
    }
  };

  // cleanLayout is now defined above to support dirty-state comparison

  // ── CARD BUILDER HANDLERS ───────────────────────────────────────────
  // Inline card headers modifications
  const updateHeader = (key, val) =>
    setLayout(l => ({ ...l, card_layout: { ...l.card_layout, header: { ...l.card_layout.header, [key]: val } } }));
  const updateSubHeader = (key, val) =>
    setLayout(l => ({ ...l, card_layout: { ...l.card_layout, sub_header: { ...l.card_layout.sub_header, [key]: val } } }));



  // Footer data rows configurations
  const addRow = () =>
    setLayout(l => ({ ...l, card_layout: { ...l.card_layout, body_rows: [...l.card_layout.body_rows, { id: uid(), label: "", field: "", isNew: true }] } }));
  const updateRow = (i, val) =>
    setLayout(l => ({ ...l, card_layout: { ...l.card_layout, body_rows: l.card_layout.body_rows.map((r, idx) => idx === i ? val : r) } }));
  const deleteRow = (i) =>
    setLayout(l => ({ ...l, card_layout: { ...l.card_layout, body_rows: l.card_layout.body_rows.filter((_, idx) => idx !== i) } }));

  /**
   * Repositions rows to rearrange order.
   */
  const moveRow = (from, to) => {
    if (to < 0 || to >= layout.card_layout.body_rows.length) return;
    setLayout(l => {
      const rows = [...l.card_layout.body_rows];
      const [item] = rows.splice(from, 1);
      rows.splice(to, 0, item);
      return { ...l, card_layout: { ...l.card_layout, body_rows: rows } };
    });
  };

  // ── MODAL BUILDER HANDLERS ──────────────────────────────────────────

  /**
   * Adds elements to the modal display order. Supporting drag-and-drop landing indices.
   */
  const addModalEl = (element, targetIndex = null) => {
    const defaults = {
      section: { element: "section", title: "" },
      field: { element: "field", label: "", field: "" },
      alert: { element: "alert", field: "", title: "", color: "yellow", icon: "warning" },
      qrcode: { element: "qrcode", field: "", title: "", caption: "" },
    };
    setLayout(l => {
      const newItem = { id: uid(), ...defaults[element], isNew: true };
      if (targetIndex !== null) {
        const newEls = [...l.modal_layout];
        newEls.splice(targetIndex, 0, newItem);
        return { ...l, modal_layout: newEls };
      }
      return { ...l, modal_layout: [...l.modal_layout, newItem] };
    });
  };
  const updateModalEl = (i, val) =>
    setLayout(l => ({ ...l, modal_layout: l.modal_layout.map((el, idx) => idx === i ? val : el) }));
  const deleteModalEl = (i) =>
    setLayout(l => ({ ...l, modal_layout: l.modal_layout.filter((_, idx) => idx !== i) }));

  /**
   * Repositions elements to rearrange modal layout structures.
   */
  const moveModalEl = (from, to) => {
    if (to < 0 || to >= layout.modal_layout.length) return;
    setLayout(l => {
      const els = [...l.modal_layout];
      const [item] = els.splice(from, 1);
      els.splice(to, 0, item);
      return { ...l, modal_layout: els };
    });
  };

  // ── DATA SERIALIZATION & API UPDATE ACTIONS ──────────────────────────

  /**
   * Restores react-controlled state configurations upon manual raw JSON input tweaks.
   */
  const handleJsonChange = (parsed) => {
    if (!parsed || typeof parsed !== "object") return;

    // Support direct root { ref, title, card_layout, modal_layout }
    // as well as nested { layout: { card_layout, modal_layout } } or legacy layout_data
    const data = (parsed.layout && (parsed.layout.card_layout || parsed.layout.modal_layout))
      ? parsed.layout
      : ((parsed.layout_data && (parsed.layout_data.card_layout || parsed.layout_data.modal_layout))
        ? parsed.layout_data
        : parsed);

    if (parsed.ref !== undefined) {
      setSaveRef(parsed.ref);
    } else if (parsed.layout_ref !== undefined) {
      setSaveRef(parsed.layout_ref);
    }

    if (parsed.title !== undefined) {
      setSaveTitle(parsed.title);
    } else if (parsed.layout_title !== undefined) {
      setSaveTitle(parsed.layout_title);
    }

    const cardLayout = data.card_layout || {};
    const modalLayout = Array.isArray(data.modal_layout) ? data.modal_layout : (Array.isArray(data) ? data : []);

    setLayout({
      card_layout: {
        header: cardLayout.header || {},
        sub_header: cardLayout.sub_header || {},
        body_rows: (cardLayout.body_rows || []).map(r => ({ ...r, id: r.id || uid() })),
      },
      modal_layout: modalLayout.map(m => {
        const copy = { ...m, id: m.id || uid() };
        if (copy.element === "section" && copy.fields) {
          copy.fields = copy.fields.map(f => ({ ...f, id: f.id || uid() }));
        }
        return copy;
      })
    });
    if (parsed.example_data || data.example_data) {
      setExampleData(parsed.example_data || data.example_data);
    }
  };

  /**
   * Packages layout parameters and issues the upsert API query.
   */
  const handleSave = async () => {
    if (!validation.isValid) {
      toast.error("Existem campos obrigatórios não preenchidos.", { duration: 3000 });
      return;
    }

    const wasNew = !isEditing;
    setSaving(true);

    try {
      const cleaned = cleanLayout();
      await upsertLayout({ ref: saveRef, title: saveTitle, layout: cleaned }).unwrap();
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

  const tabJsonObj = useMemo(() => {
    return {
      ref: saveRef,
      title: saveTitle,
      ...cleanLayoutData(layout),
    };
  }, [saveRef, saveTitle, layout]);

  const jsonStr = useMemo(() => JSON.stringify(tabJsonObj, null, 2), [tabJsonObj]);

  // ── ROUTING AND RENDER TRIGGERS ────────────────────────────────────

  // Handle active fetch loading indicator
  if (loadingLayouts) {
    return <div className="min-h-[60vh] flex items-center justify-center w-full"><LoadingState text="Carregando layouts..." /></div>;
  }

  // 1. Conditionally render Dashboard List View
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

  // 2. Otherwise render workspace design editor interface
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Upper toolbar of the editor view (Navigation, Save buttons) */}
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
      {/* Main split display: Left Panel Workspace and Right Panel Devices Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT PANEL: Workspace containing Editor inputs, JSON Editor and BASE data */}
        <Card className="lg:col-span-5 flex flex-col h-[750px] border-gray-200 dark:border-0 shadow-none overflow-hidden">
          {/* Navigation panel tab switch */}
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
                  className={`flex flex-1 justify-center items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 ${isActive ? "bg-white dark:bg-card border border-gray-200 dark:border-gray-800" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-muted/50 border border-transparent"
                    }`}
                  // style={isActive ? { color: colors.primary } : {}}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              )
            })}
          </div>

          {/* Builder Section Selector (Card representation vs Modal details representation) */}
          {activeTab === "builder" && (
            <div className="relative flex border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-card z-10 h-12 shrink-0">
              <div
                className="absolute bottom-0 left-0 w-1/2 h-0.5 transition-transform duration-300 ease-out"
                style={{
                  backgroundColor: colors.primary,
                  transform: `translateX(${section === 'card' ? '0%' : '100%'})`
                }}
              />
              {[{ key: "card", label: "Card Layout" }, { key: "modal", label: "Modal Layout" }].map(t => (
                <button key={t.key} onClick={() => setSection(t.key)}
                  className={`flex-1 flex items-center justify-center text-sm font-bold transition-colors duration-300 tracking-wide ${section === t.key ? "" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-muted/30"
                    }`}
                  style={section === t.key ? { color: colors.primary } : {}}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Render workspace contents based on selected tab */}
          <div className="flex-1 overflow-y-auto bg-gray-50/30 dark:bg-background/50">
            {activeTab === "builder" && (
              <div className="flex flex-col min-h-full">
                <div className="p-5 pb-32 flex flex-col gap-8">
                  {/* Card configuration form */}
                  {section === "card" && (
                    <CardLayoutBuilder
                      layout={layout}
                      updateHeader={updateHeader}
                      updateSubHeader={updateSubHeader}
                      addRow={addRow}
                      updateRow={updateRow}
                      deleteRow={deleteRow}
                      moveRow={moveRow}
                      validation={validation}
                    />
                  )}

                  {/* Detail modal elements workspace form */}
                  {section === "modal" && (
                    <ModalLayoutBuilder
                      layout={layout}
                      addModalEl={addModalEl}
                      updateModalEl={updateModalEl}
                      deleteModalEl={deleteModalEl}
                      moveModalEl={moveModalEl}
                      validation={validation}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Generated Raw JSON viewer and copy tab */}
            {activeTab === "json" && (
              <div className="p-5 h-full flex flex-col gap-4">
                <LayoutJsonEditor jsonStr={jsonStr} onChange={handleJsonChange} />
              </div>
            )}

            {/* Simulated target mock data editor tab */}
            {activeTab === "data" && (
              <div className="p-5 h-full">
                <ExampleDataEditor data={exampleData} onChange={setExampleData} />
              </div>
            )}
          </div>
        </Card>

        {/* RIGHT PANEL: Simulated real-time interactive mobile phone mockups */}
        <LayoutPreviewPanel
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
          exampleData={exampleData}
          cleanLayout={cleanLayout}
        />
      </div>
    </div>
  );
}