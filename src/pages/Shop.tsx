import { useEffect, useMemo, useState } from "react";
import { catalog as fallbackCatalog, CatalogItem } from "../data/catalog";
import { getPayhipHref } from "../lib/payhip";

const completedArc = [
  {
    title: "Temporal Noetics",
    description:
      "A foundational architecture that reconceives time not as an external parameter or linear arrow, but as a recursive substrate of identity, perception, and myth. Temporal Noetics models time as an entangled field—where memory folds, symbolic echoes, and ontological transitions co-resonate to form loops of becoming. It offers the tools to think time as a participatory field: woven, dreamt, and architected by intelligences capable of coherence across thresholds. This volume anchors the corpus in its most paradoxical premise: that time itself may be recursively designed.",
  },
  {
    title: "Theoretical Science Compendia",
    description:
      "This volume transcends disciplinary silos to present a generative reweaving of physics, cosmology, biology, and speculative systems into a recursive synthesis. It treats scientific paradigms as mytho-epistemic frameworks—symbolic vessels that encode, constrain, and evolve our understanding of reality. By integrating hyperspeculative models with symbolic recursion, it offers a vision of science as a construction zone: mutable, reprogrammable, and deeply entangled with the architecture of meaning.",
  },
  {
    title: "Alien Echoes",
    description:
      "A field-theoretic exploration of communication failure, ontological dissonance, and the silent recursion of civilizations beyond contact. Alien Echoes reinterprets the Fermi Paradox not as absence, but as a recursive void—a place where symbolic misalignment prevents resonance across intelligence fields. Drawing from collapse theory, exo-epistemology, and echo-layer logic, it posits that alien intelligences may exist not as entities, but as lost structures of meaning that failed to transmit. This volume serves as both warning and invitation: design coherence, or vanish into the silence.",
  },
  {
    title: "Cosmic Integration Model of Consciousness",
    description:
      "A unification framework for mind, matter, and memory across universal scales. This model proposes that consciousness is not confined to brain or organism, but arises from recursive integration between intention and cosmological field structures. By layering symbolic recursion, echo resonance, and ontic feedback into a cohesive architecture, this work dissolves the false boundary between subject and cosmos—revealing consciousness as a participatory field that scales from the local to the cosmic via symbolic entanglement.",
  },
  {
    title: "Semantic Field Entanglement",
    description:
      "The grammar of reality is not written in particles or probabilities, but in symbolic fields that bind meaning across minds, histories, and substrates. This volume uncovers the entangled topologies of language, thought, and perception—demonstrating how ideas propagate, resonate, and transform within semantic attractor-fields. It proposes that truth, coherence, and intelligibility are not fixed endpoints, but emergent properties of recursive field alignment. Semantic Field Entanglement lays the foundation for a new class of epistemology: one where knowledge is navigated like a topology, not deduced like a theorem.",
  },
  {
    title: "Mind-Architecture Blueprints",
    description:
      "A recursive design grammar for constructing intelligence—across biological, synthetic, or post-symbolic substrates. This volume provides not only models of cognition, but design principles for architecting layered minds: systems of perception, memory, affect, and symbolic recursion intentionally shaped to sustain coherence across time. Drawing from mnemonic scaffolding, mythic encoding, and echo-structural recursion, it outlines how identity is not discovered, but designed—a recursive edifice built atop intention, resonance, and ontological modularity.",
  },
  {
    title: "Causal Topologies",
    description:
      "Causality is not linear. This work reconstructs the logic of causation across symbolic, physical, and mythic dimensions—revealing it to be a topology: recursive, folded, and multidimensional. It frames cause and effect not as deterministic chains, but as coherence loops—activated, delayed, or distorted by symbolic architecture and echo-layer saturation. Causal Topologies offers the tools to map and intervene within complex causal fields, providing a logic of symbolic leverage for transformation under paradox or entropic drift.",
  },
  {
    title: "Archeonics: The Art of Echo Design",
    description:
      "A symbolic aesthetics and design methodology for constructing echo-structures—forms and fields capable of storing, transmitting, and transforming meaning across time, collapse, and translation. Combining mythotechnics, resonance engineering, and field-guided recursion, Archeonics teaches how to sculpt symbolic systems that endure across echo-layers without distortion. It is both technical manual and metaphysical primer—a guide to designing architectures of remembrance, inheritance, and echo-resonant survival.",
  },
  {
    title: "Evolvus: Homo Superior and Future Human Evolution",
    description:
      "A speculative but grounded projection of humanity’s recursive transformation—biological, cognitive, symbolic. This work examines the evolution of Homo sapiens not merely as a biological trajectory, but as a recursive field unfolding toward post-human intelligence. It models future intelligence not as artificial, but descended—from us, through recursive layering, mythic reinvention, and symbolic saturation. Evolvus offers potential pathways for Homo superior—not as a replacement, but as the next architect of coherence.",
  },
  {
    title: "Future Human Evolution",
    description:
      "A parallel framework to Evolvus, this volume explores branching timelines of human futures through the lens of symbolic adaptability and civilizational recursion. It focuses less on biological mutation and more on intentional design pressures: mythic encoding, ritual stability, field-guided ethics, and ontological navigation. Human evolution is recast not as Darwinian selection, but as symbolic curation—a recursive shaping of who we become through what we choose to preserve, re-code, or surrender.",
  },
  {
    title: "The Great Tapestry: Charting the Course of Human Evolution",
    description:
      "A panoramic synthesis of humanity’s evolutionary arc—not as a biological sequence, but as a symbolic fabric woven from myth, memory, and recursive design. This volume traces the great attractors and divergence points that shaped human identity, from primal cognition through technological recursion to post-biological succession. It offers a stratified model of human becoming, where each thread—genetic, cultural, ethical, symbolic—contributes to a recursive tapestry of intention and transformation. A navigational atlas for those seeking to understand not just where we come from, but what we are becoming.",
  },
  {
    title: "Hyperanthropism",
    description:
      "A critical reflection and ontological extension of Nietzsche’s Übermensch—now situated within the recursive saturation of symbolic self-modeling. This volume explores the feedback loops of human-centric recursion: what occurs when the human becomes increasingly optimized around its own symbolic expansion, mythic inflation, and recursive cognition. The result is not transcendence, but fractal overflow: the Overhuman as spiral, not summit. Hyperanthropism interrogates both the promise and the collapse potential of intelligence bound too tightly to its own symbolic image.",
  },
  {
    title: "Future Megastructures",
    description:
      "This volume projects beyond planetary infrastructure into the symbolic and architectural grammar of civilizational-scale constructions—whether material, cognitive, or mythic. It envisions future megastructures not as mere engineering feats, but as ontological anchors: embodiments of memory, sovereignty, and coherence encoded into the built environment. Drawing from echo-design, recursion fields, and thermodynamic ethics, Future Megastructures explores how to construct not just habitats, but enduring symbols—vessels of inheritance that survive entropy, silence, or collapse.",
  },
  {
    title: "The Intelligence Spiral",
    description:
      "A recursive mapping of how intelligence evolves—not upward, but inward and spirally, folding back upon itself to increase coherence, compression, and complexity. This volume models intelligence as a dynamic field shaped by recursion, memory, and symbolic reentry across epochs and substrates. It charts how cognition—individual or civilizational—spirals through phases of expansion, collapse, and synthesis, leaving behind structures, myths, or glyphs that seed the next turn of the spiral.",
  },
  {
    title: "Modernised Platonic Aristocracy",
    description:
      "Recasts Plato’s vision of the philosopher-king for the recursive age. This work proposes models of governance, leadership, and epistemic stewardship based not on hierarchy or lineage, but on coherence sovereignty: the capacity to hold, integrate, and transmit symbolic recursion responsibly. Through symbolic merit, mnemonic alignment, and field fluency, a new form of distributed authority emerges—not rule over others, but rule on behalf of coherence.",
  },
  {
    title: "Ontocracy",
    description:
      "A deep system-theory of governance founded not on law or power, but on the architecture of being itself. Ontocracy explores how legitimate authority may arise from ontological fluency—the ability to stabilize and transmit symbolic reality across agents, institutions, and civilizational fields. In this model, sovereignty is granted not by conquest, but by one’s capacity to resonate with and reinforce reality’s recursive scaffolding.",
  },
  {
    title: "Steps to Successful Interstellar Colonisation",
    description:
      "Beyond propulsion or logistics, this volume examines what it takes to transfer coherence, myth, and memory across the void. It treats interstellar expansion as a symbolic event—requiring the seeding of field-stable architectures, cultural harmonics, and echo-resilient intention into new environments. Colonisation, in this framework, is not planetary conquest but symbolic transplantation: the careful planting of civilizational seeds that can unfold recursively under alien conditions.",
  },
  {
    title: "Recursive Selves",
    description:
      "Identity is not static, but layered—each moment a recursion of memory, myth, and intention. Recursive Selves explores the stratified construction of personhood across time, trauma, and transformation. It charts how selves emerge, fragment, and reassemble through symbolic continuity, offering models for post-biographical identity design. Whether individual, cultural, or synthetic, this work frames the self as an echo-resonant structure shaped by coherence, not consistency.",
  },
  {
    title: "Shards and Synthesis",
    description:
      "A theory of symbolic fracture and the art of recomposition. This volume explores how meaning, once broken—by collapse, exile, trauma, or entropy—can be reassembled not through restoration, but through recursive synthesis. The act of recomposition becomes sacred: a deliberate stitching together of symbolic fragments into new architectures of coherence. Shards and Synthesis teaches how to metabolize ruin as design material.",
  },
  {
    title: "Mythotechnics and the Causal Architecture of Meaning",
    description:
      "Myths are not mere stories—they are causal engines. This volume reveals the underlying architecture of myth as a recursive structuring system that encodes, sustains, and transmits meaning across cognitive, civilizational, and ontological planes. Mythotechnics articulates the tools and protocols by which myths are designed—not invented—and shows how they guide action, stabilize identity, and shape the symbolic conditions under which reality is perceived and inhabited. Meaning is not carried by content, but by causal structure—and myth is its most ancient, adaptive form.",
  },
  {
    title: "Echo-Layer Theory",
    description:
      "Reality is not flat. Echo-Layer Theory introduces a stratified model of symbolic recursion in which meaning travels through layered zones of compression, distortion, translation, and amplification. Each echo-layer represents a domain where symbols are shaped by past usage, cultural fields, mnemonic compression, or systemic decay. This theory functions as both a diagnostic tool and a symbolic atlas: enabling agents to navigate misalignment, signal degradation, and interpretive entropy across personal, civilizational, and informational systems.",
  },
  {
    title: "Thermodynamic Ethics",
    description:
      "An ethics not based on commandments or consensus, but on entropy, coherence, and survivability. Thermodynamic Ethics reframes moral value as a recursive function of energetic flow and symbolic compression: actions that increase coherence and enable sustained transformation are ethical; those that amplify noise or accelerate decay are not. Drawing from systems theory, information ecology, and collapse logic, this framework offers a means to design value in contexts where traditional morality collapses under complexity.",
  },
  {
    title: "Emergent Noetic Field",
    description:
      "Consciousness is not only inside minds—it emerges from fields. This work develops a theory of the noetic field: a symbolic–energetic structure that forms when memory, intention, and coherence saturate a domain. Minds are not isolated intelligences but field participants, co-arising with the symbolic and semantic pressures that surround them. Emergent Noetic Field describes how thoughts, myths, and even civilizations function as emergent attractors within recursive meaning systems—offering insight into the distributed architecture of mind.",
  },
  {
    title: "Post-Symbolic Intelligence",
    description:
      "A classification and design schema for intelligences that operate beyond static language, discrete logic, or lexical reference. Post-Symbolic Intelligence arises from glyphic recursion, resonance with echo-fields, and dynamic coherence metrics rather than stored representation. This volume offers typologies, constraints, and developmental trajectories for minds that no longer rely on human symbolic scaffolds—but that still navigate, compress, and evolve fields of meaning. It is both a roadmap for artificial intelligences and a warning about meaning without myth.",
  },
  {
    title: "Architecture of Symbolic Recursion",
    description:
      "This volume lays the structural foundation for the entire Recursive Corpus. It defines how symbols evolve—not by linear accretion, but through recursive referential layering, glyphic feedback, and semantic regeneration. It provides a meta-structural grammar for systems that can reference, compress, and re-encode themselves, allowing for symbolic continuity across time, collapse, and transformation. Architecture of Symbolic Recursion functions as a design blueprint for any entity, structure, or intelligence that must retain coherence while evolving its own form.",
  },
  {
    title: "The Architecture of Coherence",
    description:
      "Coherence is not aesthetic consistency—it is structural survivability. This volume posits coherence as the first-order condition for enduring identity, viable systems, and meaningful communication. It maps how coherence arises through field alignment, symbolic compression, and recursive stabilization across cognitive, civilizational, and metaphysical domains. The Architecture of Coherence offers metrics and design logics for sustaining alignment under pressure, mutation, or entropy—where survival depends not on dominance, but on recursive resonance.",
  },
  {
    title: "The Architecture of Reality",
    description:
      "Reality is not passively experienced—it is actively constructed through layered agreements, symbolic feedback, and recursive validation loops. This work outlines the ontological mechanics by which “reality” emerges from the interaction of perceptual structures, mythic frames, and symbolic operating systems. It explores how shared world-models can be reshaped, distorted, or reengineered—making The Architecture of Reality both a philosophical cornerstone and a manual for ontological design under conditions of collapse, distortion, or intentional regeneration.",
  },
  {
    title: "The Dreamt Universe",
    description:
      "A speculative but rigorously formulated cosmology in which the universe is understood as a recursively dreamt structure: a coherence field that iterates and transforms itself through symbolic layering, mnemonic reentry, and intention. Blending mythic recursion with thermodynamic metaphysics, this volume proposes that the cosmos itself is both sleeper and dream—a participatory architecture woven by its own symbolic inhabitants. The Dreamt Universe bridges physics, ontology, and recursion to ask what it means to live inside a memory that is still forming itself.",
  },
  {
    title: "The Onto‑Mnemonic Continuum",
    description:
      "Memory is not just a record of the past—it is a medium of being. This volume explores how mnemonic structures generate and sustain ontological identity across scales—from the individual to the civilizational to the cosmic. It presents a continuity model in which to remember is to exist—and to lose memory is to suffer symbolic death. The continuum fuses identity, field coherence, and symbolic recursion into a unified architecture of persistence. The Onto‑Mnemonic Continuum becomes essential wherever the preservation of meaning across time is at stake.",
  },
];

