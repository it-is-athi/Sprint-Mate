// backend/services/scheduleService.js
const Schedule = require('../models/Schedule');
const Task = require('../models/Task');
const mongoose = require('mongoose');

/**
 * Checks for time conflicts between proposed tasks and existing tasks.
 * @param {Array<object>} tasksData - The array of newly generated tasks to check.
 * @param {string} ownerId - The ID of the user.
 * @returns {Promise<object>} - An object with conflict status and suggested slots.
 */
const checkForTimeConflicts = async (tasksData, ownerId) => {
  const conflictingTasksInfo = [];
  const allDates = [...new Set(tasksData.map(t => t.date))];

  const existingTasks = await Task.find({
    owner_id: new mongoose.Types.ObjectId(ownerId),
    date: { $in: allDates.map(d => new Date(d)) },
  }).lean();

  if (existingTasks.length === 0) {
    return { hasConflict: false, conflicts: [], suggestedSlots: [] };
  }

  for (const proposedTask of tasksData) {
    const proposedStart = new Date(`${proposedTask.date}T${proposedTask.starting_time}:00.000Z`);
    const proposedEnd = new Date(proposedStart.getTime() + proposedTask.duration * 60000);

    const tasksOnSameDay = existingTasks.filter(et => new Date(et.date).toISOString().split('T')[0] === proposedTask.date);

    for (const existingTask of tasksOnSameDay) {
      const existingStart = new Date(existingTask.date);
      existingStart.setHours(...existingTask.starting_time.split(':'), 0, 0);
      const existingEnd = new Date(existingStart.getTime() + existingTask.duration * 60000);

      // Check for overlap
      if (proposedStart < existingEnd && proposedEnd > existingStart) {
        conflictingTasksInfo.push({
          proposedTask,
          conflictingWith: existingTask,
        });
      }
    }
  }

  if (conflictingTasksInfo.length > 0) {
    // For simplicity, we'll find slots for the first conflict date.
    // A more advanced implementation could handle multiple conflict days.
    const firstConflictDate = conflictingTasksInfo[0].proposedTask.date;
    const durationNeeded = conflictingTasksInfo[0].proposedTask.duration;
    const suggestedSlots = await findAvailableSlots(firstConflictDate, durationNeeded, ownerId);

    return {
      hasConflict: true,
      conflicts: conflictingTasksInfo,
      suggestedSlots,
    };
  }

  return { hasConflict: false, conflicts: [], suggestedSlots: [] };
};


/**
 * Finds available time slots on a given day.
 * @param {string} date - The date to check in 'YYYY-MM-DD' format.
 * @param {number} durationNeeded - The duration of the task in minutes.
 * @param {string} ownerId - The user's ID.
 * @returns {Promise<Array<string>>} - A list of available start times.
 */
const findAvailableSlots = async (date, durationNeeded, ownerId) => {
    const dayStart = new Date(`${date}T08:00:00.000Z`); // Assuming user's day starts at 8 AM
    const dayEnd = new Date(`${date}T22:00:00.000Z`); // and ends at 10 PM

    const tasksOnDay = await Task.find({
        owner_id: new mongoose.Types.ObjectId(ownerId),
        date: new Date(date),
    }).sort({ starting_time: 'asc' }).lean();

    const busySlots = tasksOnDay.map(task => {
        const start = new Date(task.date);
        start.setHours(...task.starting_time.split(':'), 0, 0);
        const end = new Date(start.getTime() + task.duration * 60000);
        return { start, end };
    });

    const freeSlots = [];
    let lastEndTime = dayStart;

    for (const slot of busySlots) {
        const gap = slot.start.getTime() - lastEndTime.getTime();
        if (gap >= durationNeeded * 60000) {
            freeSlots.push(lastEndTime);
        }
        lastEndTime = slot.end;
    }

    // Check gap after the last task until the end of the day
    if (dayEnd.getTime() - lastEndTime.getTime() >= durationNeeded * 60000) {
        freeSlots.push(lastEndTime);
    }

    // Format slots into "HH:MM"
    return freeSlots.slice(0, 5).map(slot => { // Return max 5 suggestions
        const hours = slot.getUTCHours().toString().padStart(2, '0');
        const minutes = slot.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    });
};


/**
 * Creates and saves the schedule and its associated tasks to the database after checking for conflicts.
 * @param {object} scheduleData - The data for the Schedule document.
 * @param {Array<object>} tasksData - An array of data for the Task documents.
 * @param {string} ownerId - The ID of the user who owns the schedule.
 * @returns {Promise<object>} - The newly created schedule document or a conflict object.
 */
exports.createScheduleAndTasks = async (scheduleData, tasksData, ownerId) => {
  // 1. Check for time conflicts before creating anything
  const conflictResult = await checkForTimeConflicts(tasksData, ownerId);
  if (conflictResult.hasConflict) {
    return conflictResult; // Return the conflict details immediately
  }

  // 2. If no conflicts, proceed to create the schedule
  const schedule = new Schedule({
    ...scheduleData,
    owner_id: ownerId,
  });
  await schedule.save();

  // 3. Get the new schedule's ID
  const scheduleId = schedule._id;

  // 4. Prepare all tasks with the schedule_id and owner_id
  const tasksToCreate = tasksData.map(task => ({
    ...task,
    schedule_id: scheduleId,
    owner_id: ownerId, // Add owner_id to tasks as well for easier querying
  }));

  // 5. Insert all tasks in a single operation
  if (tasksToCreate.length > 0) {
    const createdTasks = await Task.insertMany(tasksToCreate);
    console.log(`✅ Successfully created ${createdTasks.length} tasks for schedule "${schedule.schedule_title}".`);
  }

  return { hasConflict: false, schedule }; // Return the created schedule
};
