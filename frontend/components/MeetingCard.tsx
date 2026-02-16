'use client'

import { useState } from 'react'
import { MeetingWithAnalysis } from '@/types'
import { ChevronDown, ChevronUp, Calendar, FileText, Brain, Sparkles, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { apiClient } from '@/lib/api-client'

interface MeetingCardProps {
  meeting: MeetingWithAnalysis
  onAnalyze?: (meetingId: string) => void
}

export default function MeetingCard({ meeting, onAnalyze }: MeetingCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      await apiClient.analyzeMeeting(meeting.id)
      if (onAnalyze) {
        onAnalyze(meeting.id)
      }
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'negative':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'closed':
        return 'bg-green-100 text-green-700'
      case 'follow_up':
        return 'bg-blue-100 text-blue-700'
      case 'no_interest':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                meeting.type === 'sales' ? 'bg-primary-100 text-primary-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {meeting.type}
              </span>
              <span className="text-sm text-gray-500">ID: {meeting.id}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              {format(new Date(meeting.occurredAt), 'PPP p')}
            </div>
          </div>
          
          {!meeting.analysis && (
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50 text-sm font-medium"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Transcript Preview */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 mr-2" />
            Transcript Preview
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {meeting.transcript}
          </p>
        </div>

        {/* Analysis Results */}
        {meeting.analysis && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center text-sm font-medium text-gray-900 mb-3">
              <Sparkles className="w-4 h-4 mr-2 text-primary-500" />
              AI Analysis
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <span className="text-xs text-gray-500 block mb-1">Sentiment</span>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getSentimentColor(meeting.analysis.sentiment)}`}>
                  {meeting.analysis.sentiment}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-1">Outcome</span>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getOutcomeColor(meeting.analysis.outcome)}`}>
                  {meeting.analysis.outcome.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="bg-primary-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">{meeting.analysis.summary}</p>
            </div>
          </div>
        )}

        {/* Expand Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-4 flex items-center justify-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              <span>Show Less</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              <span>Show More</span>
            </>
          )}
        </button>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          {/* Full Transcript */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Full Transcript</h4>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{meeting.transcript}</p>
            </div>
          </div>

          {/* Detailed Analysis */}
          {meeting.analysis && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Detailed Analysis</h4>
              
              <div className="space-y-4">
                {/* Topics */}
                {meeting.analysis.topics.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 block mb-2">Topics Discussed</span>
                    <div className="flex flex-wrap gap-2">
                      {meeting.analysis.topics.map((topic, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Objections */}
                {meeting.analysis.objections.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 block mb-2">Objections Raised</span>
                    <ul className="space-y-1">
                      {meeting.analysis.objections.map((objection, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          {objection}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Commitments */}
                {meeting.analysis.commitments.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 block mb-2">Commitments Made</span>
                    <ul className="space-y-1">
                      {meeting.analysis.commitments.map((commitment, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          {commitment}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
