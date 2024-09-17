const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/auth')
const taskRoutes = require('./routes/task')
const { pool } = require('./configs/database')

dotenv.config()

const app = express()
app.use(cors())
app.use(cookieParser())
app.use(express.json()) // Parse incoming JSON requests

// Auth routes
app.use('/auth', authRoutes)

// Task routes
app.use('/task', taskRoutes)

// Health check route
app.get('/_health', async (req, res) => {
  const result = await pool.query(`SELECT COUNT(*) AS total_users FROM public.user;`)
  res.status(200).json({ status: 'UP', timestamp: new Date(), total_users: result.rows[0].total_users })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
