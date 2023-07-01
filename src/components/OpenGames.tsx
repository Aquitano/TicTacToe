import { api, type RouterOutputs } from "@/utils/api";

type Game = RouterOutputs["game"]["getOpenGames"]["games"][number];

// TODO
const OpenGames = ({
  handleJoinGame,
  setOpen,
}: {
  handleJoinGame: (gameId: string) => Promise<void>;
  setOpen: (open: boolean) => void;
}) => {
  const { data: openGames } = api.game.getOpenGames.useQuery();

  // const openGames: Game[] = [
  //   {
  //     game: {
  //       id: "some-game-id",
  //     },
  //   },
  //   {
  //     game: {
  //       id: "some-game-id2",
  //     },
  //   },
  // ];

  return (
    <>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={() => setOpen(false)}
      >
        Hide Open Games
      </button>
      <div className="flex flex-col items-center gap-2">
        <p className="text-center text-2xl text-white">
          {JSON.stringify(openGames)}
        </p>
        {openGames?.games?.map((game: Game) => (
          <button
            key={game.id}
            className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
            onClick={async () => await void handleJoinGame(game.id)}
          >
            Join Game {game.id}
          </button>
        ))}
      </div>
    </>
  );
};

export default OpenGames;
