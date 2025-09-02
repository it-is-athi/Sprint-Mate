export interface User {
  _id: string;
  name: string;
  email: string;
  isVerified: boolean;
}

export interface Schedule {
  _id: string;
  schedule_title: string;
  starting_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'archived';
  owner_id: string;
  description: string;
  repeat_pattern: 'daily' | 'weekly' | 'monthly';
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  name: string;
  topic: string;
  duration: number;
  starting_time: string;
  date: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  missed: boolean;
  schedule_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  userId: string;
  role: 'user' | 'assistant';
  message: string;
  createdAt: string;
}