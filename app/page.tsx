'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Upload, Github, FileText, BarChart3, Users, Calendar, Star, GitFork, AlertCircle, Info } from 'lucide-react'
import { RepoChart } from '@/components/repo-chart'
import { ContributorsChart } from '@/components/contributors-chart'
import { LanguageChart } from '@/components/language-chart'

interface RepoData {
  name: string
  description: string
  stars: number
  forks: number
  language: string
  created_at: string
  updated_at: string
  topics: string[]
  contributors: any[]
  languages: Record<string, number>
  readme: string
}

interface AnalysisResult {
  summary: string
  features: string[]
  technologies: string[]
  useCases: string[]
  insights: string
}

export default function RepoAnalyzer() {
  const [repoUrl, setRepoUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [repoData, setRepoData] = useState<RepoData | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')

  const handleRepoSubmit = async () => {
    if (!repoUrl) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/analyze-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl })
      })
      
      if (!response.ok) {
        throw new Error('Failed to analyze repository')
      }
      
      const data = await response.json()
      setRepoData(data.repoData)
      setAnalysis(data.analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSubmit = async () => {
    if (!file) return
  
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }
  
    // Validate file type
    const allowedTypes = ['application/pdf', 'text/markdown', 'text/plain']
    const allowedExtensions = ['.pdf', '.md', '.txt']
    const isValidType = allowedTypes.includes(file.type) || 
      allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
  
    if (!isValidType) {
      setError('Please upload a PDF, Markdown (.md), or Text (.txt) file')
      return
    }
  
    setLoading(true)
    setError('')
  
    try {
      const formData = new FormData()
      formData.append('file', file)
    
      console.log('Uploading file:', file.name, 'Type:', file.type, 'Size:', file.size)
    
      const response = await fetch('/api/analyze-file', {
        method: 'POST',
        body: formData
      })
    
      const data = await response.json()
    
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze file')
      }
    
      setAnalysis(data.analysis)
      setRepoData(null) // Clear repo data when analyzing file
    } catch (err) {
      console.error('File analysis error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while analyzing the file')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateAge = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - created.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) return `${diffDays} days`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`
    return `${Math.floor(diffDays / 365)} years`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900">
            AI Repository & Document Analyzer
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Analyze GitHub repositories or upload documents to get AI-powered insights, 
            summaries, and visualizations
          </p>
        </div>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Choose Analysis Type
            </CardTitle>
            <CardDescription>
              Analyze a GitHub repository or upload a PDF/Markdown file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="repo" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="repo" className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  GitHub Repository
                </TabsTrigger>
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload File
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="repo" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="repo-url">Repository URL</Label>
                  <Input
                    id="repo-url"
                    placeholder="https://github.com/owner/repository"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleRepoSubmit} 
                  disabled={loading || !repoUrl}
                  className="w-full"
                >
                  {loading ? 'Analyzing...' : 'Analyze Repository'}
                </Button>
              </TabsContent>
              
              <TabsContent value="file" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Upload File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.md,.txt"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>For best results with PDFs, ensure they contain selectable text (not scanned images)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Info className="h-4 w-4" />
                      <span>PDF parsing uses Jina AI for enhanced accuracy when API key is configured</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={handleFileSubmit} 
                  disabled={loading || !file}
                  className="w-full"
                >
                  {loading ? 'Analyzing...' : 'Analyze File'}
                </Button>
              </TabsContent>
            </Tabs>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {(repoData || analysis) && (
          <div className="space-y-6">
            {/* Repository Overview */}
            {repoData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Github className="h-5 w-5" />
                    Repository Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{repoData.name}</h3>
                    <p className="text-slate-600 mt-1">{repoData.description}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{repoData.stars.toLocaleString()} stars</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GitFork className="h-4 w-4 text-slate-500" />
                      <span>{repoData.forks.toLocaleString()} forks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span>Created {calculateAge(repoData.created_at)} ago</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-500" />
                      <span>Primary: {repoData.language}</span>
                    </div>
                  </div>
                  
                  {repoData.topics.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {repoData.topics.map((topic) => (
                          <Badge key={topic} variant="secondary">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* AI Analysis */}
            {analysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    AI-Powered Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Summary</h4>
                    <p className="text-slate-700 leading-relaxed">{analysis.summary}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Key Features</h4>
                      <ul className="space-y-2">
                        {analysis.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-slate-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.technologies.map((tech, index) => (
                          <Badge key={index} variant="outline">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold mb-3">Real-World Use Cases</h4>
                    <div className="space-y-3">
                      {analysis.useCases.map((useCase, index) => (
                        <div key={index} className="p-3 bg-slate-50 rounded-lg">
                          <span className="text-slate-700">{useCase}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {analysis.insights && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-2">Additional Insights</h4>
                        <p className="text-slate-700 leading-relaxed">{analysis.insights}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Analytics Charts */}
            {repoData && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <RepoChart repoData={repoData} />
                <ContributorsChart contributors={repoData.contributors} />
                <LanguageChart languages={repoData.languages} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
