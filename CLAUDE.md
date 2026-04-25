# Claude Instructions

- Do not run `git commit`, `git push`, or any command that creates or publishes commits unless the human explicitly asks for it in the current conversation.
- Editing files and running checks is fine when requested, but leave commit and push decisions to the human unless explicitly instructed.
- Never commit or push only because implementation work is complete.
- Do not print, expose, or commit `.env*` secrets.
