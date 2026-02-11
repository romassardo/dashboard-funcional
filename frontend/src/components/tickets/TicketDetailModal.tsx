import { useState, useEffect } from 'react'
import { dashboardApi } from '../../services/api'
import { X, Loader2, Paperclip, Download, User, MessageSquare, StickyNote, Mail } from 'lucide-react'

interface Props {
  ticketId: number
  onClose: () => void
}

const TYPE_ICONS: Record<string, { icon: typeof MessageSquare; label: string; color: string }> = {
  M: { icon: Mail, label: 'Mensaje', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  R: { icon: MessageSquare, label: 'Respuesta', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  N: { icon: StickyNote, label: 'Nota interna', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function parseFieldValue(value: string | null): string {
  if (!value || value === 'null' || value === '0') return ''
  try {
    const parsed = JSON.parse(value)
    if (typeof parsed === 'object' && parsed !== null) {
      return Object.values(parsed).filter(Boolean).join(', ')
    }
    return String(parsed)
  } catch {
    return value
  }
}

export function TicketDetailModal({ ticketId, onClose }: Props) {
  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await dashboardApi.getTicketDetail(ticketId)
        setTicket(data)
      } catch (err) {
        console.error('Error loading ticket detail:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [ticketId])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700/50 flex-shrink-0">
          <div>
            {ticket && (
              <>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                  <span className="text-cyan-500 font-mono">#{ticket.number}</span> — {ticket.asunto || '(sin asunto)'}
                </h2>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span>Estado: <span className="font-medium text-slate-700 dark:text-slate-200">{ticket.estado}</span></span>
                  <span>SLA: <span className="font-medium text-slate-700 dark:text-slate-200">{ticket.sla}</span></span>
                  <span>Creado: {ticket.created}</span>
                  {ticket.closed && <span>Cerrado: {ticket.closed}</span>}
                </div>
              </>
            )}
            {loading && <div className="h-10" />}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : ticket ? (
            <>
              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Usuario', value: ticket.usuario },
                  { label: 'Email', value: ticket.usuario_email },
                  { label: 'Agente', value: ticket.agente },
                  { label: 'Departamento', value: ticket.departamento },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm text-slate-800 dark:text-slate-200 mt-0.5 truncate">{item.value || '—'}</p>
                  </div>
                ))}
              </div>

              {/* Form Fields */}
              {ticket.fields && ticket.fields.length > 0 && (() => {
                const cleanFields = ticket.fields
                  .map((f: any) => ({ label: f.label, value: parseFieldValue(f.value) }))
                  .filter((f: any) => f.value && f.value.trim() !== '')
                return cleanFields.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Campos del formulario</h3>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg divide-y divide-slate-200/50 dark:divide-slate-700/30">
                      {cleanFields.map((f: any, i: number) => (
                        <div key={i} className="flex gap-4 px-4 py-2">
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-40 flex-shrink-0">{f.label}</span>
                          <span className="text-xs text-slate-700 dark:text-slate-200 break-all">{f.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null
              })()}

              {/* Thread */}
              {ticket.thread && ticket.thread.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Conversación ({ticket.thread.length})</h3>
                  <div className="space-y-3">
                    {ticket.thread.map((entry: any) => {
                      const typeInfo = TYPE_ICONS[entry.type] || TYPE_ICONS['M']
                      const Icon = typeInfo.icon
                      return (
                        <div key={entry.id} className={`rounded-xl border p-4 ${typeInfo.color}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="w-4 h-4" />
                            <span className="text-xs font-semibold">{typeInfo.label}</span>
                            <span className="text-xs opacity-70">—</span>
                            <User className="w-3 h-3 opacity-70" />
                            <span className="text-xs font-medium">{entry.author || entry.poster || 'Sistema'}</span>
                            <span className="text-xs opacity-60 ml-auto">{entry.created}</span>
                          </div>
                          {entry.title && <p className="text-sm font-semibold mb-1">{entry.title}</p>}
                          <div
                            className="text-sm prose prose-sm dark:prose-invert max-w-none [&_*]:text-inherit"
                            dangerouslySetInnerHTML={{ __html: entry.body || '' }}
                          />
                          {/* Attachments */}
                          {entry.attachments && entry.attachments.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-current/10 space-y-1">
                              <p className="text-xs font-semibold flex items-center gap-1"><Paperclip className="w-3 h-3" /> Adjuntos</p>
                              {entry.attachments.map((att: any) => (
                                <a
                                  key={att.file_id}
                                  href={dashboardApi.getAttachmentUrl(att.file_id)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-xs hover:underline"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>{att.name}</span>
                                  <span className="opacity-60">({formatSize(att.size)})</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-sm text-slate-400">No se pudo cargar el ticket</div>
          )}
        </div>
      </div>
    </div>
  )
}
