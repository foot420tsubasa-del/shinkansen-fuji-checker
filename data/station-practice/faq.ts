export type FaqItem = {
  question: string;
  answer: string;
};

export const faqItems: FaqItem[] = [
  {
    question: "Is this an official station map?",
    answer:
      "No. This is a practice simulator inspired by the layout style of large Japanese stations. It is not affiliated with any railway operator and does not reproduce official station maps.",
  },
  {
    question: "Do I need to install anything?",
    answer:
      "No. Tokyo Mega Station Practice runs in your browser. Just open the practice page and start a mission.",
  },
  {
    question: "Will this work on my phone?",
    answer:
      "Yes. The interface is designed to be readable and usable on both desktop and mobile screens.",
  },
  {
    question: "Is this free?",
    answer:
      "Yes. The MVP is free to use. It is being built as a future feature of fujiseat.com to help travelers feel more prepared before arriving in Japan.",
  },
  {
    question: "Will the missions teach me real station layouts?",
    answer:
      "The missions teach the patterns: choose the city side first, follow transfer signs (not exit signs), trust posted walking times, and follow the airport icon for airport trains. These patterns apply across most large Japanese stations.",
  },
];
