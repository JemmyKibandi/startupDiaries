export type LeadStatus =
  | 'Identified'
  | 'Messaged'
  | 'Replied'
  | 'Call Booked'
  | 'Proposal Sent'
  | 'Client Won'
  | 'Not Interested'

export interface Lead {
  id: string
  name: string
  company: string
  status: LeadStatus
  notes: string
  createdAt: string
  updatedAt: string
}

export type TaskId =
  | 'outreach'
  | 'log_replies'
  | 'follow_up'
  | 'linkedin'
  | 'update_tracker'

export interface DailyCompletion {
  date: string
  tasks: Record<TaskId, boolean>
  completedAt?: string
}

export interface StreakData {
  current: number
  longest: number
  lastCompletedDate: string
}

export type PauseReason = 'new_client' | 'project_delivery' | 'travel' | 'other'

export interface PauseState {
  active: boolean
  reason: PauseReason
  until: string
  loggedAt: string
}

export interface WeeklySummary {
  weekStart: string
  days: Record<string, boolean>
  momentumScore: number
}

export interface NotificationSettings {
  morningTime: string
  eveningTime: string
  enabled: boolean
}

export interface OnboardingState {
  completed: boolean
  completedAt?: string
}
