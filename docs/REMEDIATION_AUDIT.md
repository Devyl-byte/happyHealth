# Remediation and honesty audit

**Review date:** 2026-10-10

**Branch reviewed:** `codex/virtual-patient-model`

**Scope:** source code, tests, documentation, presentation files, dependency checks,
and the Docker Compose configuration. A real Docker image build and multi-container
startup were deliberately excluded at the repository owner's request.

## Plain-language result

The repository now contains a credible **research prototype**, not a finished medical
product. It combines a fictional health record with a simulated glucose stream,
builds one virtual-patient view, and asks a real baseline machine-learning model to
score a clearly defined two-hour event. Automated checks passed outside Docker.

The number shown by the model is an **uncalibrated model score**. It can help rank
examples in this experiment, but it is not a trustworthy statement such as “this
patient has a 72% chance of danger.” No diagnosis, treatment, insulin dose, or
emergency decision should be made from it.

The submission is not ready to call final until the team supplies its official name
and college, records the required 20-minute video, obtains a healthcare-domain review,
makes the repository public, and performs the intentionally skipped clean-computer
Docker run.

## What was repaired, how, and why

| Area | Earlier problem | Repair | Why the repair matters |
| --- | --- | --- | --- |
| Prediction target | Different files described different meanings and time windows. | One target is now used in live code and authoritative documentation: within 120 minutes after a meal, glucose reaches at least 180 mg/dL **or** rises at least 40 mg/dL above the meal-time value. | Training, testing, API output, UI text, and presentation must refer to the same event or the claimed result is meaningless. |
| Model output | The output was called a probability and was placed into clinical-looking risk bands without calibration evidence. | The public contract now says `modelScore`, states `calibratedProbability: false`, removes live risk bands, and repeats the limitation in the UI and model card. | A score between 0 and 1 is not automatically a real-world probability. Removing unsupported clinical labels prevents false confidence. |
| Model evidence | ROC AUC looked encouraging, but the weak fixed-threshold result and majority baseline were easy to miss. | The README, model card, metadata, and presentation show validation/test ROC AUC and F1, including the always-positive baseline that beats the model's F1 at the 0.5 threshold. | Judges can see both the useful signal and the weakness instead of receiving a cherry-picked number. |
| Saved model integrity | The service loaded an artifact without strongly proving that metadata and code expected the same object. | Startup now checks the model version, target, feature count, and SHA-256 checksum recorded in metadata. | This detects an accidentally replaced or mismatched model before a prediction is served. |
| Missing inputs | Optional lab values could trigger a Java null-handling failure. | The request builder now uses a null-safe ordered map, and tests cover unavailable laboratory values. | A missing lab is normal health-data behavior and should produce a controlled model response rather than a server crash. |
| ML response trust | The coordinator accepted incomplete or inconsistent downstream responses too easily. | It now checks patient identity, status, score range, target definition, calibration flag, and required successful-response fields. | The digital twin should not silently display a malformed or semantically different model result. |
| Sensor idempotency | Duplicate event IDs could collide across different patients, and simultaneous duplicates were under-tested. | Duplicate lookup and a database uniqueness rule are scoped by patient plus event ID. Local ingestion is serialized, a database collision is returned as an idempotent duplicate, and sequential/concurrent tests were added. | Retried wearable messages must not create duplicate observations or contaminate another patient's timeline. |
| Time handling | Future sensor times could be presented as if they were current because negative age was clamped to zero. | The API exposes nullable age, an explicit timeline mode, and future timestamp information; the UI warns about future readings. | Clock mistakes become visible instead of being hidden as apparently fresh data. |
| Simulator meaning | The stream ran every five seconds but its relationship to clinical time was unclear. | The publisher starts on a current quarter-hour and explicitly labels that every five real seconds advances the simulation by 15 virtual minutes. | Reviewers can understand that it is an accelerated demonstration, not a real wearable clock. |
| Dashboard failure states | A failed refresh could leave a reassuring “online” impression. | Tests and UI states now cover loading, unknown patients, insufficient history, stale inputs, future timestamps, and refresh failure. | A clinician-facing screen must show uncertainty and loss of connection clearly. |
| Browser payload | The chart library made the initial application bundle unnecessarily large. | The chart is lazy-loaded into a separate bundle. | The main dashboard loads more efficiently without changing the demonstration. |
| Docker boundary | Research data directories could enter build contexts, internal services were published to the host, and startup ordering lacked readiness gates. | Root/component `.dockerignore` files exclude source/prepared patient data and build output; only the dashboard and backend bind to `127.0.0.1`; service health checks and dependency conditions were added. | This reduces accidental data inclusion, unnecessary network exposure, and race conditions. Actual container execution is still pending. |
| Reproducibility | Dependency versions and generated artifacts were not sufficiently fixed or reproducible. | Python packages are exactly pinned; CI, Dependabot, artifact-generation documentation, a tracked deck generator, and a PowerPoint-to-PDF export script were added. | Another reviewer has a clearer path to recreate tests and submission files. |
| Submission artifacts | Earlier slides used outdated target/probability language, and earlier PDFs were image-based. | Version 7 PPTX files use the corrected target, score wording, honest baseline comparison, and open-action list. Their PowerPoint-exported PDFs contain searchable text and were rendered for visual inspection. | The presentation now agrees with the implementation and remains accessible to search/copy tools. |
| Overstated status | Planning notes could be read as proof that the full challenge submission was complete. | The status and checklist separate implemented/component-tested work from clinical review, team data, public-access checks, the video, and the unperformed Docker run. Old plans are labelled archived. | “Implemented” and “verified end to end” are different claims; the repository now makes that distinction. |

