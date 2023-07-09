import { api, type RouterOutputs } from '@/utils/api';
import { useSession } from 'next-auth/react';

type Game = RouterOutputs['game']['getOpenGames']['games'][number];

// TODO
const OpenGames = ({
    handleJoinGame,
    setOpen,
}: {
    handleJoinGame: (gameId: string) => Promise<void>;
    setOpen: (open: boolean) => void;
}) => {
    const { data: sessionData } = useSession();
    const { data: openGames } = api.game.getOpenGames.useQuery();

    const games = openGames?.games?.map((game: Game) => {
        if (
            !game?.players?.find(
                (player) => player.id === sessionData?.user?.id,
            )
        ) {
            return (
                <button
                    key={game.id}
                    className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
                    onClick={() => void handleJoinGame(game.id)}
                >
                    Join Game {game.id}
                </button>
            );
        }
    });

    return (
        <>
            <button
                className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
                onClick={() => setOpen(false)}
            >
                Hide Open Games
            </button>
            <div className="flex flex-col items-center gap-2">
                {/* <p className="text-center text-2xl text-white">
          {JSON.stringify(openGames)}
        </p> */}
                {games}
            </div>
        </>
    );
};

export default OpenGames;
