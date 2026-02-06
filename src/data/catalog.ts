export type CatalogItem = {
  id: string;
  title: string;
  category: string;
  status: string;
  description: string;
  format: string;
};

export const catalog: CatalogItem[] = [
  {
    id: "alien-echoes",
    title: "Alien Echoes",
    category: "Recursive Corpus",
    status: "Launching",
    description:
      "A rigorous, speculative account of non-human civilizations and xeno-ethics.",
    format: "Hardcover, Digital",
  },
  {
    id: "echo-layer-atlas",
    title: "Echo-Layer Atlas",
    category: "Cognition",
    status: "In development",
    description:
      "A cartography of recursive memory systems and symbolic compression.",
    format: "Digital",
  },
  {
    id: "thermodynamic-ethics",
    title: "Thermodynamic Ethics",
    category: "Philosophy",
    status: "Prototype chapters",
    description: "An applied ethics of energy, culture, and civilizational agency.",
    format: "Hardcover",
  },
  {
    id: "mythotechnic-futures",
    title: "Mythotechnic Futures",
    category: "Speculative Culture",
    status: "Open calls",
    description:
      "Hybrid narratives and blueprints for future societies and symbolic systems.",
    format: "Digital",
  },
];
