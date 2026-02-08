---
name: git-workflow
description: Use when starting feature work needing isolation or when completing a development branch — covers worktree creation, setup, and branch finishing.
---

# Git Workflow

## Part 1: Setting Up an Isolated Workspace

### Directory Selection

Follow this priority:

1. **Check existing directories:**
   ```bash
   ls -d .worktrees 2>/dev/null
   ls -d worktrees 2>/dev/null
   ```
   If found, use it. `.worktrees` wins if both exist.

2. **Check project docs** for worktree directory preference.

3. **Ask the user** if neither exists.

### Safety Verification

**For project-local directories:** Verify the directory is git-ignored:

```bash
git check-ignore -q .worktrees 2>/dev/null
```

**If NOT ignored:** Add to `.gitignore` and commit before proceeding.

### Creation Steps

```bash
# 1. Create worktree
git worktree add <path> -b <branch-name>
cd <path>

# 2. Run project setup (auto-detect)
# Node.js:  npm install
# Rust:     cargo build
# Python:   pip install -r requirements.txt
# Go:       go mod download

# 3. Verify clean baseline
<test command>
```

**If tests fail:** Report failures, ask whether to proceed or investigate.

**If tests pass:** Report ready with location and test count.

---

## Part 2: Finishing a Development Branch

### Step 1: Verify Tests

```bash
<project test command>
```

**If tests fail:** Stop. Fix before offering options.

### Step 2: Present Options

```
Implementation complete. What would you like to do?

1. Merge back to <base-branch> locally
2. Push and create a Pull Request
3. Keep the branch as-is (I'll handle it later)
4. Discard this work
```

### Step 3: Execute Choice

**Option 1 — Merge locally:**
```bash
git checkout <base-branch>
git pull
git merge <feature-branch>
<test command>  # Verify merged result
git branch -d <feature-branch>
```
Then cleanup worktree.

**Option 2 — Push and PR:**
```bash
git push -u origin <feature-branch>
gh pr create --title "<title>" --body "<summary>"
```
Then cleanup worktree.

**Option 3 — Keep as-is:**
Report branch name and worktree path. Don't cleanup.

**Option 4 — Discard:**
**Confirm first** — show branch name, commits, worktree path. Wait for explicit confirmation.
```bash
git checkout <base-branch>
git branch -D <feature-branch>
git worktree remove <path>
```

### Worktree Cleanup

For Options 1, 2, 4:
```bash
git worktree remove <worktree-path>
```

## Red Flags

- Creating worktree without verifying it's git-ignored
- Skipping baseline test verification
- Proceeding with failing tests without asking
- Merging without verifying tests on result
- Deleting work without confirmation
- Starting implementation on main/master without consent
