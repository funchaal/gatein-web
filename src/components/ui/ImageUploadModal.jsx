import { useState, useRef, useCallback } from 'react';
import {
  Upload, X, CheckCircle, AlertTriangle, Loader2, ImageIcon, Info, ZoomIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { compressToWebP, uploadToR2 } from '@/lib/imageUpload';
import { colors } from '@/constants/colors';

// ─── Constants ────────────────────────────────────────────────────────────────

const MODES = {
  profile: {
    aspect: 1,
    label: 'Foto de Perfil',
    hint: 'Prefira uma imagem quadrada de 512×512 px ou um arquivo SVG.\nOutras dimensões serão redimensionadas automaticamente.',
    acceptedTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/svg+xml'],
    acceptAttr: '.svg,.png,.jpg,.jpeg',
    maxDimension: 512,
    maxSizeMB: 0.15,       // ~150 KB for logo
    outputWidth: 512,
    outputHeight: 512,
    previewClass: 'rounded-full overflow-hidden',
    previewStyle: { aspectRatio: '1 / 1' },
    noSvgCrop: true,       // SVGs bypass crop/compress step
  },
  announcement: {
    aspect: 14 / 9,
    label: 'Imagem do Anúncio',
    hint: 'Prefira 1080 px de largura (proporção 14:9).\nImagens menores serão redimensionadas e podem perder qualidade.',
    acceptedTypes: ['image/png', 'image/jpg', 'image/jpeg'],
    acceptAttr: '.png,.jpg,.jpeg',
    maxDimension: 1080,
    maxSizeMB: 0.5,
    outputWidth: 1080,
    outputHeight: Math.round(1080 * 9 / 14),
    previewClass: 'rounded-xl overflow-hidden',
    previewStyle: { aspectRatio: '14 / 9' },
    noSvgCrop: false,
  },
};

// ─── Step constants ───────────────────────────────────────────────────────────
const STEP = {
  IDLE:       'idle',       // No file selected
  CROP:       'crop',       // Dragging inside circular mold UI
  PREVIEW:    'preview',    // Showing processed preview for confirmation
  UPLOADING:  'uploading',  // Uploading to R2
  DONE:       'done',       // Finished
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ImageUploadModal
 *
 * @param {boolean}  isOpen         – Controls visibility
 * @param {Function} onClose        – Called when user closes/cancels
 * @param {'profile'|'announcement'} mode  – Crop & compression mode
 * @param {Function} onPresign      – async () => { upload_url, image_path, public_url }
 * @param {Function} onSuccess      – async (publicUrl, imagePath) => void — called after confirmed upload
 */
export default function ImageUploadModal({
  isOpen,
  onClose,
  mode = 'profile',
  onPresign,
  onSuccess,
}) {
  const cfg = MODES[mode];

  // ── State ──────────────────────────────────────────────────────────────────
  const [step, setStep] = useState(STEP.IDLE);
  const [srcDataUrl, setSrcDataUrl] = useState(null);
  const [isSvg, setIsSvg] = useState(false);
  const [previewObjectUrl, setPreviewObjectUrl] = useState(null);
  const [previewBlob, setPreviewBlob] = useState(null);
  const [error, setError] = useState(null);

  // Drag & Zoom Mold positioning state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.0);
  const [imgNaturalSize, setImgNaturalSize] = useState({ width: 0, height: 0 });

  const imgRef = useRef(null);
  const inputRef = useRef(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setStep(STEP.IDLE);
    setSrcDataUrl(null);
    setIsSvg(false);
    setPosition({ x: 0, y: 0 });
    setZoom(1.0);
    setImgNaturalSize({ width: 0, height: 0 });
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    setPreviewObjectUrl(null);
    setPreviewBlob(null);
    setError(null);
  }, [previewObjectUrl]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  // ── File selection ─────────────────────────────────────────────────────────

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    const isFileSvg = file.type === 'image/svg+xml';

    if (!cfg.acceptedTypes.includes(file.type) && !isFileSvg) {
      setError(`Tipo de arquivo não suportado. Use: ${cfg.acceptAttr.replaceAll(',', ', ')}`);
      return;
    }

    if (isFileSvg && !cfg.noSvgCrop) {
      setError('SVGs não são aceitos para este tipo de imagem.');
      return;
    }

    setIsSvg(isFileSvg);

    const reader = new FileReader();
    reader.onload = () => {
      setSrcDataUrl(reader.result);
      if (isFileSvg) {
        setPreviewBlob(file);
        const url = URL.createObjectURL(file);
        setPreviewObjectUrl(url);
        setStep(STEP.PREVIEW);
      } else {
        setStep(STEP.CROP);
        setPosition({ x: 0, y: 0 });
        setZoom(1.0);
      }
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  }, [cfg]);

  // ── Drag & Clamp behavior on Mold frame ──────────────────────────────────

  const clampPosition = useCallback((pos, currentZoom = zoom, naturalW = imgNaturalSize.width, naturalH = imgNaturalSize.height) => {
    if (!naturalW || !naturalH) return { x: 0, y: 0 };

    const VIEWPORT_SIZE = 250;
    const baseScale = Math.max(VIEWPORT_SIZE / naturalW, VIEWPORT_SIZE / naturalH);
    const displayW = naturalW * baseScale * currentZoom;
    const displayH = naturalH * baseScale * currentZoom;

    const maxX = Math.max(0, (displayW - VIEWPORT_SIZE) / 2);
    const maxY = Math.max(0, (displayH - VIEWPORT_SIZE) / 2);

    return {
      x: Math.max(-maxX, Math.min(maxX, pos.x)),
      y: Math.max(-maxY, Math.min(maxY, pos.y)),
    };
  }, [imgNaturalSize, zoom]);

  const handleDragStart = (e) => {
    e.preventDefault();
    const startX = e.clientX ?? e.touches?.[0]?.clientX;
    const startY = e.clientY ?? e.touches?.[0]?.clientY;
    if (startX === undefined || startY === undefined) return;

    const startPos = { ...position };

    const handleMove = (moveEvent) => {
      const currentX = moveEvent.clientX ?? moveEvent.touches?.[0]?.clientX;
      const currentY = moveEvent.clientY ?? moveEvent.touches?.[0]?.clientY;
      if (currentX === undefined || currentY === undefined) return;

      const rawPos = {
        x: startPos.x + (currentX - startX),
        y: startPos.y + (currentY - startY),
      };

      setPosition(clampPosition(rawPos, zoom));
    };

    const handleEnd = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);
  };

  // ── Mold processing -> preview ────────────────────────────────────────────

  const handleProcessCrop = useCallback(async () => {
    if (!imgRef.current) return;
    setError(null);

    try {
      const img = imgRef.current;
      const VIEWPORT_SIZE = 250; // px mold frame diameter
      const OUTPUT_SIZE = cfg.outputWidth || 512;
      const scaleFactor = OUTPUT_SIZE / VIEWPORT_SIZE;

      const canvas = document.createElement('canvas');
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext('2d');

      // Clear / white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

      const naturalW = imgNaturalSize.width || img.naturalWidth || 250;
      const naturalH = imgNaturalSize.height || img.naturalHeight || 250;

      const baseScale = Math.max(VIEWPORT_SIZE / naturalW, VIEWPORT_SIZE / naturalH);

      const displayW = naturalW * baseScale * zoom;
      const displayH = naturalH * baseScale * zoom;

      const canvasW = displayW * scaleFactor;
      const canvasH = displayH * scaleFactor;

      const canvasCenterX = OUTPUT_SIZE / 2 + position.x * scaleFactor;
      const canvasCenterY = OUTPUT_SIZE / 2 + position.y * scaleFactor;

      const drawX = canvasCenterX - canvasW / 2;
      const drawY = canvasCenterY - canvasH / 2;

      ctx.drawImage(img, drawX, drawY, canvasW, canvasH);

      const rawBlob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Falha ao processar o molde da imagem'))),
          'image/png'
        );
      });

      const compressed = await compressToWebP(rawBlob, cfg.maxDimension, cfg.maxSizeMB);
      const url = URL.createObjectURL(compressed);

      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
      setPreviewObjectUrl(url);
      setPreviewBlob(compressed);
      setStep(STEP.PREVIEW);
    } catch (err) {
      setError(`Erro ao processar a imagem: ${err.message}`);
    }
  }, [cfg, imgNaturalSize, position, zoom, previewObjectUrl]);

  // ── Upload to R2 ───────────────────────────────────────────────────────────

  const handleConfirmUpload = useCallback(async () => {
    if (!previewBlob) return;
    setError(null);
    setStep(STEP.UPLOADING);

    try {
      const contentType = isSvg ? 'image/svg+xml' : 'image/webp';
      const { upload_url, public_url, image_path } = await onPresign(contentType);
      await uploadToR2(upload_url, previewBlob, contentType);
      await onSuccess(public_url, image_path);
      setStep(STEP.DONE);
    } catch (err) {
      setError(`Erro no upload: ${err.message}`);
      setStep(STEP.PREVIEW);
    }
  }, [previewBlob, isSvg, onPresign, onSuccess]);

  // ── Drag-and-drop on idle screen ───────────────────────────────────────────
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && inputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      inputRef.current.files = dt.files;
      inputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div
              className="p-1.5 rounded-lg"
              style={{ backgroundColor: colors.primary + '20' }}
            >
              <ImageIcon className="w-4 h-4" style={{ color: colors.primary }} />
            </div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
              {step === STEP.PREVIEW ? 'Confirmar Imagem' :
               step === STEP.UPLOADING ? 'Enviando...' :
               step === STEP.DONE ? 'Upload Concluído!' :
               `Upload — ${cfg.label}`}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* ── IDLE: file drop zone ── */}
          {step === STEP.IDLE && (
            <>
              <div className="flex gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-700 dark:text-blue-300">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <p className="whitespace-pre-line">{cfg.hint}</p>
              </div>

              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50/30 dark:hover:bg-orange-900/10 transition-colors select-none"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Arraste uma imagem ou clique para selecionar
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Aceito: {cfg.acceptAttr.replaceAll(',', ', ').replaceAll('.', '').toUpperCase()}
                  </p>
                </div>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept={cfg.acceptAttr}
                className="hidden"
                onChange={handleFileSelect}
              />
            </>
          )}

          {/* ── CROP / MOLD ADJUSTMENT ── */}
          {step === STEP.CROP && srcDataUrl && (
            <div className="flex flex-col items-center justify-center gap-4 py-2">
              <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-700 dark:text-amber-300 w-full">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>Arraste a imagem dentro do molde circular para encaixar a foto de perfil. Use a barra abaixo para ajustar o zoom.</p>
              </div>

              {/* Mold Frame Container */}
              <div className="relative flex items-center justify-center p-4">
                <div
                  onMouseDown={handleDragStart}
                  onTouchStart={handleDragStart}
                  className="relative w-[250px] h-[250px] rounded-full overflow-hidden border-4 border-orange-500 shadow-2xl bg-gray-900 cursor-grab active:cursor-grabbing select-none"
                >
                  {(() => {
                    const naturalW = imgNaturalSize.width || 250;
                    const naturalH = imgNaturalSize.height || 250;
                    const baseScale = Math.max(250 / naturalW, 250 / naturalH);
                    const w = naturalW * baseScale * zoom;
                    const h = naturalH * baseScale * zoom;
                    return (
                      <img
                        ref={imgRef}
                        src={srcDataUrl}
                        alt="Foto de Perfil"
                        className="absolute max-w-none pointer-events-none select-none"
                        style={{
                          width: `${w}px`,
                          height: `${h}px`,
                          left: `calc(50% - ${w / 2}px + ${position.x}px)`,
                          top: `calc(50% - ${h / 2}px + ${position.y}px)`,
                        }}
                        onLoad={(e) => {
                          setImgNaturalSize({
                            width: e.target.naturalWidth,
                            height: e.target.naturalHeight,
                          });
                          setPosition({ x: 0, y: 0 });
                          setZoom(1.0);
                        }}
                      />
                    );
                  })()}
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center justify-center gap-3 w-64 pt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Zoom</span>
                <input
                  type="range"
                  min="1.0"
                  max="3.0"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => {
                    const newZoom = parseFloat(e.target.value);
                    setZoom(newZoom);
                    setPosition((prev) => clampPosition(prev, newZoom));
                  }}
                  className="flex-1 accent-orange-500 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono font-medium w-8 text-right">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* ── PREVIEW ── */}
          {step === STEP.PREVIEW && previewObjectUrl && (
            <>
              <div className="flex gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl text-xs text-green-700 dark:text-green-300">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <p>
                  {isSvg
                    ? 'SVG selecionado. Verifique a prévia e confirme o upload.'
                    : 'Imagem ajustada ao molde e comprimida. Verifique a qualidade e confirme.'}
                </p>
              </div>

              <div className="flex justify-center">
                <div
                  className={`border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md ${cfg.previewClass}`}
                  style={{
                    width: mode === 'profile' ? '160px' : '100%',
                    ...cfg.previewStyle,
                  }}
                >
                  <img
                    src={previewObjectUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {previewBlob && !isSvg && (
                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                  Tamanho: {(previewBlob.size / 1024).toFixed(1)} KB &nbsp;·&nbsp; Formato: WebP
                </p>
              )}
            </>
          )}

          {/* ── UPLOADING ── */}
          {step === STEP.UPLOADING && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <Loader2 className="w-10 h-10 animate-spin" style={{ color: colors.primary }} />
              <p className="text-sm text-gray-600 dark:text-gray-400">Enviando para o servidor…</p>
            </div>
          )}

          {/* ── DONE ── */}
          {step === STEP.DONE && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: colors.primary + '1A' }}
              >
                <CheckCircle className="w-8 h-8" style={{ color: colors.primary }} />
              </div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Upload realizado com sucesso!</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-400">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {(step === STEP.CROP || step === STEP.PREVIEW) && (
              <button
                onClick={() => {
                  if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
                  setPreviewObjectUrl(null);
                  setPreviewBlob(null);
                  setStep(STEP.IDLE);
                  setSrcDataUrl(null);
                }}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
              >
                Trocar imagem
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {step !== STEP.DONE && (
              <Button variant="outline" size="sm" onClick={handleClose} disabled={step === STEP.UPLOADING}>
                Cancelar
              </Button>
            )}

            {step === STEP.CROP && (
              <Button
                size="sm"
                onClick={handleProcessCrop}
                style={{ backgroundColor: colors.primary, color: 'white' }}
                className="hover:opacity-90"
              >
                Processar →
              </Button>
            )}

            {step === STEP.PREVIEW && (
              <Button
                size="sm"
                onClick={handleConfirmUpload}
                style={{ backgroundColor: colors.primary, color: 'white' }}
                className="hover:opacity-90"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Confirmar e Enviar
              </Button>
            )}

            {step === STEP.DONE && (
              <Button
                size="sm"
                onClick={handleClose}
                style={{ backgroundColor: colors.primary, color: 'white' }}
                className="hover:opacity-90"
              >
                Fechar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
