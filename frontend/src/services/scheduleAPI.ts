import api from './api';
import { Schedule, Task } from '../types';

export const scheduleAPI = {
  // Get all schedules for the authenticated user
  getSchedules: () => api.get<Schedule[]>('/schedules'),
  
  // Get a specific schedule by ID
  getSchedule: (id: string) => api.get<Schedule>(`/schedules/${id}`),
  
  // Create a new schedule
  createSchedule: (data: Partial<Schedule>) => api.post<Schedule>('/schedules', data),
  
  // Update a schedule
  updateSchedule: (id: string, data: Partial<Schedule>) => 
    api.put<Schedule>(`/schedules/${id}`, data),
  
  // Delete a schedule
  deleteSchedule: (id: string) => api.delete(`/schedules/${id}`),
  
  // Get all tasks for the authenticated user
  getTasks: (scheduleId?: string) => {
    const url = scheduleId ? `/tasks?schedule_id=${scheduleId}` : '/tasks';
    return api.get<Task[]>(url);
  },
  
  // Get a specific task by ID
  getTask: (id: string) => api.get<Task>(`/tasks/${id}`),
  
  // Create a new task
  createTask: (data: Partial<Task>) => api.post<Task>('/tasks', data),
  
  // Update a task
  updateTask: (id: string, data: Partial<Task>) => 
    api.put<Task>(`/tasks/${id}`, data),
  
  // Update task status specifically
  updateTaskStatus: (id: string, status: Task['status']) =>
    api.patch<Task>(`/tasks/${id}/status`, { status }),
  
  // Delete a task
  deleteTask: (id: string) => api.delete(`/tasks/${id}`),
  
  // Mark task as missed
  markTaskMissed: (id: string) => api.patch<Task>(`/tasks/${id}/missed`, { missed: true }),
  
  // Get progress for a schedule
  getScheduleProgress: (scheduleId: string) => 
    api.get(`/schedules/${scheduleId}/progress`),
  
  // Get overall progress for user
  getUserProgress: () => api.get('/progress'),
};