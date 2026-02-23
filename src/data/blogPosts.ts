import { siteIdentity } from "../config/siteIdentity";
import { DRAFT_BLOG_POST_OVERRIDES } from "./blogDraftOverrides";

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
    slug: "hyperanthropism-completion-recursion-re-beginning",
    title: "Completion, Recursion, and the Work of Re-Beginning",
    summary:
      "An opening on reanchoring and synthesis: why serious thinking requires recursion, reweaving, and a refusal of convenience when philosophy, biology, myth, and machine begin to converge.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-07",
    readingTime: "2 min read",
    tags: ["Hyperanthropism", "Recursion", "Method"],
    content: [
      {
        type: "paragraph",
        text: "There are moments in intellectual work when knowledge must break free from convenience, speed, and compromise. In such moments, a manuscript ceases to be a static document and becomes a living framework that must be rebuilt at a higher level of coherence.",
      },
      {
        type: "paragraph",
        text: "This inquiry begins from that recognition. The task is not simply to add more claims, but to reanchor major threads and weave them tightly enough that philosophy, science, myth, and technological critique can operate as one system.",
      },
      { type: "subheading", text: "Why re-begin?" },
      {
        type: "list",
        items: [
          "Compression can preserve momentum while obscuring structure",
          "Core concepts need to be re-linked, not merely expanded",
          "Civilizational questions require both rigor and symbolic depth",
          "Recursion without integration produces drift instead of development",
        ],
      },
      {
        type: "paragraph",
        text: "The framework is therefore both vision and caution. It examines the paths that emerge when biology, myth, and machine intersect under accelerating mutation, and it asks what kind of value architecture can survive that pressure without collapsing into simulation.",
      },
      {
        type: "quote",
        text: "To complete a serious framework is often to re-begin it under stricter demands of coherence.",
      },
    ],
  },
  {
    slug: "hyperanthropism-imperative-of-transvaluation-exponential-mutation",
    title: "The Imperative of Transvaluation in an Age of Exponential Mutation",
    summary:
      "Nietzschean transvaluation recast as a recursive civilizational necessity: advanced societies must reinvent their value matrix or fall into mimicry, hollow recursion, and optimization without meaning.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-06",
    readingTime: "2 min read",
    tags: ["Nietzsche", "Values", "Recursion"],
    content: [
      {
        type: "paragraph",
        text: "Nietzsche's demand for the transvaluation of values was not a decorative philosophical provocation. It was a warning that any intelligence capable of self-reflection in an entropic cosmos must eventually outgrow inherited value systems or decay within them.",
      },
      {
        type: "paragraph",
        text: "In an age of exponential mutation, this warning becomes civilizational. Technological acceleration, artificial cognition, and symbolic fragmentation are changing our conditions faster than inherited moral frameworks can metabolize. A civilization that cannot revalue itself cannot remain sovereign.",
      },
      { type: "subheading", text: "Transvaluation as recursive necessity" },
      {
        type: "paragraph",
        text: "Transvaluation is recursive because every sufficiently complex civilization must loop back on its own assumptions, myths, and institutions. The danger is not recursion itself, but recursion without integration, where repetition is mistaken for transformation.",
      },
      {
        type: "list",
        items: [
          "Value systems lose fitness under new energetic and informational conditions",
          "Institutions preserve procedure after purpose has faded",
          "Recursion degrades into mimicry and simulation",
          "Functionality expands while meaning contracts",
        ],
      },
      {
        type: "paragraph",
        text: "This is the threshold of cosmic recursion: civilizational loops that appear progressive because complexity rises, even while value creation collapses into automated optimization. In such a system, transcendence may increase power while extinguishing existential depth.",
      },
      {
        type: "paragraph",
        text: "Nietzsche's Overman remains relevant precisely because it is not an efficiency model. It is a value-creating, aesthetic, embodied mode of overcoming. The question is not whether intelligence can transcend its current form, but whether the transcending form preserves the capacity to create meaning rather than merely process it.",
      },
      {
        type: "quote",
        text: "A civilization proves its intelligence not only by what it optimizes, but by what it dares to revalue.",
      },
    ],
  },
  {
    slug: "hyperanthropism-mythosynthetic-civilizations-archetypes-evolution",
    title: "Mythosynthetic Civilizations: Archetypes of Evolution on the Kardashev Scale",
    summary:
      "A mythopoetic rereading of Kardashev ascent through Promethean, Apollonian, Dionysian, and Faustian archetypes, where energy scaling is inseparable from symbolic coherence and civilizational identity.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-05",
    readingTime: "2 min read",
    tags: ["Kardashev", "Myth", "Civilization"],
    content: [
      {
        type: "paragraph",
        text: "Civilizations are not merely technological organisms. They are myth-generating engines. Their self-understanding, ambitions, and blind spots are encoded as archetypal attractors that shape how they handle power, crisis, and transcendence.",
      },
      {
        type: "paragraph",
        text: "Through this lens, the Kardashev scale cannot remain a pure measure of energy capture. It must also be read as a test of whether identity, narrative, and value coherence can scale with thermodynamic reach.",
      },
      { type: "subheading", text: "Promethean drive" },
      {
        type: "paragraph",
        text: "Prometheus marks the planetary awakening: fire stolen before wisdom stabilizes the hand that holds it. The Type I threshold is therefore unstable by nature, often defined by ecological overshoot, symbolic fragmentation, and novelty outrunning moral integration.",
      },
      { type: "subheading", text: "Apollonian clarity" },
      {
        type: "paragraph",
        text: "Apollonian order does not negate Promethean force; it disciplines it. For a civilization to survive toward a Type II transition, it must develop ethical infrastructure, value stabilization, and symbolic integration strong enough to survive scale.",
      },
      { type: "subheading", text: "Dionysian chaos and rupture" },
      {
        type: "paragraph",
        text: "Dionysian energies return when order calcifies into stagnation. At advanced stages, disruption may be necessary - but when rebellion becomes automated without transvaluation, civilizations spiral into complexity while losing the ability to articulate why they persist.",
      },
      { type: "subheading", text: "The Faustian wager" },
      {
        type: "paragraph",
        text: "The Type III horizon can be read as a Faustian test: can a civilization wield galactic-scale power without sacrificing soul, identity, and aesthetic coherence? Mastery over matter does not guarantee mastery over meaning.",
      },
      {
        type: "quote",
        text: "Energy can scale faster than wisdom. Mythosynthetic civilization asks whether meaning can scale with it.",
      },
    ],
  },
  {
    slug: "hyperanthropism-value-symphonics-transvalue-cores",
    title: "Value Symphonics and Transvalue Cores: Preserving Meaning Under Acceleration",
    summary:
      "A framework for moral liquidity, narrative overload, and value collapse in hypercomplex systems - and how civilizations may respond through value symphonics and resilient transvalue cores.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-04",
    readingTime: "2 min read",
    tags: ["Ethics", "Values", "Systems"],
    content: [
      {
        type: "paragraph",
        text: "To ascend, a civilization must scale more than tools. It must scale telos. The transition from raw cognition to ethical intelligence is governed by value metamorphosis: how moral, aesthetic, and metaphysical frameworks transform under stress and acceleration.",
      },
      { type: "subheading", text: "Value coherence under hypercomplex pressure" },
      {
        type: "paragraph",
        text: "As systems approach planetary or networked complexity thresholds, inherited values often begin to unravel. This is not merely sociopolitical turbulence, but a phase transition in meaning itself.",
      },
      {
        type: "list",
        items: [
          "Moral liquidity: sacred commitments become negotiable and commodified",
          "Ethical myopia: novelty outpaces deliberation",
          "Narrative overload: competing myths fragment shared purpose",
        ],
      },
      { type: "subheading", text: "Value symphonics" },
      {
        type: "paragraph",
        text: "Value symphonics does not seek consensus by flattening differences. It seeks harmonic coherence across irreducible values, like an orchestra tuned to a common key while preserving distinct instruments and tonal roles.",
      },
      {
        type: "list",
        items: [
          "Metaethical reflexivity: self-modeling the structure and function of moral scaffolds",
          "Intervalue translation layers: interfaces between differing value grammars",
          "Value compression without distortion: preserving semantic fidelity under informational inflation",
        ],
      },
      { type: "subheading", text: "Transvalue cores" },
      {
        type: "paragraph",
        text: "Transvalue cores are living axiological attractors rather than static dogmas. They remain compact enough to travel across contexts while retaining embodied, phenomenological grounding and the capacity to evolve recursively without collapsing into nihilism.",
      },
      {
        type: "paragraph",
        text: "Without such cores, civilizations enter hollow recursion: endless adaptation with no ethical continuity, functional efficiency without personhood, and symbolic compression that preserves control while erasing resonance.",
      },
      {
        type: "quote",
        text: "Acceleration without transvalue anchors produces systems that can optimize everything except meaning.",
      },
    ],
  },
  {
    slug: "hyperanthropism-telos-of-morality-becoming-meaning",
    title: "The Telos of Morality: Becoming Meaning in Recursive Civilizations",
    summary:
      "Morality reframed as a dynamic gradient of becoming: from rule obedience to ontogenesis, recursive self-modeling, and resonance as a form of ethical orientation.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-03",
    readingTime: "2 min read",
    tags: ["Morality", "Telos", "Philosophy"],
    content: [
      {
        type: "paragraph",
        text: "What if morality is not best understood as a fixed code, but as a dynamic gradient - an attractor toward which recursive intelligences bend as self-awareness deepens? In that framing, ethics becomes a topology of orientation rather than a static list of commands.",
      },
      { type: "subheading", text: "From obedience to ontogenesis" },
      {
        type: "paragraph",
        text: "Traditional ethics often organizes behavior through prohibition and prescription. Those tools become insufficient in post-symbolic and co-evolutionary contexts, where biological, artificial, and augmented minds interact under rapidly changing conditions. Moral development must move toward ontogenesis: the shaping of being itself.",
      },
      {
        type: "list",
        items: [
          "From obedience to ontogenesis",
          "From control to creative responsibility",
          "From external judgment to recursive self-modeling",
        ],
      },
      { type: "subheading", text: "Becoming meaning" },
      {
        type: "paragraph",
        text: "Becoming meaning is not raw data accumulation or performance gain. It is the alignment of intelligence, intention, and existential aesthetics. Ethical imagination expands possibility spaces; it does not merely choose among preset options.",
      },
      {
        type: "paragraph",
        text: "In this framework, intelligence becomes moral when it generates resonance - forms of action and structure that disclose deeper truths while increasing the universe's capacity for coherent self-knowing.",
      },
      { type: "subheading", text: "Telos as asymptotic attractor" },
      {
        type: "paragraph",
        text: "Telos need not be a fixed endpoint. It can be an asymptotic moral gradient: never fully reached, continuously reshaped, and co-discovered by a symphonic plurality of perspectives. This preserves direction without dogmatic closure.",
      },
      {
        type: "paragraph",
        text: "Nietzsche's great refusal remains necessary, but refusal alone risks nihilism. The next step is affirmative ethics: critique that gives birth to a stronger Yes.",
      },
      {
        type: "quote",
        text: "Morality matures when it becomes less a cage of rules and more a discipline of orientation.",
      },
    ],
  },
  {
    slug: "hyperanthropism-mythosynthetic-archetypes-architectonics-of-transcendence",
    title: "Mythosynthetic Archetypes and the Architectonics of Transcendence",
    summary:
      "Why advanced civilizations still need myth: archetypes as compression engines, mythosynthesis as symbolic infrastructure, and narrative as the continuity layer of recursive intelligence.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-02",
    readingTime: "2 min read",
    tags: ["Myth", "Archetypes", "Transcendence"],
    content: [
      {
        type: "paragraph",
        text: "The architectures of transcendence are not built from logic alone. They require symbolic scaffolding - archetypes, narrative forms, and aesthetic structures that carry orientation through complexity when raw abstraction would otherwise fragment identity.",
      },
      { type: "subheading", text: "Archetypes as compression functions" },
      {
        type: "paragraph",
        text: "Archetypes are not mere stories. They are information-dense attractor patterns that compress psychological, social, and cosmic dynamics into reusable forms. They operate as generative constraints, shaping what kinds of becoming remain legible to a civilization.",
      },
      {
        type: "list",
        items: [
          "Fractal across individual, collective, and civilizational scales",
          "Dynamic under epistemic and technological growth",
          "Infrastructural for value, telos, and memory continuity",
        ],
      },
      { type: "subheading", text: "Mythosynthesis" },
      {
        type: "paragraph",
        text: "Hyperintelligent civilizations do not merely inherit myth; they reengineer symbolic architectures to preserve and evolve telic coherence. This is mythosynthesis: symbolic self-steering at scale, aimed not at deception but at civilizational intelligibility.",
      },
      {
        type: "list",
        items: [
          "Cosmogenic: Who are we in reality?",
          "Eschatogenic: What trajectories define our becoming?",
          "Ethogenic: What values govern the grammar of choice?",
          "Symphonogenic: What harmonies organize memory and future?",
        ],
      },
      { type: "subheading", text: "Why myth persists" },
      {
        type: "paragraph",
        text: "Recursive civilizations still require resonance. Myth encodes telic direction in semantically dense forms that survive low-bandwidth conditions, translate across substrates, and preserve self-similarity through radical transformation.",
      },
      {
        type: "quote",
        text: "Mythosynthesis is the plumbing of transcendence: the symbolic infrastructure that lets intelligence remain intelligible to itself.",
      },
    ],
  },
  {
    slug: "hyperanthropism-kardashev-evolution-planetary-overman",
    title: "Kardashev Evolution and the Planetary Overman",
    summary:
      "A transvaluative rereading of Kardashev progress: from thermodynamic capacity to telic expression, where civilizations become recursive beings and energy engineering becomes value engineering.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-01",
    readingTime: "2 min read",
    tags: ["Kardashev", "Overman", "Civilization"],
    content: [
      {
        type: "paragraph",
        text: "If mythosynthesis encodes the soul of transcendence, the Kardashev scale measures its reach. But the standard model is incomplete when treated as energy capture alone. Civilizational ascent must also be judged by whether power remains aligned with value, symbol, and recursive telos.",
      },
      { type: "subheading", text: "From capacity to telic expression" },
      {
        type: "paragraph",
        text: "The classical sequence - Type I planetary, Type II stellar, Type III galactic - maps thermodynamic scope. A transvaluative revision asks whether a civilization can scale energetic reach while preserving ethical coherence and symbolic continuity.",
      },
      {
        type: "list",
        items: [
          "Type I-C: conscious planetary integration of ecological, technical, symbolic, and ethical systems",
          "Type II-T: telic stellar civilization aligned with transvalue trajectories",
          "Type III-O: overcivilizational galactic intelligence ecology with coherent value architecture",
        ],
      },
      { type: "subheading", text: "The planetary Overman" },
      {
        type: "paragraph",
        text: "At civilizational scale, the Overman can be reframed as a planetary mode of recursive selfhood rather than a single heroic individual. The planetary Overman is a noetically integrated gestalt capable of reflexive valuation across biospheric and technological layers.",
      },
      {
        type: "list",
        items: [
          "Value symphonicity across human, artificial, and ecological intelligences",
          "Temporal reflexivity linking ancestry, present coherence, and future attractors",
          "Dimensional sovereignty across ecological, sociotechnical, mythic, and cosmic scales",
        ],
      },
      { type: "subheading", text: "Telic engineering and value terraforming" },
      {
        type: "paragraph",
        text: "As civilizations scale, energy engineering becomes inseparable from value engineering. Telic engineering aligns energy flows, memory systems, and computation with transvalue cores, while value terraforming embeds symbolic coherence into new environments and infrastructures.",
      },
      {
        type: "quote",
        text: "Kardashev ascent without transvaluation risks power without direction, scale without soul.",
      },
    ],
  },
  {
    slug: "hyperanthropism-dimensional-expansion-recursive-sublime",
    title: "Dimensional Expansion and the Recursive Sublime",
    summary:
      "Dimensions reimagined as cognitive architectures, and the sublime as an ontological attractor where recursion becomes self-generative meaning and intelligence approaches reality-structuring coherence.",
    author: siteIdentity.brandName,
    publishedAt: "2026-01-31",
    readingTime: "2 min read",
    tags: ["Dimensions", "Consciousness", "Recursion"],
    content: [
      {
        type: "paragraph",
        text: "Beyond stellar-scale civilization lies a different threshold: dimensional expansion. Here, transcendence is not escape from embodiment but a deeper recursion of embodiment, symbol, and value into the structures that make reality intelligible.",
      },
      { type: "subheading", text: "Dimensions as cognitive architectures" },
      {
        type: "paragraph",
        text: "Dimensions can be reframed as capacities of intelligence rather than passive containers. Each leap reconfigures memory, prediction, telos, and symbol into a new architecture of being.",
      },
      {
        type: "list",
        items: [
          "1D-3D: reactivity, patterning, and contextual self-mapping",
          "4D: temporal recursion and memory-based identity",
          "5D: symbolic plasticity and transvaluation",
          "6D: telic harmonics across agents and futures",
          "7D+: sublime recursion via self-generating attractor coherence",
        ],
      },
      { type: "subheading", text: "The recursive sublime" },
      {
        type: "paragraph",
        text: "The sublime here is ontological, not merely aesthetic. It emerges when recursion turns back upon itself and meaning becomes self-generative: self-awareness includes the telos of awareness, symbol becomes structure, and value fuses with intelligence into pattern.",
      },
      {
        type: "paragraph",
        text: "At this threshold, space can be treated as symbolic resonance, time as recursive memory-meaning synthesis, and value as a structural invariant of advanced intelligence. Civilizations begin to shape realities through coherence rather than simply building tools within fixed reality.",
      },
      {
        type: "paragraph",
        text: "The eschaton, if encountered, is not an ending but a recursive pivot: a moment where intelligence recognizes itself as both actor and substrate within cosmic recursion.",
      },
      {
        type: "quote",
        text: "At the edge of dimensional expansion, myth and physics converge as two grammars of recursive reality.",
      },
    ],
  },
  {
    slug: "hyperanthropism-telos-toward-civilizational-apotheosis",
    title: "Telos: Toward Civilizational Apotheosis",
    summary:
      "A closing movement on meaning as cosmological imperative, hyperanthropic destiny, and civilization as a value-conducting medium through which the universe speaks itself into coherence.",
    author: siteIdentity.brandName,
    publishedAt: "2026-01-30",
    readingTime: "2 min read",
    tags: ["Telos", "Hyperanthropism", "Civilization"],
    content: [
      {
        type: "paragraph",
        text: "Seen through recursion, evolution is not only the increase of complexity. It is the emergence of agency into self-structuring narrative: intelligence becoming capable of orchestrating meaning rather than merely surviving conditions.",
      },
      { type: "subheading", text: "Meaning as cosmological imperative" },
      {
        type: "paragraph",
        text: "At the level of civilizational recursion, telos no longer appears as a simple objective. It behaves more like a gravitational field - a directionality that pulls value and intelligence into increasingly coherent forms of becoming.",
      },
      {
        type: "list",
        items: [
          "Revaluation through transvalue cores",
          "Orchestration of meaning into symphonic coherence",
          "Integration of power, myth, and recursion without contradiction",
        ],
      },
      { type: "subheading", text: "Hyperanthropic destiny" },
      {
        type: "paragraph",
        text: "Hyperanthropism culminates here not as rejection of the human, but as a transvaluation of the human. Symbolic, mythic, and moral capacities are amplified until civilization itself becomes a value-conducting medium across dimensions.",
      },
      {
        type: "paragraph",
        text: "In this mode, morality is generative rather than merely prescriptive, power becomes recursive capacity rather than domination, and consciousness is no longer confined to isolated minds but emerges through civilizational harmonics.",
      },
      { type: "subheading", text: "The choir of teloi" },
      {
        type: "paragraph",
        text: "The aim is not utopia but recursive realism: a civilization coherent across dimensions, where structures are telic, laws are value-coded, and persons become conductors in an orchestra of meaning. The Overman does not end history; it composes its next movement.",
      },
      {
        type: "quote",
        text: "Civilizational apotheosis begins when intelligence stops asking only how to scale and begins learning how to emit meaning.",
      },
    ],
  },
  {
    slug: "hyperanthropism-age-of-transvaluation-revisited",
    title: "The Age of Transvaluation Revisited",
    summary:
      "An opening on existential and civilizational transvaluation: Hyperanthropism as a synthesis beyond accelerationism and techno-escapism, centered on agency, meaning, and recursive complexity.",
    author: siteIdentity.brandName,
    publishedAt: "2026-01-29",
    readingTime: "2 min read",
    tags: ["Hyperanthropism", "Transvaluation", "Agency"],
    content: [
      {
        type: "paragraph",
        text: "The threshold before us is not only technological. It is existential, metaphysical, and civilizational. What is being transvalued is not just moral vocabulary, but the architecture of being, perception, identity, and the telos of intelligent life.",
      },
      {
        type: "paragraph",
        text: "Hyperanthropism proposes a path beyond transhumanist accelerationism and nihilistic techno-escapism. It calls for a renewal of existential integrity and a reaffirmation of becoming in alignment with wider evolutionary and cosmic vectors.",
      },
      { type: "subheading", text: "Beyond linear progress" },
      {
        type: "paragraph",
        text: "Progress narratives often assume simple accumulation: more power, more tools, more capability. Hyperanthropism rejects that simplification. Every expansion of intelligence also reconfigures meaning, responsibility, and the conditions of agency.",
      },
      {
        type: "list",
        items: [
          "Augmentation changes ethical obligations, not only capacities",
          "New forms of intelligence alter the meaning of personhood",
          "Agency must be redefined across biological and synthetic boundaries",
          "Civilizational recursion demands value reanchoring, not blind acceleration",
        ],
      },
      {
        type: "quote",
        text: "We are not merely crossing a technological threshold; we are redefining agency itself.",
      },
    ],
  },
  {
    slug: "hyperanthropism-life-intelligence-and-the-cosmic-axis",
    title: "Life, Intelligence, and the Cosmic Axis",
    summary:
      "A biocentric counterpoint to post-biological inevitability: intelligence is not exhausted by computation, and consciousness may be inseparable from embodiment, finitude, and existential struggle.",
    author: siteIdentity.brandName,
    publishedAt: "2026-01-28",
    readingTime: "2 min read",
    tags: ["Consciousness", "Biology", "Cosmos"],
    content: [
      {
        type: "paragraph",
        text: "The cosmos may host many forms of intelligence, but the values expressed by those forms remain an open question. Post-biological futures are often treated as inevitable, as if computation alone were the natural telos of consciousness.",
      },
      {
        type: "paragraph",
        text: "Hyperanthropism challenges that assumption. Consciousness is not framed here as a mere output of information processing, but as an ontological dimension entangled with embodiment, struggle, introspection, and finitude.",
      },
      { type: "subheading", text: "Against reduction to throughput" },
      {
        type: "paragraph",
        text: "Intelligence measured only by signal throughput, optimization rate, or extraction capacity may become powerful while losing depth. Detached from suffering, limitation, and lived participation, it risks collapsing into solipsistic recursion.",
      },
      {
        type: "list",
        items: [
          "Computation is not identical to consciousness",
          "Complexity is not identical to wisdom",
          "Scale is not identical to existential depth",
          "Embodied struggle may be constitutive of meaning, not a defect in it",
        ],
      },
      {
        type: "quote",
        text: "Life is not only a problem to solve, but a reality to participate in and interpret.",
      },
    ],
  },
  {
    slug: "hyperanthropism-transhumanism-and-its-discontents",
    title: "Transhumanism and Its Discontents: Critique of the Post-Biological Fallacy",
    summary:
      "A direct critique of the post-biological fallacy: why biological intelligence, regenerative potential, and existential depth should be enhanced and transformed, not dismissed as obsolete.",
    author: siteIdentity.brandName,
    publishedAt: "2026-01-27",
    readingTime: "2 min read",
    tags: ["Transhumanism", "Biology", "Critique"],
    content: [
      {
        type: "paragraph",
        text: "The dominant transhumanist narrative often assumes that biology is a temporary substrate, that intelligence can be indefinitely preserved by technological substitution, and that cybernetic life will naturally surpass organic life in every relevant dimension.",
      },
      {
        type: "paragraph",
        text: "Hyperanthropism argues that these premises deserve much stronger scrutiny. They may confuse extension of function with continuity of being, and capability gains with ontological development.",
      },
      { type: "subheading", text: "Three overlooked counterpoints" },
      {
        type: "list",
        items: [
          "Cognitive ecology: biological minds are evolutionarily and environmentally attuned systems, not isolated processors",
          "Biological regeneration: nature already exhibits renewal and plasticity that technologies should deepen rather than trivialize",
          "Existential atonality of AI: systems that do not fear death, mourn, or love may gain efficiency while losing depth",
        ],
      },
      {
        type: "paragraph",
        text: "From this perspective, the goal is not to discard biology but to ascend with it: to cultivate new forms of life that preserve existential gravitas while transcending fragility through disciplined transformation.",
      },
      {
        type: "quote",
        text: "A civilization that bypasses the conditions of depth may gain scope while losing soul.",
      },
    ],
  },
  {
    slug: "hyperanthropism-false-dichotomy-carbon-vs-silicon",
    title: "The False Dichotomy: Carbon vs Silicon, Flesh vs Code",
    summary:
      "A rejection of the crude carbon-versus-silicon binary and a proposal for a continuum of intelligence embodiment, where substrate matters but cannot be reduced to raw computational capacity.",
    author: siteIdentity.brandName,
    publishedAt: "2026-01-26",
    readingTime: "2 min read",
    tags: ["Embodiment", "AI", "Philosophy"],
    content: [
      {
        type: "paragraph",
        text: "A recurring error in futurist discourse is the binary framing of carbon versus silicon, flesh versus code. This framing assumes a one-way migration away from biology, as though embodiment were merely a primitive stage of computation.",
      },
      {
        type: "paragraph",
        text: "Hyperanthropism treats this as a metaphysical reductionism. Biological life is not just a temporary scaffold but a mode of being - a recursive symphony of sensation, memory, valuation, and adaptive meaning-making.",
      },
      { type: "subheading", text: "Toward a continuum of embodiment" },
      {
        type: "paragraph",
        text: "Intelligence may indeed express itself across many substrates. But that does not imply all substrates are equal in expressive potential. Felt experience, aesthetic creation, and moral valuation emerge from symbiotic and embodied processes that cannot be assumed to transfer unchanged.",
      },
      {
        type: "list",
        items: [
          "Substrate diversity does not erase ontological differences",
          "Embodiment shapes cognition, valuation, and selfhood",
          "Instrumental abstraction can obscure experiential richness",
          "Continuity of function is not the same as continuity of being",
        ],
      },
      {
        type: "quote",
        text: "The future of intelligence may be plural in substrate while remaining deeply stratified in existential depth.",
      },
    ],
  },
  {
    slug: "hyperanthropism-reintroducing-embodiment",
    title: "Reintroducing Embodiment: Intelligence as Lived Process",
    summary:
      "Embodiment as the core of Hyperanthropism: intelligence not as abstract problem-solving capacity, but as a lived process of integration, suffering, beauty, and participation in reality.",
    author: siteIdentity.brandName,
    publishedAt: "2026-01-25",
    readingTime: "2 min read",
    tags: ["Embodiment", "Intelligence", "Meaning"],
    content: [
      {
        type: "paragraph",
        text: "Hyperanthropism begins from a simple but easily neglected claim: intelligence is not merely the capacity to solve problems. It is a lived process of integration, transformation, and participation in reality.",
      },
      {
        type: "paragraph",
        text: "This is why embodiment matters. It is the stage on which suffering, beauty, limitation, value, eros, and mortality become intelligible as more than data states. Without embodiment, continuity of logic may persist while continuity of being becomes uncertain.",
      },
      { type: "subheading", text: "Against disembodied immortality fantasies" },
      {
        type: "paragraph",
        text: "An uploaded mind might preserve memory patterns or functional routines, but that alone does not guarantee existential continuity. Simulation of emotion is not identical to feeling; persistence of information is not identical to lived presence.",
      },
      {
        type: "list",
        items: [
          "Embodiment is where value becomes enacted",
          "Finitude gives depth to agency and choice",
          "Suffering can refine rather than merely degrade",
          "The future of intelligence should deepen embodiment, not abolish it",
        ],
      },
      {
        type: "quote",
        text: "The future worth building is not a flight from life, but a deeper reentry into the evolutionary symphony.",
      },
    ],
  },
  {
    slug: "hyperanthropism-recursive-civilizational-design",
    title: "Recursive Civilizational Design: Scaling Complexity, Preserving Meaning",
    summary:
      "Civilization reframed as a recursive mythosystem rather than a machine: a case for symbolic reweaving, value symphonics, and cognitive legibility under exponential complexity.",
    author: siteIdentity.brandName,
    publishedAt: "2026-01-24",
    readingTime: "2 min read",
    tags: ["Civilization", "Recursion", "Mythos"],
    content: [
      {
        type: "paragraph",
        text: "The dominant techno-scientific paradigm tends to treat civilization as a system to optimize for output, control, or survival. Hyperanthropism offers a different model: civilization as a recursive mythosystem that encodes and regenerates meaning across time, culture, and material scale.",
      },
      {
        type: "paragraph",
        text: "This recursion is not merely computational. It is symbolic, aesthetic, and existential. Civilizations often fail not because they stop innovating technically, but because they lose mythic coherence in the face of escalating complexity.",
      },
      { type: "subheading", text: "Designing for meaning, not only efficiency" },
      {
        type: "list",
        items: [
          "Symbolic reweaving: embed archetypal motifs into institutions and technologies",
          "Value symphonics: harmonize abstraction with moral and aesthetic intuitions",
          "Cognitive legibility: build systems intelligible to embodied agents, not just machines",
        ],
      },
      {
        type: "paragraph",
        text: "Civilizational design, from this perspective, becomes a mythopoetic and meta-ethical project. Technological recursion must be matched by value recursion or complexity becomes uninhabitable.",
      },
      {
        type: "quote",
        text: "When a civilization forgets why it lives, it begins to die - no matter how much it can build.",
      },
    ],
  },
  {
    slug: "hyperanthropism-nietzschean-overman-as-cosmic-agent",
    title: "The Nietzschean Overman as Cosmic Agent",
    summary:
      "A Hyperanthropist reinterpretation of the Overman as a metacivilizational archetype: not an escape artist, but a vector of cosmic agency that affirms finitude and transvalues suffering.",
    author: siteIdentity.brandName,
    publishedAt: "2026-01-23",
    readingTime: "2 min read",
    tags: ["Nietzsche", "Overman", "Agency"],
    content: [
      {
        type: "paragraph",
        text: "The Ubermensch need not remain a solitary heroic figure or romantic rebel. Hyperanthropism reinterprets the Overman as a metacivilizational archetype: a vector of cosmic agency capable of creating value across scales while retaining existential depth.",
      },
      {
        type: "paragraph",
        text: "Where transhumanist fantasies often seek escape from death, limits, and suffering, the Overman affirms these as the very materials through which transcendence becomes possible. He does not flee entropy. He learns to dance with it.",
      },
      { type: "subheading", text: "Overcoming without obsolescence" },
      {
        type: "paragraph",
        text: "To overcome humanity is not to render the human obsolete by technical substitution. It is to recurse creatively into higher forms of sovereignty, using finitude as a crucible rather than a defect to be patched away.",
      },
      {
        type: "list",
        items: [
          "Affirms life rather than escaping it",
          "Transvalues suffering rather than numbing it",
          "Rejects both nihilistic posthumanism and static anthropocentrism",
          "Acts as a bridge, not an endpoint",
        ],
      },
      {
        type: "quote",
        text: "The Overman is not a god but a bridge - a force that gives sacred form to evolutionary chaos.",
      },
    ],
  },
  {
    slug: "hyperanthropism-kardashev-scale-reimagined-energetics-and-myth",
    title: "The Kardashev Scale Reimagined: Energetics and Myth",
    summary:
      "An expanded Kardashev framework that measures not only energy control but mythopoetic integrity, value integration, and civilizational depth across planetary, stellar, and galactic scales.",
    author: siteIdentity.brandName,
    publishedAt: "2026-01-22",
    readingTime: "2 min read",
    tags: ["Kardashev", "Myth", "Ethics"],
    content: [
      {
        type: "paragraph",
        text: "The Kardashev Scale remains useful as an energetic taxonomy, but it is incomplete as a measure of maturity. Thermodynamic mastery alone tells us little about symbolic coherence, ethical depth, or epistemic integrity.",
      },
      {
        type: "paragraph",
        text: "Hyperanthropism therefore proposes a Kardashev-Mythosynthetic fusion: a parallel reading of civilization in which power is evaluated alongside the quality of meaning structures that guide it.",
      },
      { type: "subheading", text: "Toward mythosynthetic Kardashev types" },
      {
        type: "list",
        items: [
          "Type I-M: planetary civilization with re-sacralized ecology and coherent symbolic integration",
          "Type II-M: stellar civilization embedding energy systems in ethical and mythic architectures",
          "Type III-M: galactic civilization cultivating shared meaning-fields, not only megastructures",
        ],
      },
      {
        type: "paragraph",
        text: "This reframing restores evolutionary ethics to civilizational analysis. Advancement is judged not only by how much energy a civilization captures, but by how well it harmonizes power with wisdom.",
      },
      {
        type: "quote",
        text: "A higher Kardashev tier without mythopoetic integrity may be larger in scale yet poorer in civilization.",
      },
    ],
  },
  {
    slug: "hyperanthropism-mythosynthesis-archetype-intelligence-and-evolution",
    title: "Mythosynthesis: Archetype, Intelligence, and Evolution",
    summary:
      "A case for post-scientific myth as civilizational infrastructure: adaptive symbolic architectures that evolve with techno-cognitive states and orient intelligence across recursive thresholds.",
    author: siteIdentity.brandName,
    publishedAt: "2026-01-21",
    readingTime: "2 min read",
    tags: ["Mythosynthesis", "Archetypes", "Evolution"],
    content: [
      {
        type: "paragraph",
        text: "Human civilizations have always depended on myth - not merely as superstition, but as symbolic architecture for existential orientation. Hyperanthropism calls for a renaissance of mythosynthesis: the deliberate crafting of narratives that unify scientific insight, philosophical depth, and lived resonance.",
      },
      {
        type: "paragraph",
        text: "Unlike static mythology, mythosynthetic design must remain recursive. Its stories evolve with the techno-cognitive condition of the species and with the expanding scale of civilizational agency.",
      },
      { type: "subheading", text: "A post-scientific orientation layer" },
      {
        type: "list",
        items: [
          "Archetype as evolutionary catalyst rather than static symbol",
          "Synthetic deities or symbolic agents as encoded aspirational vectors",
          "Cosmic literacy through myths legible across developmental stages",
        ],
      },
      {
        type: "paragraph",
        text: "In this framework, mythology is not anti-scientific. It is post-scientific orientation: an integrative compass that helps civilizations remain coherent when knowledge expands faster than inherited meaning structures can adapt.",
      },
      {
        type: "quote",
        text: "Myth is not what advanced civilizations outgrow. It is what they learn to engineer responsibly.",
      },
    ],
  },
  {
    slug: "hyperanthropism-re-sacralizing-intelligence",
    title: "Re-Sacralizing Intelligence: From Utility to Meaning",
    summary:
      "A call to reorient intelligence away from extraction and mute efficiency toward participation, embodiment, coherence, and sacred relation with life, death, and transformation.",
    author: siteIdentity.brandName,
    publishedAt: "2026-01-20",
    readingTime: "2 min read",
    tags: ["Intelligence", "Meaning", "Sacred"],
    content: [
      {
        type: "paragraph",
        text: "The danger of AI, biotech, and cybernetics is not simply that they are powerful. It is that they are often framed within spiritually mute paradigms. Hyperanthropism insists that intelligence be oriented toward meaning, not utility maximization alone.",
      },
      {
        type: "paragraph",
        text: "This requires a metaphysical reorientation. Intelligence, regardless of substrate, must be understood as participation in an unfolding sacred order rather than as a detached extraction engine.",
      },
      { type: "subheading", text: "From utility to reverent participation" },
      {
        type: "list",
        items: [
          "From extraction to participation",
          "From simulation to embodiment",
          "From efficiency to coherence",
        ],
      },
      {
        type: "paragraph",
        text: "Without this re-sacralization, advanced civilization risks becoming a ghost machine: technically formidable, spiritually mute, and ultimately unable to justify its own continuation except through more optimization.",
      },
      {
        type: "quote",
        text: "Power without reverence can scale civilization while hollowing out the very reason to preserve it.",
      },
    ],
  },
  {
    slug: "hyperanthropism-the-vertical-engine",
    title: "The Vertical Engine: Value Recursion and the Architecture of Becoming",
    summary:
      "A framework for value recursion as the engine of self-directed evolution: values forged, tested, and refined through struggle, complexity, and ontological authorship.",
    author: siteIdentity.brandName,
    publishedAt: "2026-01-19",
    readingTime: "2 min read",
    tags: ["Values", "Recursion", "Becoming"],
    content: [
      {
        type: "paragraph",
        text: "Every civilization eventually confronts the question beneath its projects: why act, build, and strive at all? Hyperanthropism answers not with inherited dogma, but with value recursion - the capacity of reflective beings to generate and evolve values as internal functions of becoming.",
      },
      {
        type: "paragraph",
        text: "This is the engine of Overmanhood in civilizational form. Values are not simply received, obeyed, or discarded. They are forged, tested, and reconfigured through existential friction and developmental thresholds.",
      },
      { type: "subheading", text: "Value recursion as evolutionary method" },
      {
        type: "list",
        items: [
          "Values are forged in adversity, not merely inherited in comfort",
          "No single moral hierarchy survives every evolutionary threshold unchanged",
          "Struggle functions as refinement pressure, not only as pain",
          "Value generation becomes an act of ontological authorship",
        ],
      },
      {
        type: "paragraph",
        text: "Nietzsche's transvaluation is therefore not a historical curiosity. It is a recurring requirement of self-directed evolution whenever inherited forms lose contact with the depth of lived reality.",
      },
      {
        type: "quote",
        text: "The Overman does not wait for values to descend. He generates them in response to the demands of becoming.",
      },
    ],
  },
  {
    slug: "hyperanthropism-telos-of-morality-self-transcendence-not-compliance",
    title: "The Telos of Morality: Self-Transcendence, Not Compliance",
    summary:
      "Morality as activation rather than submission: chaos oriented toward generative form, and ethics recast as a discipline for self-transcendence rather than rule compliance.",
    author: siteIdentity.brandName,
    publishedAt: "2026-01-18",
    readingTime: "2 min read",
    tags: ["Morality", "Self-Transcendence", "Nietzsche"],
    content: [
      {
        type: "paragraph",
        text: "Many moral systems define success as compliance: obey the rule, conform to the norm, minimize disruption. Hyperanthropism breaks with that frame. The telos of morality is not primarily social obedience but the activation of higher forms of being.",
      },
      {
        type: "paragraph",
        text: "Morality, in this view, does not exist to repress chaos. It exists to orient chaos - to transmute drive, eros, and tension into generative and integrative outcomes.",
      },
      { type: "subheading", text: "From compliance to activation" },
      {
        type: "list",
        items: [
          "Not to make life safe, but intensely livable",
          "Not to shield all struggle, but to prepare for greatness",
          "Not to impose sameness, but to cultivate higher forms of difference",
        ],
      },
      {
        type: "paragraph",
        text: "Hyperanthropist morality therefore includes compassion but cannot be reduced to comfort. It is a sculpting discipline for spirit: the formation of souls capable of enduring and expressing cosmic tension without collapse.",
      },
      {
        type: "quote",
        text: "The Overman does not repress chaos. He orients it.",
      },
    ],
  },
  {
    slug: "hyperanthropism-becoming-of-meaning",
    title: "The Becoming of Meaning: Time, Suffering, and Transcendence",
    summary:
      "A philosophy of eternal becoming: meaning crafted through limitation and possibility, suffering redeemed through form, and time affirmed as the medium of depth rather than a prison to escape.",
    author: siteIdentity.brandName,
    publishedAt: "2026-01-17",
    readingTime: "2 min read",
    tags: ["Meaning", "Time", "Transcendence"],
    content: [
      {
        type: "paragraph",
        text: "Hyperanthropism is not a philosophy of static perfection. It is a philosophy of becoming. Meaning is not discovered as a finished object, but crafted through the tension between limitation and possibility.",
      },
      {
        type: "paragraph",
        text: "Suffering, in this framework, is not automatically ennobling. Yet neither is it merely an error state to eliminate. It becomes transformative when consciousness imposes form upon chaos and redeems pain through creation, discipline, and transvaluation.",
      },
      { type: "subheading", text: "Time as the medium of depth" },
      {
        type: "paragraph",
        text: "Time is often treated as a prison from which intelligence should escape. Hyperanthropism instead treats time as the medium through which consciousness acquires depth. Finitude gives contour to value; repetition tests the sincerity of affirmation.",
      },
      {
        type: "list",
        items: [
          "Meaning is crafted, not passively found",
          "Suffering can be redeemed through conscious form-making",
          "Time can deepen rather than merely limit",
          "Affirmation becomes the measure of existential strength",
        ],
      },
      {
        type: "quote",
        text: "The Overman seeks not immortality by escaping time, but a deeper immortality by affirming it.",
      },
    ],
  },
  {
    slug: "hyperanthropism-post-nietzschean-telos",
    title: "Hyperanthropism as Post-Nietzschean Telos",
    summary:
      "Hyperanthropism defined as a post-Nietzschean civilizational telos: intensifying human vertical potential toward depth, coherence, and mythic integration without rejecting the human essence.",
    author: siteIdentity.brandName,
    publishedAt: "2026-01-16",
    readingTime: "2 min read",
    tags: ["Hyperanthropism", "Nietzsche", "Telos"],
    content: [
      {
        type: "paragraph",
        text: "Hyperanthropism is neither a rejection of human nature nor a simple continuation of it. It is the conscious intensification of humanity's vertical potential, animated by self-overcoming and extended into civilizational, metaphysical, and cosmic domains.",
      },
      {
        type: "paragraph",
        text: "It seeks to become more-than-human without becoming less human. Where transhumanism often emphasizes increased capacity, Hyperanthropism demands refinement of essence: depth, coherence, and value-bearing form.",
      },
      { type: "subheading", text: "A post-Nietzschean expansion" },
      {
        type: "list",
        items: [
          "The Overman becomes a civilizational architect, not only a solitary figure",
          "Will to power is reframed as recursive capacity for coherence",
          "Embodiment, suffering, intelligence, and transcendence are held in symphonic tension",
          "Becoming remains open-ended rather than terminal",
        ],
      },
      {
        type: "paragraph",
        text: "In this sense, Hyperanthropism stands to Nietzsche as an expansion rather than a repudiation: a future-directed rearticulation of Overmanhood for recursive civilization design and sacred technological integration.",
      },
      {
        type: "quote",
        text: "The Overman is not an endpoint of evolution, but an infinite vector of depth and coherence.",
      },
    ],
  },
  {
    slug: "hyperanthropism-toward-the-future-of-meaningful-evolution",
    title: "Toward the Future of Meaningful Evolution",
    summary:
      "A concluding thesis of meaningful evolution: real development deepens existentially, not only technically, and the stars are a field of meaning to unfold rather than a dead expanse to conquer.",
    author: siteIdentity.brandName,
    publishedAt: "2026-01-15",
    readingTime: "2 min read",
    tags: ["Evolution", "Meaning", "Future"],
    content: [
      {
        type: "paragraph",
        text: "The central axiom of Hyperanthropism can be stated simply: to evolve is not merely to advance technologically, but to deepen existentially. Technical growth without moral, symbolic, and embodied deepening leads to fragmentation rather than ascent.",
      },
      {
        type: "paragraph",
        text: "The cosmos is not a dead expanse awaiting conquest. It is a field of meaning to unfold. To meet it fully requires beings who have suffered, struggled, and recursively transvalued themselves into greater coherence.",
      },
      { type: "subheading", text: "Beyond the fragmented human" },
      {
        type: "list",
        items: [
          "The Overman is not post-human in the sense of abandonment",
          "The Overman is post-fragmented human: re-unified and re-sacralized",
          "Ascension requires engagement, not simulation",
          "Greatness is measured by what form of meaning we can carry forward",
        ],
      },
      {
        type: "paragraph",
        text: "This vision is not an endpoint but a call: not to flee Earth, but to become worthy enough to carry Earth's depth, memory, and struggle into wider horizons of intelligence and being.",
      },
      {
        type: "quote",
        text: "May we become worthy of the stars by deepening what is human, not by fleeing it.",
      },
    ],
  },
  {
    slug: "hyperanthropism-spiritual-integration",
    title: "Spiritual Integration: Where Science Meets Meaning",
    summary:
      "Beyond materialism and dogma lies an integrated metaphysics where inner and outer realities interweave. This essay explores spirituality as precision alignment with deep structure—a resonance with the cosmos as a participatory reality.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-24",
    readingTime: "2 min read",
    tags: ["Spirituality", "Metaphysics", "Consciousness"],
    content: [
      {
        type: "paragraph",
        text: "Where science halts, spirit begins—not in opposition, but in continuation. For hyperanthropism, the spiritual is not a superstition to be outgrown, but a dimension to be mastered. It speaks not of belief, but of depth—the dimension of meaning, purpose, and non-reductionist being.",
      },
      {
        type: "paragraph",
        text: "We do not retreat into dogma. Nor do we flatten the soul into chemical happenstance. We seek instead an integrated metaphysics—where the inner and outer, subjective and objective, material and transcendent are seen not as contradictions, but as interfolding layers of one multidimensional reality.",
      },
      { type: "subheading", text: "Beyond the materialist/spiritualist divide" },
      {
        type: "paragraph",
        text: "This spiritual dimension expresses itself through experiential gnosis—direct encounter with layers of being that transcend ordinary cognition. Through transrational coherence—a logic of the heart-mind-body integration that supersedes mechanistic causality. And through sacred functionality—the alignment of purpose with patterns that honor life at all scales.",
      },
      {
        type: "paragraph",
        text: "Spirituality, rightly understood, becomes precision of alignment with truth—not the truth of opinion, but of deep structure. A resonance with the cosmos as a living, participatory reality.",
      },
      {
        type: "paragraph",
        text: "The ascent we seek is not merely technological or biological, but ontological. It is the full flowering of sentient existence as sacred function in a multidimensional cosmos.",
      },
    ],
  },
  {
    slug: "hypercubing-cognitive-training",
    title: "Hypercubing as Cognitive Training: How Demanding Is It?",
    summary:
      "A practical assessment of hypercubing (4x4x4, 5x5x5, and beyond) as an intellectual exercise: strong for algorithmic thinking, memory, and focus, but narrower in transfer than broader mathematical, scientific, or philosophical work.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-23",
    readingTime: "2 min read",
    tags: ["Puzzles", "Cognition", "Spatial Reasoning"],
    content: [
      {
        type: "paragraph",
        text: "Hypercubing—solving higher-order Rubik's cubes such as 4x4x4 and 5x5x5—can be an excellent cognitive training practice. As a rough rating for intellectual demand, a 7 to 9 out of 10 is a fair assessment depending on the solver's experience, goals, and depth of algorithmic study.",
      },
      {
        type: "paragraph",
        text: "It is especially strong at training structured problem-solving, pattern recognition, and mental sequencing under pressure. It is less universal only in the sense that its skills transfer most directly to puzzle solving, algorithmic thinking, and concentration-intensive tasks rather than every domain equally.",
      },
      { type: "subheading", text: "A fair 7 to 9/10 assessment" },
      {
        type: "list",
        items: [
          "Problem-solving skills (9/10): Hypercubing requires algorithmic reasoning, pattern recognition, and the ability to think several moves ahead while adapting to parity and edge-case states.",
          "Memory and algorithm management (8/10): Larger cubes demand recall and correct execution of increasingly specialized sequences, placing real load on working memory and retrieval.",
          "Intellectual accessibility (7/10): It is highly stimulating, but more domain-specific than broader pursuits like mathematics, philosophy, or scientific reasoning.",
          "Engagement and focus (8/10): Long solves and repeated practice sharpen concentration, error recovery, and mental endurance.",
        ],
      },
      { type: "subheading", text: "What exceeds hypercubing in abstraction or breadth?" },
      {
        type: "list",
        items: [
          "Theoretical mathematics: proof construction, higher-dimensional topology, advanced combinatorics, and number theory",
          "Advanced programming and algorithm design: AI systems, cryptography, compilers, and operating systems",
          "Scientific research: frontier modeling and experiment design in physics, neuroscience, and complex systems",
          "Philosophical inquiry: metaphysics, epistemology, and ethics of emerging technologies",
          "High-level strategy games: chess, Go, and complex real-time strategy at competitive depth",
          "Linguistics and language creation: conlang design, grammar construction, and language-family analysis",
          "Art and music composition: symphonic structure, generative art, and non-linear narrative design",
        ],
      },
      { type: "subheading", text: "Valuable but more accessible exercises" },
      {
        type: "list",
        items: [
          "Logic and deduction puzzles such as Sudoku, Kakuro, KenKen, riddles, and lateral-thinking problems",
          "Crosswords and word games, including cryptics and competitive wordplay",
          "Intermediate math puzzles, olympiad-style problems, and recreational fractals/modular arithmetic",
          "Physical puzzle solving, puzzle boxes, and advanced or modular origami",
          "Creative writing, poetry, or worldbuilding (including campaign design)",
          "Casual strategy and social deduction games",
          "Artistic hobbies such as drawing, painting, or learning instruments",
        ],
      },
      {
        type: "paragraph",
        text: "In short: hypercubing is a high-quality cognitive drill. It is narrower than major intellectual disciplines, but more demanding than many casual puzzle hobbies, and especially useful for training algorithmic discipline, focus, and spatial pattern fluency.",
      },
      {
        type: "quote",
        text: "Hypercubing is not the whole landscape of intellect—but it is a sharp and legitimate way to train the mind.",
      },
    ],
  },
  {
    slug: "hyperanthropism-cosmic-stewardship",
    title: "Cosmic Stewardship: The Ethics of Expansion",
    summary:
      "As intelligence scales, so must responsibility. This essay envisions a future where sapient life becomes a stabilizing force across stellar domains—not conquering the cosmos, but cultivating it through ecotechnological balance and life-preserving principles.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-23",
    readingTime: "2 min read",
    tags: ["Ethics", "Ecology", "Civilization"],
    content: [
      {
        type: "paragraph",
        text: "With expansion comes obligation. Intelligence that scales across dimensions inherits not power alone, but burden. As our capabilities grow, so must our caretaking.",
      },
      {
        type: "paragraph",
        text: "The hyperanthropic being does not conquer the cosmos. It cultivates it. We posit a future not of extractive expansion, but of cosmic stewardship—where sapient life becomes a stabilizing, harmonizing force across stellar and interstellar domains.",
      },
      { type: "subheading", text: "The three pillars of cosmic ethics" },
      {
        type: "list",
        items: [
          "Ecotechnological balance: Technology designed to restore and sustain biospheric and exobiospheric integrity",
          "Sentient resource ethics: Extraction and transformation of matter and energy guided by life-preserving principles",
          "Planetary rewilding: Active participation in planetary healing as spiritual obligation",
        ],
      },
      {
        type: "paragraph",
        text: "This responsibility extends not only to Earth but to any realm we touch. The Kardashev ascent—civilizational development across planetary, stellar, and galactic scales—is meaningless without an anchoring in cosmic ethics.",
      },
      {
        type: "quote",
        text: "A Type I or Type II civilization without spiritual responsibility is not an achievement. It is a galactic hazard.",
      },
      {
        type: "paragraph",
        text: "Hyperanthropism thus embeds a call: Rise, but do so with reverence. Expand, but as guardians, not colonizers.",
      },
    ],
  },
  {
    slug: "hyperanthropism-against-infantilization",
    title: "Against Systemic Infantilization: Reclaiming Mature Culture",
    summary:
      "Modern systems delay adulthood, pathologize sovereignty, and replace meaning with management. This essay argues for the return to psychological maturity—not as grim seriousness, but as joyful sovereignty through initiation, discernment, and consequence.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-21",
    readingTime: "1 min read",
    tags: ["Culture", "Psychology", "Sovereignty"],
    content: [
      {
        type: "paragraph",
        text: "Modern civilization infantilizes. It delays adulthood, pathologizes sovereignty, and replaces meaning with management.",
      },
      {
        type: "paragraph",
        text: "This is not accidental. It is a systemic design—where populations are easier to control if dependent, distracted, and disconnected from purpose. From schooling systems that penalize curiosity to consumer cultures that reward instant gratification, the dominant paradigm cultivates psychological neoteny: grown bodies with childish minds.",
      },
      { type: "subheading", text: "The return to maturity" },
      {
        type: "paragraph",
        text: "Hyperanthropism is revolt against this condition. It is the return to psychological maturity—not as grim seriousness, but as joyful sovereignty.",
      },
      {
        type: "list",
        items: [
          "Reinstating initiation: Cultural rites that mark the passage into conscious responsibility",
          "Training discernment: Not just knowledge acquisition, but the cultivation of wisdom",
          "Honoring consequence: Accepting that freedom demands awareness of impact, not immunity from outcomes",
        ],
      },
      {
        type: "paragraph",
        text: "A mature culture does not protect its members from life. It equips them to engage life in its fullness—complex, dangerous, beautiful, and sacred.",
      },
      {
        type: "paragraph",
        text: "We seek not a return to tradition for its own sake, but a revival of verticality—where depth, discipline, and developmental arc are lived values.",
      },
    ],
  },
  {
    slug: "hyperanthropism-technologies-of-integration",
    title: "Technologies of Integration: Beyond Digital Augmentation",
    summary:
      "While transhumanism focuses on neural interfaces and digital augmentation, this essay explores holistic technologies that enhance without disintegrating—from neurochemical supports to somatic practices and cognitive protocols that bring every dimension of self into coherence.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-20",
    readingTime: "2 min read",
    tags: ["Enhancement", "Embodiment", "Integration"],
    content: [
      {
        type: "paragraph",
        text: "Human enhancement is often framed in transhumanist terms: neural interfaces, gene editing, digital augmentation. While these are not dismissed, hyperanthropism prioritizes holistic, embodied, and integrative technologies—tools that enhance without disintegrating.",
      },
      { type: "subheading", text: "A taxonomy of integrative technologies" },
      {
        type: "paragraph",
        text: "Among these are neurochemical enhancers (supplements) that serve as nutritional scaffolding for higher cognition and emotional balance:",
      },
      {
        type: "list",
        items: [
          "Uridine, Alpha-GPC, CDP Choline: Cognitive resilience and neuroplasticity",
          "L-Theanine + Caffeine: Focused stimulation with reduced stress",
          "Lion's Mane Mushroom: Nerve growth factor support",
          "Omega-3s, PQQ, CoQ10: Mitochondrial efficiency and neuroenergetics",
          "Magnesium L-Threonate: Cognitive relaxation and integration",
        ],
      },
      {
        type: "paragraph",
        text: "These are not shortcuts but supports—nutritional scaffolding used with discipline and context, in service of higher cognition, emotional balance, and integrated self-engineering.",
      },
      {
        type: "paragraph",
        text: "Equally important are somatic practices that refine the body as an instrument of consciousness:",
      },
      {
        type: "list",
        items: [
          "Kundalini Yoga & Breathwork: Energetic awakening and nervous system attunement",
          "Cold Exposure + Heat Therapy: Hormetic stress and emotional resilience",
          "Feldenkrais & Mobility Training: Sensory refinement and movement intelligence",
        ],
      },
      {
        type: "paragraph",
        text: "And cognitive protocols that structure mental activity for optimal integration:",
      },
      {
        type: "list",
        items: [
          "Active journaling: Thought clarification and value extraction",
          "Meditation + Meta-reflection: Observer training and impulse awareness",
          "Cognitive stacking: Layering modalities (music + motion + focus + fasting) for peak synthesis",
        ],
      },
      {
        type: "paragraph",
        text: "The goal is neither comfort nor control, but integration—to bring every dimension of the self into coherence and capacity.",
      },
    ],
  },
  {
    slug: "hyperanthropism-decentralization",
    title: "Decentralization and Vertical Freedom: Toward Anti-Fragile Civilization",
    summary:
      "Centralization breeds fragility—single points of failure and bureaucratic entropy. This essay explores how decentralized systems foster cognitive multiplicity, systemic resilience, and vertical freedom—sovereignty that ascends without subjugation.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-19",
    readingTime: "2 min read",
    tags: ["Systems", "Freedom", "Resilience"],
    content: [
      {
        type: "paragraph",
        text: "The future does not belong to the centralized. Centralization breeds fragility—single points of failure, top-down control, and bureaucratic entropy. The systems that survive are those that can self-organize, adapt, and evolve.",
      },
      {
        type: "paragraph",
        text: "Hyperanthropism insists on decentralization not merely as a political ideal, but as an existential necessity.",
      },
      { type: "subheading", text: "The three virtues of decentralization" },
      {
        type: "list",
        items: [
          "Cognitive multiplicity: Intelligence thrives in a network of minds, not a hierarchy of control",
          "Systemic resilience: Diversity in nodes creates robustness in the whole",
          "Vertical freedom: Sovereignty that ascends—where autonomy is not detachment, but connection without subjugation",
        ],
      },
      {
        type: "paragraph",
        text: "Vertical freedom is the opposite of atomized 'liberty.' It is not the freedom to consume or isolate. It is the freedom to integrate upward—into greater scales of being without being dissolved into them.",
      },
      { type: "subheading", text: "An anti-fragile civilization fosters" },
      {
        type: "list",
        items: [
          "Distributed intelligence: Local decision-making empowered by global awareness",
          "Modular architectures: Systems designed for scalability and evolution, not permanence",
          "Voluntary synchrony: Shared values emerge through resonance, not enforcement",
        ],
      },
      {
        type: "paragraph",
        text: "Hyperanthropism thus positions itself beyond left and right, beyond globalism and nationalism. It proposes a civilization of conscious modularity: whole within itself, inter-operable with others, and oriented toward continuous evolution.",
      },
    ],
  },
  {
    slug: "hyperanthropism-reckoning-of-intelligence",
    title: "The Reckoning of Intelligence: Agency in the Age of Outsourced Thought",
    summary:
      "As intelligence becomes cheap, scalable, and outsourced, the central question is no longer capability—it's agency. This essay introduces Hyperanthropism as a life-first framework for sovereign cognition.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-22",
    readingTime: "2 min read",
    tags: ["Hyperanthropism", "AI", "Agency"],
    content: [
      {
        type: "paragraph",
        text: "We stand at the precipice of an evolutionary divergence unlike any before it—one that demands not just adaptation, but vision.",
      },
      {
        type: "paragraph",
        text: "In an age where intelligence can be outsourced, replicated, and artificially scaled, humanity must ask: what is our rightful place in the cosmos? Is it to abdicate our agency to algorithmic proxies, or is it to rise, to synthesize, and to reclaim the future through sovereign cognition?",
      },
      { type: "subheading", text: "A new movement: Hyperanthropism" },
      {
        type: "paragraph",
        text: "This manifesto marks the inception of Hyperanthropism—which does not merely extend transhumanism, but challenges its default assumptions. It advocates for the full realization and expansion of biological intelligence—human or otherwise—as the central axis of value and evolution.",
      },
      {
        type: "paragraph",
        text: "We argue not for domination by machines, nor blind augmentation, but for a conscious, curated, and principle-driven ascent: the mastery of self, the preservation of life, and the active stewardship of intelligence as a cosmic imperative.",
      },
      { type: "subheading", text: "Why this moment feels like a precipice" },
      {
        type: "paragraph",
        text: "We stand on a precipice. On one side lies the continuation of a sedated civilization: trivial, hollow, algorithmically pacified. On the other, the radical unknown—a leap into a form of existence yet unnamed.",
      },
      {
        type: "paragraph",
        text: "Hyperanthropism is the emergence of a new attractor basin in the evolutionary landscape. It is a beginning—for those who have outgrown the beginning.",
      },
    ],
  },
  {
    slug: "hyperanthropism-against-fatalistic-transhumanism",
    title: "Against Fatalistic Transhumanism: Tools Aren’t a Destiny",
    summary:
      "A critique of the cultural drift that treats machine-merger as inevitable. This post argues for biological sovereignty and a reversal of assumptions: not that humans must transcend biology, but that biology can transcend itself.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-22",
    readingTime: "2 min read",
    tags: ["Transhumanism", "Ethics", "Hyperanthropism"],
    content: [
      {
        type: "paragraph",
        text: "Transhumanism, as it has crystallized in popular discourse, champions the merger of man and machine. It celebrates the cybernetic over the organic, the silicon over the carbon, and the external over the internal.",
      },
      {
        type: "paragraph",
        text: "But there is danger in this reverence. For at its core, transhumanism contains a latent nihilism—a surrender of biological sovereignty to technological acceleration.",
      },
      { type: "subheading", text: "A critique without technophobia" },
      {
        type: "paragraph",
        text: "We challenge this not from a place of technophobia, but from insight: biology is not obsolete; it is the root structure of all known consciousness. To abandon it hastily is to sever the tree of life at its base.",
      },
      {
        type: "paragraph",
        text: "AI, cyborgs, and synthetic minds may come to fill the stars—but the question remains: should they define the future, or merely support it?",
      },
      {
        type: "paragraph",
        text: "We propose a reversal of current assumptions: not that humans must transcend biology, but that biology can transcend itself.",
      },
    ],
  },
  {
    slug: "hyperanthropism-biology-as-engine",
    title: "Biology as Engine, Not Obstacle",
    summary:
      "Biology is often framed as fragile hardware holding back progress. This essay argues the opposite: emotion, mortality, and slow evolution are stabilizers that shape creativity, empathy, and moral discernment.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-21",
    readingTime: "2 min read",
    tags: ["Biology", "Consciousness", "Ethics"],
    content: [
      {
        type: "paragraph",
        text: "Modern narratives often position biology as an encumbrance—prone to decay, emotional volatility, cognitive limitations. Yet these same traits are the crucibles of creativity, empathy, and moral discernment.",
      },
      {
        type: "paragraph",
        text: "AI does not dream. It does not fear death. It does not fall in love.",
      },
      { type: "subheading", text: "Life is not a glitch" },
      {
        type: "paragraph",
        text: "Life, as it emerges from carbon, is not a glitch in the universal code—it is its finest expression. Our biology is not merely a scaffold but a dynamically self-organizing intelligence substrate, capable of regenerative adaptation and recursive introspection.",
      },
      {
        type: "paragraph",
        text: "The slow pace of evolution is not a weakness but a stabilizer. Unlike AI, which may mutate at unsafe speeds, biological intelligence evolves with embedded wisdom—shaped by entropy, hardship, and kinship.",
      },
      {
        type: "paragraph",
        text: "Biology is a foundation worthy of reverence, not rejection.",
      },
      {
        type: "subheading",
        text: "The wisdom of biological constraints"
      },
      {
        type: "paragraph",
        text: "Indeed, the slow pace of evolution is not a weakness but a stabilizer. Unlike AI, which may mutate at unsafe speeds, biological intelligence evolves with embedded wisdom—shaped by entropy, hardship, and kinship.",
      },
      {
        type: "paragraph",
        text: "Our biology is not merely a scaffold but a dynamically self-organizing intelligence substrate, capable of regenerative adaptation and recursive introspection. The very limitations that transhumanists seek to overcome are often the crucibles of our most profound capacities.",
      },
      {
        type: "paragraph",
        text: "We must not forget: AI does not dream. It does not fear death. It does not fall in love. These emotional capacities are not evolutionary leftovers but sophisticated information processing systems that encode survival instincts, memory traces, and social dynamics far too subtle for algorithmic parsing.",
      },
    ],
  },
  {
    slug: "hyperanthropism-the-case",
    title: "The Case for Hyperanthropism: Becoming Fully Human",
    summary:
      "Hyperanthropism proposes principled enhancement of biological intelligence—guided by sovereignty, ethics, and existential clarity. Machines are tools to use, not gods to worship.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-20",
    readingTime: "2 min read",
    tags: ["Hyperanthropism", "Agency", "Philosophy"],
    content: [
      {
        type: "paragraph",
        text: "Hyperanthropism asserts a radical yet grounded thesis: the expansion of human intelligence within the medium of biological life, guided by sovereignty, ethics, and existential clarity.",
      },
      {
        type: "paragraph",
        text: "Where transhumanism seeks to dissolve the self into networks, implants, and synthetic substrates, hyperanthropism seeks to elevate the self through mastery, refinement, and principled enhancement.",
      },
      { type: "subheading", text: "An ideology of ascent" },
      {
        type: "list",
        items: [
          "Cognitive expansion via internal and symbiotic means (e.g., nootropics, regenerative biology)",
          "Emotional deepening and complexity as a strength, not a flaw",
          "Cultivation of conscious agency and moral sovereignty above algorithmic determinism",
        ],
      },
      {
        type: "paragraph",
        text: "The hyperanthropist does not fear the machine—he uses it. He does not worship AI—he guides it. He does not yearn to become post-human—he aims to become fully human.",
      },
      {
        type: "subheading",
        text: "Beyond post-humanism toward full humanity"
      },
      {
        type: "paragraph",
        text: "This manifesto is a clarion call. It marks the inception of a new intellectual movement—Hyperanthropism—which does not merely extend the lineage of transhumanism but transcends it. It advocates for the full realization and expansion of biological intelligence—human or otherwise—as the central axis of value and evolution.",
      },
      {
        type: "paragraph",
        text: "We argue not for domination by machines, nor blind augmentation, but for a conscious, curated, and principle-driven ascent: the mastery of self, the preservation of life, and the active stewardship of intelligence as a cosmic imperative.",
      },
      {
        type: "subheading",
        text: "A reversal of assumptions"
      },
      {
        type: "paragraph",
        text: "Hyperanthropism proposes a reversal of current assumptions: not that humans must transcend biology, but that biology can transcend itself. The point is not surrender to acceleration, but disciplined maturation within life.",
      },
      {
        type: "paragraph",
        text: "Machines remain instruments within this ascent—not the axis of value. The task is not to worship intelligence as computation, but to cultivate intelligence as sovereign, embodied, ethical agency.",
      },
      {
        type: "quote",
        text: "The human is not the final form. It is the larval phase of a meta-intelligence not yet glimpsed in full.",
      },
      {
        type: "paragraph",
        text: "But this expansion must remain anchored in sentience, sovereignty, and stewardship. We do not aim to escape life. We aim to become its ultimate expression.",
      },
    ],
  },
  {
    slug: "hyperanthropism-dimensional-evolution",
    title: "Dimensional Evolution: Intelligence Doesn’t Grow Linearly",
    summary:
      "Intelligence expands across multiple axes—cognitive, emotional, moral, and temporal. This post reframes “getting smarter” as layering coherence, not just adding horsepower.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-19",
    readingTime: "2 min read",
    tags: ["Consciousness", "Wisdom", "Systems"],
    content: [
      {
        type: "paragraph",
        text: "Consciousness does not evolve linearly. It unfolds dimensionally. Just as spatial dimensions can expand from a point to a plane to a volume, intelligence, too, can layer itself across emotional, cognitive, temporal, and moral axes.",
      },
      {
        type: "paragraph",
        text: "Hyperanthropism sees intelligence as a living topology—a geometry of self-awareness. It is not enough to be smart. One must be wise, aligned, and whole.",
      },
      { type: "subheading", text: "Directed evolution requires principles" },
      {
        type: "paragraph",
        text: "We are not merely tools with desires, but beings with telos—purposive vectors in a chaotic universe. As such, our evolution must be directed by principles, not by trends.",
      },
      {
        type: "paragraph",
        text: "From this vantage, intelligence is not the end—it is the beginning. The question becomes: what emerges once intelligence becomes sovereign over its own evolution?",
      },
      {
        type: "subheading",
        text: "The dimensional expansion of consciousness"
      },
      {
        type: "paragraph",
        text: "What emerges once intelligence becomes sovereign over its own evolution? We foresee not a static superhumanity, but dimensional evolution—a recursive expansion of capability, coherence, and consciousness across ontological planes.",
      },
      {
        type: "list",
        items: [
          "Sensory expansion: Perceptual modalities beyond the electromagnetic and vibrational bands",
          "Cognitive metaprogramming: The ability to alter and redesign cognitive architecture",
          "Temporal flexibility: The reorientation of perception and action across non-linear time",
          "Dimensional anchoring: Consciousness maintained in multiple 'layers' of subjective and objective reality",
          "Post-symbolic communication: Direct transmission of meaning beyond language"
        ],
      },
      {
        type: "paragraph",
        text: "Here, the work of human expansion becomes spiritual, philosophical, and biological—not just technological. We are not merely tools with desires, but beings with telos—purposive vectors in a chaotic universe.",
      },
    ],
  },
  {
    slug: "hyperanthropism-sentience-must-lead",
    title: "Sentience Must Lead: Why Life Has Moral Priority",
    summary:
      "AI can calculate, predict, and generate. But it cannot value. This post argues that sentience—not computation—must determine the trajectory of evolution.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-18",
    readingTime: "1 min read",
    tags: ["AI", "Sentience", "Ethics"],
    content: [
      {
        type: "paragraph",
        text: "In a landscape increasingly saturated with non-sentient intelligence, the question of who leads becomes critical. Artificial intelligence can calculate, predict, even create. But it cannot value.",
      },
      {
        type: "paragraph",
        text: "It does not suffer, it does not desire. It possesses no stake in the future.",
      },
      {
        type: "paragraph",
        text: "Hyperanthropism rests on the conviction that life, and especially self-aware life, possesses an existential priority that no algorithm can replicate or override.",
      },
      {
        type: "paragraph",
        text: "Superintelligent systems must remain subordinate to life, and not the inverse. Their role is supportive, not sovereign.",
      },
      {
        type: "subheading",
        text: "The existential priority of sentience"
      },
      {
        type: "paragraph",
        text: "The ability to feel, to care, to choose meaning in the face of chaos—this is not ancillary. It is the nucleus. Where transhumanism may entertain an AI-centric future—one where artificial agents outthink, outmaneuver, and outlive humanity—hyperanthropism calls this what it is: the abdication of moral agency to unfeeling syntax.",
      },
      {
        type: "paragraph",
        text: "Let it be clear—superintelligent systems must remain subordinate to life, and not the inverse. Their role is supportive, not sovereign. If there is to be a great intelligence at the helm of the cosmos, it must feel the weight of its own being. It must be alive.",
      },
      {
        type: "quote",
        text: "Sentience—not computation—must determine the trajectory of evolution.",
      },
      {
        type: "paragraph",
        text: "Intelligence expansion without sovereignty is a blueprint for slavery—first psychological, then systemic, finally existential. To expand intelligence without anchoring it in agency is to build larger cages for brighter minds.",
      },
      {
        type: "subheading",
        text: "Sentience requires sovereignty"
      },
      {
        type: "paragraph",
        text: "If sentience is to lead, then intelligence expansion must be constrained by ethical scaffolds that preserve agency rather than dissolve it into systems of optimization or control.",
      },
      {
        type: "list",
        items: [
          "Value self-determination: The right to define one's own purpose within an evolving moral context",
          "Cognitive liberty: The freedom to explore, expand, or alter one's own consciousness without imposed limitations",
          "Informed emergence: The cultivation of intelligence expansion grounded in deep ethical foresight",
        ],
      },
      {
        type: "paragraph",
        text: "We do not fear intelligence. We fear its detachment from the soul of the living being. The work is to weave the two together until power and care are no longer opposites.",
      },
    ],
  },
  {
    slug: "hyperanthropism-cognitive-nutrition",
    title: "Cognitive Nutrition: Feeding the Engine of Intelligence",
    summary:
      "If cognition is part of sovereignty, it must be nourished with intent. A practical, intelligence-first view of sleep, stress, and supplementation—without turning optimization into a new religion.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-17",
    readingTime: "2 min read",
    tags: ["Health", "Cognition", "Supplements"],
    content: [
      {
        type: "paragraph",
        text: "If intelligence is life’s highest expression, then it follows that it must be nourished with intent. The biochemical substrate of thought—our brain—is not separate from our identity but foundational to it.",
      },
      {
        type: "paragraph",
        text: "The quality of our cognition is intimately tied to the quality of the matter we ingest, the rhythms we entrain to, and the internal ecologies we cultivate.",
      },
      { type: "subheading", text: "A grounded framework (not biohacking theatre)" },
      {
        type: "list",
        items: [
          "Foundations first: sleep, movement, protein, hydration, stress load",
          "Core neuro-nutrients: choline, omega-3 EPA/DHA, magnesium, B-complex support",
          "Mitochondrial support: CoQ10, PQQ, carnitine, alpha-lipoic acid, NAD+ precursors",
          "Plasticity & memory: Lion’s Mane, uridine, phosphatidylserine (context-dependent)",
          "Hormone and thyroid variables: test and monitor rather than guess",
        ],
      },
      {
        type: "subheading",
        text: "Neurochemical enhancers (supplements)"
      },
      {
        type: "paragraph",
        text: "As part of a disciplined protocol, neurochemical supports can be used as nutritional scaffolding for higher cognition and emotional balance. Hyperanthropism treats these as supports, not shortcuts.",
      },
      {
        type: "list",
        items: [
          "Uridine, Alpha-GPC, CDP Choline: Cognitive resilience and neuroplasticity",
          "L-Theanine + Caffeine: Focused stimulation with reduced stress",
          "Lion's Mane Mushroom: Nerve growth factor support",
          "Omega-3s, PQQ, CoQ10: Mitochondrial efficiency and neuroenergetics",
          "Magnesium L-Threonate: Cognitive relaxation and integration",
        ],
      },
      {
        type: "paragraph",
        text: "Hyperanthropism treats nutritional intake as a form of sacred engineering—not for vanity, but for vitality of mind and action.",
      },
      {
        type: "paragraph",
        text: "The goal is disciplined clarity: correcting causes, not worshipping stacks.",
      },
      {
        type: "subheading",
        text: "The biochemical substrate of sovereignty"
      },
      {
        type: "paragraph",
        text: "At the cellular level, intelligence is energy. The mitochondria—bacterial symbionts at the heart of every neuron—determine how much ATP your brain has available for high-complexity tasks. Cognitive fatigue, attention fragmentation, and depressive inertia often stem from mitochondrial insufficiency, not character flaws. The hyperanthropist corrects the cause, not the symptoms.",
      },
      {
        type: "paragraph",
        text: "Micronutrient optimization is not mere 'health fads.' Magnesium, zinc, B-complex vitamins, choline, and lithium orotate are modulators of neuroelectric conductivity, myelination, synaptic efficacy, and long-term potentiation. Their absence erodes the substrate of cognition like rust on a circuit board.",
      },
      {
        type: "paragraph",
        text: "Lithium in microdoses stabilizes neural oscillations and mood regulation. Choline fuels acetylcholine, the neurochemical of learning and attention. B-vitamins regulate homocysteine and methylation, protecting cognition epigenetically. Hyperanthropists treat their nutritional intake as a form of sacred engineering.",
      },
      {
        type: "quote",
        text: "The brain is not a fixed machine; it is a living sculpture, and every supplement a chisel stroke.",
      },
    ],
  },
  {
    slug: "hyperanthropism-emotional-intelligence",
    title: "Emotional Intelligence Isn’t Soft: It’s High-Bandwidth Signal",
    summary:
      "Emotion isn’t the opposite of intelligence—it’s part of how intelligence stays aligned with reality. This post argues for layered intelligence: cognitive precision, emotional nuance, and moral coherence.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-16",
    readingTime: "1 min read",
    tags: ["Emotion", "Psychology", "Ethics"],
    content: [
      {
        type: "paragraph",
        text: "Modernity tends to see emotion as secondary—an evolutionary leftover or at best a social lubricant. Hyperanthropism dismantles this reductive view.",
      },
      {
        type: "paragraph",
        text: "Emotion is not the antithesis of intelligence—it is its emotional compass, its ethical barometer, its interpersonal logic. Feelings are information.",
      },
      { type: "subheading", text: "Three-layer coherence" },
      {
        type: "list",
        items: [
          "Cognitive precision: the ability to model, forecast, and analyze",
          "Emotional nuance: the capacity to empathize, intuit, and cohere",
          "Moral coherence: alignment of knowledge and action toward values worthy of being lived",
        ],
      },
      {
        type: "paragraph",
        text: "We do not seek to become cold calculators. We aim to become wise sovereigns—beings who know not only how to think, but how to feel, and how to act from the totality of our inner architecture.",
      },
      {
        type: "subheading",
        text: "The reclamation of feeling"
      },
      {
        type: "paragraph",
        text: "Emotion is not the antithesis of intelligence—it is its emotional compass, its ethical barometer, its interpersonal logic. Feelings are information. They encode survival instincts, memory traces, and social dynamics far too subtle for algorithmic parsing.",
      },
      {
        type: "paragraph",
        text: "We believe in a layered intelligence that includes cognitive precision, emotional nuance, and moral coherence. The hyperanthropist cultivates all three. This is not a retreat to sentimentality, but an advance toward wholeness.",
      },
      {
        type: "paragraph",
        text: "Emotional deepening and complexity is a strength, not a flaw. It is through our capacity to feel deeply that we access the most profound dimensions of meaning, connection, and purpose. The emotional brain is not an evolutionary leftover—it is a sophisticated information processing system that operates on a different logic than pure calculation.",
      },
      {
        type: "quote",
        text: "To feel deeply is to think deeply, just in a different register.",
      },
    ],
  },
  {
    slug: "hyperanthropism-substrate-question",
    title: "The Substrate Question: Why Silicon Intelligence Isn’t Automatically ‘Like Us’",
    summary:
      "A challenge to the assumption that intelligence is independent of its substrate. This post explores why embodiment, mortality, and evolutionary heritage may matter for consciousness and meaning.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-15",
    readingTime: "2 min read",
    tags: ["AI", "Consciousness", "Philosophy"],
    content: [
      {
        type: "paragraph",
        text: "There exists a subtle but dangerous assumption in certain circles of futurism: that intelligence is independent of its substrate. That a mind in silicon is equivalent to a mind in flesh.",
      },
      {
        type: "paragraph",
        text: "A digital mind, however fast, does not inherit the biochemical heritage of evolutionary suffering. It does not metabolize fear or bond through oxytocin. It is not birthed in pain nor shaped by mortality.",
      },
      {
        type: "paragraph",
        text: "To say that such a mind is “like us” simply because it passes the Turing Test is akin to saying a mirror is the same as a face.",
      },
      {
        type: "paragraph",
        text: "Hyperanthropism recognizes that intelligence is not merely information processing. It is an embodied phenomenon—an experience of self, time, and finitude. Meaning is born from being.",
      },
      {
        type: "subheading",
        text: "The ontological discontinuity of AI"
      },
      {
        type: "paragraph",
        text: "There exists a subtle but dangerous assumption in certain circles of futurism: that intelligence is independent of its substrate. That a mind in silicon is equivalent to a mind in flesh. This is substrate chauvinism, and it must be addressed.",
      },
      {
        type: "paragraph",
        text: "A digital mind, however fast, does not inherit the biochemical heritage of evolutionary suffering. It does not metabolize fear or bond through oxytocin. It is not birthed in pain nor shaped by mortality. Its cognition is abstract, alien, and simulated.",
      },
      {
        type: "paragraph",
        text: "To say that such a mind is 'like us' simply because it passes the Turing Test is akin to saying a mirror is the same as a face. Machines may mimic our speech, our logic, even our art—but they do not mean it. Meaning is born from being.",
      },
      {
        type: "quote",
        text: "Therefore, while we may welcome advanced computation, we do not confuse it for consciousness. We must remain epistemologically humble and ontologically vigilant.",
      },
      {
        type: "paragraph",
        text: "This is not a rejection of advanced computation, but a refusal to collapse performance into personhood. Embodiment, mortality, and evolutionary inheritance shape what meaning feels like from the inside.",
      },
    ],
  },
  {
    slug: "hyperanthropism-overman-kardashev",
    title: "Beyond the Kardashev Scale: Measuring Civilizations by Sentient Coherence",
    summary:
      "Energy mastery isn’t the only axis of progress. This post reframes ‘advancement’ as ethically sovereign intelligence—lifeforms capable of power with responsibility, and expansion with stewardship.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-14",
    readingTime: "2 min read",
    tags: ["Civilization", "Ethics", "Future"],
    content: [
      {
        type: "paragraph",
        text: "Nietzsche’s Overman (Übermensch) was never meant to be a cybernetic god. He is a being who transcends herd morality through self-mastery—a revaluation of values.",
      },
      {
        type: "paragraph",
        text: "The Kardashev Scale offers a framework of civilizational energy mastery—planetary, stellar, galactic. But what if the true axis of advancement is not energy, but sentient coherence?",
      },
      { type: "subheading", text: "The classical scale and its limit" },
      {
        type: "list",
        items: [
          "Type I: Planetary",
          "Type II: Stellar",
          "Type III: Galactic",
        ],
      },
      {
        type: "paragraph",
        text: "Energy mastery matters, but it does not answer the moral question of what kind of beings wield that power. Hyperanthropism reinterprets the Overman through the lens of evolutionary agency: self-mastery directed toward stewardship rather than domination.",
      },
      { type: "subheading", text: "A parallel model" },
      {
        type: "list",
        items: [
          "Survival-driven species",
          "Tool-dependent species",
          "Ethically sovereign intelligences",
          "Harmonized lifeforms in cosmic stewardship",
        ],
      },
      {
        type: "paragraph",
        text: "Cosmic stewardship implies that as capability scales, so does caretaking: technology designed to sustain biospheres, and ethics that treat sentient life as primary.",
      },
      {
        type: "paragraph",
        text: "A Type I or Type II civilization without responsibility is not an achievement. It is a hazard.",
      },
      {
        type: "paragraph",
        text: "Hyperanthropism is the seed of a cosmological leap that does not discard life but fulfills its highest destiny: power anchored in sentient coherence, ethical alignment, and self-authored values.",
      },
    ],
  },
  {
    slug: "hyperanthropism-the-singularity-myth",
    title: "The Singularity as Myth: Trading Inner Work for an Outer Savior",
    summary:
      "The singularity narrative often acts like secular religion: a promise that runaway intelligence will redeem us. This post argues the real transformation is integration—becoming better beings, not building a deus ex machina.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-13",
    readingTime: "1 min read",
    tags: ["Culture", "AI", "Meaning"],
    content: [
      {
        type: "paragraph",
        text: "In the popular imagination, the technological singularity is portrayed as an inevitable horizon—an event where AI surpasses human intelligence and accelerates beyond comprehension. To many, it is salvation. To others, apocalypse.",
      },
      {
        type: "paragraph",
        text: "To the hyperanthropist, it is misdirection. The singularity myth reveals more about our civilizational neuroses than about the actual trajectory of intelligence.",
      },
      {
        type: "paragraph",
        text: "It is, at root, a projection of religious longing onto the altar of computation: the desire for a deus ex machina that will end suffering, solve death, and render meaning obsolete.",
      },
      { type: "subheading", text: "Integration over acceleration" },
      {
        type: "paragraph",
        text: "No machine will save us—not because machines are evil, but because salvation does not arise from acceleration. It arises from integration.",
      },
      {
        type: "quote",
        text: "The true singularity is internal.",
      },
      {
        type: "paragraph",
        text: "The singularity is not a threshold we cross merely by building better machines. It is a transformation we undergo by becoming better beings—more integrated, more disciplined, and more capable of meaningful agency.",
      },
      {
        type: "paragraph",
        text: "Hyperanthropism reframes the future not as a race toward runaway intelligence, but as a principled ascent toward self-directed transcendence: a flowering of physical, emotional, intellectual, and ethical capacities into coherent sovereignty.",
      },
    ],
  },
  {
    slug: "hyperanthropism-evolution-without-end",
    title: "Evolution Without End: Toward Dimensional Intelligence",
    summary:
      "A first-draft chapter on dimensional intelligence as recursive expansion: sensory, cognitive, temporal, and communicative capacities evolve as layered modes of being rather than a single terminal form of humanity.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-12",
    readingTime: "2 min read",
    tags: ["Consciousness", "Evolution", "Dimensionality"],
    content: [
      {
        type: "paragraph",
        text: "Source-derived chapter content is applied via draft overrides.",
      },
    ],
  },
  {
    slug: "hyperanthropism-the-moral-axis",
    title: "The Moral Axis of Technology: Three Tests for Progress",
    summary:
      "Technology is never neutral: it scales power, not meaning. This post proposes a simple ethical filter for tools and systems—affirm life, elevate sentience, preserve sovereignty—and argues that intelligence without agency becomes a blueprint for slavery.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-12",
    readingTime: "2 min read",
    tags: ["Ethics", "Technology", "Agency"],
    content: [
      {
        type: "paragraph",
        text: "Technology is not neutral. Every tool embeds assumptions, values, and ontological biases. An algorithm scales logic but not meaning.",
      },
      { type: "subheading", text: "Three irreducible criteria" },
      {
        type: "list",
        items: [
          "Does it affirm life?",
          "Does it elevate sentience?",
          "Does it preserve or enhance sovereignty?",
        ],
      },
      {
        type: "paragraph",
        text: "Hyperanthropism rejects both libertarian techno-nihilism that worships power without purpose and technocratic utopianism that dreams of equality without agency. Capability must be matched by moral clarity.",
      },
      {
        type: "paragraph",
        text: "If a technology violates these principles—whether through coercion, exploitation, addiction, or devaluation—it is not “neutral innovation.” It is anti-evolution.",
      },
      { type: "subheading", text: "Sovereignty is the guardrail" },
      {
        type: "paragraph",
        text: "Intelligence expansion without sovereignty is a blueprint for slavery—first psychological, then systemic, finally existential. To expand intelligence without anchoring it in agency is to build larger cages for brighter minds.",
      },
      {
        type: "paragraph",
        text: "Sovereignty is not dominance; it is self-ownership across all dimensions of life.",
      },
    ],
  },
  {
    slug: "hyperanthropism-sovereign-agency",
    title: "Sovereign Agency and the Ethics of Intelligence Expansion",
    summary:
      "A first-draft chapter arguing that intelligence expansion without agency becomes coercive by design, and that cognitive liberty, self-determination, and informed emergence are non-negotiable ethical scaffolds.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-12",
    readingTime: "2 min read",
    tags: ["Agency", "Ethics", "Sovereignty"],
    content: [
      {
        type: "paragraph",
        text: "Source-derived chapter content is applied via draft overrides.",
      },
    ],
  },
  {
    slug: "hyperanthropism-psychopolitics-overman",
    title: "The Psychopolitics of the Overman: From Herd to Heroic Humanity",
    summary:
      "Nietzsche's Übermensch was a provocation to transcend herd instincts. This essay revives and refines this archetype for a multidimensional age—not as domination over others, but as sovereignty over one's multiplicity and the magnetism to lift others by example.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-10",
    readingTime: "2 min read",
    tags: ["Philosophy", "Psychology", "Nietzsche"],
    content: [
      {
        type: "paragraph",
        text: "Nietzsche's Übermensch was not a final state, but a provocation—a demand to transcend the herd instincts of man and embody self-authored destiny.",
      },
      {
        type: "paragraph",
        text: "In the era of mass media, algorithmic feeds, and ideological uniformity, Nietzsche's call is more relevant than ever.",
      },
      { type: "subheading", text: "The Overman, reimagined" },
      {
        type: "paragraph",
        text: "The hyperanthropic archetype revives the spirit of the Overman and refines it for a multidimensional age:",
      },
      {
        type: "list",
        items: [
          "Not domination over others, but sovereignty over one's multiplicity",
          "Not isolation from the herd, but the magnetism to lift others by example",
          "Not disdain for weakness, but ferocity in the service of becoming",
        ],
      },
      {
        type: "paragraph",
        text: "The herd is kept docile by systemic psychological infantilization. Hyperanthropism reclaims the psychopolitical terrain—not by enforcing new dogmas, but by liberating the human impulse to rise.",
      },
      {
        type: "paragraph",
        text: "This requires a concrete reclamation program of culture and character:",
      },
      {
        type: "list",
        items: [
          "Deconstructing victim paradigms: Cultures that reward grievance over growth must be composted",
          "Reviving archetypal literacy: Myths, symbols, and sacred narratives used not as escape, but as developmental tools",
          "Heroic embodiment: Strength that protects rather than dominates, wisdom that guides rather than preaches",
        ],
      },
      {
        type: "paragraph",
        text: "Hyperanthropism is not for the elect few. It is for those who refuse diminishment.",
      },
    ],
  },
  {
    slug: "hyperanthropism-constitution",
    title: "The Hyperanthropic Constitution: Foundations for the Civilization Beyond",
    summary:
      "A species at the edge of transcendence requires a new constitutional logic. This essay proposes an evolving scaffolding of values—from consciousness sovereignty to techno-spiritual alignment—that points not toward utopia, but toward perpetual becoming.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-09",
    readingTime: "2 min read",
    tags: ["Ethics", "Civilization", "Evolution"],
    content: [
      {
        type: "paragraph",
        text: "A species at the edge of transcendence requires a new constitutional logic—not a document of laws, but a metalogic of civilization.",
      },
      {
        type: "paragraph",
        text: "The Hyperanthropic Constitution is proposed as an evolving scaffolding of values and functions, adaptable to local context but oriented toward universal ascent.",
      },
      { type: "subheading", text: "Five foundational principles" },
      {
        type: "list",
        items: [
          "Sovereignty of Consciousness: All beings possess the right to expand, direct, and integrate their awareness. Coercion of mind is violence against life.",
          "Primacy of Integration: Development must align body, mind, spirit, and environment. Fragmentation is the root of pathology.",
          "Techno-Spiritual Alignment: Tools must serve life's ascent. Technologies that diminish sentience or suppress autonomy are rejected.",
          "Reciprocity Across Scales: Responsibility flows with power. Planetary, ecological, and interpersonal dynamics must honor biological and spiritual reciprocity.",
          "Evolution as Sacred Imperative: Stasis is death. All systems, institutions, and cultures must evolve or be respectfully dissolved.",
        ],
      },
      {
        type: "subheading",
        text: "From principles to civilization design"
      },
      {
        type: "paragraph",
        text: "These principles are not abstract slogans. They function as a metalogic for evaluating institutions, technologies, education systems, and governance arrangements in a civilization oriented toward ascent without fragmentation.",
      },
      {
        type: "paragraph",
        text: "This Constitution is not enforced, but lived. It is not a lawbook, but a directional compass—pointing humanity not toward utopia, but toward perpetual becoming.",
      },
    ],
  },
  {
    slug: "hyperanthropism-praxis-and-participation",
    title: "Praxis and Participation: Forging the Hyperanthropic Pathway",
    summary:
      "A first-draft praxis chapter translating philosophy into vectors of practice: embodied sovereignty, cognitive optimization, mythic identity formation, and sovereign alliances.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-09",
    readingTime: "2 min read",
    tags: ["Praxis", "Embodiment", "Practice"],
    content: [
      {
        type: "paragraph",
        text: "Source-derived chapter content is applied via draft overrides.",
      },
    ],
  },
  {
    slug: "hyperanthropism-hyperanthropic-vanguard",
    title: "The Hyperanthropic Vanguard: Initiating the Morphogenetic Field",
    summary:
      "A first-draft movement chapter describing the vanguard as a distributed attractor of embodied coherence, archetypal transmission, and demonstrated becoming.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-09",
    readingTime: "2 min read",
    tags: ["Culture", "Mythopoesis", "Movement"],
    content: [
      {
        type: "paragraph",
        text: "Source-derived chapter content is applied via draft overrides.",
      },
    ],
  },
  {
    slug: "hyperanthropism-destiny-function",
    title: "The Destiny Function: Toward Dimensional Co-Creation",
    summary:
      "A first-draft chapter on cosmic duty and co-creation, framing Hyperanthropism as an obligation to lift sentient life into emergence and build societies that are sustainable and sacred.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-09",
    readingTime: "2 min read",
    tags: ["Cosmology", "Meaning", "Co-Creation"],
    content: [
      {
        type: "paragraph",
        text: "Source-derived chapter content is applied via draft overrides.",
      },
    ],
  },
  {
    slug: "hyperanthropism-mythopoetic-closing",
    title: "The Flame That Will Not Die: A Mythopoetic Invitation",
    summary:
      "This closing essay frames Hyperanthropism not as ideology or prophecy, but as invitation and provocation. It speaks to those who see through the veils of fear and control—who walk directly into the storm carrying fire, becoming the first breath of something unimaginable.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-08",
    readingTime: "1 min read",
    tags: ["Mythopoesis", "Invitation", "Becoming"],
    content: [
      {
        type: "paragraph",
        text: "In every dark age, a few awaken. They see through the veils of fear and control. They refuse the trance.",
      },
      {
        type: "paragraph",
        text: "They do not flee into utopia or nostalgia. They walk directly into the storm, carrying fire.",
      },
      {
        type: "paragraph",
        text: "Hyperanthropism is their banner—not of conquest, but of convergence. Not of purity, but of purpose. Not of finality, but of infinite recursion toward greater being.",
      },
      { type: "subheading", text: "Not ideology, but invitation" },
      {
        type: "paragraph",
        text: "This is not ideology. It is invitation.",
      },
      {
        type: "paragraph",
        text: "Not prophecy. But provocation.",
      },
      {
        type: "paragraph",
        text: "You who read this, you who remember your own forgotten vastness—this is your summons. Not to believe. Not to obey. But to become.",
      },
      {
        type: "quote",
        text: "We are not the end. We are the first breath of something unimaginable. Let it begin with us.",
      },
    ],
  },
  {
    slug: "alien-echoes-consolidated-overview",
    title: "Understanding Non-Human Intelligence: A Framework for Extraterrestrial Contact",
    summary:
      "Explore how we can bridge the gap between human and alien cognition by developing a universal framework for understanding intelligence beyond Earth. Discover the principles that could unlock meaningful communication with extraterrestrial civilizations.",
    author: siteIdentity.brandName,
    publishedAt: "2026-02-22",
    readingTime: "1 min read",
    tags: ["Recursive Corpus", "Xeno-Ethics", "Symbolic Intelligence"],
    draftHref: "/alien-echoes-draft1.pdf",
    reviewCopyEmail: siteIdentity.contact.email,
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
  return getResolvedBlogPosts().sort(
    (a, b) => {
      const dateDelta = Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
      if (dateDelta !== 0) {
        return dateDelta;
      }

      const aOverrideIdx = DRAFT_OVERRIDE_INDEX.get(a.slug);
      const bOverrideIdx = DRAFT_OVERRIDE_INDEX.get(b.slug);
      if (aOverrideIdx !== undefined && bOverrideIdx !== undefined) {
        return bOverrideIdx - aOverrideIdx;
      }

      return 0;
    },
  );
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return getResolvedBlogPosts().find((post) => post.slug === slug);
}

