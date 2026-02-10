import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface BarChartCardProps {
  title: string
  data: Array<{ name: string; value: number }>
  color: string
}

export function BarChartCard({ title, data, color }: BarChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF"
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '0.5rem'
              }}
            />
            <Legend />
            <Bar dataKey="value" fill={color} name="Cantidad" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
