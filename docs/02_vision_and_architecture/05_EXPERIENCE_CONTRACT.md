# Atlas Experience Specification

**Version:** 1.0

---

# Experience Lifecycle

## Arrival

* **Purpose:** Establish atmospheric context and evoke immediate wonder.
* **Goals:** Anchor the learner's focus, reset cognitive load, and present the core subject.
* **Success Criteria:** The user halts external distractions and forms an immediate desire to engage within 3 seconds.

## Orientation

* **Purpose:** Introduce spatial coordinates, scale, and subtle controls.
* **Goals:** Establish the mental model of the interface without distracting tutorials.
* **Success Criteria:** The user intuitively understands how to navigate the space without explicit instructions.

## Observation

* **Purpose:** Present the unperturbed system in its natural state.
* **Goals:** Allow the learner to establish a baseline expectation of normal behavior.
* **Success Criteria:** The user identifies pattern behaviors and notices a key variable or anomaly.

## Interaction

* **Purpose:** Invite the user's first physical or conceptual touch point.
* **Goals:** Demonstrate immediate, responsive feedback to user agency.
* **Success Criteria:** The user realizes their input directly controls the physics or logic of the scene.

## Experimentation

* **Purpose:** Encourage hypothesis testing and stress-testing the environment.
* **Goals:** Drive deep understanding through variable manipulation and variable isolation.
* **Success Criteria:** The user intentionally alters variables to see "what happens if..." rather than clicking at random.

## Challenge

* **Purpose:** Validate conceptual mastery through active problem-solving.
* **Goals:** Require the user to apply their mental model to solve an operational puzzle or predict an outcome.
* **Success Criteria:** The user successfully resolves the scenario using scientific reasoning, not guess-and-check mechanics.

## Reflection

* **Purpose:** Synthesize learnings and bridge the concept to the real world.
* **Goals:** Solidify the mental model into long-term memory and connect it to adjacent domains.
* **Success Criteria:** The user can explain *why* the phenomenon occurs and feels motivated to explore connected concepts.

---

# Scene Structure

Every module is built from the same seven scenes. Content changes. Rhythm never does.

**Arrival → Orientation → Observation → Interaction → Experiment → Challenge → Reflection**

| Scene | What must happen |
|---|---|
| Arrival | The learner becomes curious immediately. Never open with a definition. |
| Orientation | They sense where they are and what they can touch, without being told in words. |
| Observation | They notice something unusual, on their own. |
| Interaction | They change something, and something responds. |
| Experiment | They predict, test, observe, learn. |
| Challenge | They apply what they now understand. |
| Reflection | The concept connects to the wider universe. |

---

# Experience Anatomy

```
┌─────────────────────────────────────────────────────────────┐
│                       ATLAS SCENE                           │
│                                                             │
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │     Hero Canvas       │       │    Narrative Overlay  │  │
│  │ (3D/Simulation/Lab)   │       │  (Story & Orientation)│  │
│  └───────────┬───────────┘       └───────────┬───────────┘  │
│              │                               │              │
│              └───────────────┬───────────────┘              │
│                              │                              │
│              ┌───────────────▼───────────────┐              │
│              │       Explorer / Controls     │              │
│              │    (Variable Manipulation)    │              │
│              └───────────────┬───────────────┘              │
│                              │                              │
│              ┌───────────────▼───────────────┐              │
│              │    Knowledge Cards / Data     │              │
│              │     (Context & Insights)      │              │
│              └───────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘

```

### Hero

* **Purpose:** The visual and interactive anchor of the experience.
* **When Present:** Always present at the center of the experience stage.
* **When Absent:** Never.
* **Educational Contribution:** Provides the spatial and dynamic grounding for the core phenomenon.

### Story

* **Purpose:** Frame the scientific journey with narrative drive and historical/universal context.
* **When Present:** During transition points, arrival, and synthesis moments.
* **When Absent:** During deep experimentation or challenge modes where focus is paramount.
* **Educational Contribution:** Answers the question: "Why does this matter?"

