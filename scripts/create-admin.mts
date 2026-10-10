/**
 * Creates (or promotes) an admin account.
 *
 *   npm run admin:create -- you@example.com
 *
 * - If the email has no account yet, you'll be asked for a password and the
 *   account is created through Supabase Auth, then marked as confirmed.
 * - If the account exists, it is simply given admin rights.
 */
import { createClient } from "@supabase/supabase-js";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import postgres from "postgres";

const url = process.env.DATABASE_URL_SESSION ?? process.env.DATABASE_URL;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !supabaseUrl || !supabaseKey) {
  console.error("Missing DATABASE_URL / NEXT_PUBLIC_SUPABASE_* — run with --env-file=.env.local");
  process.exit(1);
}

const sql = postgres(url, { prepare: false, max: 1 });
const rl = createInterface({ input, output });

async function findUser(email: string) {
  const [user] = await sql<{ id: string; email: string; confirmed: boolean }[]>`
    select id, email, email_confirmed_at is not null as confirmed
    from auth.users where lower(email) = ${email} limit 1`;
  return user;
}

try {
  const email = (process.argv[2] ?? (await rl.question("Admin email: "))).trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("That doesn't look like an email address.");

  let user = await findUser(email);
  if (!user) {
    const password = (await rl.question("Choose a password (min 8 characters): ")).trim();
    if (password.length < 8) throw new Error("Password must be at least 8 characters.");
    const name = (await rl.question("Your name (optional): ")).trim();

    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name || null } } });
    if (error) console.warn(`Supabase said: ${error.message} — checking whether the account was created anyway…`);

    user = await findUser(email);
    if (!user) throw new Error("The account could not be created. Check Authentication → Sign-ups in Supabase.");
  }

  if (!user.confirmed) {
    await sql`update auth.users set email_confirmed_at = now() where id = ${user.id}`;
  }
  await sql`insert into public.admins (user_id, email) values (${user.id}, ${user.email}) on conflict (user_id) do nothing`;

  console.log(`\n✓ ${user.email} is an admin. Sign in at /login and open /admin.`);
} catch (error) {
  console.error(`\n✗ ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
} finally {
  rl.close();
  await sql.end();
}
