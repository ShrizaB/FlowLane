import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { run, all, get, scalar } from '../db/index.js'

const router = Router()

const withAssignee = (id) => get(`
  SELECT t.*, tm.name AS assignee_name, tm.avatar_color AS assignee_color
  FROM tasks t LEFT JOIN team_members tm ON t.assignee_id = tm.id
  WHERE t.id = ?`, [id])

const serialize = (row) => row ? { ...row, tags: JSON.parse(row.tags || '[]') } : null

router.post('/', (req, res) => {
  const { board_id, column_id, title, description, due_date, priority = 'medium', assignee_id, tags = [] } = req.body
  if (!board_id || !column_id || !title) {
    return res.status(400).json({ error: 'board_id, column_id and title are required' })
  }

  const maxPos = scalar('SELECT COALESCE(MAX(position), -1) FROM tasks WHERE column_id = ?', [column_id])
  const id = uuid()

  run(`INSERT INTO tasks (id, board_id, column_id, title, description, due_date, priority, assignee_id, position, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, board_id, column_id, title, description ?? null, due_date ?? null,
     priority, assignee_id ?? null, maxPos + 1, JSON.stringify(tags)])

  res.status(201).json(serialize(withAssignee(id)))
})

router.get('/:id', (req, res) => {
  const task = serialize(withAssignee(req.params.id))
  if (!task) return res.status(404).json({ error: 'Not found' })
  res.json(task)
})

router.put('/:id', (req, res) => {
  const { title, description, due_date, priority, assignee_id, column_id, position, tags } = req.body

  run(`UPDATE tasks SET
    title       = COALESCE(?, title),
    description = COALESCE(?, description),
    due_date    = COALESCE(?, due_date),
    priority    = COALESCE(?, priority),
    assignee_id = COALESCE(?, assignee_id),
    column_id   = COALESCE(?, column_id),
    position    = COALESCE(?, position),
    tags        = COALESCE(?, tags),
    updated_at  = datetime('now')
    WHERE id = ?`,
    [title ?? null, description ?? null, due_date ?? null, priority ?? null,
     assignee_id ?? null, column_id ?? null, position ?? null,
     tags !== undefined ? JSON.stringify(tags) : null,
     req.params.id])

  res.json(serialize(withAssignee(req.params.id)))
})

router.patch('/:id/move', (req, res) => {
  const { column_id, position } = req.body
  if (!column_id || position === undefined) {
    return res.status(400).json({ error: 'column_id and position are required' })
  }
  run("UPDATE tasks SET column_id = ?, position = ?, updated_at = datetime('now') WHERE id = ?",
    [column_id, position, req.params.id])
  res.json({ ok: true })
})

router.delete('/:id', (req, res) => {
  run('DELETE FROM tasks WHERE id = ?', [req.params.id])
  res.sendStatus(204)
})

export default router