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

export default function Home() {
  const router = useRouter();
  const { data: sessionData } = useSession({
    required: true,
  });
  const [showOpenGames, setShowOpenGames] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const joinGame = api.game.joinGame.useMutation();
  const handleJoinGame = async (gameId: string) => {
    // TODO: join game
    confirm('Join game ' + gameId);

    const { game } = await joinGame.mutateAsync({ gameId });

    if (game === null) throw new Error('Error joining game');

    // Redirect to game page
    await router.prefetch(`/game/${gameId}`);
    await router.push(`/game/${gameId}`);
  };

  const createGame = api.game.createGame.useMutation();
  const handleCreateGame = async () => {
    if (sessionData?.user?.id === undefined)
      throw new Error('Session user id is undefined');

    const { game } = await createGame.mutateAsync();
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
            <span className="text-[hsl(280,100%,70%)]">TicTacToe</span>
          </h1>
          <div className="flex flex-col items-center gap-2">
            <input
              className="rounded-full bg-white/10 px-4 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
              placeholder="Enter Game ID"
              ref={input}
            />

            <button
              className="rounded-full bg-white/10 px-12 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
              onClick={() => void handleJoinGame(input.current?.value ?? '')}
            >
              Join Game
            </button>
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
