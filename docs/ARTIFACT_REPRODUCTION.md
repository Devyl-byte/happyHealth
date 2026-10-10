# Reproducing the submission artifacts

The committed PowerPoint files are generated from the tracked Artifact Tool source
at `.codex-build/presentations/generate_submission_decks.mjs`. The source remains
inside the otherwise ignored build directory because it is the exact program that
created the submitted decks; Git tracks that one file explicitly.

## PowerPoint files

Run the generator from the repository root in a Codex workspace with the bundled
presentation runtime. Define these environment variables first:

- `CODEX_PRESENTATIONS_SKILL_DIR`: absolute path to the installed Presentations skill
- `CODEX_RUNTIME_PYTHON`: absolute path to the bundled Python executable
- `RUNTIME_NODE_MODULES`: absolute path to the bundled Node module directory

Then run the generator with the bundled Node executable. It writes validated PPTX
files to `submission/TEAM_NAME_COLLEGE_NAME/` and slide previews to the ignored
`.codex-build/presentations/previews/` directory.

## Searchable PDF files

On Windows with Microsoft PowerPoint installed, run:

```powershell
.\scripts\export_submission_pdfs.ps1
```

PowerPoint exports the native slides directly. Unlike the retired image-only PDF
method, the resulting text remains searchable and selectable. Render every page and
inspect it before committing the files.