### Explorer

* **Purpose:** A set of intuitive, non-intrusive controls allowing free manipulation of variables.
* **When Present:** Whenever a simulation or model is active.
* **When Absent:** During pure linear story transitions or cinematic reveals.
* **Educational Contribution:** Enables active inquiry and hands-on parameter discovery.

### Simulation

* **Purpose:** The mathematical/logical engine running in real time beneath the visual layer.
* **When Present:** Whenever dynamic behavior must accurately reflect real-world physics or logic.
* **When Absent:** Static structural studies (e.g., pure anatomical inspection).
* **Educational Contribution:** Guarantees scientific truth and unscripted, emergent outcomes.

### Comparison

* **Purpose:** Juxtapose two scales, time periods, variables, or theories side-by-side.
* **When Present:** When understanding relies on contrast (e.g., Normal vs. Mutated, Classical vs. Quantum).
* **When Absent:** When introducing a single foundational concept for the first time.
* **Educational Contribution:** Sharpens discrimination and reveals subtle systemic differences.

### Timeline

* **Purpose:** Map phenomena across temporal scales—from femtoseconds to billions of years.
* **When Present:** When time is the primary variable driving state changes.
* **When Absent:** Time-invariant systems or instantaneous state changes.
* **Educational Contribution:** Develops temporal intuition across non-human scales.

### Lab

* **Purpose:** A focused, multi-variable sandbox for rigorous testing and measurement.
* **When Present:** Advanced stages of an experience following initial discovery.
* **When Absent:** Arrival or early orientation phases.
* **Educational Contribution:** Mirrors authentic scientific methodology and formal data collection.

### Challenge

* **Purpose:** An interactive task testing whether the user's internal mental model aligns with reality.
* **When Present:** Post-experimentation; serves as the milestone gate before final reflection.
* **When Absent:** During early exploration phases.
* **Educational Contribution:** Prevents superficial familiarity from being mistaken for deep understanding.

### Reflection

* **Purpose:** Deconstruct what was learned, offering high-level conceptual summaries and real-world parallels.
* **When Present:** At the closing stage of a scene or complete experience.
* **When Absent:** During active interaction.
* **Educational Contribution:** Consolidates short-term engagement into persistent mental schemas.

### Knowledge Card

* **Purpose:** Micro-doses of precise context, historical notes, or mathematical definitions that pop up on demand.
* **When Present:** Embedded organically within interactive elements or spatial hotspots.
* **When Absent:** Blocking the primary workspace or obscuring visuals unprompted.
* **Educational Contribution:** Offers immediate depth for inquisitive minds without cluttering the primary canvas.

---

# Experience Metadata

Every Atlas Experience must express its conceptual identity through standard metadata properties:

* **Title:** Clear, evocative name that captures the core phenomenon (e.g., *The Architecture of Light*).
* **Subject:** Broad scientific domain (e.g., *Physics, Molecular Biology, Astrophysics*).
* **Concept:** Primary topic under investigation (e.g., *Wave-Particle Duality*).
* **Difficulty:** Intellectual readiness index (*Intuitive, Foundational, Intermediate, Advanced, Research-Grade*).
* **Estimated Duration:** Time investment measured in meaningful cognitive sessions (e.g., *15 Minutes*).
* **Prerequisites:** Conceptual stepping stones needed for full comprehension.
* **Learning Objectives:** The mental models and insights the user will master upon completion.
* **Wonder Level:** Measure of visual and spatial awe designed into the initial arrival phase (*1 to 5*).
* **Interaction Density:** Ratio of user agency versus automated presentation (*1 to 5*).
* **Story Density:** Proportion of narrative framing relative to raw experimentation (*1 to 5*).
* **Immersion Level:** Depth of spatial and sensory engagement (*Focus, Ambient, Full-Spatial*).
* **Accessibility Level:** Universal design compatibility rating.
* **Tags:** Semantic markers for dynamic categorization.
* **Related Concepts:** Neighboring scientific domains to enable fluid discovery paths across the Atlas graph.