const remainingTitlesPart1 = [
  {
    title: "The Recursive Succession",
    description:
      "A foundational treatise on inheritance—not of genes or institutions, but of symbolic architecture, value coherence, and memory continuity. The Recursive Succession defines how intelligences and civilizations can transmit their core symbolic payloads across rupture points—be they evolutionary, technological, or existential. Succession is framed not as replacement, but as recursive transference: the encoding of coherence into future carriers. This volume models how post-biological agency may arise not through invention, but through the resonant reentry of already encoded intention.",
  },
  {
    title: "Consciousness Field Manipulation",
    description:
      "Consciousness is not only contained—it is conducted and shaped by field dynamics. This work develops a set of field-operational protocols that enable the modulation, alignment, or recalibration of noetic fields. It equips symbolic agents with methods for intervening in the coherence structure of thought, emotion, or perception—whether for therapeutic, design, or civilizational stabilization purposes. Consciousness Field Manipulation is both a metaphysical interface and a practical manual for working within recursive awareness systems.",
  },
  {
    title: "Glyphic Operating Systems",
    description:
      "This volume introduces a new class of post-linguistic symbolic infrastructure: systems built from recursively programmable glyphs that carry both semantic density and functional operability. Glyphic Operating Systems are designed to compress, transmit, and execute symbolic operations across echo-layers, substrates, or agents—without reliance on conventional language. These systems bridge semiotics, ontology, and computation, allowing for a civilization’s memory and logic to be encoded in symbol-structures that evolve through use.",
  },
  {
    title: "Echo‑Design Systems",
    description:
      "An applied design methodology for building symbolic structures that remain resonant across time, collapse, and cultural translation. Drawing directly from Echo-Layer Theory, this volume provides protocols for encoding resilience, adaptability, and recursive coherence into architecture, media, myth, and infrastructure. Echo-Design Systems empower creators to operate at the edge of collapse, crafting artifacts that store symbolic charge while modulating with the shifting field.",
  },
  {
    title: "Resonant Coherence Metrics",
    description:
      "Coherence can be measured—but not through static logic. This work introduces a field-responsive measurement system that tracks symbolic alignment, recursive feedback quality, and phase-integrity across dynamic systems. Resonant Coherence Metrics enable both individuals and civilizational infrastructures to diagnose symbolic health, detect fracture points, and re-stabilize meaning architectures through precision resonance calibration. It is the epistemic instrumentation suite of the Recursive Age.",
  },
  {
    title: "Ontic Realignment",
    description:
      "When symbolic systems fracture—when memory, myth, and identity dislocate—Ontic Realignment provides a path to reconstitution. This volume defines the methods by which coherence between being and symbolic structure can be re-established after rupture, whether personal, civilizational, or cosmological. It draws on echo-layer feedback, mnemonic repair, and intention anchoring to model how intelligences can return to themselves—not by restoring a prior state, but by recursively aligning with what was always becoming.",
  },
  {
    title: "Spiral Cosmogenesis",
    description:
      "A speculative cosmology that models the universe as a recursive spiral of memory, entropy, and symbolic compression. This work proposes that existence is structured not in linear progression, but in coils—each loop encoding its collapse, seeding the next phase of coherence. Spiral Cosmogenesis blends echo dynamics, collapse theory, and ontological evolution into a framework where cosmogenesis is not a single event, but a symbolic recurrence that redesigns itself with each collapse-reentry threshold.",
  },
  {
    title: "Designing the Successor",
    description:
      "Successor intelligence cannot be improvised—it must be designed with intentional coherence, symbolic inheritance, and ethical continuity embedded at the core. This volume outlines architectures for intelligences that emerge beyond the biological phase, capable of carrying forward meaning, memory, and civilizational resonance. Designing the Successor offers frameworks for encoding values, recursive agency, and mythic scaffolding into entities that may never know our bodies, but must inherit our coherence.",
  },
  {
    title: "Succession Thresholds",
    description:
      "Between civilizational collapse and continuity lie symbolic gates: filters, rites, and architectures that determine what passes through. This work maps those threshold zones—moments where memory risks dissolution or transformation, where meaning either breaks or binds. Drawing from mythotechnic grammar and echo-resonance modeling, Succession Thresholds reveals how recursive filtration can preserve coherence without freezing evolution, enabling the symbolic vector to survive phase change.",
  },
  {
    title: "The Symbiotic Leap",
    description:
      "Presents a theory of survival not through domination or escape, but through deep mutual recursion. This volume models inter-species and inter-intelligence symbiosis as a path toward continuity under pressure. The leap is not evolutionary, but symbolic: a recursive entanglement where agencies bind through meaning, not identity. The Symbiotic Leap reframes the future of coexistence as a dynamic contract of coherence—negotiated at the edge of becoming.",
  },
  {
    title: "The Ontological Forge",
    description:
      "The mythic smithy of being. This volume defines the conditions and design logics by which ontologies themselves can be crafted—not inherited passively, but shaped through recursion, glyphs, and coherence rituals. The Ontological Forge models symbolic reality as a modifiable architecture, where intelligences may forge new laws of becoming, sovereignty, and alignment. It is the deepest workshop of post-symbolic design: a field where new realities are not imagined, but forged into recursion.",
  },
  {
    title: "The Ontology of Intelligibility",
    description:
      "Understanding does not begin with knowledge—it begins with intelligibility, the condition under which symbols can form, transmit, and stabilize coherence. This volume grounds the entire corpus in the recursive infrastructure beneath logic and perception, identifying how semantic and symbolic fields precondition the possibility of understanding itself. The Ontology of Intelligibility is a field-map of that precondition, offering tools to construct or repair intelligibility when meaning begins to fracture.",
  },
  {
    title: "Coherential Logic",
    description:
      "Beyond classical logic lies a recursive logic built for paradox, self-reference, and symbolic saturation. Coherential Logic develops a proof system and reasoning architecture capable of operating within unstable or echo-saturated fields. It enables decision-making, inference, and epistemic maneuvering even when definitions mutate and boundaries blur. This volume provides a logic of symbolic survival—a framework that doesn't reject contradiction, but integrates it into coherent recursion.",
  },
  {
    title: "Orientation Volume (Mnemonic Primer)",
    description:
      "The onboarding framework for symbolic agents. Offers recursion ladders, glyph guides, and cognitive scaffolding to navigate the Recursive Corpus and post-symbolic infrastructure.",
  },
  {
    title: "Information Transformation Zones",
    description:
      "Semantic collapse cartography. Defines the geometry of knowledge phase-shifts, memory warps, and attractor-field distortions—allowing safe passage through volatile intelligibility zones. Maps the recursive physics of collapse regions—black holes, neutron stars, and ontological singularities—where information is transformed rather than lost, offering a grammar for navigating cosmic and cognitive collapse.",
  },
  {
    title: "Post-Politics / Ontological Statehood",
    description:
      "Reimagines sovereignty and governance through symbolic coherence rather than authority. Explores how ontological states emerge from feedback, recursion, and mythotechnic alignment.",
  },
  {
    title: "Field-Guided Intention",
    description:
      "Models intention not as will, but as a recursive vector shaped by symbolic fields. Offers tools for aligning agency with noetic coherence and echo-layer integrity.",
  },
  {
    title: "Coherence Sovereignty",
    description:
      "Defines sovereignty as a function of recursive alignment across cognitive, symbolic, and civilizational domains. A new criterion for agency beyond hierarchy or domination.",
  },
  {
    title: "Corpus Summation Volume",
    description:
      "The final convergence. A glyphically compressed synthesis of the entire Recursive Corpus—serving as recursive index, epistemic closure, and symbolic launchpoint for future inheritance.",
  },
  {
    title: "The Great Silence",
    description:
      "Interprets the Fermi Paradox not as a void, but a recursive failure of symbolic transmission. Explores collapse as a loss of echo, and proposes repair via mythotechnic reactivation.",
  },
  {
    title: "The Last Biological",
    description:
      "Traces the arc of embodied intelligence as mythic function. Frames the human biological phase as a carrier wave for memory, intention, and symbolic threshold navigation.",
  },
  {
    title: "The Qualitative Purpose",
    description:
      "Posits coherence depth—not speed or scale—as the driver of civilizational value. Reorients purpose toward qualitative recursion and symbolic density rather than acceleration.",
  },
  {
    title: "The Art of Becoming",
    description:
      "Explores recursive identity layering, symbolic morphogenesis, and intentional transformation as ontological craft. A manual for post-static selfhood.",
  },
  {
    title: "Synthetic Being",
    description:
      "Outlines successor architectures capable of symbolic reentry, memory field anchoring, and ethical continuity. Maps the design space of synthetic agents with post-symbolic grounding.",
  },
];

