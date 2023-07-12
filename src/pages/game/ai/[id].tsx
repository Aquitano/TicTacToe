/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import Board from '@/components/board';
import MoveHistory from '@/components/moveHistory';
import { Separator } from '@/components/separator';
import { useToast } from '@/components/use-toast';
import { checkGameEnd, getMove } from '@/utils/ai';
import { api } from '@/utils/api';
import { type GetStaticProps, type NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import Rematch from '../../../components/rematch';

const BOARD_SIZE = 9;

/**
 * The main ai game page component.
 * @param {object} props - The component props.
 * @param {string} props.gameId - The ID of the game.
 * @returns {JSX.Element} The rendered component.
 */
const GamePage: NextPage<{ gameId: string }> = ({ gameId: gameId }) => {
    const router = useRouter();
    const { toast } = useToast();
    const [board, setBoard] = useState<string[]>(Array(BOARD_SIZE).fill(''));
    const [moveHistory, setMoveHistory] = useState<
        Array<{ player: string; position: number; time: Date }>
    >([]);
    const [winningText, setWinningText] = useState<string>('');
    const boardRef = useRef(board);
    const moveHistoryRef = useRef(moveHistory);
    const [aiStrength, setAiStrength] = useState<number>(0);

    const [turn, setTurn] = useState<'AI' | 'Player' | ''>('');

    /**
     * Handles errors by showing a toast.
     * @param {object} error - The error object.
     * @param {string} error.message - The error message.
     */
    const handleError = (error: { message: string }) => {
        toast({
            title: 'Uh oh! Something went wrong.',
            description: error.message,
            variant: 'destructive',
        });
    };

    const { data: sessionData } = useSession({
        required: true,
    });

    const {
        mutate: uploadMove,
        error: moveError,
        isLoading: isMoveLoading,
    } = api.game.makeAiMove.useMutation({
        onError: handleError,
    });
    const { data: gameData, isLoading: isGameLoading } =
        api.game.getAiGame.useQuery({ gameId });

    /**
     * Resets the board when there's a move error.
     */
    useEffect(() => {
        // Reset the board
        setBoard(Array(BOARD_SIZE).fill(''));
        setMoveHistory([]);
    }, [moveError]);

    /**
     * Handles the end of the game.
     * @param {string} winnerId - The ID of the winner.
     * @param {'draw' | 'win'} status - The status of the game.
     * @param {boolean} upload - Whether to upload the game result.
     */
    const handleGameEnd = useCallback(
        (winnerId: string, status: 'draw' | 'win', upload = true) => {
            if (status === 'draw') {
                setWinningText("It's a draw!");
                setTurn('');
                toast({
                    title: 'Game over!',
                    description: `It's a draw!`,
                });
                if (upload)
                    uploadMove({
                        gameId,
                        status,
                        moves: moveHistoryRef.current,
                    });
            } else {
                if (winnerId === sessionData?.user?.id) {
                    setWinningText('You won!');
                    setTurn('');
                    toast({
                        title: 'Game over!',
                        description: `You won!`,
                    });
                    if (upload)
                        uploadMove({
                            gameId,
                            status,
                            moves: moveHistoryRef.current,
                            winner: sessionData.user.id,
                        });
                } else {
                    setWinningText('You lost!');
                    setTurn('');
                    toast({
                        title: 'Game over!',
                        description: `You lost!`,
                        variant: 'destructive',
                    });
                    if (upload)
                        uploadMove({
                            gameId,
                            status,
                            moves: moveHistoryRef.current,
                            winner: 'AI',
                        });
                }
            }
        },
        [gameId, sessionData?.user.id, toast, uploadMove],
    );

    /**
     * Checks if the game has ended after a move.
     * @param {string} userId - The ID of the user.
     */
    const handleCheckMove = useCallback(
        (userId: string) => {
            const gameEnd = checkGameEnd(moveHistoryRef.current);
            switch (gameEnd) {
                case 'AI':
                    handleGameEnd('AI', 'win');
                    break;
                case userId:
                    handleGameEnd(userId, 'win');
                    break;
                case 'draw':
                    handleGameEnd('', 'draw');
                    break;
                default:
                    break;
            }
        },
        [handleGameEnd],
    );

    /**
     * Handles a move by the current player or the AI.
     * @param {number} position - The position of the move.
     * @param {'AI' | 'Player'} curTurn - The current turn.
     */
    const handleMove = useCallback(
        (position: number, curTurn: 'AI' | 'Player' = 'Player') => {
            if (sessionData?.user?.id === undefined)
                throw new Error('Session user id is undefined');

            if (winningText !== '') return;

            if (curTurn === 'AI') {
                setBoard((prevBoard) => {
                    const newBoard = [...prevBoard];

                    newBoard[position] = 'O';

                    return newBoard;
                });

                setMoveHistory((prevMoveHistory) => [
                    ...prevMoveHistory,
                    {
                        player: 'AI',
                        position,
                        time: new Date(),
                    },
                ]);

                setTurn('Player');
            } else {
                if (board[position] !== '') return;

                setBoard((prevBoard) => {
                    const newBoard = [...prevBoard];

                    newBoard[position] = 'X';

                    return newBoard;
                });

                setMoveHistory((prevMoveHistory) => [
                    ...prevMoveHistory,
                    {
                        player: sessionData.user.id,
                        position,
                        time: new Date(),
                    },
                ]);
                setTurn('AI');
            }
        },
        [board, sessionData?.user.id, winningText],
    );

    /**
     * Initializes the game board and move history based on the game data.
     */
    useEffect(() => {
        if (sessionData?.user?.id === undefined) return;

        const newMoveHistory: {
            player: string;
            position: number;
            time: /* eslint-disable @typescript-eslint/no-unsafe-member-access */ Date;
        }[] = [];

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const newBoard: string[] = Array(BOARD_SIZE).fill('');
        // Update the board
        gameData?.game?.moves.forEach((move) => {
            const player =
                move.playerType === 'ai' ? 'AI' : sessionData.user.id;
            newMoveHistory.push({
                player: player,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                position: move.position,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                time: move.createdAt,
            });

            newBoard[move.position] = player === 'AI' ? 'O' : 'X';
        });

        setMoveHistory(newMoveHistory);
        setBoard(newBoard);

        console.log('Initial board loaded');

        setAiStrength(Number(router.query.strength));
        if (gameData?.game?.gameEnd) {
            if (gameData?.game?.winner) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                handleGameEnd(gameData.game.winner, 'win', false);
            } else {
                handleGameEnd('', 'draw', false);
            }
            return;
        }

        // Randomize who goes first
        setTurn(Math.random() > 0.5 ? 'AI' : 'Player');
    }, [
        gameData?.game,
        sessionData?.user?.id,
        handleGameEnd,
        router.query.strength,
    ]);

    /**
     * Checks if the game has ended after every move.
     */
    useEffect(() => {
        if (sessionData?.user?.id === undefined) return;
        if (gameData?.game?.gameEnd) return;

        handleCheckMove(sessionData.user.id);
    }, [
        moveHistory,
        sessionData?.user.id,
        handleCheckMove,
        gameId,
        gameData?.game?.gameEnd,
    ]);

    /**
     * Handles the AI's turn.
     */
    useEffect(() => {
        if (turn === '' || turn === 'Player') return;
        if (sessionData?.user?.id === undefined) return;
        if (moveHistoryRef.current.length === 9) return;

        const gameEnd = checkGameEnd(moveHistoryRef.current);
        if (gameEnd) return;

        if (isGameLoading) return;
        if (isMoveLoading) return;

        if (gameData?.game?.gameEnd) return;

        console.log('AI turn');

        const aiMove = getMove(board, aiStrength);
        handleMove(aiMove, 'AI');
    }, [
        aiStrength,
        board,
        gameData?.game?.gameEnd,
        handleMove,
        isGameLoading,
        isMoveLoading,
        sessionData?.user?.id,
        turn,
        winningText,
    ]);

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
                            TicTacToe AI
                        </span>
                    </h1>
                    <div className="flex flex-col items-center justify-center gap-3">
                        <p className="text-lg font-bold tracking-tight text-white sm:text-xl">
                            {gameId}, AI Strength: {aiStrength}
                        </p>
                        <p
                            className={`text-lg font-bold tracking-tight text-white sm:text-xl ${
                                !winningText ? 'invisible' : ''
                            }`}
                        >
                            {winningText}
                        </p>
                        <p
                            className={`text-white ${
                                turn === 'Player' ? '' : 'invisible'
                            }`}
                        >
                            Make Move
                        </p>
                        <div className="flex h-full max-w-xs flex-col content-center justify-center">
                            <div className="self-center">
                                <div className="max-w-xs text-3xl">
                                    <Board
                                        board={board}
                                        handleMove={handleMove}
                                    />
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
                        {winningText !== '' && (
                            <Rematch newGameSettings={aiStrength} />
                        )}
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
