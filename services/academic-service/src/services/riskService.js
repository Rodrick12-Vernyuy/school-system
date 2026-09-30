// At-risk detection: a student is flagged at-risk when EITHER
//  (a) overall attendance rate across all courses is below 75%, OR
//  (b) they have two consecutive failing grades (score < 50, chronological).
// Pure functions here so they are trivially unit-testable without a DB.

function isAttendanceAtRisk(attendanceRecords) {
  if (attendanceRecords.length === 0) return false;
  const presentOrLate = attendanceRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
  const rate = presentOrLate / attendanceRecords.length;
  return rate < 0.75;
}

function hasTwoConsecutiveFailingGrades(gradesInChronologicalOrder) {
  let consecutiveFails = 0;
  for (const grade of gradesInChronologicalOrder) {
    if (!grade.is_passing) {
      consecutiveFails += 1;
      if (consecutiveFails >= 2) return true;
    } else {
      consecutiveFails = 0;
    }
  }
  return false;
}

function evaluateAtRisk({ attendanceRecords, gradesInChronologicalOrder }) {
  const attendanceRisk = isAttendanceAtRisk(attendanceRecords);
  const gradeRisk = hasTwoConsecutiveFailingGrades(gradesInChronologicalOrder);
  return {
    atRisk: attendanceRisk || gradeRisk,
    reasons: [
      ...(attendanceRisk ? ['attendance_below_75_percent'] : []),
      ...(gradeRisk ? ['two_consecutive_failing_grades'] : []),
    ],
  };
}

module.exports = { isAttendanceAtRisk, hasTwoConsecutiveFailingGrades, evaluateAtRisk };
