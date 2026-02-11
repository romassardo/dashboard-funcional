import { useState } from 'react'
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
      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6 backdrop-blur-sm">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">Requerimientos Funcionales</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Ticket</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Título</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Fecha Solicitud</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Fecha Implementación</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {requirements.map((req) => (
                <tr key={req.ticket_number} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-slate-700 dark:text-slate-300">{req.ticket_number}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{req.titulo}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{formatDate(req.fecha_solicitud)}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{formatDate(req.fecha_implementacion)}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedRequirement(req)}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {requirements.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No se encontraron requerimientos funcionales
            </div>
          )}
        </div>
      </div>

      {selectedRequirement && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Detalle del Requerimiento</h3>
              <button
                onClick={() => setSelectedRequirement(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Nro. Ticket</label>
                <p className="font-mono text-sm text-slate-900 dark:text-white">{selectedRequirement.ticket_number}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Título</label>
                <p className="text-slate-900 dark:text-white">{selectedRequirement.titulo}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Descripción</label>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{selectedRequirement.descripcion || 'Sin descripción'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Fecha Solicitud</label>
                  <p className="text-sm text-slate-900 dark:text-white">{formatDate(selectedRequirement.fecha_solicitud)}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Fecha Implementación</label>
                  <p className="text-sm text-slate-900 dark:text-white">{formatDate(selectedRequirement.fecha_implementacion)}</p>
                </div>
              </div>
              {selectedRequirement.comentarios_solicitud && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Comentarios Solicitud</label>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                    <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{selectedRequirement.comentarios_solicitud}</p>
                  </div>
                </div>
              )}
              {selectedRequirement.comentarios_implementacion && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Comentarios Implementación</label>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                    <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{selectedRequirement.comentarios_implementacion}</p>
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
