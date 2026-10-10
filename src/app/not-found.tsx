import Link from "next/link";
import { Figure } from "@/components/brand/figure";
import { Wordmark } from "@/components/brand/wordmark";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="theme-dark relative flex min-h-dvh flex-col overflow-hidden bg-velvet px-4 text-cream sm:px-10">
      <Link href="/" aria-label="Cinema O'my — home" className="mt-8 w-fit">
        <Wordmark className="h-8" />
      </Link>
      <div className="flex flex-1 flex-col justify-center py-16">
        <p className="font-meta text-[0.66rem] text-smoke">Reel missing · 404</p>
        <h1 className="mt-4 font-poster text-[clamp(3.6rem,12vw,10rem)] text-cream">This scene was cut.</h1>
        <p className="mt-6 max-w-lg font-serif text-[1.25rem] text-cream/75">
          The page you were looking for isn&apos;t in this print. The program is still running, though.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/program" className={buttonClasses({ variant: "cream", size: "lg" })}>
            See the program
          </Link>
          <Link href="/" className={buttonClasses({ variant: "outline-cream", size: "lg" })}>
            Home
          </Link>
        </div>
      </div>
      <Figure className="pointer-events-none absolute -bottom-4 right-[8%] h-[38vh] text-[#b8352a]" />
    </main>
  );
}
