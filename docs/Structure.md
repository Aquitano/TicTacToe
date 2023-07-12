# Folder Structure

## Overview

The application follows a standard folder structure for a Next.js project. Here's a brief overview:

- `src/`: Contains the source code for the application.
    - `components/`: Contains all the React components used in the application.
    - `pages/`: Contains all the pages of the application.
    - `server/`: Contains server-side logic.
      - `api/routers/`: Contains the routers for the tRPC procedures (API endpoints).
    - `styles/`: Contains global styles for the application.
    - `utils/`: Contains utility functions and helpers for the application.
- `prisma`: Contains the Prisma schema and migrations (database configurations).
- `public/`: Contains public assets such as images and icons.

## Details

### Pages
- `_app.tsx`: This is the custom App component. It allows to override the default App component provided by Next.js. It's used to maintain layout or state between page changes.
- `index.tsx`: This is the home page of the application.
- `game.tsx`: This is the main game page where users can create a new game or join an existing game.
- `game/[id].tsx`: This page corresponds to a specific game identified by its id.
- `game/ai/[id].tsx`: This page corresponds to a specific AI game identified by its id.

## Routers
- `tictactoe.ts`: The router for the TicTacToe game procedures.
- `user.ts`: The router for user-related procedures.

More details about the routers can be found in the [procedures](./Procedures.md) page.

---

This structure allows for a clean and organized codebase, making it easier to navigate and maintain the project.