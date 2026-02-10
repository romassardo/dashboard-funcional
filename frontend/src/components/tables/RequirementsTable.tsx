import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { formatDate } from '@/lib/utils'
import { FunctionalRequirement } from '@/services/api'
import { Eye, X } from 'lucide-react'

interface RequirementsTableProps {
  requirements: FunctionalRequirement[]
}

export function RequirementsTable({ requirements }: RequirementsTableProps) {
  const [selectedRequirement, setSelectedRequirement] = useState<FunctionalRequirement | null>(null)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Requerimientos Funcionales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Ticket</th>
                  <th className="text-left py-3 px-4 font-semibold">Título</th>
                  <th className="text-left py-3 px-4 font-semibold">Fecha Solicitud</th>
                  <th className="text-left py-3 px-4 font-semibold">Fecha Implementación</th>
                  <th className="text-left py-3 px-4 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {requirements.map((req) => (
                  <tr key={req.ticket_number} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs">{req.ticket_number}</td>
                    <td className="py-3 px-4">{req.titulo}</td>
                    <td className="py-3 px-4">{formatDate(req.fecha_solicitud)}</td>
                    <td className="py-3 px-4">{formatDate(req.fecha_implementacion)}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedRequirement(req)}
                        className="p-2 hover:bg-white/10 rounded-md transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {requirements.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron requerimientos funcionales
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedRequirement && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-xl font-semibold">Detalle del Requerimiento</h3>
              <button
                onClick={() => setSelectedRequirement(null)}
                className="p-2 hover:bg-white/10 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Nro. Ticket</label>
                <p className="font-mono text-sm">{selectedRequirement.ticket_number}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Título</label>
                <p>{selectedRequirement.titulo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Descripción</label>
                <div className="bg-secondary/50 rounded-md p-4 max-h-64 overflow-y-auto">
                  <p className="whitespace-pre-wrap">{selectedRequirement.descripcion || 'Sin descripción'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Fecha Solicitud</label>
                  <p>{formatDate(selectedRequirement.fecha_solicitud)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Fecha Implementación</label>
                  <p>{formatDate(selectedRequirement.fecha_implementacion)}</p>
                </div>
              </div>
              {selectedRequirement.comentarios_solicitud && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Comentarios Solicitud</label>
                  <div className="bg-secondary/50 rounded-md p-4">
                    <p className="whitespace-pre-wrap">{selectedRequirement.comentarios_solicitud}</p>
                  </div>
                </div>
              )}
              {selectedRequirement.comentarios_implementacion && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Comentarios Implementación</label>
                  <div className="bg-secondary/50 rounded-md p-4">
                    <p className="whitespace-pre-wrap">{selectedRequirement.comentarios_implementacion}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
