from __future__ import annotations

import re
import subprocess
import unittest
from pathlib import Path
from urllib.parse import unquote


ROOT = Path(__file__).resolve().parents[1]
TARGET_TERMS = ("180 mg/dL", "40 mg/dL")


class RepositoryConsistencyTest(unittest.TestCase):
    def test_relative_markdown_links_resolve(self) -> None:
        broken: list[str] = []
        link_pattern = re.compile(r"!?\[[^\]]*\]\(([^)]+)\)")
        for document in [ROOT / "README.md", *sorted((ROOT / "docs").glob("*.md")),
                         *sorted((ROOT / "submission").rglob("*.md"))]:
            for raw_target in link_pattern.findall(document.read_text(encoding="utf-8")):
                target = raw_target.strip().strip("<>")
                if target.startswith(("http://", "https://", "mailto:", "#")):
                    continue
                target = unquote(target.split("#", 1)[0].split("?", 1)[0])
                if target and not (document.parent / target).resolve().exists():
                    broken.append(f"{document.relative_to(ROOT)} -> {raw_target}")
        self.assertEqual([], broken, "Broken repository links:\n" + "\n".join(broken))

    def test_public_target_descriptions_include_both_event_conditions(self) -> None:
        sources = [
            ROOT / "README.md",
            ROOT / "ml-service" / "MODEL_CARD.md",
            ROOT / "ml-service" / "app" / "model_service.py",
            ROOT / ".codex-build" / "presentations" / "generate_submission_decks.mjs",
        ]
        for source in sources:
            text = source.read_text(encoding="utf-8")
            for term in TARGET_TERMS:
                self.assertIn(term, text, f"{source.relative_to(ROOT)} omits {term}")

    def test_raw_and_processed_patient_files_are_not_tracked(self) -> None:
        tracked = subprocess.run(
            ["git", "ls-files", "data/external", "data/processed"],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        ).stdout.splitlines()
        allowed = {
            "data/external/.gitignore",
            "data/external/MANIFEST.csv",
            "data/external/README.md",
            "data/processed/.gitignore",
            "data/processed/README.md",
        }
        self.assertEqual(allowed, set(tracked))

    def test_clinical_risk_bands_are_not_in_the_live_contract(self) -> None:
        live_files = [
            ROOT / "ml-service" / "app" / "schemas.py",
            ROOT / "ml-service" / "app" / "main.py",
            ROOT / "frontend" / "src" / "types" / "twin.ts",
            ROOT / "frontend" / "src" / "components" / "PredictionPanel.tsx",
        ]
        for source in live_files:
            self.assertNotIn("riskBand", source.read_text(encoding="utf-8"))

    def test_docker_build_context_excludes_local_research_data(self) -> None:
        rules = (ROOT / ".dockerignore").read_text(encoding="utf-8").splitlines()
        self.assertIn("data/external", rules)
        self.assertIn("data/processed", rules)


if __name__ == "__main__":
    unittest.main()
