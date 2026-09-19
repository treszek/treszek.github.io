---
title: "Abbas-odo — Day 1: Project kickoff"
date: 2026-09-16T10:20:00Z
project: Abbas-odo
---

Kicked off the Abbas-odo project today. Spent most of the day setting up the repository, deciding on the stack, and sketching the initial architecture.

## What got done

- Repository initialized, CI skeleton in place
- Core module boundaries drafted
- Decided on the data model for the first milestone

## Notes

A quick example of the config loader I prototyped:

```python
import tomllib
from pathlib import Path

def load_config(path: str) -> dict:
    """Load a TOML config file, falling back to defaults."""
    p = Path(path)
    if not p.exists():
        return {"debug": False, "workers": 4}
    with p.open("rb") as f:
        return tomllib.load(f)
```

Tomorrow: wire up the first end-to-end path.
