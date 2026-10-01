import type { Metadata } from 'next';
import Link from 'next/link';
import { Instrument_Serif } from 'next/font/google';
import { ArrowRight, Check, Hotel } from 'lucide-react';
import { BrowserFrame, PhoneFrame } from '@/components/landing/Frames';
import NavActions from '@/components/landing/NavActions';
import LandingPricing from '@/components/landing/LandingPricing';
import { pricingQuestions } from '@/components/billing/pricingFaq';
import dashboardShot from '@/components/landing/screens/dashboard.png';
import calendarShot from '@/components/landing/screens/calendar-month.png';
import walkInShot from '@/components/landing/screens/walk-in.png';
import roomsShot from '@/components/landing/screens/rooms.png';
import reservationsShot from '@/components/landing/screens/reservations.png';
import mobileManagerShot from '@/components/landing/screens/mobile-manager.png';
import mobileGuestShot from '@/components/landing/screens/mobile-guest.png';
import mobileRoomsShot from '@/components/landing/screens/mobile-rooms.png';

const display = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'Hotel Manager · Reservations, walk-ins and housekeeping for small hotels',
  description:
    'One place for reservations, walk-ins, rooms, housekeeping and payments, built for small hotels, hostels and guesthouses. Free plan, or 30 days of Pro with no card.',
};

const tokens = {
  '--paper': '#f6f3ed',
  '--paper-deep': '#ece6db',
  '--ink': '#14171f',
  '--muted': '#5c6270',
  '--rule': '#e2dbcf',
  '--accent': '#2563eb',
  '--accent-strong': '#1d4ed8',
} as React.CSSProperties;

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

const stayFlow = [
  { status: 'Booked', text: 'A guest books online or in the app, you take a phone booking, or someone walks in.' },
  { status: 'Confirmed', text: 'Confirm pending requests in one tap. Double bookings are blocked before they happen.' },
  { status: 'Checked in', text: 'Record a deposit or the full amount. Partly paid stays stay visible until they are settled.' },
  { status: 'Checked out', text: 'Express checkout takes the balance. The room moves to cleaning and housekeeping picks it up.' },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{children}</p>;
}

