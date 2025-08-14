// backend/services/schedulerService.js
const { addDays, minutesToHHMM } = require('../utils/dateUtils');

/**
 * createSchedule:
 * inputs:
 *   subjects: [{ name: 'Chemistry', portions: 5, perPortionMin: 45 }]
 *   startDate: '2025-08-13'
 *   deadline: '2025-08-20'
 *   dailyStart: '17:00'
 *   dailyEnd: '21:00'
 *   breakMin: 15
 *
 * returns { summary, sessions[] }
 */
function createSchedule({ subjects, startDate, deadline, dailyStart, dailyEnd, breakMin = 15 }) {
  // compute total minutes per day
  const [startH, startM] = dailyStart.split(':').map(Number);
  const [endH, endM] = dailyEnd.split(':').map(Number);
  const dailyMinutes = (endH * 60 + endM) - (startH * 60 + startM);

  // flatten all portions into a queue of sessions
  const queue = [];
  subjects.forEach(sub => {
    for (let i = 1; i <= sub.portions; i++) {
      queue.push({
        title: `${sub.name}: Portion ${i}`,
        subject: sub.name,
        durationMin: sub.perPortionMin
      });
    }
  });

  // distribute across days until deadline
  const sessions = [];
  let currentDate = startDate;
  let dayIndex = 0;

  while (queue.length > 0) {
    const dayBudget = dailyMinutes;
    let used = 0;
    let cursor = startH * 60 + startM;

    while (queue.length > 0 && (used + queue[0].durationMin + (used > 0 ? breakMin : 0)) <= dayBudget) {
      if (used > 0) {
        used += breakMin;
        cursor += breakMin;
      }
      const next = queue.shift();
      sessions.push({
        title: next.title,
        subject: next.subject,
        day: currentDate,
        start: minutesToHHMM(cursor),
        durationMin: next.durationMin,
        status: 'pending'
      });
      used += next.durationMin;
      cursor += next.durationMin;
    }

    // advance day
    dayIndex += 1;
    currentDate = addDays(startDate, dayIndex);

    // stop if we passed the deadline — leftover stays unplanned
    if (currentDate > deadline) break;
  }

  const planned = sessions.length;
  const total = planned + queue.length;

  const summary = `Planned ${planned}/${total} sessions from ${startDate} to ${deadline}.`;
  return { summary, sessions };
}

/**
 * reallocateMissed:
 * Move missed sessions forward starting the next available day/time.
 */
function reallocateMissed({ sessions, fromDate, dailyStart = '17:00', dailyEnd = '21:00', breakMin = 15 }) {
  const [startH, startM] = dailyStart.split(':').map(Number);
  const [endH, endM] = dailyEnd.split(':').map(Number);
  const dailyMinutes = (endH * 60 + endM) - (startH * 60 + startM);

  // gather missed
  const missed = sessions.filter(s => s.status === 'missed')
    .map(s => ({ title: s.title, subject: s.subject, durationMin: s.durationMin }));

  if (missed.length === 0) return sessions;

  // keep non-missed as fixed; we will append missed after fromDate
  const fixed = sessions.filter(s => s.status !== 'missed');

  // find the max day in existing plan or use fromDate
  const lastPlannedDay = fixed.reduce((max, s) => (s.day > max ? s.day : max), fromDate);
  let currentDate = lastPlannedDay;
  let dayIndex = 0;

  const newOnes = [];
  while (missed.length > 0) {
    const dayBudget = dailyMinutes;
    let used = 0;
    let cursor = startH * 60 + startM;

    while (missed.length > 0 && (used + missed[0].durationMin + (used > 0 ? breakMin : 0)) <= dayBudget) {
      if (used > 0) {
        used += breakMin;
        cursor += breakMin;
      }
      const next = missed.shift();
      newOnes.push({
        title: next.title,
        subject: next.subject,
        day: currentDate,
        start: minutesToHHMM(cursor),
        durationMin: next.durationMin,
        status: 'pending'
      });
      used += next.durationMin;
      cursor += next.durationMin;
    }

    dayIndex += 1;
    currentDate = addDays(lastPlannedDay, dayIndex);
  }

  return [...fixed, ...newOnes].sort((a, b) => (a.day + a.start).localeCompare(b.day + b.start));
}

module.exports = { createSchedule, reallocateMissed };
