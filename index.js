const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const authRoutes = require('./routes/auth')
const authenticateToken = require('./middlewares/auth')

dotenv.config()

const app = express()
app.use(cors())

app.use(express.json()) // Parse incoming JSON requests

// Auth routes
app.use('/auth', authRoutes)
app.get('/_health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() })
})

// Protected route example
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'You have accessed a protected route!', user: req.user })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
