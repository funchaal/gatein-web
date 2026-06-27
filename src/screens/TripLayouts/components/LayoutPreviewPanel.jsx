import { Smartphone } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { colors } from "@/constants/colors";
import { PhoneFrame } from "./SharedComponents";
import { CardPreview } from "./CardPreview";
import { ModalPreview } from "./ModalPreview";

export default function LayoutPreviewPanel({
  previewMode,
  setPreviewMode,
  exampleData,
  cleanLayout,
}) {
  return (
    <Card className="lg:col-span-7 h-[750px] flex flex-col shadow-none border-gray-200 dark:border-gray-800 bg-gray-100/50 dark:bg-gray-900/50 overflow-hidden">
      <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-card py-4 px-6 flex flex-row items-center justify-between gap-4 shrink-0">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-gray-500 dark:text-gray-400" /> Preview do Dispositivo
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Visualize em tempo real como o layout ficará no aplicativo móvel
          </CardDescription>
        </div>
        {/* preview toggle */}
        <div className="bg-gray-100 dark:bg-input/30 p-1 rounded-full border border-gray-200 dark:border-gray-800 w-60">
          <div className="relative grid grid-cols-3 w-full h-full">
            <div
              className="absolute top-0 bottom-0 left-0 w-1/3 rounded-full transition-transform duration-300 ease-out shadow-sm"
              style={{
                backgroundColor: colors.primary,
                transform: `translateX(${
                  previewMode === "card"
                    ? "0%"
                    : previewMode === "modal"
                    ? "100%"
                    : "200%"
                })`,
              }}
            />
            {[
              { key: "card", label: "Card" },
              { key: "modal", label: "Modal" },
              { key: "both", label: "Ambos" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setPreviewMode(t.key)}
                className={`relative z-10 py-1.5 text-xs font-bold transition-colors duration-300 ${
                  previewMode === t.key
                    ? "text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-8 flex items-start justify-center gap-10 flex-wrap relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px]">
        {/* Card preview */}
        {(previewMode === "card" || previewMode === "both") && (
          <div className="flex flex-col items-center gap-3">
            <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-white dark:bg-card px-3 py-1 rounded-full shadow-sm border border-gray-200 dark:border-gray-800">
              Card de Viagem
            </div>
            <PhoneFrame>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                {/* fake list header */}
                <div
                  style={{
                    paddingTop: 60,
                    paddingBottom: 16,
                    paddingLeft: 16,
                    paddingRight: 16,
                    background: "#fff",
                    borderBottom: "1px solid #E2E8F0",
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
                    Viagens
                  </div>
                  <div style={{ fontSize: 12, color: "#94A3B8" }}>Hoje</div>
                </div>
                <div
                  style={{
                    flex: 1,
                    paddingBottom: 24,
                    overflowY: "auto",
                    background: "#FFFFFF",
                  }}
                >
                  <CardPreview data={exampleData} config={cleanLayout()} />
                </div>
              </div>
            </PhoneFrame>
          </div>
        )}

        {/* Modal preview */}
        {(previewMode === "modal" || previewMode === "both") && (
          <div className="flex flex-col items-center gap-3">
            <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-white dark:bg-card px-3 py-1 rounded-full shadow-sm border border-gray-200 dark:border-gray-800">
              Modal de Detalhes
            </div>
            <PhoneFrame>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                }}
              >
                {/* fake background app */}
                <div
                  style={{
                    paddingTop: 60,
                    paddingBottom: 16,
                    paddingLeft: 16,
                    paddingRight: 16,
                    background: "#fff",
                    borderBottom: "1px solid #E2E8F0",
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
                    Viagens
                  </div>
                  <div style={{ fontSize: 12, color: "#94A3B8" }}>Hoje</div>
                </div>
                <div style={{ flex: 1, paddingBottom: 24, background: "#FFFFFF" }}>
                  <CardPreview data={exampleData} config={cleanLayout()} />
                </div>

                {/* modal overlay */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    zIndex: 100,
                  }}
                >
                  <div style={{ height: "60%" }}>
                    <ModalPreview data={exampleData} config={cleanLayout()} />
                  </div>
                </div>
              </div>
            </PhoneFrame>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