export default function LandingPage() {
  return (
    <div style={tokens} className={`${display.variable} min-h-screen bg-[var(--paper)] text-[var(--ink)] antialiased`}>
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-[var(--rule)]/70 bg-[var(--paper)]/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ink)] text-white">
              <Hotel className="h-4 w-4" aria-hidden="true" />
            </span>
            Hotel Manager
          </Link>
          <nav aria-label="Sections" className="hidden items-center gap-7 text-sm text-[var(--muted)] md:flex">
            {navLinks.map(link => (
              <a key={link.href} href={link.href} className="hover:text-[var(--ink)]">{link.label}</a>
            ))}
          </nav>
          <NavActions />
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[0.95fr_1.05fr] lg:gap-10 lg:pb-12 lg:pt-8">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[var(--rule)] bg-white/60 px-3 py-1 text-xs font-medium text-[var(--muted)]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                For small hotels, hostels and guesthouses
              </p>
              <h1 className="font-serif mt-6 text-[clamp(2.9rem,6vw,4.75rem)] leading-[0.98] tracking-[-0.01em]">
                Your front desk, <em className="text-[var(--accent)]">all in one</em> calm place.
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--muted)]">
                Reservations, walk-ins, rooms, housekeeping and payments, on the web and on your phone. Set it up in an afternoon.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/register-hotel"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-[var(--accent-strong)]"
                >
                  Start 30-day free trial <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a href="#features" className="rounded-full border border-[var(--ink)]/15 px-6 py-3 text-sm font-semibold hover:bg-white">
                  See what&apos;s inside
                </a>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--muted)]">
                {['No card needed', 'Free plan forever', 'Your data stays if you downgrade'].map(item => (
                  <li key={item} className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Bleeds past the right edge on wide screens so the screenshot stays readable */}
            <div className="relative pb-12 sm:pl-12 lg:-mr-48 lg:pl-8 xl:-mr-64">
              <BrowserFrame
                src={dashboardShot}
                alt="The hotel dashboard: today's check-ins and check-outs, and room status"
                priority
                sizes="(min-width: 1024px) 70vw, 100vw"
              />
              <PhoneFrame
                src={mobileManagerShot}
                alt="The mobile app's Today screen with occupancy, arrivals and departures"
                priority
                sizes="200px"
                className="absolute bottom-0 left-0 hidden w-[24%] max-w-[200px] sm:block lg:-left-6"
              />
            </div>
          </div>
        </section>

        {/* Built for */}
        <section aria-label="Who it is for" className="border-y border-[var(--rule)] bg-[var(--paper-deep)]/50">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-10 gap-y-3 px-4 py-6 text-sm sm:px-6">
            <p className="text-[var(--muted)]">Built for places with a handful of rooms, not a hundred</p>
            <ul className="flex flex-wrap gap-x-8 gap-y-2 font-serif text-2xl">
              {['Small hotels', 'Hostels', 'Guesthouses', 'Apartments'].map(type => <li key={type}>{type}</li>)}
            </ul>
          </div>
        </section>

        {/* Features bento */}
        <section id="features" className="scroll-mt-16 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <Eyebrow>Everything at the desk</Eyebrow>
              <h2 className="font-serif mt-4 text-5xl leading-[1.02] sm:text-6xl">The whole stay, from booking to clean sheets.</h2>
              <p className="mt-5 text-lg text-[var(--muted)]">Every screen below is the real app, running on a demo hotel.</p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-6">
              {/* Calendar: lead tile */}
              <article className="flex flex-col overflow-hidden rounded-3xl border border-[var(--rule)] bg-white md:col-span-4 md:row-span-2">
                <div className="p-8 pb-6">
                  <h3 className="text-xl font-semibold">Every booking on one calendar</h3>
                  <p className="mt-2 max-w-md text-[var(--muted)]">
                    Month, week, day, list and a per-room timeline. Filter by room or status, and start a new reservation from any day.
                  </p>
                </div>
                <div className="relative mt-auto flex-1 overflow-hidden border-t border-[var(--rule)] bg-[var(--paper)] min-h-[18rem]">
                  <BrowserFrame
                    src={calendarShot}
                    alt="September in month view, with each reservation labelled by room and guest"
                    sizes="(min-width: 768px) 60vw, 100vw"
                    className="absolute bottom-[-1px] left-6 right-[-2rem] sm:left-8"
                  />
                </div>
              </article>

              {/* Mobile */}
              <article className="flex flex-col overflow-hidden rounded-3xl bg-[var(--ink)] text-white md:col-span-2 md:row-span-2">
                <div className="p-8 pb-6">
                  <h3 className="text-xl font-semibold">The desk in your pocket</h3>
                  <p className="mt-2 text-white/70">
                    Every room by floor, colour-coded. Plus today&apos;s arrivals, walk-ins, bookings and tasks, all from your phone.
                  </p>
                </div>
                <div className="relative mt-auto h-80 overflow-hidden md:h-auto md:flex-1">
                  <PhoneFrame
                    src={mobileRoomsShot}
                    alt="The mobile Rooms screen with every room by floor and its status"
                    sizes="260px"
                    className="absolute left-1/2 top-0 w-[72%] max-w-[260px] -translate-x-1/2 border-white/15"
                  />
                </div>
              </article>

              {/* Walk-in */}
              <article className="overflow-hidden rounded-3xl border border-[var(--rule)] bg-white md:col-span-3">
                <div className="p-8 pb-6">
                  <h3 className="text-xl font-semibold">Walk-ins in four steps</h3>
                  <p className="mt-2 text-[var(--muted)]">Guest, room, price, confirm. A first name is all you need, and you can set the price on the spot.</p>
                </div>
                <div className="h-56 overflow-hidden border-t border-[var(--rule)] bg-[var(--paper)] pl-8 pt-6">
                  <BrowserFrame src={walkInShot} alt="The walk-in check-in steps next to the list of guests checked in" sizes="(min-width: 768px) 45vw, 100vw" className="w-[150%]" />
                </div>
              </article>

              {/* Rooms */}
              <article className="overflow-hidden rounded-3xl border border-[var(--rule)] bg-white md:col-span-3">
                <div className="p-8 pb-6">
                  <h3 className="text-xl font-semibold">Rooms that know their state</h3>
                  <p className="mt-2 text-[var(--muted)]">Available, occupied or cleaning at a glance. Nightly prices, and hourly ones for short stays.</p>
                </div>
                <div className="h-56 overflow-hidden border-t border-[var(--rule)] bg-[var(--paper)] pl-8 pt-6">
                  <BrowserFrame src={roomsShot} alt="The rooms list with type, price and status" sizes="(min-width: 768px) 45vw, 100vw" className="w-[150%]" />
                </div>
              </article>

              {/* Smaller text tiles */}
              {[
                { title: 'Housekeeping', text: 'Generate the day’s tasks from checkouts, assign them to staff and mark rooms clean.' },
                { title: 'Payments', text: 'Deposits, partial payments and refunds in one ledger, so you always know what is still owed.' },
                { title: 'Reports', text: 'Revenue, occupancy, cancellations, no-shows and daily reconciliation, with export.' },
              ].map(tile => (
                <article key={tile.title} className="rounded-3xl border border-[var(--rule)] bg-white/60 p-8 md:col-span-2">
                  <h3 className="font-serif text-3xl">{tile.title}</h3>
                  <p className="mt-3 text-[var(--muted)]">{tile.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How a stay flows */}
        <section id="how-it-works" className="scroll-mt-16 border-t border-[var(--rule)] bg-white py-24 sm:py-32">
          <div className="mx-auto grid max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <Eyebrow>How it works</Eyebrow>
              <h2 className="font-serif mt-4 text-5xl leading-[1.02] sm:text-6xl">One stay, four statuses, nothing on paper.</h2>
              <ol className="mt-10 space-y-0">
                {stayFlow.map((step, i) => (
                  <li key={step.status} className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-[var(--rule)] py-5 last:border-b">
                    <span className="font-serif text-3xl leading-none text-[var(--accent)]">{i + 1}</span>
                    <div>
                      <p className="font-semibold">{step.status}</p>
                      <p className="mt-1 text-[var(--muted)]">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <BrowserFrame
              src={reservationsShot}
              alt="The reservations list with confirmed, checked-in, checked-out and pending stays and their payment state"
              sizes="(min-width: 1024px) 55vw, 100vw"
            />
          </div>
        </section>

        {/* Guests book directly */}
        <section className="overflow-hidden py-24 sm:py-32">
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
            <div className="relative order-2 mx-auto flex w-full max-w-md justify-center lg:order-1">
              <div className="absolute inset-x-6 bottom-6 top-16 rounded-[3rem] bg-[var(--paper-deep)]" aria-hidden="true" />
              <PhoneFrame src={mobileGuestShot} alt="The guest app: search by city, pick dates and see free rooms and prices" sizes="280px" className="relative aspect-[9/13] w-[62%] max-w-[280px] -rotate-2" imageClassName="h-full object-cover object-top" />
            </div>
            <div className="order-1 lg:order-2">
              <Eyebrow>For your guests</Eyebrow>
              <h2 className="font-serif mt-4 text-5xl leading-[1.02] sm:text-6xl">Let guests book themselves.</h2>
              <p className="mt-5 max-w-lg text-lg text-[var(--muted)]">
                Guests make an account, see which rooms are free for their dates and book. Their request lands in your reservations, ready to confirm.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  'Overnight stays or a few hours, at the prices you set',
                  'Their trips in one list, and cancelling if plans change',
                  'On the web and in the mobile app',
                ].map(item => (
                  <li key={item} className="flex gap-3">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-16 border-t border-[var(--rule)] bg-[var(--paper-deep)]/50 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-xl">
                <Eyebrow>Pricing</Eyebrow>
                <h2 className="font-serif mt-4 text-5xl leading-[1.02] sm:text-6xl">Priced for a small place.</h2>
                <p className="mt-5 text-lg text-[var(--muted)]">Start free and stay free if it&apos;s enough. Upgrade when you add rooms or staff.</p>
              </div>
            </div>
            <div className="mt-10">
              <LandingPricing />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-16 py-24 sm:py-32">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <Eyebrow>Questions</Eyebrow>
              <h2 className="font-serif mt-4 text-5xl leading-[1.02]">Before you sign up</h2>
            </div>
            <div className="divide-y divide-[var(--rule)] border-y border-[var(--rule)]">
              {pricingQuestions.map(item => (
                <details key={item.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span className="text-2xl leading-none text-[var(--muted)] transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="mt-3 max-w-2xl text-[var(--muted)]">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="px-4 pb-6 sm:px-6">
          <div className="mx-auto max-w-6xl rounded-[2rem] bg-[var(--ink)] px-6 py-20 text-center text-white sm:px-12">
            <h2 className="font-serif mx-auto max-w-3xl text-5xl leading-[1.02] sm:text-6xl">
              Less time on bookings. <em className="text-[#93b4ff]">More time with guests.</em>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-white/70">Every feature free for 30 days. No card, and nothing is deleted if you stop.</p>
            <Link
              href="/register-hotel"
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-[var(--ink)] hover:bg-white/90"
            >
              Start your free trial <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-10 text-sm text-[var(--muted)] sm:px-6">
        <p className="flex items-center gap-2 font-medium text-[var(--ink)]">
          <Hotel className="h-4 w-4" aria-hidden="true" /> Hotel Manager
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-6">
          {navLinks.map(link => <a key={link.href} href={link.href} className="hover:text-[var(--ink)]">{link.label}</a>)}
          <Link href="/login" className="hover:text-[var(--ink)]">Sign in</Link>
        </nav>
      </footer>
    </div>
  );
}
