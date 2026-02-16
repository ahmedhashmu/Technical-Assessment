import { Users, Search } from 'lucide-react'
import Link from 'next/link'

export default function ContactsPage() {
  // Sample contact IDs for demo
  const sampleContacts = [
    'contact_001',
    'contact_002',
    'contact_003',
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-primary-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Contacts
            </h1>
          </div>
          <p className="text-gray-600">
            View meeting history and analysis for each contact
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <label htmlFor="contactSearch" className="block text-sm font-medium text-gray-700 mb-3">
            Search by Contact ID
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="contactSearch"
                placeholder="Enter contact ID (e.g., contact_xyz789)"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = (e.target as HTMLInputElement).value
                    if (value) {
                      window.location.href = `/contacts/${value}`
                    }
                  }
                }}
              />
            </div>
            <button
              onClick={() => {
                const input = document.getElementById('contactSearch') as HTMLInputElement
                if (input.value) {
                  window.location.href = `/contacts/${input.value}`
                }
              }}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium"
            >
              Search
            </button>
          </div>
        </div>

        {/* Sample Contacts */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sample Contacts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleContacts.map((contactId) => (
              <Link
                key={contactId}
                href={`/contacts/${contactId}`}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md hover:border-primary-300 transition"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <Users className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="font-medium text-gray-900">{contactId}</span>
                </div>
                <p className="text-sm text-gray-600">
                  View meeting history and AI analysis
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-primary-50 border border-primary-100 rounded-lg p-6">
          <h3 className="font-medium text-primary-900 mb-2">How to Use</h3>
          <ul className="space-y-2 text-sm text-primary-700">
            <li className="flex items-start">
              <span className="mr-2">1.</span>
              <span>Enter a contact ID in the search box above</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2.</span>
              <span>View all meetings associated with that contact</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3.</span>
              <span>Click "Analyze" on any meeting to extract AI insights</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
