'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Users } from 'lucide-react'

interface ContributorsChartProps {
  contributors: Array<{
    login: string
    contributions: number
    avatar_url: string
  }>
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function ContributorsChart({ contributors }: ContributorsChartProps) {
  const topContributors = contributors.slice(0, 5).map((contributor, index) => ({
    name: contributor.login,
    value: contributor.contributions,
    fill: COLORS[index % COLORS.length]
  }))

  const chartConfig = {
    value: {
      label: 'Contributions',
      color: 'hsl(var(--chart-1))',
    },
  }

  // Add a check for empty contributors data
  if (!contributors || contributors.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base font-medium">Top Contributors</CardTitle>
            <CardDescription>By number of contributions</CardDescription>
          </div>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-sm text-muted-foreground">No contributor data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">Top Contributors</CardTitle>
          <CardDescription>By number of contributions</CardDescription>
        </div>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={topContributors}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {topContributors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 space-y-2">
          {topContributors.map((contributor, index) => (
            <div key={contributor.name} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: contributor.fill }}
              />
              <span className="font-medium">{contributor.name}</span>
              <span className="text-muted-foreground">({contributor.value})</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
