# Pi Superpowers

A skill-driven workflow system for [pi](https://github.com/badlogic/pi). Ensures the right skills are loaded before any implementation, debugging, or multi-step work.

## What's Included

### Skills

| Skill | Description |
|-------|-------------|
| `pi-superpowers` | Meta-skill that orchestrates loading other skills based on the task |
| `brainstorming` | Explore intent, requirements, and design before implementation |
| `planning` | Break multi-step tasks into implementation plans |
| `test-driven-development` | Write tests before implementation code |
| `systematic-debugging` | Structured approach to bugs and unexpected behavior |
| `code-review` | Self-review and responding to external feedback |
| `git-workflow` | Worktree creation, setup, and branch management |
| `verification` | Verify work is actually complete before claiming success |

### Extensions (Tools)

| Tool | Description |
|------|-------------|
| `todo` | Task/todo list management for tracking implementation progress. Supports create, add, batch, start/done/skip/block/reset, list, summary, clear. Includes a `/todos` command for interactive viewing. |
| `prompt_user` | Ask the user questions during workflows — select from options, yes/no confirmations, or free text input. |

## Install

```bash
# From GitHub
pi install https://github.com/jevon/pi-superpowers

# From npm (if published)
pi install npm:pi-superpowers
```

## Usage

Once installed, pi automatically discovers all skills. The `pi-superpowers` meta-skill ensures the right ones are loaded for each task.

You can also invoke any skill directly:

```bash
/skill:brainstorming
/skill:planning
/skill:systematic-debugging
```
