"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button, buttonClasses } from "@/components/ui/button";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-4 py-24">
      <p className="font-meta text-[0.66rem] text-ink-3">Projector trouble</p>
      <h1 className="mt-4 font-poster text-[clamp(3rem,9vw,7rem)] text-oxblood">The film snapped.</h1>
      <p className="mt-6 max-w-lg font-serif text-[1.2rem] text-ink-2">
        Something went wrong on our side. Give it another go — if it keeps happening, call the box office.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button size="lg" onClick={() => retry()}>
          Try again
        </Button>
        <Link href="/" className={buttonClasses({ variant: "outline", size: "lg" })}>
          Home
        </Link>
      </div>
      {error.digest && <p className="mt-10 font-mono text-[0.75rem] text-ink-3">Reference {error.digest}</p>}
    </main>
  );
}
