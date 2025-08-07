'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { Calendar } from 'lucide-react'

interface RepoChartProps {
  repoData: {
    name: string
    stars: number
    forks: number
    created_at: string
    updated_at: string
  }
}

export function RepoChart({ repoData }: RepoChartProps) {
  const data = [
    {
      name: 'Stars',
      value: repoData.stars,
    },
    {
      name: 'Forks',
      value: repoData.forks,
    }
  ]

  const chartConfig = {
    value: {
      label: 'Count',
      color: 'hsl(var(--chart-1))',
    },
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">Repository Stats</CardTitle>
          <CardDescription>Stars vs Forks</CardDescription>
        </div>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
              />
              <Bar 
                dataKey="value" 
                fill="var(--color-value)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
