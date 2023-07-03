import { Button } from "@/components/button";
import { type Session } from "next-auth";
import Image from "next/image";
import { memo, useEffect, useState } from "react";
import { Separator } from "./separator";

// eslint-disable-next-line react/display-name
const MoveHistory = memo(
  ({
    history,
    setBoard,
    sessionData,
    BOARD_SIZE,
  }: {
    history: {
      player: string;
      position: number;
      time: Date;
    }[];
    setBoard: (board: string[]) => void;
    sessionData: Session | null;
    BOARD_SIZE: number;
  }) => {
    const [currentMove, setCurrentMove] = useState<number>(0);

    function jumpTo(moveNumber: number) {
      // Create a new empty board
      const newBoard = Array(BOARD_SIZE).fill("") as string[];

      // Apply each move up to the selected move to the new board
      for (let i = 0; i <= moveNumber; i++) {
        const move = history[i];
        if (move === undefined) break;
        newBoard[move.position] =
          move.player === sessionData?.user?.id ? "X" : "O";
      }

      // Set the state of the board and the current move
      setBoard(newBoard);
      setCurrentMove(moveNumber);
    }

    useEffect(() => {
      setCurrentMove(history.length - 1);
    }, [history]);

    return (
      // center via flexbox
      <div className="move-history flex flex-col items-center">
        <h2 className="text-xl text-neutral-300">Move History</h2>
        <Separator className="mb-3" />
        <div>
          <Button
            onClick={() => jumpTo(currentMove - 1)}
            disabled={currentMove === -1}
            className="mr-2 bg-transparent"
          >
            <Image
              src="/arrow-left.svg"
              alt="arrow-left"
              width={50}
              height={50}
            />
          </Button>
          <Button
            onClick={() => jumpTo(currentMove + 1)}
            disabled={currentMove === history.length - 1}
            className="bg-transparent"
          >
            <Image
              src="/arrow-right.svg"
              alt="arrow-right"
              width={50}
              height={50}
            />
          </Button>
        </div>
      </div>
    );
  }
);

export default MoveHistory;
