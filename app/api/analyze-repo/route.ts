import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { repoUrl } = await request.json()
    
    // Extract owner and repo from URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) {
      return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 })
    }
    
    const [, owner, repo] = match
    
    // Fetch repository data
    const repoData = await fetchRepoData(owner, repo)
    
    // Generate AI analysis
    const analysis = await generateAnalysis(repoData)
    
    return NextResponse.json({ repoData, analysis })
  } catch (error) {
    console.error('Error analyzing repository:', error)
    return NextResponse.json(
      { error: 'Failed to analyze repository' },
      { status: 500 }
    )
  }
}

async function fetchRepoData(owner: string, repo: string) {
  const headers = GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {}
  
  // Fetch basic repo info
  const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers
  })
  const repoInfo = await repoResponse.json()
  
  // Fetch contributors
  const contributorsResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=10`,
    { headers }
  )
  const contributors = await contributorsResponse.json()
  
  // Fetch languages
  const languagesResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/languages`,
    { headers }
  )
  const languages = await languagesResponse.json()
  
  // Fetch README
  let readme = ''
  try {
    const readmeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      { headers }
    )
    const readmeData = await readmeResponse.json()
    readme = Buffer.from(readmeData.content, 'base64').toString('utf-8')
  } catch (error) {
    console.log('No README found')
  }
  
  return {
    name: repoInfo.name,
    description: repoInfo.description || '',
    stars: repoInfo.stargazers_count,
    forks: repoInfo.forks_count,
    language: repoInfo.language || 'Unknown',
    created_at: repoInfo.created_at,
    updated_at: repoInfo.updated_at,
    topics: repoInfo.topics || [],
    contributors: contributors || [],
    languages: languages || {},
    readme
  }
}

async function generateAnalysis(repoData: any) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured')
  }
  
  const prompt = `
Analyze this GitHub repository and provide insights:

Repository: ${repoData.name}
Description: ${repoData.description}
Primary Language: ${repoData.language}
Topics: ${repoData.topics.join(', ')}
README Content: ${repoData.readme.substring(0, 2000)}

Please provide:
1. A concise summary of the repository's purpose (2-3 sentences)
2. Key features (list 3-5 main features)
3. Technologies and frameworks used (extract from README and topics)
4. 3 potential real-world use cases
5. Additional insights about the project

Format your response as JSON with the following structure:
{
  "summary": "...",
  "features": ["...", "...", "..."],
  "technologies": ["...", "...", "..."],
  "useCases": ["...", "...", "..."],
  "insights": "..."
}
`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      })
    }
  )
  
  const data = await response.json()
  const text = data.candidates[0].content.parts[0].text
  
  try {
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (error) {
    console.error('Failed to parse AI response as JSON')
  }
  
  // Fallback if JSON parsing fails
  return {
    summary: text.substring(0, 200) + '...',
    features: ['Feature extraction failed'],
    technologies: [repoData.language],
    useCases: ['Use case analysis failed'],
    insights: 'Additional analysis unavailable'
  }
}
