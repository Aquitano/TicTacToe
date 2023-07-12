# tRPC Procedures
This document provides an overview of the tRPC procedures used in the application. The procedures are divided into two main files: `tictactoe.ts` and `user.ts`.

## tictactoe.ts
This file contains procedures related to the TicTacToe game. It includes procedures for creating and joining games, making moves, and fetching game data.

### Procedures
- `joinGame`: Joins a game. Throws an error if the game is not found or is full.
- `createGame`: Creates a game. The type of game (AI or PVP) is specified in the input.
- `getGame`: Fetches a game. Throws an error if the game is not found.
- `getAiGame`: Fetches an AI game. Throws an error if the game is not found.
- `getFullGame`: Fetches a game including moves. Throws an error if the game is not found.
- `getMoves`: Fetches the moves of a game.
- `makeMove`: Makes a move in a game. Throws an error if the game is not found, is already finished, or it's not the user's turn.
- `makeAiMove`: Makes a move in an AI game. Throws an error if the game is not found, is already finished, or it's not the user's turn.
- `getOpenGames`: Fetches open games.

## user.ts
This file contains procedures related to user management. Currently, it only includes a procedure for fetching a user by their ID.

### Procedures
- `getUserById`: Fetches a user by their ID.

## Usage
To use these procedures, you need to import the api utility and call the procedure with the required input. For example:

```ts
import { api } from '@/utils/api';

// Inside a React component:
const createGame = api.game.createGame.useMutation();
const { game } = await createGame.mutateAsync({ type: 'AI' });
```
Please note that some procedures are protected and require a valid user session to be established.

## Error Handling
Most procedures throw a `TRPCError` if something goes wrong. The error includes a code and a message that provide more information about what went wrong. You should catch these errors and handle them appropriately in your application.