## Verification actually performed

The following checks were run on the reviewed working tree:

- Python/data/API/repository tests: **16 passed**.
- Spring Boot tests: **9 passed**.
- React tests: **6 passed**.
- React production build: succeeded; the chart was split from the main bundle.
- JavaScript dependency audit: no reported vulnerabilities at the selected threshold.
- Python dependency audit: no known vulnerabilities reported for the pinned list.
- Model artifact metadata: version, 43-feature schema, target, and checksum checked by code and tests.
- Repository consistency tests: Markdown links, target wording in authoritative files,
  absence of live `riskBand`, Docker ignore rules, and exclusion of raw/prepared
  patient-level files.
- Submission PPTX files: generated with the tracked source and passed presentation
  validation.
- Submission PDFs: correct page counts, searchable text, target/baseline wording, and
  rendered-page visual inspection.
- Git whitespace check and Docker Compose configuration parsing are part of the final
  pre-push checks.

These checks do **not** prove clinical safety, complete cybersecurity, real-world
accuracy, container runtime correctness, or reproducibility on every computer.

## Mistakes and misleading assumptions found

This section records the earlier mistakes plainly instead of hiding them.

1. **The target drifted.** Some materials talked about a threshold-only spike, some
   implied a rise-based event, and some used different time wording. That could make
   a correct-looking metric refer to the wrong task.
2. **A model score was described as a probability.** Logistic Regression emits a
   number between zero and one, but this model was not shown to be calibrated for an
   individual patient. Calling it a clinical probability was too strong.
3. **Risk bands were invented before clinical validation.** “Low/medium/high” looked
   medically meaningful even though no defensible cut-offs or reviewer approval had
   been established.
4. **Performance was easy to overstate.** ROC AUC was reported without making the
   poorer fixed-threshold F1 comparison equally prominent. The majority baseline is
   essential context.
5. **The prototype status was overstated.** Component code and files existed, but
   that did not prove a fresh Docker Compose run, public link access, a working video,
   or clinical wording approval.
6. **The simulator could be mistaken for real time.** A five-second publisher was not
   originally explained well enough as an accelerated synthetic clock.
7. **Failure and timestamp edge cases were under-covered.** Missing labs, future
   readings, unavailable predictions, repeated events, concurrent duplicates, stale
   data, and refresh failure needed explicit behavior and tests.
8. **The build boundary was too broad.** Without strong ignore rules, downloaded or
   prepared research data could accidentally be sent into a container build context.
9. **Internal services were more exposed than necessary.** Publishing ML and MQTT
   ports to the host increased the attack surface of a local demonstration.
10. **Generated evidence was not fully reproducible.** Presentation source, export
    instructions, exact versions, and automated checks needed to be committed with
    the outputs.
11. **Old instructions can still confuse readers.** Archived HOW_TO/TODO/blueprint
    files intentionally preserve the old plan, including old field names. They now
    carry an archive warning, but they are history—not the current contract. Current
    behavior is defined by the root README, API contract, data dictionary, model card,
    architecture, and status documents.
12. **Security cannot be declared complete.** Package audits found no currently known
    issues in the checked Python/JavaScript declarations, but this is not a penetration
    test, Java/container vulnerability assessment, secret-history audit, or medical
    software certification.

## Remaining loopholes and required human work

| Open item | Who must close it | What counts as evidence |
| --- | --- | --- |
| Full Docker build and five-service run | Developer with Docker Desktop | Fresh `docker compose up --build`, healthy services, live MQTT updates, successful dashboard refresh, then a recorded command/result |
| Clinical target and wording review | BPharma/healthcare-domain reviewer | Reviewer name, date, comments, and accepted corrections in `docs/PHASE_STATUS.md` |
| Team/college identity and folder rename | Team leader | Official values replace placeholders and submission folder has the required `Team Name_College Name` format |
| Minimum 20-minute video | Team | Public/unlisted link tested in a private browser window |
| Public repository and link access | Team leader | Repository is Public and every README/artifact/video link opens without the contributor's login |
| Real-world generalisation | Future research work | External validation on a legally usable, representative cohort; subgroup analysis; calibration; threshold selection; prospective review |
| Security depth | Future engineering work | Secret-history review, Java/container scanning, threat model, authentication/authorization design, and penetration testing |
| Concurrency beyond one demo instance | Future engineering work | Multi-instance integration tests and durable broker-delivery tests; the database uniqueness rule protects storage, but only single-process concurrency is covered by the automated suite |

## Final compliance judgement

For the challenge prototype, the repository now directly demonstrates the required
design: static synthetic EHR plus dynamic simulated wearable data, a model that scores
an adverse glucose event two hours ahead, and a doctor-facing conceptual dashboard.
Its data use is aligned with the stated sandbox because the public demo is synthetic
and patient-level research files are not committed.

Compliance is still **conditional**, not final. The remaining submission actions in
the table above cannot be honestly fabricated or completed by code alone. In
particular, this audit must not be used as evidence that Docker was run or that a
healthcare professional approved the clinical wording.
