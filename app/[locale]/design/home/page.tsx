import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Armchair,
  BedDouble,
  CalendarDays,
  Car,
  ChevronRight,
  CircleDot,
  Globe2,
  Instagram,
  Landmark,
  Leaf,
  Luggage,
  Mail,
  Map,
  MapPin,
  ShieldCheck,
  Sprout,
  TrainFront,
  Users,
  Wifi,
  Youtube,
} from "lucide-react";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Design Home Reference — fujiseat.com",
  description:
    "A screenshot-matched fujiseat.com home UI shell for design review.",
  robots: {
    index: false,
    follow: false,
  },
  other: {
    "agd-partner-manual-verification": "",
  },
};

const navItems = [
  ["Seat Checker", "/seat-checker"],
  ["Planner", "/planner"],
  ["Quiet Tokyo", "/quiet-tokyo"],
  ["Stay", "/areas-to-stay"],
  ["Essentials", "/guide"],
  ["Command Center", "/command-center"],
  ["About", "/about"],
] as const;

const featureCards = [
  {
    title: "Seat Checker",
    text: "Find Seat E for Mt. Fuji views on the Shinkansen.",
    icon: TrainFront,
    href: "/seat-checker",
  },
  {
    title: "Trip Planner",
    text: "Build your itinerary with routes and timings.",
    icon: CalendarDays,
    href: "/planner",
  },
  {
    title: "Quiet Tokyo",
    text: "Discover peaceful neighborhoods and spots.",
    icon: Landmark,
    href: "/quiet-tokyo",
  },
  {
    title: "Stay Areas",
    text: "Find the best places to stay for your trip.",
    icon: BedDouble,
    href: "/areas-to-stay",
  },
  {
    title: "Essentials",
    text: "Everything you need before and during your trip.",
    icon: Luggage,
    href: "/guide",
  },
] as const;

const popularLinks = [
  ["Shinkansen Seat Guide", Car],
  ["7-Day Itinerary", CalendarDays],
  ["Quiet Tokyo Areas", Leaf],
  ["eSIM for Japan", Wifi],
  ["Airport Transfer", Car],
] as const;

const routeStops = [
  {
    city: "Tokyo",
    text: "Start your adventure in Tokyo.",
    img: "/design-home-assets/route-tokyo.png",
  },
  {
    city: "Mt. Fuji View by Train",
    text: "Best seat, best view. Seat E is the Fuji side.",
    img: "/design-home-assets/route-fuji.png",
  },
  {
    city: "Kyoto",
    text: "Temples, gardens, and timeless streets.",
    img: "/design-home-assets/route-kyoto.png",
  },
  {
    city: "Osaka",
    text: "Food, energy, and easy day trips.",
    img: "/design-home-assets/route-osaka.png",
  },
] as const;

const quietAreas = [
  {
    title: "Kiyosumi Shirakawa",
    text: "Riverside calm, art museums, and coffee spots.",
    img: "/design-home-assets/quiet-kiyosumi.png",
  },
  {
    title: "Kuramae",
    text: "Craft, coffee, and a slow local vibe.",
    img: "/design-home-assets/quiet-kuramae.png",
  },
  {
    title: "Oshiage",
    text: "Skyline views with a local neighborhood feel.",
    img: "/design-home-assets/quiet-oshiage.png",
  },
] as const;

const essentials = [
  ["eSIM for Japan", "Get online the moment you land.", Wifi],
  ["Airport Transfer", "Book hassle-free airport rides.", Car],
  ["JR Pass Check", "See if a JR Pass fits your itinerary.", CircleDot],
  ["Travel Insurance", "Travel with peace of mind.", ShieldCheck],
] as const;

const trustItems = [
  ["Practical Local Tips", "Real insights from Tokyo and beyond.", MapPin],
  ["Calm & Scenic Routes", "Well-planned journeys with comfort in mind.", Sprout],
  ["Traveler-First Guidance", "Clear, practical, and easy to use.", Users],
  ["Independent & Honest", "Independent guidance to help you travel with confidence.", ShieldCheck],
] as const;

