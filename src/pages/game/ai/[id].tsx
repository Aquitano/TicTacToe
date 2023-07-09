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

const BOARD_SIZE = 9;

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

    useEffect(() => {
        setAiStrength(Number(router.query.strength));
        // Randomize who goes first
        setTurn(Math.random() > 0.5 ? 'AI' : 'Player');
    }, [router.query.strength]);

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

    const { mutate: makeMove, error: moveError } =
        api.game.makeAiMove.useMutation({
            onError: handleError,
        });

    useEffect(() => {
        // Reset the board
        setBoard(Array(BOARD_SIZE).fill(''));
        setMoveHistory([]);
    }, [moveError]);

    const handleGameEnd = useCallback(
        (winnerId: string, status: 'draw' | 'win') => {
            if (status === 'draw') {
                setWinningText("It's a draw!");
                setTurn('');
                toast({
                    title: 'Game over!',
                    description: `It's a draw!`,
                });
            } else {
                if (winnerId === sessionData?.user?.id) {
                    setWinningText('You won!');
                    setTurn('');
                    toast({
                        title: 'Game over!',
                        description: `You won!`,
                    });
                } else {
                    setWinningText('You lost!');
                    setTurn('');
                    toast({
                        title: 'Game over!',
                        description: `You lost!`,
                        variant: 'destructive',
                    });
                }
            }
        },
        [sessionData?.user?.id, toast],
    );
    const handleCheckMove = useCallback(
        (userId: string) => {
            const gameEnd = checkGameEnd(moveHistoryRef.current);
            console.log('gameEnd', gameEnd);
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
    const handleMove = useCallback(
        (position: number, curTurn: 'AI' | 'Player' = 'Player') => {
            if (sessionData?.user?.id === undefined)
                throw new Error('Session user id is undefined');

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
        [board, sessionData?.user.id],
    );

    useEffect(() => {
        if (sessionData?.user?.id === undefined) return;

        handleCheckMove(sessionData.user.id);
    }, [moveHistory, sessionData?.user.id, handleCheckMove]);

    useEffect(() => {
        if (turn === '' || turn === 'Player') return;
        if (sessionData?.user?.id === undefined) return;
        if (moveHistoryRef.current.length === 9) return;

        const gameEnd = checkGameEnd(moveHistoryRef.current);
        if (gameEnd) return;

        console.log('making ai move', turn);

        const aiMove = getMove(board, aiStrength);
        handleMove(aiMove, 'AI');
    }, [aiStrength, board, handleMove, sessionData?.user?.id, turn]);

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
                        {winningText && (
                            <p className="text-lg font-bold tracking-tight text-white sm:text-xl">
                                {winningText}
                            </p>
                        )}
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
