export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header section - placeholder for future navigation */}
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Math Tutor
          </h1>
        </div>
      </header>

      {/* Main content area - placeholder for chat interface and problem input */}
      <main className="flex-1 bg-zinc-50 dark:bg-black">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Welcome to Math Tutor
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                Your AI-powered Socratic learning assistant for mathematics
              </p>
            </div>

            {/* Placeholder for future components */}
            <div className="w-full max-w-2xl space-y-4 rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-zinc-600 dark:text-zinc-400">
                Problem input interface will go here
              </p>
            </div>

            <div className="w-full max-w-2xl space-y-4 rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-zinc-600 dark:text-zinc-400">
                Chat interface will go here
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer section - placeholder for future links/info */}
      <footer className="border-t border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            A portfolio demo of an AI-powered Socratic math tutor
          </p>
        </div>
      </footer>
    </div>
  );
}
