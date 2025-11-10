import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageCircle, Network, TrendingUp, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            MathFoundry
          </h1>
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* AI Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 border border-green-500/30 bg-green-500/10 text-green-400 px-4 py-2 rounded-full text-sm font-medium">
              AI-Powered Math Learning
            </div>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-balance text-foreground">
            Stop memorizing. Start <span className="text-green-500">understanding</span>.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            An AI tutor that finds gaps in your <span className="text-green-500 font-medium">foundation</span>, helps you fill them, and builds real understanding from the ground up.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8 bg-green-600 hover:bg-green-700 text-white">
                Start Learning
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="lg" className="text-lg">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Hero Visual - Chat Interface Mockup */}
          {/* Commented out to save space and test process flow section
          <div className="mt-12">
            <Card className="p-6 max-w-2xl mx-auto shadow-xl bg-white/80 backdrop-blur dark:bg-zinc-900/80">
              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-blue-100 text-blue-900 rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs dark:bg-blue-900/30 dark:text-blue-100">
                    <p className="text-sm">How do I solve: If x + 5 = 12, what is x?</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 max-w-md">
                    <p className="text-sm text-foreground">
                      Great question! Before we solve it, let's think about what information we have. What does this
                      equation tell us?
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-blue-100 text-blue-900 rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs dark:bg-blue-900/30 dark:text-blue-100">
                    <p className="text-sm">That x plus 5 equals 12?</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 max-w-md">
                    <p className="text-sm text-foreground">
                      Exactly! So if we want to find x by itself, what operation could we do to both sides of the
                      equation?
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          */}
        </div>
      </section>

      {/* Process Flow Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Step 1: Identify Gaps */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3" strokeWidth="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4M2 12h4m12 0h4" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground">Identify Gaps</h3>
            </div>

            {/* Step 2: Build Foundation */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground">Build Foundation</h3>
            </div>

            {/* Step 3: Practice */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground">Practice</h3>
            </div>

            {/* Step 4: Master Concepts */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground">Master Concepts</h3>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            Most math help just gives you answers
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Other Tools */}
            <Card className="p-6 bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50 shadow-lg shadow-red-500/10">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h4 className="text-xl font-semibold text-foreground">Other Tools</h4>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <p>Solve the problem for you</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <p>You copy the answer</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <p>You still don't understand</p>
                </div>
              </div>
            </Card>

            {/* This Tutor */}
            <Card className="p-6 bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900/50 shadow-lg shadow-green-500/20">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="text-xl font-semibold text-foreground">This Tutor</h4>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <p>Finds what you're missing</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <p>Fills your knowledge gaps</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <p>You master the fundamentals</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">How it works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 - Finds Your Gaps */}
            <Card className="p-6 text-center space-y-4 transition-transform hover:scale-105">
              <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Network className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="text-xl font-semibold text-foreground">Finds Your Gaps</h4>
              <p className="text-muted-foreground text-pretty">
                Struggling with fractions? We trace back to find exactly what you're <span className="text-green-500 font-medium">missing</span> - maybe division from 4th grade - so you can fix it at the <span className="text-green-500 font-medium">root</span>.
              </p>
            </Card>

            {/* Feature 2 - Practice & Reinforcement */}
            <Card className="p-6 text-center space-y-4 transition-transform hover:scale-105">
              <div className="w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="text-xl font-semibold text-foreground">Practice & Reinforcement</h4>
              <p className="text-muted-foreground text-pretty">
                Practice the specific <span className="text-green-500 font-medium">prerequisite skills</span> you need. Build a solid <span className="text-green-500 font-medium">foundation</span> before tackling the harder stuff.
              </p>
            </Card>

            {/* Feature 3 - Guided Learning */}
            <Card className="p-6 text-center space-y-4 transition-transform hover:scale-105">
              <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-xl font-semibold text-foreground">Guided Learning</h4>
              <p className="text-muted-foreground text-pretty">
                Once your foundation is solid, work through problems with questions that help you <span className="text-green-500 font-medium">discover</span> the answer - no spoon-feeding.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <Card className="p-8 bg-gradient-to-br from-blue-50 to-zinc-50 dark:from-blue-950/30 dark:to-zinc-900/30">
            <p className="text-xl md:text-2xl text-foreground font-medium text-balance">
              Perfect for middle school students who want to actually <span className="text-green-500">understand</span> math, not just get through homework.
            </p>
          </Card>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-12 pb-20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground">Ready to learn differently?</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8 bg-green-600 hover:bg-green-700 text-white">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
