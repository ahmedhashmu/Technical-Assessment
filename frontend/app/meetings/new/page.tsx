import MeetingSubmissionForm from '@/components/MeetingSubmissionForm'
import { FileText } from 'lucide-react'

export default function NewMeetingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-primary-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Submit Meeting Transcript
            </h1>
          </div>
          <p className="text-gray-600">
            Ingest a new meeting transcript as an immutable record. 
            All data will be stored securely and cannot be modified after submission.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <MeetingSubmissionForm />
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-primary-50 border border-primary-100 rounded-lg p-4">
          <h3 className="font-medium text-primary-900 mb-2">About Immutable Records</h3>
          <p className="text-sm text-primary-700">
            Meeting transcripts are stored as immutable truth. Once submitted, they cannot be 
            modified or deleted. This ensures data integrity and provides a complete audit trail.
          </p>
        </div>
      </div>
    </div>
  )
}
