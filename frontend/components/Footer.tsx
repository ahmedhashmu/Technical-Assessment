import { Brain, Github, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-2 rounded-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                TruthOS
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Contact-centric meeting analysis with AI-powered insights.
              One source of truth.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="/meetings/new" className="hover:text-primary-600 transition">
                  Submit Meeting
                </a>
              </li>
              <li>
                <a href="/contacts" className="hover:text-primary-600 transition">
                  View Contacts
                </a>
              </li>
              <li>
                <a href="https://github.com/ahmedhashmu/Technical-Assessment" className="hover:text-primary-600 transition">
                  Documentation
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com/ahmedhashmu/Technical-Assessment"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary-600 transition"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@truthos.com"
                className="text-gray-600 hover:text-primary-600 transition"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>© 2026 TruthOS. Built for technical assessment.</p>
        </div>
      </div>
    </footer>
  )
}
