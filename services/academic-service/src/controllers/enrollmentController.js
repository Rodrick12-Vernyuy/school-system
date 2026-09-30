// Enrollment is the centerpiece of the mandatory async workflow:
//   Student enrolls -> Academic Service persists it -> publishes
//   STUDENT_ENROLLED on RabbitMQ -> Finance Service consumes it and
//   creates a tuition invoice.
const pool = require('../config/db');
const { publishStudentEnrolled } = require('../services/eventPublisher');

async function enroll(req, res, next) {
  try {
    const { studentId, courseId } = req.body;

    const student = await pool.query('SELECT * FROM students WHERE id = $1', [studentId]);
    if (student.rowCount === 0) return res.status(404).json({ error: 'Student not found' });

    const course = await pool.query('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (course.rowCount === 0) return res.status(404).json({ error: 'Course not found' });

    // Prerequisite check: every prerequisite course must have a completed
    // enrollment with a passing grade for this student.
    const prereqs = await pool.query(
      'SELECT prerequisite_course_id FROM course_prerequisites WHERE course_id = $1',
      [courseId]
    );
    for (const row of prereqs.rows) {
      const completed = await pool.query(
        `SELECT g.is_passing FROM enrollments e
         JOIN grades g ON g.enrollment_id = e.id
         WHERE e.student_id = $1 AND e.course_id = $2
         ORDER BY g.graded_at DESC LIMIT 1`,
        [studentId, row.prerequisite_course_id]
      );
      if (completed.rowCount === 0 || !completed.rows[0].is_passing) {
        return res.status(400).json({ error: 'Prerequisite not satisfied for this course' });
      }
    }

    // Capacity check.
    const capacityCheck = await pool.query(
      `SELECT COUNT(*) FROM enrollments WHERE course_id = $1 AND status = 'enrolled'`,
      [courseId]
    );
    if (parseInt(capacityCheck.rows[0].count, 10) >= course.rows[0].capacity) {
      return res.status(409).json({ error: 'Course has reached capacity' });
    }

    const result = await pool.query(
      `INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING *`,
      [studentId, courseId]
    );
    const enrollment = result.rows[0];

    // Publish the async event. If RabbitMQ is briefly unreachable we log the
    // failure but still return 201 - the enrollment itself must not fail
    // because of a messaging outage; in a production system this would be
    // hardened with an outbox pattern, which is documented as a known gap.
    try {
      await publishStudentEnrolled({
        enrollmentId: enrollment.id,
        studentId: student.rows[0].id,
        studentName: student.rows[0].full_name,
        studentEmail: student.rows[0].email,
        courseId: course.rows[0].id,
        courseCode: course.rows[0].code,
        courseTitle: course.rows[0].title,
        credits: course.rows[0].credits,
      });
    } catch (mqErr) {
      console.error('[academic-service] failed to publish STUDENT_ENROLLED', mqErr.message);
    }

    res.status(201).json(enrollment);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Student is already enrolled in this course' });
    next(err);
  }
}

async function listForStudent(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT e.*, c.code, c.title, c.credits FROM enrollments e
       JOIN courses c ON c.id = e.course_id WHERE e.student_id = $1 ORDER BY e.enrolled_at DESC`,
      [req.params.studentId]
    );
    res.json({ data: result.rows });
  } catch (err) { next(err); }
}

async function drop(req, res, next) {
  try {
    const result = await pool.query(
      `UPDATE enrollments SET status = 'dropped' WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Enrollment not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

module.exports = { enroll, listForStudent, drop };
