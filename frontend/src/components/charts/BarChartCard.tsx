import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface BarChartCardProps {
  title: string
  data: Array<{ name: string; value: number }>
  color: string
  layout?: 'horizontal' | 'vertical'
}

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-white font-medium text-sm">{label}</p>
        <p className="text-blue-400 text-sm">{payload[0].value} tickets</p>
      </div>
    )
  }
  return null
}

export function BarChartCard({ title, data, color, layout = 'horizontal' }: BarChartCardProps) {
  const isVertical = layout === 'vertical'
  const chartHeight = isVertical ? Math.max(250, data.length * 45) : 280

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6 backdrop-blur-sm">
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart 
          data={data} 
          layout={isVertical ? 'vertical' : 'horizontal'}
          margin={isVertical ? { left: 20, right: 20, top: 5, bottom: 5 } : { left: 0, right: 20, top: 5, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
          {isVertical ? (
            <>
              <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="#94a3b8" 
                fontSize={11} 
                width={160}
                tickLine={false}
                axisLine={false}
              />
            </>
          ) : (
            <>
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                fontSize={11}
                angle={-35}
                textAnchor="end"
                height={70}
                tickLine={false}
                axisLine={false}
              />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            </>
          )}
          <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(148,163,184,0.1)' }} />
          <Bar 
            dataKey="value" 
            fill={color} 
            radius={isVertical ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
