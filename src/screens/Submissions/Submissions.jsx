import React, { useState } from "react";
import {
  Search,
  Inbox,
  ExternalLink,
  User,
  X,
  Eye,
  CheckCircle,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useGetSubmissionsQuery, useGetSubmissionDetailQuery } from "@/services/api";
import LoadingState from "@/components/LoadingState";
import { colors } from "@/constants/colors";

export default function Submissions() {
  const [taxIdQuery, setTaxIdQuery] = useState("");
  const [activeTaxId, setActiveTaxId] = useState("");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const { data: submissionsData, isLoading } = useGetSubmissionsQuery({
    tax_id: activeTaxId || undefined,
  });

  const { data: detailData, isLoading: isLoadingDetail } = useGetSubmissionDetailQuery(
    selectedSubmissionId,
    { skip: !selectedSubmissionId }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveTaxId(taxIdQuery.trim());
  };

  const clearSearch = () => {
    setTaxIdQuery("");
    setActiveTaxId("");
  };

  const formatDate = (isoString) => {
    if (!isoString) return "—";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "EDITED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <Pencil className="w-3 h-3" /> Editado
          </span>
        );
      case "SENT":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="w-3 h-3" /> Enviado
          </span>
        );
    }
  };

  if (isLoading) {
    return <LoadingState text="Carregando envios..." />;
  }

  const items = submissionsData?.data || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primary + "1A" }}>
            <Inbox className="w-5 h-5" style={{ color: colors.primary }} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Envios Recebidos</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Consulte os comprovantes, CNHs e outros documentos enviados pelos motoristas para sua empresa
            </p>
          </div>
        </div>
      </div>

      {/* Main Card List with Search Header */}
      <Card className="border-gray-200 dark:border-0 shadow-none overflow-hidden">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-transparent">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Documentos e Formulários</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {submissionsData?.total || items.length} envio(s) cadastrado(s)
              </CardDescription>
            </div>

            <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Buscar por CPF (ex: 123.456.789-00)..."
                  value={taxIdQuery}
                  onChange={(e) => setTaxIdQuery(e.target.value)}
                  className="pl-9 pr-8"
                />
                {taxIdQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button type="submit" size="sm" style={{ backgroundColor: colors.primary }}>
                Buscar
              </Button>
            </form>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                {activeTaxId
                  ? `Nenhum envio localizado para o CPF "${activeTaxId}".`
                  : "Sua empresa ainda não recebeu envios de motoristas."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-3">Motorista</th>
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-3">Tipo de Envio</th>
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-3">Conteúdo</th>
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-3">Data de Envio</th>
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-3">Status</th>
                    <th className="text-right text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-3">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 dark:text-gray-100">{item.user_name}</div>
                        <div className="text-xs text-gray-400 font-mono">CPF: {item.user_tax_id}</div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {item.type_title}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-500 space-y-0.5">
                        <div>{item.attachments_count} anexo(s)</div>
                        <div>{item.fields_count} campo(s) preenchido(s)</div>
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-500">
                        <div>{formatDate(item.created_at)}</div>
                        {item.edited_at && (
                          <div className="text-[10px] text-amber-600 italic">
                            editado em {formatDate(item.edited_at)}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">{getStatusBadge(item.status)}</td>

                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedSubmissionId(item.id)}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/40"
                        >
                          <Eye className="w-4 h-4 mr-1.5" /> Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Detail Modal */}
      {selectedSubmissionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            {isLoadingDetail ? (
              <LoadingState text="Carregando detalhes..." />
            ) : detailData ? (
              <>
                {/* Modal Header */}
                <div className="flex items-start justify-between border-b pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {detailData.type_title}
                      </h2>
                      {getStatusBadge(detailData.status)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Enviado em {formatDate(detailData.created_at)}
                    </p>
                    {detailData.edited_at && (
                      <p className="text-xs text-amber-600 font-medium italic mt-0.5">
                        Editado em {formatDate(detailData.edited_at)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedSubmissionId(null)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Driver Info */}
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-gray-100">
                        {detailData.user_name || "Motorista"}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        CPF: {detailData.user_tax_id}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dynamic Fields Section */}
                <div>
                  <h4 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-3">
                    Informações Preenchidas
                  </h4>
                  {Object.keys(detailData.field_data || {}).length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Nenhum campo preenchido.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(detailData.field_data).map(([key, val]) => (
                        <div
                          key={key}
                          className="bg-gray-50/70 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 rounded-xl p-3"
                        >
                          <span className="block text-[11px] font-bold uppercase text-gray-400 mb-0.5">
                            {key}
                          </span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                            {String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Attachments Section */}
                <div>
                  <h4 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-3">
                    Anexos ({detailData.attachments?.length || 0})
                  </h4>

                  {!detailData.attachments || detailData.attachments.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Nenhum anexo incluído neste envio.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {detailData.attachments.map((att, idx) => {
                        const isPdf = att.type === "pdf" || att.url?.toLowerCase().endsWith(".pdf");
                        return (
                          <div
                            key={idx}
                            className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 flex items-center justify-between gap-3 bg-white dark:bg-card"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {isPdf ? (
                                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">
                                  PDF
                                </div>
                              ) : (
                                <img
                                  src={att.url}
                                  alt="Preview"
                                  className="w-10 h-10 rounded-lg object-cover cursor-pointer"
                                  onClick={() => setPreviewImage(att.url)}
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold truncate text-gray-800 dark:text-gray-200">
                                  {att.name || `Anexo ${idx + 1}`}
                                </p>
                                <p className="text-[10px] text-gray-400 uppercase font-mono">
                                  {isPdf ? "Documento PDF" : "Imagem"}
                                </p>
                              </div>
                            </div>

                            <a
                              href={att.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 text-gray-400 hover:text-orange-600 rounded-lg"
                              title="Abrir anexo"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </Card>
        </div>
      )}

      {/* Fullscreen Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
            <img
              src={previewImage}
              alt="Anexo Expandido"
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 p-2 text-white bg-black/50 rounded-full hover:bg-black/80"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
