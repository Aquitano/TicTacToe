import AuthShowcase from '@/components/authShowcase';
import { Separator } from '@/components/separator';
import { api } from '@/utils/api';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
const OpenGames = dynamic(() => import('@/components/openGames'), {
    loading: () => <p>Loading...</p>,
});

/**
 * The main game component.
 * @returns {JSX.Element} The rendered component.
 */
export default function Game() {
    const [newGameSettings, setNewGameSettings] = useState<number>(0);
    const router = useRouter();
    const { data: sessionData } = useSession({
        required: true,
    });
    const [showOpenGames, setShowOpenGames] = useState(false);
    const input = useRef<HTMLInputElement>(null);

    const joinGame = api.game.joinGame.useMutation();
    const createGame = api.game.createGame.useMutation();

    /**
     * Handles joining a game.
     * @param {string} gameId - The ID of the game.
     */
    const handleJoinGame = async (gameId: string) => {
        confirm('Join game ' + gameId);

        const { game } = await joinGame.mutateAsync({ gameId });

        if (game === null) throw new Error('Error joining game');

        // Redirect to game page
        await router.prefetch(`/game/${gameId}`);
        await router.push(`/game/${gameId}`);
    };

    /**
     * Handles creating a game.
     */
    const handleCreateGame = async () => {
        if (sessionData?.user?.id === undefined)
            throw new Error('Session user id is undefined');

        // New AI game
        if (newGameSettings > 0) {
            const { game } = await createGame.mutateAsync({ type: 'AI' });
            const gameId = game.id;

            // Redirect to game page
            await router.prefetch(
                `/game/ai/${gameId}?strength=${newGameSettings}`,
            );
            await router.push(`/game/ai/${gameId}?strength=${newGameSettings}`);
            return;
        }

        // New PvP game
        const { game } = await createGame.mutateAsync({ type: 'PVP' });
        const gameId = game.id;

        // Redirect to game page
        await router.prefetch(`/game/${gameId}`);
        await router.push(`/game/${gameId}`);
    };

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
                    <div className="flex flex-col items-center gap-2">
                        <input
                            className="rounded-full bg-white/10 px-4 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
                            placeholder="Enter Game ID"
                            ref={input}
                        />

                        <button
                            className="rounded-full bg-white/10 px-12 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
                            onClick={() =>
                                void handleJoinGame(input.current?.value ?? '')
                            }
                        >
                            Join Game
                        </button>
                        <div
                            className="mt-5 inline-flex rounded-md shadow-sm"
                            role="group"
                        >
                            <button
                                type="button"
                                className={`rounded-l-lg px-4 py-2 text-sm font-medium hover:bg-gray-100 hover:text-blue-700 focus:z-10 ${
                                    newGameSettings === 0
                                        ? 'bg-gray-100 text-blue-700'
                                        : 'bg-white/10 text-white'
                                }`}
                                onClick={() => setNewGameSettings(0)}
                            >
                                PvP
                            </button>
                            <button
                                type="button"
                                className={`border-l border-r px-4 py-2 text-sm font-medium hover:bg-gray-100 hover:text-blue-700 ${
                                    newGameSettings === 1
                                        ? 'bg-gray-100 text-blue-700'
                                        : 'bg-white/10 text-white'
                                }`}
                                onClick={() => setNewGameSettings(1)}
                            >
                                AI Level 1
                            </button>
                            <button
                                type="button"
                                className={`border-r px-4 py-2 text-sm font-medium hover:bg-gray-100 hover:text-blue-700 ${
                                    newGameSettings === 2
                                        ? 'bg-gray-100 text-blue-700'
                                        : 'bg-white/10 text-white'
                                }`}
                                onClick={() => setNewGameSettings(2)}
                            >
                                AI Level 2
                            </button>
                            <button
                                type="button"
                                className={`rounded-r-md px-4 py-2 text-sm font-medium hover:bg-gray-100 hover:text-blue-700 ${
                                    newGameSettings === 3
                                        ? 'bg-gray-100 text-blue-700'
                                        : 'bg-white/10 text-white'
                                }`}
                                onClick={() => setNewGameSettings(3)}
                            >
                                AI Level 3
                            </button>
                        </div>
                        <button
                            className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
                            // eslint-disable-next-line @typescript-eslint/no-misused-promises
                            onClick={handleCreateGame}
                        >
                            Create Game
                        </button>
                        <br />
                        {showOpenGames ? (
                            <OpenGames
                                handleJoinGame={handleJoinGame}
                                setOpen={setShowOpenGames}
                            />
                        ) : (
                            <button
                                className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
                                onClick={() => setShowOpenGames(true)}
                            >
                                Show Open Games
                            </button>
                        )}
                        <Separator />
                        <AuthShowcase />
                    </div>
                </div>
            </main>
        </>
    );
}
