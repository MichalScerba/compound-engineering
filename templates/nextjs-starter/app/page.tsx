import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Feature one",
    description: "Short description of what this feature does and why it matters.",
  },
  {
    title: "Feature two",
    description: "Short description of what this feature does and why it matters.",
  },
  {
    title: "Feature three",
    description: "Short description of what this feature does and why it matters.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-32 gap-6">
        <h1 className="text-5xl font-bold tracking-tight max-w-2xl">
          Your product headline goes here
        </h1>
        <p className="text-lg text-gray-500 max-w-xl">
          One or two sentences describing what your product does and who it is for.
        </p>
        <Button asChild size="lg">
          <Link href="/login">Get started</Link>
        </Button>
      </section>

      {/* Features */}
      <section className="px-4 py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-12">
            Why choose this?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col gap-2">
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col items-center text-center px-4 py-24 gap-4">
        <h2 className="text-3xl font-bold">Ready to get started?</h2>
        <p className="text-gray-500">No credit card required.</p>
        <Button asChild>
          <Link href="/login">Sign up free</Link>
        </Button>
      </section>
    </main>
  );
}
