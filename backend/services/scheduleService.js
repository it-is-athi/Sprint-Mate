// backend/services/scheduleService.js
const Schedule = require('../models/Schedule');
const Task = require('../models/Task');
const mongoose = require('mongoose');

/**
 * Creates and saves the schedule and its associated tasks to the database.
 * @param {object} scheduleData - The data for the Schedule document.
 * @param {Array<object>} tasksData - An array of data for the Task documents.
 * @param {string} ownerId - The ID of the user who owns the schedule.
 * @returns {Promise<object>} - The newly created schedule document.
 */
exports.createScheduleAndTasks = async (scheduleData, tasksData, ownerId) => {
  // 1. Create the schedule
  const schedule = new Schedule({
    ...scheduleData,
    owner_id: ownerId,
  });
  await schedule.save();

  // 2. Get the new schedule's ID
  const scheduleId = schedule._id;

  // 3. Prepare all tasks with the schedule_id and owner_id
  const tasksToCreate = tasksData.map(task => ({
    ...task,
    schedule_id: scheduleId,
    owner_id: ownerId,
  }));

  // 4. Insert all tasks in a single operation
  if (tasksToCreate.length > 0) {
    const createdTasks = await Task.insertMany(tasksToCreate);
    console.log(`✅ Successfully created ${createdTasks.length} tasks for schedule "${schedule.schedule_title}".`);
  }

  return { schedule };
};
