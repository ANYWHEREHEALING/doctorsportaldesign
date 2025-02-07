interface InfoRowProps {
    label: string
    value: string
  }
  
  function InfoRow({ label, value }: InfoRowProps) {
    return (
      <div className="grid grid-cols-2 gap-4 py-4">
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{label}</h4>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{value}</p>
        </div>
      </div>
    )
  }
  
  interface InfoSectionProps {
    title: string
    items: Array<{ label: string; value: string }>
  }
  
  export function InfoSection({ title, items }: InfoSectionProps) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
            {title === "Patient Information" ? (
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {title}
          </h3>
          <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {items.map((item, i) => (
            <InfoRow key={i} label={item.label} value={item.value} />
          ))}
        </div>
      </div>
    )
  }
  
  