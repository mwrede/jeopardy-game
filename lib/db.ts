import fs from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'data.json')

interface DatabaseSchema {
  users: User[]
  games: Game[]
}

export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  created_at: string
}

export interface Game {
  id: number
  user_id: string
  score: number
  completed_at: string
  date: string
}

export interface LeaderboardEntry {
  user_id: string
  name: string
  image: string | null
  score: number
  completed_at: string
}

function readDb(): DatabaseSchema {
  if (!fs.existsSync(dbPath)) {
    return { users: [], games: [] }
  }
  const data = fs.readFileSync(dbPath, 'utf-8')
  return JSON.parse(data)
}

function writeDb(db: DatabaseSchema): void {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
}

export function createOrUpdateUser(id: string, email: string, name: string | null, image: string | null): void {
  const db = readDb()
  const existingUserIndex = db.users.findIndex(u => u.id === id)

  const user: User = {
    id,
    email,
    name,
    image,
    created_at: existingUserIndex >= 0 ? db.users[existingUserIndex].created_at : new Date().toISOString()
  }

  if (existingUserIndex >= 0) {
    db.users[existingUserIndex] = user
  } else {
    db.users.push(user)
  }

  writeDb(db)
}

export function saveGame(userId: string, score: number, date: string): void {
  const db = readDb()
  const game: Game = {
    id: db.games.length + 1,
    user_id: userId,
    score,
    completed_at: new Date().toISOString(),
    date
  }
  db.games.push(game)
  writeDb(db)
}

export function getTodaysBestScore(userId: string, date: string): number | null {
  const db = readDb()
  const userGames = db.games.filter(g => g.user_id === userId && g.date === date)
  if (userGames.length === 0) return null
  return Math.max(...userGames.map(g => g.score))
}

export function hasPlayedToday(userId: string, date: string): boolean {
  const db = readDb()
  return db.games.some(g => g.user_id === userId && g.date === date)
}

export function getLeaderboard(date: string, limit: number = 10): LeaderboardEntry[] {
  const db = readDb()
  const todaysGames = db.games.filter(g => g.date === date)

  const userScores = new Map<string, { score: number; completed_at: string }>()

  todaysGames.forEach(game => {
    const existing = userScores.get(game.user_id)
    if (!existing || game.score > existing.score) {
      userScores.set(game.user_id, {
        score: game.score,
        completed_at: game.completed_at
      })
    }
  })

  const leaderboard: LeaderboardEntry[] = Array.from(userScores.entries())
    .map(([userId, { score, completed_at }]) => {
      const user = db.users.find(u => u.id === userId)
      return {
        user_id: userId,
        name: user?.name || 'Unknown',
        image: user?.image || null,
        score,
        completed_at
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return leaderboard
}