Every experience also declares its emotional profile:

* **Feeling** — Wonder / Calm / Energy / Exploration
* **Scientific Accuracy**
* **Required Attention**

Treat this as real data the platform uses for pacing and sequencing — not flavor text.

---

# Experience Capabilities

An Atlas Experience declares capabilities to communicate its sensory and cognitive depth:

* **Interactive Simulation:** Real-time calculation of dynamic behavior based on user input.
* **3D Environment:** True spatial rendering allowing rotation, translation, and depth manipulation.
* **Timeline Navigation:** Non-linear manipulation of temporal flow.
* **Spatial Audio:** Acoustic feedback tied directly to 3D orientation and physical events.
* **Assessment & Challenge:** Dynamic problem verification without traditional multiple-choice tests.
* **Comparative Analysis:** Dual-viewport rendering for parallel experimentation.
* **Sandbox Mode:** Open-ended state with all constraints and guardrails removed.
* **Spatial & AR Ready:** Adaptable to immersive, head-worn, or spatial display formats.
* **AI Tutor Integration:** Prepared for contextual conversational guidance using real-time scene state.
* **Offline Operation:** Autonomous function independent of network connectivity.
* **Progress Tracking:** Semantic recording of conceptual mastery, not just completed steps.

---

# Scene Philosophy

A **Scene** is a single, uninterrupted unit of cognitive focus. It is a spatial and emotional room dedicated to illuminating one specific sub-concept.

```
┌─────────────────────────────────────────────────────────────┐
│                        SCENE FLOW                           │
│                                                             │
│   ┌──────────────┐       ┌──────────────┐       ┌─────────┐ │
│   │   Scene 1    │──────►│   Scene 2    │──────►│ Scene 3 │ │
│   │ (Macro View) │       │ (Micro Mechanism)    │ (Lab)   │ │
│   └──────────────┘       └──────────────┘       └─────────┘ │
└─────────────────────────────────────────────────────────────┘

```

* **Why Scenes Exist:** Human working memory can hold only a limited number of new concepts at once. Scenes isolate variables to keep cognitive load focused, preventing overwhelm.
* **Transitions:** Transitions between scenes must maintain spatial continuity. If moving from a leaf to a chloroplast, the camera zooms *into* the cellular structure—it never cuts abruptly to black.
* **Pacing & Length:** A scene should last only as long as required to master its singular insight—typically 2 to 5 minutes of active exploration.
* **Triggering a New Scene:** A new scene begins only when the user has demonstrated mastery of the current concept or explicitly chooses to branch into a deeper level of detail.

---

# Interaction Philosophy

> Every interaction must answer the learner's subconscious question: *"What happens if I do this?"*

* **Purpose:** Interactions are not control inputs; they are physical queries made to nature.
* **Feedback Loop:** Feedback must be immediate, tactile, visual, and domain-appropriate. If mass increases, momentum must lag visually, and the audio tone must drop in pitch.
* **Discovery over Instruction:** Do not display an arrow saying "Drag Slider to Increase Heat." Provide a heat element that glows red backward red when touched, inviting natural experimentation.
* **Experimentation & Bounds:** Allow users to push systems to their absolute mathematical limits. If a system can break, explode, or collapse, let it—and explain *why* it did.
* **Failure as Context:** There are no "Wrong" inputs in Atlas—only unexpected physical outcomes. An improper value is an invitation to observe an edge case, not a red error message.
* **Recovery:** Resetting a scene must feel like returning to a pristine laboratory bench—instant, frictionless, and welcoming of another attempt.

---

# Storytelling Philosophy

