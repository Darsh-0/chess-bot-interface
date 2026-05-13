import { useRef, useState } from "react";
import {
    Chessboard,
    type PieceDropHandlerArgs,
    type SquareHandlerArgs,
} from "react-chessboard";
import {Chess, type PieceSymbol, type Square} from "chess.js";

function ChessGame() {
    const chessGameRef = useRef(new Chess());
    const chessGame = chessGameRef.current;

    const [chessPosition, setChessPosition] = useState(
        chessGame.fen()
    );

    const [moveFrom, setMoveFrom] = useState<string>("");
    const [optionSquares, setOptionSquares] = useState<
        Record<string, React.CSSProperties>
    >({});

    function makeRandomMove() {
        const possibleMoves = chessGame.moves();

        if (chessGame.isGameOver()) return;

        const randomMove =
            possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

        chessGame.move(randomMove);

        setChessPosition(chessGame.fen());
    }

    function getMoveOptions(square: Square) {
        const moves = chessGame.moves({
            square,
            verbose: true,
        });

        if (moves.length === 0) {
            setOptionSquares({});
            return false;
        }

        const newSquares: Record<string, React.CSSProperties> = {};

        for (const move of moves) {
            newSquares[move.to] = {
                background:
                    chessGame.get(move.to) &&
                    chessGame.get(move.to)?.color !==
                    chessGame.get(square)?.color
                        ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
                        : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
                borderRadius: "50%",
            };
        }

        newSquares[square] = {
            background: "rgba(255, 255, 0, 0.4)",
        };

        setOptionSquares(newSquares);

        return true;
    }

    function onSquareClick({ square, piece }: SquareHandlerArgs) {
        if (!moveFrom && piece) {
            const hasMoveOptions = getMoveOptions(square as Square);

            if (hasMoveOptions) {
                setMoveFrom(square);
            }

            return;
        }

        const moves = chessGame.moves({
            square: moveFrom as Square,
            verbose: true,
        });

        const foundMove = moves.find(
            (m) => m.from === moveFrom && m.to === square
        );

        if (!foundMove) {
            const hasMoveOptions = getMoveOptions(square as Square);

            setMoveFrom(hasMoveOptions ? square : "");
            return;
        }

        try {
            chessGame.move({
                from: moveFrom,
                to: square,
                promotion: "q",
            });
        } catch {
            const hasMoveOptions = getMoveOptions(square as Square);

            setMoveFrom(hasMoveOptions ? square : "");
            return;
        }

        setChessPosition(chessGame.fen());

        setMoveFrom("");
        setOptionSquares({});
    }

    function onPieceDrop({sourceSquare, targetSquare,}: PieceDropHandlerArgs) {


        if (!targetSquare) return false;

        try {
            chessGame.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: "q",
            });

            setChessPosition(chessGame.fen());

            if (chessGame.isGameOver()) {
                checkGameStatus();
            }

            setMoveFrom("");
            setOptionSquares({});

            return true;
        } catch {
            return false;
        }
    }

    function checkGameStatus() {
        if (chessGame.isCheckmate()) {
            console.log("Checkmate");
        } else if (chessGame.isStalemate()) {
            console.log("Stalemate");
        } else if (chessGame.isDraw()) {
            console.log("Draw");
        } else if (chessGame.isInsufficientMaterial()) {
            console.log("Insufficient material");
        }
    }

    function getTurn() {
        const isWhite = chessGame.turn() === "w";

        return (
            <div className="doodle flex items-center gap-2">
            <span
                style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: isWhite ? "#fff" : "#000",
                    border: "2px solid #3c3c3c",
                    boxShadow: "2px 2px 0px #3c3c3c",
                    display: "inline-block",
                }}
            />

                <p className="text-2xl">
                    {isWhite ? "White to move" : "Black to move"}
                </p>
            </div>
        );
    }

    function getMoveNumber() {
        const fen = chessGame.fen();
        const moveNumber = Number(fen.split(" ")[5]);
        return (
            <p className="text-2xl">Move Number {moveNumber}</p>
        )
    }

    const chessboardOptions = {
        onPieceDrop,
        onSquareClick,
        position: chessPosition,
        squareStyles: optionSquares,
        id: "click-or-drag-to-move",
    };

    return (
        <div className="doodle-border">
            <Chessboard options={chessboardOptions} />
            <div className="grid grid-cols-2">
                <div>
                    {getTurn()}
                </div>
                <div className="text-right">
                    {getMoveNumber()}
                </div>

            </div>

        </div>
    );
}

export default ChessGame;