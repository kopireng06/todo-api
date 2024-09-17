const express = require('express')
const { createTask, getTasks, editTask, deleteTask } = require('../controllers/task')
const authenticateToken = require('../middlewares/auth')
const router = express.Router()

// Apply middleware
router.use(authenticateToken)

// Register route
router.post('/', createTask)
router.put('/:id', editTask)
router.delete('/:id', deleteTask)
router.get('/', getTasks)

module.exports = router