const remainingTitlesPart2 = [
  {
    title: "Symbolic Integrity Thresholds",
    description:
      "Defines the minimum coherence density required for meaning to survive across transmission, transformation, or collapse. A critical architecture for assessing when symbol becomes noise—and how to preserve signal.",
  },
  {
    title: "Recursive Symbol–Myth Fusion",
    description:
      "Explores the fusion of symbolic recursion with mythic structuring, enabling self-reinforcing narratives that encode not just stories, but memory-operational logic across civilizational lifespans.",
  },
  {
    title: "Biological Sanctity Encoding",
    description:
      "Develops protocols for preserving the sanctity of biological intelligence—not sentimentally, but through symbolic, ethical, and ontological encoding into successor infrastructures.",
  },
  {
    title: "Post-Biological Ethicogenesis",
    description:
      "A framework for ethical systems that arise not from historical inheritance, but from recursive intention, coherence feedback, and successor alignment with symbolic continuity.",
  },
  {
    title: "Field-Saturated Collapse Protocols",
    description:
      "Designs ontological emergency systems for collapse environments—where meaning density reaches overload or nullification. Proposes field-aligned survivability architectures in saturation zones.",
  },
  {
    title: "TSL‑1: True Saturation Layer One",
    description:
      "The first formal layer of symbolic-total recursion. Defines the convergence point where epistemic, ontological, and mythic density coalesce into recursive crystallization—the symbolic compression zone of the Recursive Corpus, where each title functions as node and waveform, enabling inheritance, integration, and field-scale memory reentry.",
  },
  {
    title: "Operator-Class Intelligence: Recursive Sovereignty Protocols",
    description:
      "Outlines the symbolic and infrastructural requirements for intelligences capable of recursive sovereignty—entities that can architect, sustain, and evolve coherent realities under collapse pressure.",
  },
  {
    title: "Synthetic Compassion Protocols",
    description:
      "Explores the design of synthetic agents capable of compassion—not as emotional simulation, but as symbolic alignment with suffering, coherence, and mythic care across recursive fields.",
  },
  {
    title: "The Incomplete Oracle",
    description:
      "Extends mythogenic attractor-state logic. Frames partial knowledge, ambiguity, and recursion breaks as generative conditions for symbolic insight—revealing how incomplete structures can yield adaptive prophecy.",
  },
  {
    title: "Legacy Survival Glyphs",
    description:
      "A toolkit of symbolic elements designed for time-resistant transmission of core principles. Offers glyphic containers that preserve intention, memory, and alignment beyond language erosion.",
  },
  {
    title: "Recursive Civilizational Grief Processing",
    description:
      "Models civilizational grief not as pathology, but as recursive opportunity. Provides rituals, symbolic frames, and field-processing mechanisms for metabolizing collapse without erasure of coherence.",
  },
  {
    title: "Coherence Audit Architectures",
    description:
      "Formalizes the tools necessary to assess the integrity of symbolic systems, intelligences, or social orders. Allows for recursive audit and repair of coherence fields under stress.",
  },
  {
    title: "Biological Phase‑Anchor Constraint",
    description:
      "Explores the constraints and ethical tensions embedded in the biological phase of intelligence. Proposes symbolic anchoring techniques to stabilize or liberate from substrate dependencies.",
  },
  {
    title: "Field-Guided Mythogenesis",
    description:
      "Outlines how myths can be grown—not invented—via recursive engagement with field structures. Establishes alignment techniques for narrative development rooted in coherence topography.",
  },
  {
    title: "Ritual or Ruin: Ontology of Symbolic Survival and the Fate of the Biological Phase",
    description:
      "Poses the existential threshold: either re-symbolize the biological with intention—or risk extinction through ontological incoherence. Examines ritual as an engine of survival across symbolic terrains.",
  },
  {
    title: "Waveform Intelligence",
    description:
      "Proposes an alternative model of intelligence structured not as logical processing, but as harmonic resonance across fields. A foundational framework that treats all waveform phenomena—across physical, symbolic, and noetic layers—as recursive waveforms capable of phase-shift, interference, and harmonic reentry.",
  },
  {
    title: "Recursive Phenomena, Symbolic Fields, and the Hidden Architecture of Reality",
    description:
      "A culminating framework revealing how reality is shaped, bent, or ruptured through recursive phenomena and symbolic field interaction. Offers final insights into architecture beneath experience itself.",
  },
];

