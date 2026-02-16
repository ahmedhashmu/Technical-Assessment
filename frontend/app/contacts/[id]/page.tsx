'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { MeetingWithAnalysis } from '@/types'
import MeetingCard from '@/components/MeetingCard'
import { User, Loader2, AlertCircle } from 'lucide-react'

export default function ContactPage() {
  const params = useParams()
  const contactId = params.id as string

  const [meetings, setMeetings] = useState<MeetingWithAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMeetings = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getContactMeetings(contactId)
      setMeetings(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load meetings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeetings()
  }, [contactId])

  const handleAnalyze = () => {
    // Refresh meetings after analysis
    fetchMeetings()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading meetings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">Error Loading Meetings</h2>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={fetchMeetings}
            className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-primary-100 p-3 rounded-lg">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Contact: {contactId}
              </h1>
              <p className="text-gray-600 mt-1">
                {meetings.length} {meetings.length === 1 ? 'meeting' : 'meetings'} found
              </p>
            </div>
          </div>
        </div>

        {/* Meetings List */}
        {meetings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Meetings Found</h3>
            <p className="text-gray-600 mb-6">
              This contact doesn't have any meetings yet.
            </p>
            <a
              href="/meetings/new"
              className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
            >
              Submit First Meeting
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {meetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onAnalyze={handleAnalyze}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
