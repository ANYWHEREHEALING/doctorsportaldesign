export default function ErrorComponent({ message = 'Failed to load patient details. Please try refreshing the page.' }) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    )
  }