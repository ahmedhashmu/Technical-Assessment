import { Brain, Plus, Users, Sparkles, Shield, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-primary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Meeting Intelligence</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              One Source of Truth for
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700">
                {' '}Meeting Intelligence
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Contact-centric meeting analysis with AI-powered insights. 
              Immutable records, derived intelligence, and verified outcomes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/meetings/new"
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Submit Meeting</span>
              </Link>
              
              <Link
                href="/contacts"
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition border border-gray-200"
              >
                <Users className="w-5 h-5" />
                <span className="font-medium">View Contacts</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for Truth-Driven Organizations
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ingest real operational activity, convert it into verified metrics, 
              and power AI agents with immutable records.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-2xl border border-primary-100">
              <div className="bg-primary-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Immutable Records
              </h3>
              <p className="text-gray-600">
                Meeting transcripts stored as immutable truth. No retroactive manipulation. 
                Complete audit trail for compliance.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-2xl border border-primary-100">
              <div className="bg-primary-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Bounded AI Analysis
              </h3>
              <p className="text-gray-600">
                LLM agents constrained by rules and structured outputs. 
                Extract topics, sentiment, and outcomes without hallucinations.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-2xl border border-primary-100">
              <div className="bg-primary-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Contact-Centric Intelligence
              </h3>
              <p className="text-gray-600">
                All data organized by contact. View complete interaction history, 
                analysis results, and verified outcomes in one place.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-500 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-10">
            Submit your first meeting transcript and see AI-powered analysis in action.
          </p>
          <Link
            href="/meetings/new"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-primary-600 rounded-lg hover:bg-gray-50 transition shadow-lg hover:shadow-xl font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Submit Meeting Now</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
