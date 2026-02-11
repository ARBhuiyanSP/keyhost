---
description: How to push only frontend folder changes
---

If you only want to commit and push changes within the `frontend` folder, follow these steps:

1.  **Stage Only Frontend Changes**:
    Use `git add` strictly for the `frontend` folder.
    ```bash
    git add frontend
    ```
    This leaves changes in other folders (like `backend`, `aerotake`, etc.) unstaged.

2.  **Commit**:
    ```bash
    git commit -m "Your commit message about frontend"
    ```

3.  **Pull Updates (Carefully)**:
    When pulling updates, Git fetches everything. If you have local changes in `frontend` that conflict, `git pull` will pause.
    It's safer to stash your changes first if you are unsure:
    ```bash
    git stash
    git pull origin keyhost-flight-01
    git stash pop
    ```
    _(This applies your changes on top of the latest code)_

4.  **Push**:
    ```bash
    git push origin keyhost-flight-01
    ```

**Handling Submodules (`aerotake`)**:
If `aerotake` shows as modified but you didn't change it, you can reset it:
```bash
git submodule update --init --recursive
```
This discards local submodule changes and syncs it to the commit tracked by `keyhost`.