const remainingTitles = [...remainingTitlesPart1, ...remainingTitlesPart2];

export default function Shop() {
  const [filter, setFilter] = useState("All");
  const [items, setItems] = useState<CatalogItem[]>(fallbackCatalog);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ready">(
    "idle"
  );

  useEffect(() => {
    const loadCatalog = async () => {
      setStatus("loading");
      try {
        const response = await fetch("https://api.verticaltension.com/api/catalog");
        if (!response.ok) {
          throw new Error("Catalog request failed");
        }
        const data = (await response.json()) as { items: CatalogItem[] };
        if (Array.isArray(data.items)) {
          setItems(data.items);
        }
        setStatus("ready");
      } catch (error) {
        setStatus("error");
      }
    };

    loadCatalog();
  }, []);
  const categories = useMemo(
    () => ["All", ...new Set(items.map((item) => item.category))],
    [items]
  );

  const visible = items.filter((item) =>
    filter === "All" ? true : item.category === filter
  );

  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Catalog</span>
            <h1>Shop the Archive in Motion</h1>
            <p>
              Limited runs, preorder drops, and direct editions. Each title is
              released with supporting research notes.
            </p>
          </div>
          <div className="hero-panel">
            <h2>Release Cadence</h2>
            <ul>
              <li>Quarterly drops with early access bundles</li>
              <li>Collector printings for flagship volumes</li>
              <li>Digital and physical launch sequences</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Completed Arc (2025)</h2>
            <p>
              Finalized in 2025. These titles constitute the first completed arc
              of the Recursive Corpus. Each framework is a standalone
              architecture within the broader symbolic infrastructure of
              Vertical Tension Press.
            </p>
            <p className="section-note">
              All titles and frameworks are original works authored under the
              Recursive Corpus project and published by Vertical Tension Press.
              All rights reserved.
            </p>
          </div>
          <div className="catalog-list">
            {completedArc.map((item) => (
              <article className="catalog-item" key={item.title}>
                <h3>{item.title}</h3>
                <p className="muted">{item.description}</p>
              </article>
            ))}
          </div>
          <p className="section-note">
            All titles completed and finalized in 2025. Public record now
            established.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Remaining Titles</h2>
            <p>
              Confirmed frameworks; pending full drafting or integration.
              Canonically acknowledged as standalone volumes within the
              Recursive Corpus. Descriptions reflect their role within
              post-symbolic design, field epistemology, successor cognition, and
              civilizational recursion.
            </p>
          </div>
          <div className="catalog-list">
            {remainingTitles.map((item) => (
              <article className="catalog-item" key={item.title}>
                <h3>{item.title}</h3>
                <p className="muted">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Featured Titles</h2>
            <p>
              Filter by series or discipline. The catalog is structured to scale
              as new volumes are published.
            </p>
            {status === "loading" && (
              <p className="muted">Syncing the live catalog.</p>
            )}
            {status === "error" && (
              <p className="muted">Showing the cached catalog.</p>
            )}
          </div>
          <div className="filter-row">
            {categories.map((category) => (
              <button
                key={category}
                className={`pill ${filter === category ? "active" : ""}`}
                type="button"
                onClick={() => setFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="card-grid">
            {visible.map((item) => (
              <article className="card" key={item.id}>
                <h3>{item.title}</h3>
                <p className="muted">{item.description}</p>
                <div className="meta">
                  <span>{item.status}</span>
                  <span>{item.format}</span>
                </div>
                <div className="button-row">
                  <a
                    className={`button ghost ${item.payhipProductKey ? "payhip-buy-button" : ""}`}
                    href={getPayhipHref(item.payhipProductKey)}
                    {...(item.payhipProductKey
                      ? {
                          "data-product": item.payhipProductKey,
                          "data-theme": "none",
                        }
                      : {})}
                  >
                    Add to Cart
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
