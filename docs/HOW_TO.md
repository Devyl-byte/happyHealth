# How to Coordinate and Document Phases 1-3

> **Archived planning record:** This file describes the original pre-implementation plan. It is retained for history and is not an instruction, current status report, API contract, or description of the implemented model. Use [`PHASE_STATUS.md`](PHASE_STATUS.md), [`API_CONTRACT.md`](API_CONTRACT.md), and the root README for current behavior.

Owners: M3 for healthcare meaning; M1 for frontend/ML documentation; M2 for backend/IoT architecture and setup.
Objective: turn the team plan into shared agreements, runnable instructions, and evidence that each phase is complete.
Roadmap: [Project phases](PROJECT_PHASES.md).

## How to Use This Guide

Read [TODO.md](TODO.md) for the full checklist; this guide explains how to work through it.
M1 = fullstack + Python ML coordination. M2 = Spring Boot + MQTT + digital twin. M3 = BPharma healthcare lead.
These instructions cover Phases 1-3. The services, fixtures, and commands described below are planned; this document does not claim they already exist or have passed tests.

A folder is ready when its completion checks pass and the named reviewer has checked the handoff. The whole phase is done only when all required folders meet the gate in the project roadmap.
Record evidence and review notes in docs/PHASE_STATUS.md when that file is created. Use Pending, In progress, Ready for review, Blocked, or Done. Leave TODO boxes unchecked until the relevant check passes.
For a dependency question, send the file/revision, a concrete example, expected behavior, actual behavior, and the decision needed. Continue independent work while waiting; do not silently guess a shared field or clinical definition.

## Start Here

| Folder | Practical guide | Primary owner |
| --- | --- | --- |
| backend | [Backend HOW_TO](../backend/HOW_TO.md) | M2 |
| frontend | [Frontend HOW_TO](../frontend/HOW_TO.md) | M1 |
| ml-service | [ML HOW_TO](../ml-service/HOW_TO.md) | M1 |
| data | [Data HOW_TO](../data/HOW_TO.md) | M2, with M3 review |
| docs | This guide | All three, by subject |

The TODO says what to deliver; HOW_TO explains the method; PROJECT_PHASES defines the team completion gate.
Files mentioned as future deliverables, such as API_CONTRACT.md and PHASE_STATUS.md, must be created as those tasks are carried out.

## Tools You Will Use

| Tool | Purpose |
| --- | --- |
| Markdown editor with preview | Readable contracts, notes, and setup instructions |
| Mermaid inside Markdown | Maintainable architecture diagram |
| Git and GitHub issues/reviews | Track revisions, decisions, and review feedback |
| Browser and service responses | Review the actual dashboard and API behavior |
| PowerShell and Docker Compose | Developers verify documented commands |
| PowerPoint/Google Slides and PDF | Final presentation later, not required for Phase 3 |

M3 can draft plain-language content and review tables/screenshots. M1/M2 handle code, commands, diagrams, and automated checks where needed.

## Phase 1: Agree Scope Before Building

