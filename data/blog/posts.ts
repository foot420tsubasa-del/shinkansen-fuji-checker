/**
 * Blog posts: the long-form answers that the tools leave out.
 *
 * Words live here, not in the tools (the site's rule since 2026-11-15: tools
 * and visuals on screen, prose in the blog). Each post answers a question
 * around the Mt. Fuji seat that /guide does not, and links back to it rather
 * than competing for "which side" searches.
 */

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "steps"; items: { title: string; text: string }[] }
  | { type: "timing" }
  | { type: "booking" }
  | { type: "note"; text: string };

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  /** ISO dates. */
  published: string;
  updated: string;
  heroImage: { src: string; alt: string; illustrative: boolean };
  tldr: string[];
  sections: { heading: string; blocks: BlogBlock[] }[];
  faq: { q: string; a: string }[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "seat-e-sold-out-mt-fuji",
    title: "Seat E Sold Out? How to Still See Mt. Fuji From the Shinkansen",
    description:
      "No window seat on the Mt. Fuji side? Seat D, the door window, another train or the non-reserved cars still get you the view. A Japan-based local's guide, with the minutes to be ready and how to photograph it through the glass.",
    published: "2026-11-15",
    updated: "2026-11-15",
    heroImage: {
      src: "/images/hero/window-fuji-winter-wide.webp",
      alt: "Snow-capped Mt. Fuji seen through a Shinkansen window",
      illustrative: true,
    },
    tldr: [
      "Take Seat D. It is on the same side as Seat E, so you see Mt. Fuji past the window passenger.",
      "Or stand at the door window at the end of the car, on the Mt. Fuji side, for the few minutes it is in view.",
      "Try another train: a later Nozomi, or a Hikari, often still has Seat E.",
      "At a ticket office you can ask for the seat by letter: “E-seki, onegai shimasu.”",
    ],
    sections: [
      {
        heading: "First, which side you need",
        blocks: [
          {
            type: "p",
            text: "Mt. Fuji is on the right going from Tokyo to Kyoto or Osaka, and on the left coming back. In the standard cars, which are three seats and two, the window on that side is Seat E in both directions. Everything below is about getting a view when that one seat is gone.",
          },
        ],
      },
      {
        heading: "Five ways to see it without Seat E",
        blocks: [
          {
            type: "steps",
            items: [
              {
                title: "Book Seat D",
                text: "Seat D is the aisle seat on the two-seat side — the same side as Seat E. You look past one passenger instead of across the whole car, and for the few minutes Mt. Fuji is in view that is usually enough.",
              },
              {
                title: "Use the door window at the end of the car",
                text: "Every car has doors at each end with windows on both sides. Step out to the deck on the Mt. Fuji side a few minutes before it appears and watch from there. Keep the doorway clear and you will not be in anyone's way.",
              },
              {
                title: "Pick a different train",
                text: "Seat E goes first on the most popular departures. The next Nozomi, ten or twenty minutes later, often still has it, and so does a Hikari, which stops a little more but follows the same line past Mt. Fuji.",
              },
              {
                title: "Ask at the ticket office",
                text: "Staff at a JR ticket office can choose a specific seat for you. Say “E-seki, onegai shimasu” (E seat, please) or show the letter E on your phone.",
              },
              {
                title: "Try the non-reserved cars",
                text: "On most days the Nozomi has non-reserved cars (cars 1–3). Line up early at their marked spot on the platform and you can choose a Seat E yourself. During the New Year, Golden Week and Obon holidays the Nozomi runs fully reserved, so this does not work then.",
              },
            ],
          },
        ],
      },
      {
        heading: "When to be at the window",
        blocks: [
          {
            type: "p",
            text: "Mt. Fuji is in view for about eight minutes on a Nozomi, largest as the train passes Shin-Fuji Station. Be in place a little before the window opens:",
          },
          { type: "timing" },
          {
            type: "note",
            text: "Times are for a Nozomi; a Hikari or Kodama runs later. The seat checker on the homepage turns your departure time into a calendar alert five minutes before the view opens.",
          },
        ],
      },
      {
        heading: "How to photograph it through the glass",
        blocks: [
          {
            type: "list",
            items: [
              "Hold your phone or lens right up against the window. Most reflections come from the gap between the lens and the glass.",
              "Cup your hand, or a dark scarf, around the lens to block reflections from inside the car.",
              "Turn the flash off.",
              "Tap the mountain to focus, so the camera does not focus on the glass or on raindrops.",
              "Use burst mode and start a little early: noise barriers and poles flash past, and one frame in a burst will be clear.",
              "Mornings are clearest. In December and January, nearly half of mornings over this stretch are clear.",
            ],
          },
        ],
      },
      {
        heading: "In the Green Car",
        blocks: [
          {
            type: "p",
            text: "The Green Car has four seats across, A–B and C–D, and the window on the Mt. Fuji side is Seat D. The same tricks apply if it is taken: the aisle seat next to it, or the door window.",
          },
        ],
      },
      {
        heading: "Still need a ticket?",
        blocks: [{ type: "booking" }],
      },
    ],
    faq: [
      {
        q: "Can you see Mt. Fuji from Seat D on the Shinkansen?",
        a: "Yes. Seat D is on the same side as Seat E in the standard cars, so you see Mt. Fuji past the window passenger. It is the next best seat when E is sold out.",
      },
      {
        q: "Is it OK to stand by the door to take photos of Mt. Fuji?",
        a: "Yes. Standing in the deck area at the end of the car is normal on the Shinkansen. Keep the doorway clear and move aside when people need to pass.",
      },
      {
        q: "How long is Mt. Fuji visible from the Shinkansen?",
        a: "About eight minutes on a Nozomi. Going west it opens about 40 minutes after Tokyo and is largest at about 45, passing Shin-Fuji Station.",
      },
      {
        q: "Which side of the Shinkansen is Mt. Fuji on?",
        a: "The right side from Tokyo to Kyoto or Osaka, and the left side from Kyoto or Osaka to Tokyo. In standard cars that is Seat E in both directions.",
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
