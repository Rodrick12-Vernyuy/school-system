const { isAttendanceAtRisk, hasTwoConsecutiveFailingGrades, evaluateAtRisk } = require('../src/services/riskService');

describe('isAttendanceAtRisk', () => {
  test('flags risk when attendance rate is below 75%', () => {
    const records = [
      { status: 'present' }, { status: 'absent' }, { status: 'absent' }, { status: 'present' },
    ];
    expect(isAttendanceAtRisk(records)).toBe(true); // 50% present
  });

  test('does not flag risk when attendance rate is 75% or above', () => {
    const records = [
      { status: 'present' }, { status: 'present' }, { status: 'present' }, { status: 'absent' },
    ];
    expect(isAttendanceAtRisk(records)).toBe(false); // 75% present
  });

  test('treats late as attended', () => {
    const records = [{ status: 'late' }, { status: 'present' }, { status: 'present' }, { status: 'present' }];
    expect(isAttendanceAtRisk(records)).toBe(false);
  });

  test('no records means no risk', () => {
    expect(isAttendanceAtRisk([])).toBe(false);
  });
});

describe('hasTwoConsecutiveFailingGrades', () => {
  test('detects two consecutive fails', () => {
    const grades = [{ is_passing: true }, { is_passing: false }, { is_passing: false }];
    expect(hasTwoConsecutiveFailingGrades(grades)).toBe(true);
  });

  test('does not flag non-consecutive fails', () => {
    const grades = [{ is_passing: false }, { is_passing: true }, { is_passing: false }];
    expect(hasTwoConsecutiveFailingGrades(grades)).toBe(false);
  });

  test('empty grade list is not at risk', () => {
    expect(hasTwoConsecutiveFailingGrades([])).toBe(false);
  });
});

describe('evaluateAtRisk', () => {
  test('combines both signals with reasons', () => {
    const result = evaluateAtRisk({
      attendanceRecords: [{ status: 'absent' }, { status: 'absent' }, { status: 'present' }],
      gradesInChronologicalOrder: [{ is_passing: false }, { is_passing: false }],
    });
    expect(result.atRisk).toBe(true);
    expect(result.reasons).toEqual(expect.arrayContaining(['attendance_below_75_percent', 'two_consecutive_failing_grades']));
  });

  test('healthy student is not at risk', () => {
    const result = evaluateAtRisk({
      attendanceRecords: [{ status: 'present' }, { status: 'present' }],
      gradesInChronologicalOrder: [{ is_passing: true }, { is_passing: true }],
    });
    expect(result.atRisk).toBe(false);
    expect(result.reasons).toEqual([]);
  });
});
