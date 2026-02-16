export interface Meeting {
  id: string
  contactId: string
  type: 'sales' | 'coaching'
  occurredAt: string
  transcript: string
  createdAt: string
}

export interface MeetingAnalysis {
  id: string
  meetingId: string
  sentiment: 'positive' | 'neutral' | 'negative'
  topics: string[]
  objections: string[]
  commitments: string[]
  outcome: 'closed' | 'follow_up' | 'no_interest' | 'unknown'
  summary: string
  analyzedAt: string
}

export interface MeetingWithAnalysis extends Meeting {
  analysis?: MeetingAnalysis
}

export interface MeetingFormData {
  meetingId: string
  contactId: string
  type: 'sales' | 'coaching'
  occurredAt: string
  transcript: string
}
