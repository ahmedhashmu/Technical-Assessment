import Link from 'next/link'
import { Brain, Plus, Users } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-2 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">
              TruthOS
            </span>
          </Link>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              href="/meetings/new"
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Meeting</span>
            </Link>
            
            <Link
              href="/contacts"
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <Users className="w-4 h-4" />
              <span>Contacts</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
