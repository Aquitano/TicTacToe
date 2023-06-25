import java.util.Scanner;
import java.util.Random;
import java.util.InputMismatchException;

public class TicTacToe {
  private int[] board;
  private int currentPlayer;
  private Random random;

  private static final int BOARD_SIZE = 9;
  private static final int EMPTY_POSITION = 0;
  private static final int FIRST_PLAYER = 1;
  private static final int HUMAN_PLAYER = 1;
  private static final int AI_PLAYER = 2;

  public static void main(String[] args) {
    var game = new TicTacToe();
    game.playGame();
  }

  /**
   * Returns a string representation of the game board.
   *
   * @return A string representation of the game board.
   */
  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < BOARD_SIZE; i++) {
      if (i % 3 == 0 && i != 0) {
        sb.append("\n");
      }
      sb.append(board[i] == 0 ? "." : (board[i] == 1 ? "X" : "O"));
      sb.append(" ");
    }
    return sb.toString();
  }

  /**
   * The constructor for the TicTacToe class.
   */
  public TicTacToe() {
    this.board = new int[BOARD_SIZE];
    this.currentPlayer = FIRST_PLAYER;
    this.random = new Random();
    reset();
  }

  /**
   * Resets the game to its initial state.
   */
  public void reset() {
    for (int i = 0; i < BOARD_SIZE; i++) {
      board[i] = EMPTY_POSITION;
    }
    this.currentPlayer = FIRST_PLAYER;
    System.out.println("\n=== NEW GAME\n");
  }

  /**
   * Sets a mark at the given position on the board.
   *
   * @param position The position to set the mark at.
   * @return True if the mark was set successfully, false otherwise.
   */
  public boolean setMark(int position) {
    if (position < 0 || position >= BOARD_SIZE || board[position] != EMPTY_POSITION) {
      return false;
    }
    board[position] = currentPlayer;
    return true;
  }

  /**
   * Starts the game and handles the game loop.
   */
  public void playGame() {
    Scanner scanner = new Scanner(System.in);
    int opponent = getOpponent(scanner);
    boolean gameOn = true;

    while (gameOn) {
      System.out.println(this);
      if (opponent == HUMAN_PLAYER || currentPlayer == HUMAN_PLAYER) {
        humanMove(scanner);
      } else {
        aiMove();
      }
      if (checkWin(currentPlayer)) {
        System.out.println("\033[1;32mPlayer " + currentPlayer + " wins!\033[0m\n");
        System.out.println(this);
        reset();
        gameOn = continuePlaying(scanner);
      } else if (isBoardFull()) {
        System.out.println("\033[1;33mIt's a tie!\033[0m\n");
        System.out.println(this);
        reset();
        gameOn = continuePlaying(scanner);
      } else {
        currentPlayer = (currentPlayer == 1) ? 2 : 1;
      }
    }

  }

  /**
   * Asks the user if they want to continue playing.
   *
   * @param scanner The Scanner to read the user's input.
   * @return True if the user wants to continue playing, false otherwise.
   */
  private boolean continuePlaying(Scanner scanner) {
    System.out.println("Do you want to continue playing? (1) Yes (2) No");
    int response = scanner.nextInt();
    return response == 1;
  }

  /**
   * Checks if the game board is full.
   *
   * @return True if the board is full, false otherwise.
   */
  private boolean isBoardFull() {
    for (int i = 0; i < BOARD_SIZE; i++) {
      if (board[i] == EMPTY_POSITION) {
        return false;
      }
    }
    return true;
  }

  /**
   * Gets the opponent's choice of who they want to play against.
   *
   * @param scanner The Scanner to read the user's input.
   * @return The opponent's choice (1 for human, 2 for AI).
   */
  private int getOpponent(Scanner scanner) {
    int opponent = 0;
    while (opponent != HUMAN_PLAYER && opponent != AI_PLAYER) {
      System.out.println("Do you want to play against (1) another human or (2) the AI?");
      try {
        opponent = scanner.nextInt();
        if (opponent != 1 && opponent != 2) {
          System.out.println("Invalid input. Please enter 1 or 2.");
        }
      } catch (InputMismatchException e) {
        System.out.println("Invalid input. Please enter 1 or 2.");
        scanner.next(); // discard the invalid input
      }
    }
    return opponent;
  }

  /**
   * Handles the human player's move.
   *
   * @param scanner The Scanner to read the user's input.
   */
  private void humanMove(Scanner scanner) {
    boolean validMove = false;

    while (!validMove) {
      System.out.println("Player " + currentPlayer + ", enter a position (0-8):");
      try {
        int position = scanner.nextInt();
        if (!setMark(position)) {
          System.out.println("Invalid position, try again.");
        } else {
          validMove = true;
        }
      } catch (InputMismatchException e) {
        System.out.println("Invalid input. Please enter a number between 0 and 8.");
        scanner.next(); // discard the invalid input
      }
    }
  }

  /**
   * Checks if the given player has won the game.
   *
   * @param player The player to check for a win.
   * @return True if the player has won, false otherwise.
   */
  private boolean checkWin(int player) {
    int[][] winConditions = {
        { 0, 1, 2 }, { 3, 4, 5 }, { 6, 7, 8 }, // rows
        { 0, 3, 6 }, { 1, 4, 7 }, { 2, 5, 8 }, // columns
        { 0, 4, 8 }, { 2, 4, 6 } // diagonals
    };

    for (int[] condition : winConditions) {
      if (board[condition[0]] == player &&
          board[condition[1]] == player &&
          board[condition[2]] == player) {
        return true;
      }
    }
    return false;
  }

  /**
   * Finds a winning move for the given player.
   *
   * @param player The player to find a winning move for.
   * @return The position of the winning move, or -1 if no winning move is found.
   */
  private int findWinningMove(int player) {
    for (int i = 0; i < BOARD_SIZE; i++) {
      if (board[i] == EMPTY_POSITION) {
        board[i] = player;
        if (checkWin(player)) {
          board[i] = EMPTY_POSITION;
          return i;
        }
        board[i] = EMPTY_POSITION;
      }
    }
    return -1;
  }

  /**
   * Handles the AI's move.
   */
  public void aiMove() {
    // Try to find a winning move for AI.
    int move = findWinningMove(2);

    // If no winning move for AI, try to block human's winning move.
    if (move == -1)
      move = findWinningMove(1);

    // If no winning move for either, make a random move.
    if (move == -1)
      move = randomMove();

    setMark(move);
    System.out.println("---");
  }

  /**
   * Generates a random move for the AI.
   *
   * @return The position of the random move.
   */
  private int randomMove() {
    int move;
    do {
      move = random.nextInt(9);
    } while (board[move] != 0);
    return move;
  }
}