* **Narrative Arc:** Scientific storytelling is the ultimate detective story. The mystery is the phenomenon; the clues are observable effects; the resolution is the underlying law of nature.
* **Human Scale Anchor:** Frame cosmic or subatomic phenomena using human-scale touchpoints (e.g., *"If this atomic nucleus were the size of a marble, the electrons would circle it at the perimeter of a stadium"*).
* **Contextual Pacing:** Narrative slows down during complex conceptual shifts, allowing breathing room, and accelerates during moments of dramatic experimental realization.
* **Tone & Voice:** Authoritative yet filled with wonder. Human, accessible, eloquent, and precise. Free of academic jargon, but rich in scientific fidelity.

---

# Scientific Integrity

* **Absolute Mathematical Integrity:** Visuals may simplify aesthetic complexity, but underlying calculations must derive from genuine physical equations wherever possible.
* **Primary Sources:** Every simulation model must be anchored in peer-reviewed scientific consensus or validated empirical data.
* **Precise Terminology:** Use exact terminology introduced organically context-first (e.g., show the fluid dynamic before naming it *laminar flow*).
* **Visual Correctness:** Avoid false visual tropes (e.g., electrons portrayed as literal tiny spheres orbiting in flat solar-system rings without contextualizing quantum probability clouds).
* **Educational Responsibility:** Clearly delineate where an experience uses an abstraction or metaphor versus where it depicts raw physical reality.

---

# Accessibility Philosophy

Science belongs to every human mind. An Atlas Experience must accommodate diverse cognitive, perceptual, and physical profiles natively, not as an afterthought.

* **Multi-Sensory Encoding:** Every core concept must communicate through at least two sensory channels simultaneously (e.g., visual density accompanied by pitch shifts or tactile/haptic cues).
* **Cognitive Flexibility:** Allow users to modify the speed of simulation time, adjust visual contrast, and toggle between abstract visual modes and detailed data views.
* **Motor Autonomy:** Every interactive element must be navigable through precise step-by-step inputs, continuous fluid gestures, or direct keyboard navigation.
* **Motion Sensitivity:** Provide a simple toggle for reduced motion that converts continuous spatial fly-throughs into elegant, cross-fading spatial keyframes without compromising the mental model.
* **Alternative Explanations:** Offer alternative conceptual pathways—such as swapping a visual metaphor for a structural or spatial equivalent—for learners with different sensory processing styles.

---

# Performance Philosophy

The illusion of a living, physical world shatters the moment frame rates drop or controls lag.

* **Frictionless Loading:** Experiences must launch instantly. Essential spatial assets load first; deep analytical layers stream gracefully in the background.
* **Perceptual Responsiveness:** Interactions must acknowledge input within 16 milliseconds. Even if a deep physical simulation requires processing time, the interface immediately reflects the physical intent.
* **Graceful Degradation:** When compute resources are constrained, prioritize simulation accuracy and interaction responsiveness over complex visual effects or dynamic lighting.
* **Responsive Adaptation:** The experience dynamically scales layout, interface ergonomics, and visual complexity to fit any viewport size or input style seamlessly.
* **Offline Autonomy:** Core simulation engines and interactive logic run locally, ensuring learning continues without internet access.

---

# Never End — Always Connect

No experience is an island. Every experience surfaces what to explore next (Water Transport → Osmosis → Cell Structure → Photosynthesis). Knowledge should feel alive, not closed.


---

> **Atlas Navigation** · [00 Constitution](00_CONSTITUTION.md) · [01 Platform Vision](01_PLATFORM_VISION.md) · [02 Platform Model](02_PLATFORM_MODEL.md) · [03 Design Language](03_DESIGN_LANGUAGE.md) · [04 Experience Philosophy](04_EXPERIENCE_PHILOSOPHY.md) · **05 Experience Contract** · [06 Quality Bar](06_QUALITY_BAR.md) · [07 Glossary](07_GLOSSARY.md) · [08 Anti-Patterns](08_ANTI_PATTERNS.md) · [09 Reading Order](09_READING_ORDER.md) · [Roles →](roles/)
