import { api } from '@/utils/api';
import { useSession } from 'next-auth/react';
import { memo } from 'react';

// eslint-disable-next-line react/display-name
const AuthShowcase = memo(() => {
    const { data: sessionData } = useSession();

    const { data: secretMessage } = api.example.getSecretMessage.useQuery(
        undefined,
        {
            enabled: sessionData?.user !== undefined,
            queryKey: ['example.getSecretMessage', undefined],
        },
    );

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-center text-2xl text-white">
                {sessionData && (
                    <span>Logged in as {sessionData.user?.name}</span>
                )}
                {secretMessage && <span> - {secretMessage}</span>}
            </p>
            <button
                className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
                onClick={
                    sessionData
                        ? () => {
                              void import('next-auth/react').then(
                                  ({ signOut }) => signOut(),
                              );
                          }
                        : () => {
                              void import('next-auth/react').then(
                                  ({ signIn }) => signIn(),
                              );
                          }
                }
            >
                {sessionData ? 'Sign out' : 'Sign in'}
            </button>
        </div>
    );
});

export default AuthShowcase;