1. Read PROJECT_BLUEPRINT.md, PROJECT_PHASES.md, and TEAM_WORKLOAD.md together. Write the Phase 3 objective in one sentence: one synthetic patient and a labelled mock prediction through three services.
2. M3 creates CLINICAL_SCOPE.md: intended user, condition, prediction window, candidate event definition, assumptions, and limits.
3. Use trustworthy clinical references for terms. Start with [NIDDK's A1C page](https://www.niddk.nih.gov/health-information/diagnostic-tests/a1c-test) and [CGM overview](https://www.niddk.nih.gov/health-information/diabetes/overview/managing-diabetes/continuous-glucose-monitoring). Record a separate relevant source for any final clinical threshold; introductory pages alone do not establish the project's prediction target.
4. Build DATA_DICTIONARY.md as a table: field, plain-language meaning, type, unit, required status, example, owner. M3 fills meaning/units; M1/M2 fill technical rules.
5. M2 drafts public routes in API_CONTRACT.md; M1 drafts the internal ML route. Include one valid JSON exchange and errors for each relevant case.
6. M2 creates ARCHITECTURE.md showing the browser-to-backend-to-ML path and synthetic data import. Show MQTT/training as planned future work. Use [GitHub's Mermaid instructions](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams).
7. M1 adds a dashboard sketch and M3 reviews labels. Copy the Phase 3 completion checks into ACCEPTANCE_CRITERIA.md in testable language.
8. Record review comments and resolve questions affecting implementation before declaring the relevant contract ready.

### Ask for Input Before Proceeding

| Question | Owner to ask | Evidence to provide |
| --- | --- | --- |
| What does this clinical field/threshold mean? | M3 | Field/example and source passage or link |
| Can the backend supply this field or error? | M2 | Proposed public JSON and consuming screen |
| Can the ML service accept/return this shape? | M1 | Internal request/response examples |
| Is the mock wording understandable? | M3 | Screen sketch and exact label |
| Does a decision change scope or multiple contracts? | All affected owners | Proposed change, affected files, and impact |

M3's review is the team's healthcare-content review, not a claim of clinical validation. If evidence is uncertain, label the assumption and identify what it blocks; unrelated scaffolding can continue.

### Mark Phase 1 Done for Documentation When

- [ ] Scope, dictionary, contracts, architecture, and acceptance criteria exist.
- [ ] M1/M2 confirm contracts are implementable and M3 reviews clinical meanings.
- [ ] Blocking questions are resolved; non-blocking assumptions have owners and review points.

The team may close Phase 1 only after each folder's Phase 1 checks also pass.

## Phase 2: Write Instructions Another Member Can Follow

1. M1 leads the root README. Give the project purpose, three owners, five-folder map, current mock status, and prerequisites.
2. M2 supplies backend/Maven/H2 instructions and Compose configuration. M1 supplies frontend/npm and Python environment instructions.
3. Each service gets its own README. Record exact working commands and required working directory; distinguish native startup from Compose startup.
4. Document addresses: browser-accessible frontend/backend URLs versus container-to-container service names. Include a small table of expected ports and health routes.
5. Explain the selected dependency versions by linking manifests/lock files. Do not copy a latest-version tutorial into an older pinned stack without checking compatibility.
6. Create PHASE_STATUS.md with the record format below. Keep planned results marked pending until observed.
7. Ask another technical member to follow the instructions and report missing steps. M3 can verify whether the resulting screen and plain-language instructions are understandable.
8. Document the first failing command and fix the instructions/configuration before marking startup complete.

The [Docker Compose quickstart](https://docs.docker.com/compose/gettingstarted/) is a reference for multi-service startup; our agreed service names, ports, and configuration remain project-specific.

### Review Record Template

~~~text
Folder / phase:
Owner:
Status: Pending | In progress | Ready for review | Blocked | Done
Deliverable and revision:
Check performed (command or manual steps):
Expected result:
Observed result and evidence:
Reviewer and review date:
Unresolved issue / next action / owner:
~~~

Do not prefill a successful result or another member's approval. If someone has not reviewed it, write "Awaiting review".

### Mark Phase 2 Done for Documentation When

- [ ] Root and service setup instructions match actual files/commands.
- [ ] M1/M2 reproduce startup, health checks, and cross-service connectivity.
- [ ] Status records distinguish successful checks from remaining work.
- [ ] Another technical member can follow the instructions without undocumented setup.

## Phase 3: Observe the Demo and Close the Gate

1. M1 writes a short internal DEMO_SCRIPT.md: start services, open patient, inspect history, refresh mock prediction, show error/recovery.
2. M2 prepares the fixture import/reset instructions and sample API outputs. M1 records which actual requests the screen makes.
3. Observe patient identity, units, and historical timestamps. M3 compares the rendered screen with the reviewed field table.
4. Trigger refresh and confirm all three services participate. The mock markers and 120-minute horizon must survive the entire path.
5. Stop ML temporarily with M1/M2 coordinating. Check that refresh shows unavailable, then restart and retry. Also verify unknown-patient behavior.
6. M1/M2 run the focused test suites and production build; record commands, environment, date, and results.
7. Add a screenshot and review notes. List missing capabilities honestly: no trained accuracy, live MQTT, or complete twin yet.
8. Collect all five folder completion records. Resolve failed acceptance checks before marking the whole phase Done.
9. Write the next task list for Phase 4 IoT (M2) and Phase 5 ML (M1), with M3 supporting field/target review. Those phases may run in parallel after shared contracts are ready.

### When to Ask for Final Validation

Ask M2 to validate backend data flow and failure handling, M1 to validate frontend/ML integration, and M3 to validate clinical wording and fixture plausibility. Send the runnable demo steps, actual response/screenshot, test evidence, and known limitations. A message saying "code is finished" is not enough evidence.

### Mark Phase 3 Done for the Team When

- [ ] All five folder Phase 3 checks have evidence and relevant review notes.
- [ ] The real React -> Spring Boot -> FastAPI -> Spring Boot -> React demo works.
- [ ] Unknown patient, ML unavailable, restart/retry, and mock labelling are verified.
- [ ] PROJECT_PHASES.md's shared demonstration checklist is satisfied.
- [ ] The team status explicitly says "Phase 3 complete: mock integration demo", not "ML model complete".

The final minimum 20-minute submission video and presentation remain Phase 8 deliverables. Phase 3 needs only a reproducible internal walkthrough.

## How to Ask for Help Without Blocking Everyone

Use this short format:

~~~text
To: [member]
Folder and phase: [where I am working]
I need: [one specific decision or review]
Example/evidence: [file + revision, JSON, screenshot, or error]
Proposed choice: [what I think we should do and why]
Blocked work: [what cannot proceed until answered]
Independent work: [what I can continue now]
~~~

Changes to a shared API need the affected developers' agreement; clinical definitions need M3's review.
Routine local code organization does not need a team meeting. If a review is pending, keep that task open and continue work that does not depend on it.

## Sources and How to Use Them

Official references checked for this guide on 2026-10-05.

| Source | Use |
| --- | --- |
| [Project roadmap](PROJECT_PHASES.md) and [team workload](TEAM_WORKLOAD.md) | Internal scope and ownership |
| User-provided challenge brief | Submission requirements; recheck the original before final submission |
| [GitHub Mermaid diagrams](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams) | Architecture diagrams in Markdown |
| [Docker Compose](https://docs.docker.com/compose/gettingstarted/) | Reproducible multi-service setup |
| [NIDDK A1C](https://www.niddk.nih.gov/health-information/diagnostic-tests/a1c-test) | Clinical field terminology |
| [NIDDK CGM](https://www.niddk.nih.gov/health-information/diabetes/overview/managing-diabetes/continuous-glucose-monitoring) | Sensor terminology and context |
| Folder HOW_TO source tables | Official technical tutorials relevant to each owner |

For external clinical claims, record title, organization, URL, access date, exact claim supported, and whether it is a project assumption. Do not treat a tool tutorial as clinical evidence.
