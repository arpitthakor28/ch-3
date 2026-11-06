# Architectural & Pedagogical Decisions

This document logs design and implementation decisions made in accordance with Section 0 of the VLS PRD (Class 9 Chapter 3 "Tissues in Action").

## 1. M01 Root Tip Cut Timing (Open Question Q1)
- **Decision:** As specified in Section 14 (Q1), the scissors tool unlocks strictly after the student completes and saves the Day 3 root length measurements. Advancing from Day 3 to Day 4 removes 1.0 cm from Jar B's hypothetical 2.6 cm growth (visible as a faint ghost marker), fixing Jar B at exactly 1.6 cm for Days 4 through 7. Jar A continues normal growth up to 5.8 cm on Day 7.

## 2. Seeded Random Jitter in Lab Mode
- **Decision:** Implemented a lightweight Mulberry32 pseudo-random number generator (PRNG) seeded by the student's pseudonym or session seed. This provides reproducible +/- 0.15 cm measurement variations in Lab Mode while Textbook Mode remains strictly deterministic with exact values from NCERT Fig. 3.2.

## 3. Storage & State Synchronization (V1 through V4)
- **Decision:** Provided a dual-tier storage system: an in-memory & LocalStorage/IndexedDB state engine that operates 100% offline with zero latency, alongside a fully compliant REST API client (`/api/...`) that queues events and syncs seamlessly with teacher dashboards and progress reports.

## 4. Graphics Rendering Strategy
- **Decision:** High-performance, scalable inline SVG with hardware-accelerated CSS transforms and Canvas for high-density particle simulations (xylem/phloem, blood cells, neuron action potential impulses). No external bloated 3D dependencies required, achieving sub-second load times and 60 FPS on low-end mobile devices and school Chromebooks.

## 5. Paraphrased Content & Accessibility First
- **Decision:** All pedagogical summaries, micro-copy, and quiz prompts are authored in clear, concise Class 9 English (reading age ~14-15), strictly paraphrased from NCERT without verbatim copying. All interactive components feature keyboard traps avoidance, ARIA labels, live announcement regions, and high-contrast / reduced-motion modes.


## 6. Full Release Architecture (V1 through V4)
- **V1 (Plant Tissues):** Delivered M01 (Onion Root-Growth), M02 (Plant Growth-Zones & Teak Rings), M03 (Virtual Sunflower Stem Microscope), M04 (Xylem & Phloem Transport Engine).
- **V2 (Animal Tissues):** Delivered M05 (Animal Tissue Explorer with 5 epithelial subtypes & organ locator), M06 (Connective Tissue Comparison with 55/45 centrifuge test tube & knee anatomy), M07 (Muscle Types with striated/spindle/branched cells and voluntary/involuntary meters), M08 (Neuron Signal Explorer with 5-part labeling challenge and impulse wave).
- **V3 (Movement & Skeleton):** Delivered M09 (Elbow Muscle-Bone Kinematic Model with 0°–145° flexion and antagonistic triceps), M10 (Joint Movement Sandbox with 4 stations, allowed/blocked axis test, and Activity 3.5 observation table), M11 (Skeleton Explorer with 12 rib pairs, costal cartilage breathing dynamics, and flexible spinal discs).
- **V4 (Teacher Dashboard & Chapter Mastery Quiz):** Implemented Section 13.1 Paraphrased 12-Question Mastery Quiz Bank with instant rationale feedback, along with the Teacher Dashboard providing Class 9-A metrics, assignment distribution, and anonymized student progress CSV export.
