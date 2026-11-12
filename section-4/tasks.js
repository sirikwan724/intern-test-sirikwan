const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const ALLOWED_STATUSES = ['To Do', 'Done'];
const PAGE_SIZE = 20;
const isPositiveIntegerId = (value) => typeof value === 'string' && /^[1-9]\d*$/.test(value);

router.get('/api/tasks', authenticate, async (req, res) => {
  const page = Number(req.query.page ?? 1);
  if (!Number.isSafeInteger(page) || page < 1 || page > Math.floor(Number.MAX_SAFE_INTEGER / PAGE_SIZE)) {
    return res.status(400).json({ message: 'Invalid page' });
  }

  const conditions = [];
  const params = [];
  if (req.query.projectId !== undefined) {
    if (!isPositiveIntegerId(req.query.projectId)) {
      return res.status(400).json({ message: 'Invalid projectId' });
    }
    params.push(req.query.projectId);
    conditions.push(`project_id = $${params.length}`);
  }
  if (req.user.role !== 'admin') {
    params.push(req.user.id);
    conditions.push(`assigned_to = $${params.length}`);
  }
  const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
  params.push(PAGE_SIZE, (page - 1) * PAGE_SIZE);
  const limitIndex = params.length - 1;
  const offsetIndex = params.length;

  try {
    const result = await db.query(
      `SELECT * FROM tasks${where} ORDER BY created_at DESC LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
      params,
    );
    return res.status(200).json({ tasks: result.rows, page });
  } catch (err) {
    console.error('GET /api/tasks failed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/api/tasks/:id/status', authenticate, async (req, res) => {
  const taskId = req.params.id;
  const status = req.body?.status;
  if (!isPositiveIntegerId(taskId)) {
    return res.status(400).json({ message: 'Invalid task id' });
  }
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  let client;
  let inTransaction = false;
  try {
    client = await db.connect();
    await client.query('BEGIN');
    inTransaction = true;

    const { rows } = await client.query('SELECT * FROM tasks WHERE id = $1 FOR UPDATE', [taskId]);
    const task = rows[0];
    if (!task) {
      await client.query('ROLLBACK');
      inTransaction = false;
      return res.status(404).json({ message: 'Task not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = String(task.assigned_to) === String(req.user.id);
    if (!isAdmin && !isOwner) {
      await client.query('ROLLBACK');
      inTransaction = false;
      return res.status(403).json({ message: 'No permission to edit this task' });
    }
    if (!isAdmin && (task.status !== 'To Do' || status !== 'Done')) {
      await client.query('ROLLBACK');
      inTransaction = false;
      return res.status(409).json({ message: 'Employees may only change To Do to Done' });
    }

    const updatedResult = await client.query(
      'UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, taskId],
    );
    const updatedTask = updatedResult.rows[0];
    await client.query(
      'INSERT INTO audit_log (task_id, user_id, action) VALUES ($1, $2, $3)',
      [taskId, req.user.id, `status:${status}`],
    );
    await client.query('COMMIT');
    inTransaction = false;
    return res.status(200).json({ task: updatedTask });
  } catch (err) {
    if (client && inTransaction) {
      try { await client.query('ROLLBACK'); } catch (rollbackError) {
        console.error('PATCH rollback failed:', rollbackError);
      }
    }
    console.error('PATCH /api/tasks/:id/status failed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    client?.release();
  }
});

router.delete('/api/tasks/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }
  if (!isPositiveIntegerId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid task id' });
  }

  try {
    const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    return res.status(204).end();
  } catch (err) {
    console.error('DELETE /api/tasks/:id failed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
