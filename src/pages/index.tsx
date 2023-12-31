import AuthShowcase from '@/components/authShowcase';
import { api } from '@/utils/api';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';

export default function Home() {
    const router = useRouter();
    const hello = api.example.hello.useQuery({ text: 'from the server!' });
    const { data: sessionData } = useSession();

    const redirect = useCallback(async () => {
        await router.prefetch('/game');
        await router.push('/game');
    }, [router]);

    useEffect(() => {
        if (sessionData) {
            void redirect();
        }
    }, [redirect, sessionData]);

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
                        <p className="text-2xl text-white">
                            {hello.data
                                ? hello.data.greeting
                                : 'Loading tRPC query...'}
                        </p>
                        <AuthShowcase />
                    </div>
                </div>
            </main>
        </>
    );
}
