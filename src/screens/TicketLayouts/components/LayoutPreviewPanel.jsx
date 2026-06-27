import { Smartphone } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PhoneFrame } from "../../AppointmentLayouts/components/SharedComponents";
import TicketPreview from "./TicketPreview";

export default function LayoutPreviewPanel({
  exampleData,
  layout,
  apptCardLayout,
}) {
  return (
    <Card className="w-full lg:flex-1 h-[750px] flex flex-col shadow-none border-gray-200 dark:border-gray-800 bg-gray-100/50 dark:bg-gray-900/50 overflow-hidden">
      <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-card py-4 px-6 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-gray-500 dark:text-gray-400" /> Preview do Ticket
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Visualize em tempo real como o ticket de acesso ficará no aplicativo do motorista
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-8 flex items-start justify-center relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px]">
        <div className="flex flex-col items-center gap-3">
          <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-white dark:bg-card px-3 py-1 rounded-full shadow-sm border border-gray-200 dark:border-gray-800">
            Ticket de Acesso do Motorista
          </div>
          <PhoneFrame>
            <TicketPreview data={exampleData} config={layout} apptCardLayout={apptCardLayout} />
          </PhoneFrame>
        </div>
      </CardContent>
    </Card>
  );
}
