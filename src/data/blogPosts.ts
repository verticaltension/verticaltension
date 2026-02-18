export type BlogContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "subheading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string };

export interface BlogCartItem {
  id: string;
  title: string;
  category: string;
  status: string;
  format: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  summary: string;
  author: string;
  publishedAt: string;
  readingTime: string;
  tags: string[];
  content: BlogContentBlock[];
  draftHref?: string;
  reviewCopyEmail?: string;
  cartItem?: BlogCartItem;
}

const BLOG_POSTS: BlogPost[] = [
  {
    slug: "alien-echoes-consolidated-overview",
    title: "Alien Echoes: Consolidated Overview",
    summary:
      "A consolidated synthesis of the original Alien Echoes landing material: non-human cognition, xeno-ethics, and symbolic survival under thermodynamic constraints.",
    author: "Vertical Tension Press",
    publishedAt: "2026-02-18",
    readingTime: "6 min read",
    tags: ["Recursive Corpus", "Xeno-Ethics", "Symbolic Intelligence"],
    draftHref: "/alien-echoes-draft1.pdf",
    reviewCopyEmail: "inquiries@verticaltension.com",
    cartItem: {
      id: "alien-echoes",
      title: "Alien Echoes",
      category: "Recursive Corpus",
      status: "Launching",
      format: "Hardcover, Digital",
    },
    content: [
      {
        type: "paragraph",
        text:
          "Alien Echoes is the first completed volume of the Recursive Corpus. Rather than projecting anthropocentric assumptions onto extraterrestrial life, it reconstructs plausible alien sociocognitive architectures from first principles.",
      },
      {
        type: "paragraph",
        text:
          "The framework treats intelligence as a constrained field function shaped by energy flow, information density, and transmissibility across symbolic layers. In this model, contact failure is often not physical distance but semantic misalignment.",
      },
      { type: "subheading", text: "Consolidated Abstract" },
      {
        type: "paragraph",
        text:
          "Alien Echoes models how civilizations encode value, memory, and continuity through phase shifts, collapse zones, and recursive drift. It integrates thermodynamic limits with semiotic recursion to evaluate which structures remain coherent under pressure.",
      },
      {
        type: "list",
        items: [
          "Emergent noetic fields across non-biological substrates",
          "Civilization wavefronts and glyphic cultural encoding",
          "Interstellar mythopoiesis and phase-stable ethical structures",
          "Symbolic extinction risks and memory-channel recovery",
        ],
      },
      { type: "subheading", text: "Core Threads" },
      {
        type: "list",
        items: [
          "Cosmological Premises: energy, information, and constraint modeling",
          "Ethical Architectures: phase-invariant morality across substrate shifts",
          "Signal Artifacts: echo-layer transmission, glyphic encoding, and memory",
          "Research Notes: documented assumptions and synthesis methodology",
        ],
      },
      {
        type: "quote",
        text:
          "Design coherence, or vanish into the silence.",
      },
    ],
  },
];

export function getBlogPosts(): BlogPost[] {
  return BLOG_POSTS.slice().sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
