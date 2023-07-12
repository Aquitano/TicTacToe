import { api } from '@/utils/api';
import { useSession } from 'next-auth/react';
import { memo } from 'react';
import { Button } from './button';

// eslint-disable-next-line react/display-name
const Rematch = memo(({ newGameSettings }: { newGameSettings: number }) => {
    const { data: sessionData } = useSession({
        required: true,
    });

    const createGame = api.game.createGame.useMutation();
    const handleCreateGame = async () => {
        if (sessionData?.user?.id === undefined)
            throw new Error('Session user id is undefined');

        // New AI game
        if (newGameSettings > 0) {
            const { game } = await createGame.mutateAsync({ type: 'AI' });
            const gameId = game.id;

            // Redirect to game page
            window.location.href = `/game/ai/${gameId}?strength=${newGameSettings}`;
            return;
        }

        // New PvP game
        const { game } = await createGame.mutateAsync({ type: 'PVP' });
        const gameId = game.id;

        // Redirect to game page
        window.location.href = `/game/${gameId}`;
    };

    return (
        <Button
            className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
            onClick={() => void handleCreateGame()}
        >
            Rematch
        </Button>
    );
});

export default Rematch;
