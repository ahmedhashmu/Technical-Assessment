import { Meeting, MeetingAnalysis, MeetingWithAnalysis, MeetingFormData } from '@/types'

// Token storage key
const TOKEN_STORAGE_KEY = 'auth_token'

export class APIClient {
  // Get stored token
  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  }

  // Set token
  setToken(token: string) {
    if (typeof window === 'undefined') return
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  }

  // Clear token
  clearToken() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_role')
  }

  // Get current user role from localStorage
  getCurrentRole(): 'operator' | 'basic' | null {
    if (typeof window === 'undefined') return null
    const role = localStorage.getItem('user_role')
    return role as 'operator' | 'basic' | null
  }

  // Get current user email
  getCurrentEmail(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('user_email')
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getToken() !== null
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken()
    
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    }

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Handle 401 - redirect to login
    if (response.status === 401) {
      this.clearToken()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new Error('Authentication required')
    }

    return response
  }

  async createMeeting(data: MeetingFormData): Promise<Meeting> {
    const response = await this.fetchWithAuth('/api/meetings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail?.message || 'Failed to create meeting')
    }

    return response.json()
  }

  async analyzeMeeting(meetingId: string): Promise<MeetingAnalysis> {
    const response = await this.fetchWithAuth(`/api/meetings/${meetingId}/analyze`, {
      method: 'POST',
    })

    if (!response.ok) {
      const error = await response.json()
      
      // Handle 403 specifically
      if (response.status === 403) {
        throw new Error('Insufficient permissions. Only operators can analyze meetings.')
      }
      
      throw new Error(error.detail?.message || 'Failed to analyze meeting')
    }

    return response.json()
  }

  async getContactMeetings(contactId: string): Promise<MeetingWithAnalysis[]> {
    const response = await this.fetchWithAuth(`/api/contacts/${contactId}/meetings`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail?.message || 'Failed to fetch meetings')
    }

    const data = await response.json()
    return data.meetings
  }
}

export const apiClient = new APIClient()
