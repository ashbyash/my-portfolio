# 🚀 Claude Code Execution Guide

## 🎯 Operational Principle: Token Efficiency
- **Precision Edit**: Modify only the target lines. Avoid full file rewrites.
- **Context Awareness**: Use `DESIGN.md` for UI/UX and `DATA_STRATEGY.md` for content structure.
- **Briefing**: Keep explanations concise; focus on the "Action."

## 🛠 Project Architecture
- **Single Page Application**: The site must be a **One-Pager** (Vertical Scroll).
- **Branch Strategy**: Use `main` as the default branch. No `master`.
- **Logic**: Fetch all portfolio data dynamically from JSON files.

## 📋 Roadmap (Current Backlog)
1. [x] **Branch Clean-up**: Rename `master` to `main` and update remote.
2. [x] **One-Pager Refactor**: Combine all sections into a single scrollable view.
3. [x] **Anchor Navigation**: Update navbar to scroll to `#id` instead of toggling views.
4. [x] **JSON Integration**: Map provided `portfolio-*.json` files to the UI.

## 🤖 Maintenance
- Ask me to "Update CLAUDE.md" after completing each task to track progress.