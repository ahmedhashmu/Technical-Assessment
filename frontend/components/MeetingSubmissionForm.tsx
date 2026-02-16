'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { MeetingFormData } from '@/types'
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function MeetingSubmissionForm() {
  const [formData, setFormData] = useState<MeetingFormData>({
    meetingId: '',
    contactId: '',
    type: 'sales',
    occurredAt: '',
    transcript: '',
  })
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await apiClient.createMeeting(formData)
      setSuccess(true)
      // Clear form
      setFormData({
        meetingId: '',
        contactId: '',
        type: 'sales',
        occurredAt: '',
        transcript: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit meeting')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-900">Meeting submitted successfully!</h3>
            <p className="text-sm text-green-700 mt-1">
              Your meeting transcript has been saved as an immutable record.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Meeting ID */}
      <div>
        <label htmlFor="meetingId" className="block text-sm font-medium text-gray-700 mb-2">
          Meeting ID
        </label>
        <input
          type="text"
          id="meetingId"
          required
          value={formData.meetingId}
          onChange={(e) => setFormData({ ...formData, meetingId: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="meet_abc123"
        />
      </div>

      {/* Contact ID */}
      <div>
        <label htmlFor="contactId" className="block text-sm font-medium text-gray-700 mb-2">
          Contact ID
        </label>
        <input
          type="text"
          id="contactId"
          required
          value={formData.contactId}
          onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="contact_xyz789"
        />
      </div>

      {/* Meeting Type */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
          Meeting Type
        </label>
        <select
          id="type"
          required
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as 'sales' | 'coaching' })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="sales">Sales</option>
          <option value="coaching">Coaching</option>
        </select>
      </div>

      {/* Occurred At */}
      <div>
        <label htmlFor="occurredAt" className="block text-sm font-medium text-gray-700 mb-2">
          Meeting Date & Time
        </label>
        <input
          type="datetime-local"
          id="occurredAt"
          required
          value={formData.occurredAt}
          onChange={(e) => setFormData({ ...formData, occurredAt: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Transcript */}
      <div>
        <label htmlFor="transcript" className="block text-sm font-medium text-gray-700 mb-2">
          Meeting Transcript
        </label>
        <textarea
          id="transcript"
          required
          rows={10}
          value={formData.transcript}
          onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Enter the full meeting transcript here..."
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Submitting...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>Submit Meeting</span>
          </>
        )}
      </button>
    </form>
  )
}
