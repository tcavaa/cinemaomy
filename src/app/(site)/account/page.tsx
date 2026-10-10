import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { Button, ButtonLink } from "@/components/ui/button";
import { signOut } from "@/features/auth/actions";
import { ProfileForm } from "@/features/auth/components/auth-forms";
import { isAdmin, requireUser } from "@/features/auth/session";
import { TicketRow } from "@/features/booking/components/ticket-row";
import { listUserTickets } from "@/features/booking/service";

export const metadata: Metadata = { title: "My tickets", robots: { index: false } };

export default function AccountPage({ searchParams }: PageProps<"/account">) {
  return (
    <div className="pb-24">
      <Suspense fallback={<Container className="py-24 font-meta text-[0.7rem] text-ink-3">Loading your tickets…</Container>}>
        <Account searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Account({ searchParams }: Pick<PageProps<"/account">, "searchParams">) {
  const [user, query] = await Promise.all([requireUser("/account"), searchParams]);
  const [tickets, admin] = await Promise.all([listUserTickets(user.id), isAdmin(user.id)]);

  const upcoming = tickets.filter((t) => t.upcoming).reverse();
  const past = tickets.filter((t) => !t.upcoming);

  return (
    <Container className="pt-12 lg:pt-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-meta text-[0.65rem] text-ink-3">{user.name ? `Hello, ${user.name.split(" ")[0]}` : "Your account"}</p>
          <h1 className="mt-3 font-poster text-[clamp(3.2rem,10vw,8.5rem)] text-oxblood">My tickets</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          {admin && (
            <ButtonLink href="/admin" variant="ink" size="sm" arrow>
              Cinema admin
            </ButtonLink>
          )}
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>

      {query.notice === "admin-only" && (
        <p role="alert" className="mt-6 border-l-2 border-vermilion pl-3 font-ui text-[0.95rem] text-vermilion">
          That area is for cinema staff. Ask an admin to give your account access.
        </p>
      )}

      <section aria-labelledby="upcoming" className="mt-12">
        <h2 id="upcoming" className="font-label text-[0.8rem] tracking-[0.14em] text-oxblood">
          Coming up
        </h2>
        {upcoming.length ? (
          <ul className="mt-5 flex flex-col gap-3">
            {upcoming.map((t) => (
              <TicketRow key={t.booking.id} view={t} />
            ))}
          </ul>
        ) : (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-6 border border-dashed border-ink/30 p-6">
            <p className="font-serif text-[1.2rem] text-ink-2">No tickets for upcoming screenings yet.</p>
            <ButtonLink href="/program" arrow size="sm">
              See the program
            </ButtonLink>
          </div>
        )}
        <p className="mt-4 font-ui text-[0.88rem] text-ink-3">
          Booked as a guest? Open your ticket link while signed in and choose &ldquo;Save to my account&rdquo;.
        </p>
      </section>

      {past.length > 0 && (
        <section aria-labelledby="past" className="mt-14">
          <h2 id="past" className="font-label text-[0.8rem] tracking-[0.14em] text-ink-3">
            Seen before
          </h2>
          <ul className="mt-5 flex flex-col gap-3">
            {past.map((t) => (
              <TicketRow key={t.booking.id} view={t} past />
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="details" className="mt-16 grid gap-10 border-t-2 border-ink pt-10 lg:grid-cols-[minmax(0,1fr)_28rem]">
        <div>
          <h2 id="details" className="font-poster text-[2.6rem] text-ink">Your details</h2>
          <p className="mt-3 max-w-md font-serif text-[1.1rem] text-ink-2">
            We use these to fill in your bookings. Want a new password?{" "}
            <Link href="/account/password" className="text-oxblood underline underline-offset-3">
              Change it here
            </Link>
            .
          </p>
        </div>
        <ProfileForm name={user.name} phone={user.phone} email={user.email} />
      </section>
    </Container>
  );
}
