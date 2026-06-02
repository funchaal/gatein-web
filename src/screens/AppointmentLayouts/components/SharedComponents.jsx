import { useState, useEffect } from "react";
import { Database, Code, Copy, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { colors } from "@/constants/colors";

export function IconSvg({ name, size = 18, color = "#6B7280" }) {
  const icons = {
    "alert-circle": <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2" />,
    "check-bold": <path d="M4 12l5 5 9-9" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />,
    "check-circle": <><circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2" /><path d="M8 12l3 3 5-5" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" /></>,
    "information": <><circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2" /><line x1="12" y1="8" x2="12" y2="12" stroke={color} strokeWidth="2" /><circle cx="12" cy="16" r="1" fill={color} /></>,
    "information-circle": <><circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2" /><line x1="12" y1="8" x2="12" y2="12" stroke={color} strokeWidth="2" /><circle cx="12" cy="16" r="1" fill={color} /></>,
    "hand-right": <path d="M9 4v8M6 7v5M12 5v7M15 8v4a4 4 0 01-4 4H9a5 5 0 01-5-5V7" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
    "warning": <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="none" stroke={color} strokeWidth="2" /><line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth="2" /><circle cx="12" cy="17" r="1" fill={color} /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "block", flexShrink: 0 }}>
      {icons[name] || icons["information"]}
    </svg>
  );
}

export function PhoneFrame({ children, style }) {
  return (
    <div style={{
      width: 390, flexShrink: 0,
      background: "#000000",
      borderRadius: 44,
      padding: "8px",
      boxShadow: "0 0 0 2px #2a2a2a, 0 20px 60px rgba(0,0,0,0.15)",
      position: "relative",
      ...style,
    }}>
      {/* Dynamic island / Notch */}
      <div style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", width: 120, height: 30, background: "#000", borderRadius: 15, zIndex: 50 }} />
      <div style={{
        background: "#FFFFFF",
        borderRadius: 36,
        overflow: "hidden",
        height: 750,
        position: "relative",
        display: "flex",
        flexDirection: "column"
      }}>
        {children}
      </div>
    </div>
  );
}

export function ExampleDataEditor({ data, onChange }) {
  const [text, setText] = useState(JSON.stringify(data, null, 2));
  const [err, setErr] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleBlur = () => {
    try {
      onChange(JSON.parse(text));
      setErr(null);
    } catch {
      setErr("JSON inválido");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Dados de Exemplo (Preview)</Label>
        <div className="flex items-center gap-3">
          {err && <span className="text-xs text-red-500 font-medium">{err}</span>}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-1 py-0.5 text-xs font-semibold text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-transparent transition-colors"
            title="Copiar json"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span className="text-green-600">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar JSON</span>
              </>
            )}
          </button>
        </div>
      </div>
      <div className="flex-1 relative flex flex-col min-h-0">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onBlur={handleBlur}
          className={`flex-1 w-full bg-gray-900 text-gray-300 font-mono text-sm p-4 rounded-xl border ${err ? "border-red-500 focus:ring-red-500" : "border-gray-800 focus:ring-gray-700"} focus:outline-none resize-none leading-relaxed shadow-inner discrete-scrollbar`}
        />
      </div>
      <div className="mt-4 text-xs text-gray-600 dark:text-gray-400 p-3 rounded-lg border flex items-start gap-2" style={{ backgroundColor: colors.primary + '0D', borderColor: colors.primary + '33' }}>
        <Database className="w-4 h-4 shrink-0 mt-0.5" style={{ color: colors.primary }} />
        <p>Edite os dados de exemplo para ver o preview atualizado em tempo real. Use caminhos como <code className="px-1 py-0.5 rounded font-mono" style={{ color: colors.primary, backgroundColor: colors.primary + '1A' }}>motorista</code> ou <code className="px-1 py-0.5 rounded font-mono" style={{ color: colors.primary, backgroundColor: colors.primary + '1A' }}>peso_total</code> nos campos <strong>Field</strong>.</p>
      </div>
    </div>
  );
}

export function LayoutJsonEditor({ jsonStr, onChange }) {
  const [text, setText] = useState(jsonStr);
  const [err, setErr] = useState(null);
  const [prevJsonStr, setPrevJsonStr] = useState(jsonStr);
  const [copied, setCopied] = useState(false);

  if (jsonStr !== prevJsonStr) {
    setPrevJsonStr(jsonStr);
    setText(jsonStr);
    setErr(null);
  }

  const handleBlur = () => {
    try {
      const parsed = JSON.parse(text);
      onChange(parsed);
      setErr(null);
    } catch {
      setErr("JSON inválido");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex justify-between items-center mb-2">
        <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Estrutura do Layout (JSON)</Label>
        <div className="flex items-center gap-3">
          {err && <span className="text-xs text-red-500 font-medium">{err}</span>}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-1 py-0.5 text-xs font-semibold text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-transparent transition-colors"
            title="Copiar JSON"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span className="text-green-600">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar JSON</span>
              </>
            )}
          </button>
        </div>
      </div>
      <div className="flex-1 relative flex flex-col min-h-0">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onBlur={handleBlur}
          spellCheck={false}
          className={`flex-1 overflow-auto bg-gray-900 text-gray-300 p-5 rounded-xl text-xs font-mono whitespace-pre border focus:outline-none focus:ring-1 ${err ? "border-red-500 focus:ring-red-500" : "border-gray-800 focus:ring-gray-700"} shadow-inner leading-relaxed resize-none discrete-scrollbar`}
        />
      </div>
      <div className="mt-4 text-xs text-gray-600 dark:text-gray-400 bg-blue-50/80 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50 flex items-start gap-2">
        <Code className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p>Você pode editar o JSON diretamente aqui. As alterações serão refletidas no <strong>Editor</strong> assim que você clicar fora da caixa (blur).</p>
      </div>
    </div>
  );
}

export function RequiredTag({ visible, className }) {
  return (
    <span
      className={cn(
        "ml-auto flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded px-1.5 h-6 transition-opacity",
        visible ? "opacity-100" : "opacity-0 pointer-events-none",
        className
      )}
    >
      ⚠ obrigatório
    </span>
  );
}

