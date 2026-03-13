import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { run, all, get } from '../db/index.js'

const router = Router()

const COLORS = ['#f43f5e','#8b5cf6','#10b981','#f59e0b','#06b6d4','#6366f1','#ec4899','#14b8a6']
const randColor = () => COLORS[Math.floor(Math.random() * COLORS.length)]

router.get('/', (req, res) => {
  res.json(all('SELECT * FROM team_members ORDER BY name'))
})

router.post('/', (req, res) => {
  const { name, email, role = 'Member', avatar_color } = req.body
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' })

  const id = uuid()
  try {
    run('INSERT INTO team_members (id, name, email, avatar_color, role) VALUES (?, ?, ?, ?, ?)',
      [id, name, email, avatar_color ?? randColor(), role])
    res.status(201).json(get('SELECT * FROM team_members WHERE id = ?', [id]))
  } catch {
    res.status(409).json({ error: 'Email already exists' })
  }
})

router.put('/:id', (req, res) => {
  const { name, role } = req.body
  run('UPDATE team_members SET name = COALESCE(?, name), role = COALESCE(?, role) WHERE id = ?',
    [name ?? null, role ?? null, req.params.id])
  res.json(get('SELECT * FROM team_members WHERE id = ?', [req.params.id]))
})

router.delete('/:id', (req, res) => {
  run('DELETE FROM team_members WHERE id = ?', [req.params.id])
  res.sendStatus(204)
})

router.get('/:id/tasks', (req, res) => {
  const rows = all(`
    SELECT t.*, b.name AS board_name, c.name AS column_name
    FROM tasks t
    JOIN boards  b ON t.board_id  = b.id
    JOIN columns c ON t.column_id = c.id
    WHERE t.assignee_id = ?
    ORDER BY t.due_date ASC
  `, [req.params.id])

  res.json(rows.map(r => ({ ...r, tags: JSON.parse(r.tags || '[]') })))
})

export default router