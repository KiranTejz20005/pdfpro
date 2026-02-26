import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'docprint-recent-tools'
const MAX_RECENT = 10

export function useRecentTools() {
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw) as unknown
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentIds))
    } catch {
      // ignore
    }
  }, [recentIds])

  const addRecent = useCallback((toolId: string) => {
    setRecentIds((prev) => {
      const next = [toolId, ...prev.filter((id) => id !== toolId)].slice(0, MAX_RECENT)
      return next
    })
  }, [])

  return { recentIds, addRecent }
}
