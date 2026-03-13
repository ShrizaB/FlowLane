import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { run, all, get, scalar } from '../db/index.js'

const router = Router()

const DEFAULT_COLUMNS = [
  { name: 'To Do',       color: '#64748b' },
  { name: 'In Progress', color: '#6366f1' },
  { name: 'Done',        color: '#10b981' },
]

router.get('/', (req, res) => {
  res.json(all('SELECT * FROM boards ORDER BY created_at DESC'))
})

router.post('/', (req, res) => {
  const { name, description, color = '#6366f1' } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })

  const id = uuid()
  run('INSERT INTO boards (id, name, description, color) VALUES (?, ?, ?, ?)',
    [id, name, description ?? null, color])

  DEFAULT_COLUMNS.forEach((col, i) =>
    run('INSERT INTO columns (id, board_id, name, position, color) VALUES (?, ?, ?, ?, ?)',
      [uuid(), id, col.name, i, col.color]))

  res.status(201).json(get('SELECT * FROM boards WHERE id = ?', [id]))
})

router.get('/:id', (req, res) => {
  const board = get('SELECT * FROM boards WHERE id = ?', [req.params.id])
  if (!board) return res.status(404).json({ error: 'Not found' })
  res.json(board)
})

router.put('/:id', (req, res) => {
  const { name, description, color } = req.body
  run(`UPDATE boards SET
    name        = COALESCE(?, name),
    description = COALESCE(?, description),
    color       = COALESCE(?, color),
    updated_at  = datetime('now')
    WHERE id = ?`,
    [name ?? null, description ?? null, color ?? null, req.params.id])
  res.json(get('SELECT * FROM boards WHERE id = ?', [req.params.id]))
})

router.delete('/:id', (req, res) => {
  run('DELETE FROM boards WHERE id = ?', [req.params.id])
  res.sendStatus(204)
})

router.get('/:id/columns', (req, res) => {
  res.json(all('SELECT * FROM columns WHERE board_id = ? ORDER BY position', [req.params.id]))
})

router.post('/:id/columns', (req, res) => {
  const { name, color = '#64748b' } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })

  const maxPos = scalar('SELECT COALESCE(MAX(position), -1) FROM columns WHERE board_id = ?', [req.params.id])
  const id = uuid()
  run('INSERT INTO columns (id, board_id, name, position, color) VALUES (?, ?, ?, ?, ?)',
    [id, req.params.id, name, maxPos + 1, color])
  res.status(201).json(get('SELECT * FROM columns WHERE id = ?', [id]))
})

router.get('/:id/tasks', (req, res) => {
  const rows = all(`
    SELECT t.*,
           tm.name         AS assignee_name,
           tm.avatar_color AS assignee_color,
           tm.role         AS assignee_role
    FROM tasks t
    LEFT JOIN team_members tm ON t.assignee_id = tm.id
    WHERE t.board_id = ?
    ORDER BY t.column_id, t.position
  `, [req.params.id])

  res.json(rows.map(r => ({ ...r, tags: JSON.parse(r.tags || '[]') })))
})

router.get('/:id/stats', (req, res) => {
  const total      = scalar('SELECT COUNT(*) FROM tasks WHERE board_id = ?', [req.params.id])
  const byPriority = all('SELECT priority, COUNT(*) AS count FROM tasks WHERE board_id = ? GROUP BY priority', [req.params.id])
  const byColumn   = all(`
    SELECT c.name, COUNT(t.id) AS count
    FROM columns c
    LEFT JOIN tasks t ON t.column_id = c.id
    WHERE c.board_id = ?
    GROUP BY c.id
    ORDER BY c.position
  `, [req.params.id])

  res.json({ total, by_priority: byPriority, by_column: byColumn })
})

export default router