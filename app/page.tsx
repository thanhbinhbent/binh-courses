import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ThemeToggle } from "@/components/theme-toggle";
import { BookOpen, Award, Users, TrendingUp, CheckCircle2, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="w-full border-b bg-card/50 backdrop-blur-sm">
        <Container className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Modern LMS</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/courses">
              <Button variant="ghost">Courses</Button>
            </Link>
            <Link href="/quizzes">
              <Button variant="ghost">Quizzes</Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
            <ThemeToggle />
          </nav>
        </Container>
      </header>

      {/* Hero Section */}
      <section className="flex-1 bg-gradient-to-br from-background via-secondary/20 to-primary/10 py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
              Learn. Practice. Excel.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Master AWS, Azure, ISTQB, and more with our comprehensive learning platform.
              Expert-led courses, hands-on practice, and real certifications.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="h-12 w-full sm:w-auto">
                  Start Learning Free
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline" className="h-12 w-full sm:w-auto">
                  Browse Courses
                </Button>
              </Link>
            </div>
            
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span>1000+ Students</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span>50+ Courses</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span>Expert Instructors</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <Container>
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
        </Container>
      </section>

      {/* Popular Categories */}
      <section className="bg-secondary/20 py-20">
        <Container>
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Popular Categories</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <CategoryCard name="AWS Certification" courses={15} />
            <CategoryCard name="Azure Certification" courses={12} />
            <CategoryCard name="ISTQB Testing" courses={8} />
            <CategoryCard name="DevOps" courses={10} />
            <CategoryCard name="Cloud Architecture" courses={7} />
            <CategoryCard name="Software Development" courses={20} />
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <Container>
          <div className="rounded-lg bg-primary px-6 py-16 text-center text-primary-foreground">
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
        </Container>
      </section>

      {/* Footer */}
      <footer className="w-full border-t py-8">
        <Container className="text-center text-sm text-muted-foreground">
          <p>© 2025 Modern LMS. All rights reserved.</p>
        </Container>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
      <div className="mb-4 rounded-lg bg-primary/10 p-3 text-primary">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function CategoryCard({ name, courses }: { name: string; courses: number }) {
  return (
    <Link href={`/courses?category=${name.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="group cursor-pointer rounded-lg border bg-card p-6 transition-all hover:border-primary hover:shadow-lg">
        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">{name}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{courses} courses</p>
        <div className="mt-4 flex items-center gap-1 text-warning">
          <Star className="h-4 w-4 fill-current" />
          <span className="text-sm font-medium text-foreground">4.8</span>
        </div>
      </div>
    </Link>
  );
}
