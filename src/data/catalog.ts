export type CatalogItem = {
  id: string;
  title: string;
  subtitle?: string;
  volumeLabel?: string;
  category: string;
  status: string;
  description: string;
  format: string;
  payhipProductKey?: string;
};

export const catalog: CatalogItem[] = [
  {
    id: "theoretical-sciences-vol1",
    title: "Theoretical Sciences",
    subtitle: "The Complete Concrete Concepts",
    volumeLabel: "Volume I: Materials Science — Advanced Materials — Part I",
    category: "Theoretical Sciences",
    status: "Launching",
    description:
      "Concrete foundations of materials science within the Recursive Corpus framework of scientific inquiry.",
    format: "Paperback · Hardcover · E-book · Audiobook",
  },
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
    id: "thermodynamic-ethics",
    title: "Thermodynamic Ethics",
    category: "Philosophy",
    status: "Prototype chapters",
    description: "An applied ethics of energy, culture, and civilizational agency.",
    format: "Hardcover",
  },
];
