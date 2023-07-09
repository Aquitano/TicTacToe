import { memo } from 'react';

// eslint-disable-next-line react/display-name
const Board = memo(
    ({
        board,
        handleMove,
    }: {
        board: string[];
        handleMove: (position: number) => void;
    }) => (
        <div className="-mb-2 flex flex-wrap justify-center gap-2">
            {board.map((cell, i) => (
                <div
                    id={String(i)}
                    className="mb-4 flex h-20 w-20 items-center justify-center rounded-xl border-2 border-white bg-transparent bg-white bg-opacity-0 text-white duration-300 hover:bg-opacity-25"
                    key={'cell' + String(i)}
                    onClick={() => {
                        handleMove(i);
                    }}
                >
                    {cell}
                </div>
            ))}
        </div>
    ),
);

export default Board;
