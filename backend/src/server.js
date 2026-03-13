import express from 'express'
import cors from 'cors'
import { initDb } from './db/index.js'
import boardsRouter from './routes/boards.js'
import tasksRouter  from './routes/tasks.js'
import teamRouter   from './routes/team.js'

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/boards', boardsRouter)
app.use('/api/tasks',  tasksRouter)
app.use('/api/team',   teamRouter)

app.get('/api/health', (_, res) => res.json({ status: 'ok', app: 'Flowlane' }))

initDb().then(() => {
  app.listen(PORT, () => console.log(`⚡ Flowlane API  →  http://localhost:${PORT}`))
}).catch(e => {
  console.error('Failed to start:', e)
  process.exit(1)
})