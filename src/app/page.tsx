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
            Math Tutor
          </h1>
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold text-balance text-foreground">
            Stop memorizing. Start understanding.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            An AI tutor that finds gaps in your foundation, helps you fill them, and builds real understanding from the ground up.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8">
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
        </div>
      </section>

      {/* The Problem Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            Most math help just gives you answers
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Other Tools */}
            <Card className="p-6 bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50">
              <div className="flex items-start gap-3 mb-4">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-1" />
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
            <Card className="p-6 bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900/50">
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0 mt-1" />
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
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">How it works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 - Finds Your Gaps */}
            <Card className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Network className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-xl font-semibold text-foreground">Finds Your Gaps</h4>
              <p className="text-muted-foreground text-pretty">
                Struggling with fractions? We trace back to find exactly what you're missing - maybe division from 4th grade - so you can fix it at the root.
              </p>
            </Card>

            {/* Feature 2 - Practice & Reinforcement */}
            <Card className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-xl font-semibold text-foreground">Practice & Reinforcement</h4>
              <p className="text-muted-foreground text-pretty">
                Practice the specific prerequisite skills you need. Build a solid foundation before tackling the harder stuff.
              </p>
            </Card>

            {/* Feature 3 - Guided Learning */}
            <Card className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-xl font-semibold text-foreground">Guided Learning</h4>
              <p className="text-muted-foreground text-pretty">
                Once your foundation is solid, work through problems with questions that help you discover the answer - no spoon-feeding.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <Card className="p-8 bg-gradient-to-br from-blue-50 to-zinc-50 dark:from-blue-950/30 dark:to-zinc-900/30">
            <p className="text-xl md:text-2xl text-foreground font-medium text-balance">
              Perfect for middle school students who want to actually understand math, not just get through homework.
            </p>
          </Card>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-16 pb-24">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground">Ready to learn differently?</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8">
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