export default function DesignHomePage() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.logo} href="/">
            <span className={styles.logoMark} aria-hidden="true">
              <span />
            </span>
            <span>fujiseat.com</span>
          </Link>
          <nav className={styles.nav} aria-label="Primary navigation">
            {navItems.map(([label, href]) => (
              <Link key={label} href={href}>
                {label}
              </Link>
            ))}
          </nav>
          <div className={styles.lang}>
            <Globe2 size={20} strokeWidth={2.2} />
            <span>EN</span>
            <span className={styles.sep}>|</span>
            <span>日本語</span>
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <Image
          src="/design-home-assets/home-hero-train-fuji.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <h1>
              Plan Your Japan Trip —
              <br />
              From Mt. Fuji Seat to Stay
            </h1>
            <p>Smart tools, calm routes, and local tips from someone based in Tokyo.</p>
            <div className={styles.heroActions}>
              <Link className={`${styles.button} ${styles.primary}`} href="/seat-checker">
                <Armchair size={28} />
                <span>Start with Seat Checker</span>
              </Link>
              <Link className={styles.button} href="/planner">
                <Map size={27} />
                <span>Plan Your Trip</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className={styles.main}>
        <section className={`${styles.container} ${styles.featureGrid}`} aria-label="Core tools">
          {featureCards.map(({ title, text, icon: Icon, href }) => (
            <Link className={styles.featureCard} key={title} href={href}>
              <span className={styles.iconCircle}>
                <Icon size={35} strokeWidth={2.1} />
              </span>
              <h2>{title}</h2>
              <p>{text}</p>
            </Link>
          ))}
        </section>

        <section className={`${styles.container} ${styles.section}`}>
          <div className={styles.eyebrowRow}>
            <span className={styles.smallIcon}><CircleDot size={20} /></span>
            <h2>Popular Links</h2>
          </div>
          <div className={styles.pillGrid}>
            {popularLinks.map(([label, Icon]) => (
              <Link className={styles.pill} href="/guide" key={label}>
                <Icon size={22} />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className={`${styles.container} ${styles.section}`}>
          <div className={styles.sectionIntro}>
            <div className={styles.eyebrowRow}>
              <MapPin size={24} />
              <h2>Plan Your Route</h2>
            </div>
            <p>A classic journey. Designed with time, comfort, and views in mind.</p>
          </div>
          <div className={styles.routeRail}>
            {routeStops.map((stop, index) => (
              <div className={styles.routeUnit} key={stop.city}>
                <article className={styles.routeCard}>
                  <Image src={stop.img} alt="" width={350} height={210} />
                  <div className={styles.routeBody}>
                    <div className={styles.routeTitle}>
                      <MapPin size={22} />
                      <h3>{stop.city}</h3>
                    </div>
                    <p>{stop.text}</p>
                  </div>
                </article>
                {index < routeStops.length - 1 ? (
                  <div className={styles.connector} aria-hidden="true">
                    <span />
                    <TrainFront size={25} />
                    <strong>{index === 0 ? "~1.5 hr" : index === 1 ? "~2.5 hr" : "~30 min"}</strong>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className={`${styles.container} ${styles.section}`}>
          <div className={styles.centerTitle}>
            <div className={styles.eyebrowRow}>
              <Leaf size={22} />
              <h2>Quiet Tokyo Neighborhoods</h2>
            </div>
            <p>Local favorites for a calmer, more authentic Tokyo.</p>
          </div>
          <div className={styles.quietGrid}>
            {quietAreas.map((area) => (
              <Link className={styles.quietCard} href="/quiet-tokyo" key={area.title}>
                <Image src={area.img} alt="" width={558} height={210} />
                <div>
                  <h3>{area.title}</h3>
                  <p>{area.text}</p>
                </div>
                <ChevronRight className={styles.cardArrow} size={24} />
              </Link>
            ))}
          </div>
        </section>

        <section className={`${styles.container} ${styles.section}`}>
          <div className={styles.eyebrowRow}>
            <Luggage size={24} />
            <h2>Essentials Before You Land</h2>
          </div>
          <div className={styles.essentialsGrid}>
            {essentials.map(([title, text, Icon]) => (
              <Link className={styles.essentialCard} href="/guide" key={title}>
                <span className={styles.squareIcon}>
                  <Icon size={33} />
                </span>
                <span>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </span>
                <ChevronRight size={24} />
              </Link>
            ))}
          </div>
        </section>

        <section className={`${styles.container} ${styles.trustBand}`} aria-label="Why trust fujiseat.com">
          {trustItems.map(([title, text, Icon]) => (
            <div key={title}>
              <Icon size={38} />
              <span>
                <strong>{title}</strong>
                <small>{text}</small>
              </span>
            </div>
          ))}
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <Link className={styles.footerLogo} href="/">
              <span className={styles.logoMark} aria-hidden="true">
                <span />
              </span>
              <span>fujiseat.com</span>
            </Link>
            <p>Smart tools, calm routes, and local tips for your Japan trip.</p>
            <div className={styles.socials}>
              <Link href="/" aria-label="Instagram"><Instagram size={19} /></Link>
              <Link href="/" aria-label="YouTube"><Youtube size={19} /></Link>
              <Link href="/" aria-label="Email"><Mail size={18} /></Link>
            </div>
          </div>
          <FooterColumn title="Plan" items={["Seat Checker", "Planner", "Quiet Tokyo", "Stay Areas", "Essentials"]} />
          <FooterColumn title="Guides" items={["Shinkansen Seat Guide", "Itineraries", "Japan Rail Guide", "Packing List", "Travel Tips"]} />
          <FooterColumn title="Support" items={["FAQ", "Contact", "Command Center", "Site Updates"]} />
          <FooterColumn title="About" items={["About fujiseat.com", "Privacy Policy", "Terms of Use"]} />
          <form className={styles.newsletter}>
            <h2>Get Japan Trip Tips</h2>
            <p>Practical tips and updates from Tokyo.</p>
            <div>
              <input aria-label="Email address" placeholder="Your email address" />
              <button type="button">Subscribe</button>
            </div>
          </form>
        </div>
        <div className={styles.legal}>
          <span>This site contains affiliate links. If you make a purchase through them, I may earn a small commission at no extra cost to you.</span>
          <span>© 2025 fujiseat.com. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div className={styles.footerColumn}>
      <h2>{title}</h2>
      {items.map((item) => (
        <Link href="/" key={item}>
          {item}
        </Link>
      ))}
    </div>
  );
}
