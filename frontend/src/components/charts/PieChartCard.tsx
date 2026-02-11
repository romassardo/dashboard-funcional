import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface DonutChartProps {
  title: string
  data: Array<{ name: string; value: number; percentage: number }>
  colors: string[]
  centerLabel?: string
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0]
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-white font-medium text-sm">{item.name}</p>
        <p className="text-blue-400 text-sm">{item.value} tickets ({(item.value / item.payload.total * 100).toFixed(1)}%)</p>
      </div>
    )
  }
  return null
}

export function PieChartCard({ title, data, colors, centerLabel }: DonutChartProps) {
  const total = data.reduce((sum: number, item: any) => sum + Number(item.value), 0)

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6 backdrop-blur-sm">
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">{title}</h3>
      <div className="flex items-center gap-2">
        <div className="w-3/5 flex-shrink-0">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.map(d => ({ ...d, total }))}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((_entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <text x="50%" y="46%" textAnchor="middle" className="fill-slate-800 dark:fill-white text-2xl font-bold">{total}</text>
              <text x="50%" y="58%" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-xs">{centerLabel || 'Total'}</text>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-2/5 space-y-1.5">
          {data.map((item: any, index: number) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: colors[index % colors.length] }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-700 dark:text-slate-300 truncate">{item.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.value} ({(item.value / total * 100).toFixed(1)}%)</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
