/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import MoveHistory from '@/components/moveHistory';
import { Separator } from '@/components/separator';
import { Skeleton } from '@/components/skeleton';
import { useToast } from '@/components/use-toast';
import { api } from '@/utils/api';
import { type GetStaticProps, type NextPage } from 'next';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
const Board = dynamic(() => import('@/components/board'), {
    loading: () => <p>Loading...</p>,
});
const Rematch = dynamic(() => import('@/components/rematch'), {
    loading: () => <p>Loading...</p>,
});

const BOARD_SIZE = 9;
const MAX_POSITION = 8;
const FETCH_INTERVAL = 1000;

/**
 * The main game page component.
 * @param {object} props - The component props.
 * @param {string} props.gameId - The ID of the game.
 * @returns {JSX.Element} The rendered component.
 */
const GamePage: NextPage<{ gameId: string }> = ({ gameId }) => {
    const { toast } = useToast();
    const [board, setBoard] = useState<string[]>(Array(BOARD_SIZE).fill(''));
    const [lastMove, setLastMove] = useState<Date | null>(null);
    const [myTurn, setMyTurn] = useState<boolean>(false);
    const [winner, setWinner] = useState<string | null>(null);
    const [gameStarted, setGameStarted] = useState<boolean>(false);
    const [moveHistory, setMoveHistory] = useState<
        Array<{ player: string; position: number; time: Date }>
    >([]);
    const [winningText, setWinningText] = useState<string>('');
    const boardRef = useRef(board);
    const moveHistoryRef = useRef(moveHistory);

    /**
     * Handles errors by showing a toast and refetching the data.
     * @param {object} error - The error object.
     * @param {string} error.message - The error message.
     */
    const handleError = (error: { message: string }) => {
        toast({
            title: 'Uh oh! Something went wrong.',
            description: error.message,
            variant: 'destructive',
        });
        void refetch();
    };

    const { data: sessionData } = useSession({
        required: true,
    });
    const { data: winnerInfo } = api.user.getUserById.useQuery(
        {
            id: winner ?? '',
        },
        {
            queryKey: ['user.getUserById', { id: winner ?? '' }],
            enabled: winner !== null,
        },
    );
    const { data: gameStatus } = api.game.getGame.useQuery(
        {
            gameId,
        },
        {
            refetchInterval: FETCH_INTERVAL,
            enabled: !gameStarted && winner === null,
            queryKey: ['game.getGame', { gameId }],
        },
    );
    const { data: fullGame, refetch } = api.game.getFullGame.useQuery(
        { gameId },
        {
            refetchInterval: FETCH_INTERVAL,
            enabled: gameStarted && winner === null,
            queryKey: ['game.getFullGame', { gameId }],
        },
    );
    const { mutate: makeMove, error: moveError } =
        api.game.makeMove.useMutation({
            onError: handleError,
        });

    /**
     * Resets the board and refetches the data when there's a move error.
     */
    useEffect(() => {
        // Reset the board
        setBoard(Array(BOARD_SIZE).fill(''));
        setMoveHistory([]);
        setLastMove(null);

        void refetch();
    }, [moveError, refetch]);

    /**
     * Handles a move by the current player.
     * @param {number} position - The position of the move.
     */
    const handleMove = useCallback(
        (position: number) => {
            if (sessionData?.user?.id === undefined)
                throw new Error('Session user id is undefined');

            if (!myTurn) return;
            if (board[position] !== '') return;

            makeMove({
                gameId,
                position,
            });

            setMyTurn(false);
            setBoard((prevBoard) => {
                const newBoard = [...prevBoard];

                newBoard[position] = 'X';

                return newBoard;
            });
        },
        [board, gameId, makeMove, myTurn, sessionData?.user?.id],
    );

    /**
     * Handles the end of the game.
     * @param {string} winnerId - The ID of the winner.
     * @param {'draw' | 'win'} status - The status of the game.
     */
    const handleGameEnd = useCallback(
        (winnerId: string, status: 'draw' | 'win') => {
            setWinner(winnerId);
            if (status === 'draw') {
                setWinningText("It's a draw!");
                toast({
                    title: 'Game over!',
                    description: `It's a draw!`,
                });
            } else {
                setWinner(winnerId);
                if (winnerId === sessionData?.user?.id) {
                    setWinningText('You won!');
                    toast({
                        title: 'Game over!',
                        description: `You won!`,
                    });
                } else {
                    setWinningText('You lost!');
                    toast({
                        title: 'Game over!',
                        description: `You lost!`,
                        variant: 'destructive',
                    });
                }
            }

            setMyTurn(false);
        },
        [sessionData?.user?.id, toast],
    );

    /**
     * Checks if the game has started or ended.
     */
    useEffect(() => {
        if (!gameStatus) return;
        // Check if the game has started
        if (gameStatus?.game.turn === null) return;

        console.log('Game started');
        setGameStarted(true);

        // Check if the game has ended
        if (gameStatus?.game.winner !== null) return;

        setMyTurn(gameStatus?.game.turn === sessionData?.user?.id);
    }, [gameStatus, sessionData]);

    /**
     * Updates the board and move history based on the full game data.
     */
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
            if (
                lastMove !== null &&
                move.createdAt.getTime() <= lastMove.getTime()
            )
                return;

            // Update the board
            const symbol = move.playerId === sessionData?.user.id ? 'X' : 'O';
            newBoard[move.position] = symbol;

            if (move.playerId === null) throw new Error('Player id is null');

            newMoveHistory.push({
                player: move.playerId,
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
        if (fullGame.game.winner !== null)
            handleGameEnd(fullGame.game.winner, 'win');
        else if (fullGame.game.moves.length === BOARD_SIZE)
            handleGameEnd('', 'draw');

        // Guard clause for no changes detected
        if (!changesDetected) return;

        setBoard(newBoard);
        setMoveHistory(newMoveHistory);

        if (newLastMove !== null) setLastMove(newLastMove);

        void refetch();
    }, [lastMove, fullGame, sessionData, refetch, handleGameEnd]);

    // Update refs
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
                        <span className="text-[hsl(280,100%,70%)]">
                            TicTacToe
                        </span>
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
                        <p
                            className={`text-lg font-bold tracking-tight text-white sm:text-xl ${
                                !winnerInfo ? 'invisible' : ''
                            }`}
                        >
                            {winningText}
                        </p>
                        <p
                            className={`text-white ${
                                !myTurn ? 'invisible' : ''
                            }`}
                        >
                            Make Move
                        </p>
                        <div className="flex h-full max-w-xs flex-col content-center justify-center">
                            <div className="self-center">
                                <div className="max-w-xs text-3xl">
                                    {!gameStarted ? (
                                        <GridSkeleton />
                                    ) : (
                                        <Board
                                            board={board}
                                            handleMove={handleMove}
                                        />
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
                        {winnerInfo && <Rematch newGameSettings={0} />}
                        <Link
                            href="/game"
                            className="text-lg font-bold tracking-tight text-white sm:text-xl"
                        >
                            Go back to the lobby
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
};

// eslint-disable-next-line react/display-name
const GridSkeleton = memo(() => (
    <div className="grid grid-cols-3 gap-4">
        {Array(9)
            .fill('')
            .map((_, i) => (
                <Skeleton
                    key={'board-skeleton' + String(i)}
                    className="mb-4 h-20 w-20 rounded-xl opacity-70"
                />
            ))}
    </div>
));

export const getStaticProps: GetStaticProps = (context) => {
    const gameId = context.params?.id;

    if (typeof gameId !== 'string') return { notFound: true };

    return {
        props: {
            gameId,
        },
    };
};

export const getStaticPaths = () => {
    return { paths: [], fallback: 'blocking' };
};

export default GamePage;
