# FACILITY ARG

> FACILITY ARCHIVE // CENTRAL REPOSITORY  
> CLASSIFICATION: RESTRICTED  
> STATUS: ARCHIVED

The central repository for FacilityARG, an alternate reality game spanning interconnected projects, fictional records, interactive experiences, and communication systems.

This monorepo consolidates the original FacilityARG repositories into a single archive, preserving their source code, assets, and Git commit histories.

## Repository Structure

```text
FacilityARG/
├── FacilityARG/
│   ├── Facility/
│   ├── Facility_VESSEL/
│   ├── Facility_ProLog/
│   ├── Facility_Quest/
│   ├── Facility_Scripts/
│   └── Facility_DiscordBot/
└── README.md
```

| Project | Description |
|---|---|
| [Facility](FacilityARG/Facility) | Core Facility project and associated resources. |
| [Facility_VESSEL](FacilityARG/Facility_VESSEL) | VESSEL project files and resources. |
| [Facility_ProLog](FacilityARG/Facility_ProLog) | ProLog project files and resources. |
| [Facility_Quest](FacilityARG/Facility_Quest) | Quest-related components and resources. |
| [Facility_Scripts](FacilityARG/Facility_Scripts) | Supporting scripts and utilities. |
| [Facility_DiscordBot](FacilityARG/Facility_DiscordBot) | Discord bot implementation and associated resources. |

Individual project documentation, where available, can be found within the corresponding directories.

## Getting Started

Clone the complete archive:

```bash
git clone https://github.com/DefinetlyNotAI/FacilityARG.git
cd FacilityARG
```

Each project is contained within its respective directory.

Project-specific setup instructions, dependencies, and execution requirements may differ. Consult the documentation inside each project before running its components.

## Repository Consolidation

FacilityARG originally consisted of six independently maintained Git repositories under the `FacilityARG` GitHub organization.

These repositories were consolidated using Git subtrees without squashing commits.

The migration preserves:

- Original source files and directory structures.
- Git commit history from each imported repository.
- Commit authorship information and timestamps.
- Independent project directories within the monorepo.

The resulting archive is self-contained. It does not require the original repositories to remain accessible and does not rely on Git submodules.

GitHub-specific metadata, including issues, pull requests, releases, and repository settings, is not included in the subtree migration.

## Project History

To inspect changes to an individual project:

```bash
git log --oneline -- FacilityARG/Facility_VESSEL
```

Replace `Facility_VESSEL` with the relevant project directory.

For the complete combined history:

```bash
git log --all --graph --oneline
```

## Archive Status

This repository serves as the consolidated home of FacilityARG's original projects.

The original repositories may be retired following migration and verification. Their Git histories remain accessible through this repository.

---

FACILITY ARCHIVE  
END OF RECORD
