const { pool } = require('../configs/database')

// Create a new task

const createTask = async (req, res) => {
  const { title, status, note, due_date } = req.body
  const userId = req.user.id

  try {
    // Execute the SQL query using the pool
    const query = `
      INSERT INTO task (title, status, note, created_at, updated_at, due_date, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `
    const values = [title, status, note, new Date().toISOString(), new Date().toISOString(), due_date, userId]

    const result = await pool.query(query, values)

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).send('Server Error')
  }
}

const editTask = async (req, res) => {
  const { id } = req.params
  const { title, due_date, status, note } = req.body

  try {
    const currentTask = await pool.query(
      `SELECT * FROM public.task
      WHERE id = $1;`,
      [id]
    )

    if (currentTask.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    if (currentTask.rows[0].user_id !== req.user.id) {
      return res.status(401).json({ error: 'Unauthorized request' })
    }

    const query = `
      UPDATE public.task
      SET title = $1, due_date = $2, status = $3, note = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *;
    `
    const values = [title, due_date, status, note, id]

    // Execute the query
    const result = await pool.query(query, values)

    // Send back the updated task
    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server Error' })
  }
}

const deleteTask = async (req, res) => {
  const { id } = req.params

  try {
    const currentTask = await pool.query(
      `SELECT * FROM public.task
      WHERE id = $1;`,
      [id]
    )

    if (currentTask.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    if (currentTask.rows[0].user_id !== req.user.id) {
      return res.status(401).json({ error: 'Unauthorized request' })
    }

    const query = `
      DELETE FROM public.task
      WHERE id = $1
      RETURNING *;
    `
    const values = [id]

    // Execute the query
    const result = await pool.query(query, values)

    // Send back the updated task
    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server Error' })
  }
}

const getTasks = async (req, res) => {
  const userId = req.user.id // Ensure req.user is properly populated by authentication middleware
  const { sort_by, title, status } = req.query // Default sort to 'desc' if not provided

  try {
    // SQL query to fetch tasks for the authenticated user
    let query = `
      SELECT * FROM public.task
      WHERE user_id = $1
    `

    let values = [userId]

    if (title && status) {
      query += ` AND title ILIKE $2 AND status = $3` // Use ILIKE for case-insensitive search
      values.push(`%${title}%`)
      values.push(status)
    } else if (title) {
      query += ` AND title ILIKE $2` // Use ILIKE for case-insensitive search
      values.push(`%${title}%`)
    } else if (status) {
      query += ` AND status = $2` // Use ILIKE for case-insensitive search
      values.push(status)
    }

    if (sort_by === 'due_date') {
      query += ` ORDER BY due_date DESC`
    } else {
      query += ` ORDER BY created_at DESC`
    }

    console.log({ query })

    const result = await pool.query(query, values)

    // Return all tasks for the user
    res.status(200).json(result.rows) // 200 status code for successful GET request
  } catch (error) {
    console.error('Error fetching tasks:', error)
    res.status(500).json({ message: 'Server Error' }) // Return a JSON error message
  }
}

module.exports = { createTask, editTask, deleteTask, getTasks }
