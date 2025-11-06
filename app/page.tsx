import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Award, Users, TrendingUp, CheckCircle2, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span className="text-xl font-bold">Modern LMS</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/courses">
              <Button variant="ghost">Courses</Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
              Learn. Practice. Excel.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Master AWS, Azure, ISTQB, and more with our comprehensive learning platform.
              Expert-led courses, hands-on practice, and real certifications.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="h-12">
                  Start Learning Free
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline" className="h-12">
                  Browse Courses
                </Button>
              </Link>
            </div>
            
            <div className="mt-10 flex justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>1000+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>50+ Courses</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Expert Instructors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Why Choose Modern LMS?</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<BookOpen className="h-10 w-10" />}
              title="Expert Content"
              description="Learn from industry experts with real-world experience"
            />
            <FeatureCard
              icon={<Award className="h-10 w-10" />}
              title="Certifications"
              description="Get recognized certificates upon course completion"
            />
            <FeatureCard
              icon={<Users className="h-10 w-10" />}
              title="Community"
              description="Join thousands of learners and share knowledge"
            />
            <FeatureCard
              icon={<TrendingUp className="h-10 w-10" />}
              title="Track Progress"
              description="Monitor your learning journey with detailed analytics"
            />
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="bg-gray-50 py-20">
        <div className="container px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Popular Categories</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <CategoryCard name="AWS Certification" courses={15} />
            <CategoryCard name="Azure Certification" courses={12} />
            <CategoryCard name="ISTQB Testing" courses={8} />
            <CategoryCard name="DevOps" courses={10} />
            <CategoryCard name="Cloud Architecture" courses={7} />
            <CategoryCard name="Software Development" courses={20} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container px-4">
          <div className="rounded-lg bg-blue-600 px-6 py-16 text-center text-white">
            <h2 className="text-3xl font-bold">Ready to Start Learning?</h2>
            <p className="mt-4 text-lg opacity-90">
              Join thousands of students already learning on Modern LMS
            </p>
            <Link href="/sign-up">
              <Button size="lg" variant="secondary" className="mt-8 h-12">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Modern LMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 rounded-lg bg-blue-50 p-3 text-blue-600">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function CategoryCard({ name, courses }: { name: string; courses: number }) {
  return (
    <Link href={`/courses?category=${name.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="group cursor-pointer rounded-lg border bg-white p-6 transition-all hover:border-blue-500 hover:shadow-lg">
        <h3 className="text-lg font-semibold group-hover:text-blue-600">{name}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{courses} courses</p>
        <div className="mt-4 flex items-center gap-1 text-yellow-500">
          <Star className="h-4 w-4 fill-current" />
          <span className="text-sm font-medium text-gray-900">4.8</span>
        </div>
      </div>
    </Link>
  );
}
