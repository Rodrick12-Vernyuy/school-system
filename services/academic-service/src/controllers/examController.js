const pool = require('../config/db');

async function schedule(req, res, next) {
  try {
    const { courseId, examDate, startTime, endTime, room } = req.body;

    // Conflict = same room, same date, overlapping time window.
    const conflict = await pool.query(
      `SELECT * FROM examinations WHERE room = $1 AND exam_date = $2
       AND start_time < $4 AND end_time > $3`,
      [room, examDate, startTime, endTime]
    );
    if (conflict.rowCount > 0) {
      return res.status(409).json({ error: 'Scheduling conflict: room is already booked for an overlapping time', conflictsWith: conflict.rows });
    }

    const result = await pool.query(
      `INSERT INTO examinations (course_id, exam_date, start_time, end_time, room) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [courseId, examDate, startTime, endTime, room]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
}

async function list(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT e.*, c.code, c.title FROM examinations e JOIN courses c ON c.id = e.course_id ORDER BY exam_date, start_time`
    );
    res.json({ data: result.rows });
  } catch (err) { next(err); }
}

module.exports = { schedule, list };
