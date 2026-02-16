export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">TruthOS Meeting Intelligence</h1>
        <p className="text-lg text-gray-600 mb-8">
          Contact-centric meeting analysis with AI-powered insights
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a
            href="/meetings/new"
            className="p-6 border rounded-lg hover:border-blue-500 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">Submit Meeting →</h2>
            <p className="text-gray-600">
              Ingest a new meeting transcript
            </p>
          </a>
          
          <a
            href="/contacts"
            className="p-6 border rounded-lg hover:border-blue-500 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">View Contacts →</h2>
            <p className="text-gray-600">
              Browse meeting history and analysis
            </p>
          </a>
        </div>
      </div>
    </main>
  )
}
