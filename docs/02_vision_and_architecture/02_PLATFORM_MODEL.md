# Atlas Platform Architecture

**Version:** 1.0

---

## Architecture

The repository is divided into two distinct worlds:

- **Platform** — Rendering, Navigation, Registry, Theme, Motion, Search, Progress, and AI.
- **Experiences** — Science content. Nothing else.

---

## Core Principles

1. **The platform is permanent; experiences are replaceable.** Never couple the platform to a specific science topic. The platform should never know what "DNA" or "Electricity" means. It only understands Experiences.
2. **Every experience is independent.** No experience should depend on another. Any experience must be removable without affecting the platform.
3. **Every experience follows the same contract.** Consistency is more important than cleverness.
4. **Everything should be reusable.** Never create a component that only works for one module. Build systems, not features.
5. **Animation has meaning.** Motion should explain, not decorate. If removing an animation does not reduce understanding, the animation should not exist.
6. **The repository is AI-first.** Humans are welcome, but the architecture is optimized for autonomous AI development. Every folder should be understandable. Every responsibility should be obvious. Every module should be isolated.

---

## AI Roles

| Role | Responsibility |
|---|---|
| **Architect** | Owns the platform, contracts, and structure. |
| **Experience Architect** | Creates science experiences. Never edits platform architecture. |
| **Integration Engineer** | Registers new experiences. Never redesigns experiences. |
| **Animation Engineer** | Improves immersion. Never changes scientific meaning. |
| **Performance Engineer** | Optimizes. Never redesigns. |
| **QA Engineer** | Verifies quality. |
| **Curator** | Protects philosophy. Rejects contributions that do not match the Atlas vision. |

---

## Repository Rule

No AI should modify files outside its assigned responsibility unless explicitly instructed. Isolation is preferred over convenience.

---

## Decision Rule

When two solutions exist, prefer the one that improves consistency, modularity, discoverability, reuse, and reduces complexity, while creating a better experience.

---

## Reusability Philosophy

* **Component Modularity:** Core interactive components (simulators, color-scales, spatial viewports) exist as reusable foundational elements across the entire platform.
* **Platform vs. Experience Separation:**
  * *The Platform provides:* Camera physics, render pipelines, state synchronization, spatial audio engines, accessibility frameworks, and global navigation.
  * *The Experience provides:* Scientific domain rules, specific assets, narrative progression, scene layouts, and specific parameter constraints.
* **Pattern Standard:** Once a user learns how to manipulate a parameter in one experience, that interaction pattern applies universally across all Atlas experiences.

---

## Integration Philosophy

An Atlas Experience is an active, context-aware node within a larger knowledge network.

* **Knowledge Graph Integration:** Experiences link organically to adjacent topics. Completing an experience on *Photosynthesis* unseals natural pathways into *Thermodynamics* and *Quantum Biology*.
* **State Awareness:** The experience communicates conceptual progress, time spent exploring, and self-directed hypothesis testing back to the platform without breaking the user's flow.
* **AI Context Readiness:** The state of every variable, object position, and user gesture is exposed to the contextual guidance layer, allowing an AI guide to offer precise, context-aware prompts when invited.
* **Non-Intrusive Analytics:** Analytics measure depth of engagement and conceptual breakthroughs rather than crude click counts or screen time.

---

## Future Evolution

* **Backward Compatibility of Conceptual Models:** As platform rendering capabilities evolve, the underlying mathematical and pedagogical blueprints remain constant.
* **Progressive Depth:** Experiences are built to support higher levels of fidelity, deeper mathematical models, and richer spatial environments as display technology advances.
* **Ecosystem Expansion:** Experiences are designed as living documents, capable of integrating new scientific discoveries without requiring a complete redesign of the core user journey.


---

> **Atlas Navigation** · [00 Constitution](00_CONSTITUTION.md) · [01 Platform Vision](01_PLATFORM_VISION.md) · **02 Platform Model** · [03 Design Language](03_DESIGN_LANGUAGE.md) · [04 Experience Philosophy](04_EXPERIENCE_PHILOSOPHY.md) · [05 Experience Contract](05_EXPERIENCE_CONTRACT.md) · [06 Quality Bar](06_QUALITY_BAR.md) · [07 Glossary](07_GLOSSARY.md) · [08 Anti-Patterns](08_ANTI_PATTERNS.md) · [09 Reading Order](09_READING_ORDER.md) · [Roles →](roles/)