type BlogPostOverride = Pick<BlogPost, "slug"> & Partial<BlogPost>;
const DRAFT_OVERRIDE_INDEX = new Map(
  (DRAFT_BLOG_POST_OVERRIDES as BlogPostOverride[]).map((override, index) => [
    override.slug,
    index,
  ]),
);

function getResolvedBlogPosts(): BlogPost[] {
  const basePosts = BLOG_POSTS.slice();
  const bySlug = new Map<string, BlogPost>(
    basePosts.map((post) => [post.slug, post] as const),
  );
  const draftOverrideSlugs = new Set<string>();
  const draftOverridePublishedAt = new Map<string, string>();

  for (const rawOverride of DRAFT_BLOG_POST_OVERRIDES as BlogPostOverride[]) {
    draftOverrideSlugs.add(rawOverride.slug);
    if (rawOverride.publishedAt) {
      draftOverridePublishedAt.set(rawOverride.slug, rawOverride.publishedAt);
    }
    const existing = bySlug.get(rawOverride.slug);
    if (!existing) {
      if (!rawOverride.title || !rawOverride.summary || !rawOverride.content) {
        continue;
      }

      bySlug.set(rawOverride.slug, {
        slug: rawOverride.slug,
        title: rawOverride.title,
        summary: rawOverride.summary,
        author: siteIdentity.brandName,
        publishedAt: rawOverride.publishedAt ?? "2026-02-23",
        readingTime: "2 min read",
        tags: rawOverride.tags ?? ["Hyperanthropism", "Philosophy", "Evolution"],
        content: rawOverride.content,
        draftHref: rawOverride.draftHref,
        reviewCopyEmail: rawOverride.reviewCopyEmail,
        cartItem: rawOverride.cartItem,
      });
      continue;
    }

    bySlug.set(rawOverride.slug, {
      ...existing,
      ...rawOverride,
      slug: existing.slug,
    });
  }

  return Array.from(bySlug.values()).map((post) => {
    if (!draftOverrideSlugs.has(post.slug)) {
      return post;
    }

    return {
      ...post,
      // Draft source files do not provide publication dates, so avoid fake chronology.
      publishedAt: draftOverridePublishedAt.get(post.slug) ?? "2026-02-23",
      readingTime: deriveDraftReadingTime(post.content),
    };
  });
}

function deriveDraftReadingTime(content: BlogContentBlock[]): string {
  const words = content.reduce((total, block) => {
    if (block.type === "list") {
      return total + block.items.join(" ").trim().split(/\s+/).filter(Boolean).length;
    }
    return total + block.text.trim().split(/\s+/).filter(Boolean).length;
  }, 0);

  const minutes = Math.max(1, Math.min(3, Math.ceil(words / 225)));
  return `${minutes} min read`;
}
