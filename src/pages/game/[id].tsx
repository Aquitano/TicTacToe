/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import Board from "@/components/board";
import MoveHistory from "@/components/moveHistory";
import { Separator } from "@/components/separator";
import { Skeleton } from "@/components/skeleton";
import { useToast } from "@/components/use-toast";
import { api } from "@/utils/api";
import { type GetStaticProps, type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const BOARD_SIZE = 9;
const MAX_POSITION = 8;
const FETCH_INTERVAL = 1000;

const GamePage: NextPage<{ gameId: string }> = ({ gameId }) => {
  const { toast } = useToast();
  const [board, setBoard] = useState<string[]>(Array(BOARD_SIZE).fill(""));
  const [lastMove, setLastMove] = useState<Date | null>(null);
  const [myTurn, setMyTurn] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [moveHistory, setMoveHistory] = useState<
    Array<{ player: string; position: number; time: Date }>
  >([]);
  const boardRef = useRef(board);
  const moveHistoryRef = useRef(moveHistory);

  const handleError = (error: { message: string }) => {
    toast({
      title: "Uh oh! Something went wrong.",
      description: error.message,
      variant: "destructive",
    });
    void refetch();
  };

  const { data: sessionData } = useSession({
    required: true,
  });
  const { data: winnerInfo } = api.user.getUserById.useQuery(
    {
      id: winner ?? "",
    },
    {
      enabled: winner !== null,
    }
  );
  const { data: gameStatus } = api.game.getGame.useQuery(
    {
      gameId,
    },
    {
      refetchInterval: FETCH_INTERVAL,
      enabled: !gameStarted && winner === null,
    }
  );
  const { data: fullGame, refetch } = api.game.getFullGame.useQuery(
    { gameId },
    {
      refetchInterval: FETCH_INTERVAL,
      enabled: gameStarted && winner === null,
    }
  );
  const { mutate: makeMove, error: moveError } = api.game.makeMove.useMutation({
    onError: handleError,
  });

  useEffect(() => {
    // Reset the board
    setBoard(Array(BOARD_SIZE).fill(""));
    setMoveHistory([]);
    setLastMove(null);

    void refetch();
  }, [moveError, refetch]);

  const handleMove = useCallback(
    (position: number) => {
      if (sessionData?.user?.id === undefined)
        throw new Error("Session user id is undefined");

      if (!myTurn) return;
      if (board[position] !== "") return;

      setMyTurn(false);
      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];

        newBoard[position] = "X";

        return newBoard;
      });

      makeMove({
        gameId,
        position,
      });

      void refetch();
    },
    [board, gameId, makeMove, myTurn, refetch, sessionData?.user?.id]
  );
  const handleGameEnd = useCallback(
    (winnerId: string) => {
      setWinner(winnerId);
      if (winnerId === sessionData?.user?.id)
        toast({
          title: "Game over!",
          description: `You won!`,
        });
      else {
        toast({
          title: "Game over!",
          description: `You lost!`,
          variant: "destructive",
        });
      }

      setMyTurn(false);
    },
    [sessionData?.user?.id, toast]
  );

  useEffect(() => {
    if (!gameStatus) return;
    // Check if the game has started
    if (gameStatus?.game.turn === null) return;

    console.log("Game started");
    setGameStarted(true);

    // Check if the game has ended
    if (gameStatus?.game.winner !== null) return;

    setMyTurn(gameStatus?.game.turn === sessionData?.user?.id);
  }, [gameStatus, sessionData]);

  useEffect(() => {
    if (!fullGame) return;

    const newBoard = [...boardRef.current];
    const newMoveHistory = [...moveHistoryRef.current];
    let newLastMove: Date | null = null;
    let changesDetected = false;

    fullGame?.game.moves.forEach((move) => {
      // Guard clause for invalid moves
      if (move.position < 0 || move.position > MAX_POSITION) return;

      // Guard clause for moves that are not newer than the last move
      if (lastMove !== null && move.createdAt.getTime() <= lastMove.getTime())
        return;

      // Update the board
      const symbol = move.playerID === sessionData?.user.id ? "X" : "O";
      newBoard[move.position] = symbol;

      newMoveHistory.push({
        player: move.playerID,
        position: move.position,
        time: move.createdAt,
      });

      // Update the last move
      if (newLastMove === null || move.createdAt > newLastMove)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        newLastMove = move.createdAt;

      changesDetected = true;
    });

    setMyTurn(fullGame.game.turn === sessionData?.user?.id);
    if (fullGame.game.winner !== null) handleGameEnd(fullGame.game.winner);

    // Guard clause for no changes detected
    if (!changesDetected) return;

    setBoard(newBoard);
    setMoveHistory(newMoveHistory);

    if (newLastMove !== null) setLastMove(newLastMove);

    void refetch();

    console.log(newBoard);
  }, [lastMove, fullGame, sessionData, refetch, handleGameEnd]);

  boardRef.current = board;
  moveHistoryRef.current = moveHistory;
  return (
    <>
      <Head>
        <title>TicTacToe</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            <span className="text-[hsl(280,100%,70%)]">TicTacToe</span>
          </h1>
          <div className="flex flex-col items-center justify-center gap-3">
            <p className="text-lg font-bold tracking-tight text-white sm:text-xl">
              {gameId}
            </p>
            {!gameStarted && (
              <p className="animate-pulse text-lg font-bold tracking-tight text-white sm:text-xl">
                Waiting for opponent...
              </p>
            )}
            {winnerInfo && (
              <p className="text-lg font-bold tracking-tight text-white sm:text-xl">
                {winnerInfo.user?.id === sessionData?.user?.id
                  ? "You won!"
                  : String(winnerInfo?.user?.name) + " won!"}
              </p>
            )}

            {myTurn && (
              <button
                onClick={() => {
                  handleMove(0);
                }}
              >
                Make Move
              </button>
            )}
            <div className="flex h-full max-w-xs flex-col content-center justify-center">
              <div className="self-center ">
                <div className="max-w-xs text-3xl">
                  {!gameStarted ? (
                    <div className="-mb-2 flex flex-wrap justify-center gap-2">
                      {Array(9)
                        .fill("")
                        .map((_, i) => (
                          <Skeleton
                            key={"board-skeleton" + String(i)}
                            className="mb-4 h-20 w-20 rounded-xl opacity-70"
                          />
                        ))}
                    </div>
                  ) : (
                    <Board board={board} handleMove={handleMove} />
                  )}
                </div>
                <MoveHistory
                  history={moveHistory}
                  setBoard={setBoard}
                  sessionData={sessionData}
                  BOARD_SIZE={BOARD_SIZE}
                />
              </div>
            </div>
            <Separator className="mt-16" />
            <Link
              href="/game"
              className="text-lg font-bold tracking-tight text-white sm:text-xl"
            >
              Go back to the lobby
            </Link>
            {/* <p className="text-yellow-500">{JSON.stringify(info)}</p> */}
          </div>
        </div>
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps = (context) => {
  const gameId = context.params?.id;

  if (typeof gameId !== "string") return { notFound: true };

  return {
    props: {
      gameId,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default GamePage;
