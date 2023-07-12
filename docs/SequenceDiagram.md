# Sequence Diagram

This document describes the sequence of method calls when a player makes a move in the game.

```mermaid
sequenceDiagram
    participant P as Player
    participant G as GamePage Component
    participant A as API
    participant S as Server
    Note over P,G: Player decides to make a move (if possible)
    P->>G: handleMove(position)
    G->>A: makeMove({ gameId, position })
    A->>S: Sends request to server
    S->>S: validateTurn(game, ctx.session.user.id, input);
    S->>S: checkWinnerByHistory(updatedGame);
    S->>S: changeTurn(game, input.gameId);
    S-->>A: Responds with game status
    A-->>G: Returns game status
    G->>G: setMyTurn(false)
    G->>G: setBoard(newBoard)
    Note over G: Game state is updated
    G->>P: Update DOM to reflect new game state
    Note over G,A: Every second, the component fetches the full game state
    G->>A: fullGame = api.game.getFullGame.useQuery({ gameId })
    A->>S: Sends request to server
    S-->>A: Responds with full game state
    A-->>G: Returns full game state
    G->>G: setMoveHistory(newMoveHistory)
    G->>G: handleGameEnd()
    Note over G: Game state is updated
    G->>P: Update DOM to reflect new game state
```

## Description

1. The player decides to make a move and calls the `handleMove` function with the chosen position as an argument.

2. The `handleMove` function checks if it's the player's turn and if the chosen position on the board is empty. If these conditions are met, it calls the `makeMove` function from the API with the game ID and the chosen position as arguments.

3. The `makeMove` function sends a request to the server to make a move in the game.

4. The server processes the request and responds with the updated game status.

5. The `makeMove` function returns the updated game status to the `handleMove` function.

6. The `handleMove` function updates the game state by setting `myTurn` to `false` and updating the board with the new move.

7. The GamePage component updates the UI to reflect the new game state.

8. Every second, the `GamePage` component fetches the full game state from the server using the `api.game.getFullGame.useQuery` function.

9. The server processes the request and responds with the full game state.

10. The `api.game.getFullGame.useQuery` function returns the full game state to the `GamePage` component.

11. The `GamePage` component updates the move history with the new moves from the full game state.

12. The GamePage component updates the UI to reflect the new move history.
