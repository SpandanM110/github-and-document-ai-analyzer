'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { Code } from 'lucide-react'

interface LanguageChartProps {
  languages: Record<string, number>
}

export function LanguageChart({ languages }: LanguageChartProps) {
  // Process languages data and convert to percentage
  const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0)
  
  const data = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, bytes]) => ({
      name: name.length > 10 ? name.substring(0, 10) + '...' : name,
      value: Math.round((bytes / totalBytes) * 100 * 100) / 100, // Percentage with 2 decimals
      bytes: bytes
    }))

  const chartConfig = {
    value: {
      label: 'Percentage (%)',
      color: 'hsl(var(--chart-2))',
    },
  }

  // If no language data, show a message
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base font-medium">Languages</CardTitle>
            <CardDescription>By codebase percentage</CardDescription>
          </div>
          <Code className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-sm text-muted-foreground">No language data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">Languages</CardTitle>
          <CardDescription>By codebase percentage</CardDescription>
        </div>
        <Code className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              layout="horizontal"
              margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
            >
              <XAxis 
                type="number" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={50}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip 
                content={<ChartTooltipContent 
                  formatter={(value, name) => [
                    `${value}%`,
                    'Percentage'
                  ]}
                />}
                cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
              />
              <Bar 
                dataKey="value" 
                fill="var(--color-value)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 space-y-1">
          {data.map((lang, index) => (
            <div key={lang.name} className="flex items-center justify-between text-sm">
              <span className="font-medium">{lang.name}</span>
              <span className="text-muted-foreground">{lang.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
