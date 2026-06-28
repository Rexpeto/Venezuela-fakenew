type TavilyResult = {
  title: string
  url: string
  content: string
  score: number
}

export async function searchTavily(
  apiKey: string,
  query: string,
  maxResults = 5,
): Promise<TavilyResult[]> {
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey, query, max_results: maxResults }),
    })
    if (!res.ok) return []
    const data = (await res.json()) as { results?: TavilyResult[] }
    return data.results ?? []
  } catch {
    return []
  }
}
