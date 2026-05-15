import React, { useRef, useState, useEffect } from "react";
import {Chess, type PieceSymbol, type Square} from "chess.js";
import type { PieceDropHandlerArgs, SquareHandlerArgs } from "react-chessboard";
import SelectMove from "../api/BotMoveSelector.tsx";

type PieceType = "p" | "n" | "b" | "r" | "q";
type Color = "w" | "b";
type GameStatus =
    | {
    type:
        | "checkmate"
        | "stalemate"
        | "draw"
        | "insufficient_material";

    winner?: Color;
}
    | null;

type CapturedPieces = Record<Color, Record<PieceType, number>>;

const EMPTY_CAPTURES: CapturedPieces = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0 },
};

const PIECE_VALUES: Record<PieceType, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
const PIECE_ORDER: PieceType[] = ["p", "n", "b", "r", "q"];

function materialScore(captured: Record<PieceType, number>): number {
    return PIECE_ORDER.reduce((sum, p) => sum + captured[p] * PIECE_VALUES[p], 0);
}

export function useChessGame(whitePlayer: string, blackPlayer: string) {
    const chessRef = useRef(new Chess());

    const [position, setPosition] = useState(() => chessRef.current.fen());
    const [moveFrom, setMoveFrom] = useState<string>("");
    const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
    const [capturedPieces, setCapturedPieces] = useState<CapturedPieces>(EMPTY_CAPTURES);

    // Derived from position (a real state value), not from the ref directly
    const fenParts = position.split(" ");
    const turn = fenParts[1] as Color;
    const moveNumber = Number(fenParts[5]);
    const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square; } | null>(null);

    const [gameStatus, setGameStatus] = useState<GameStatus>(null);

    const [promotionBonus, setPromotionBonus] = useState({ w: 0, b: 0 });

    function isBotTurn() {
        const turn = chessRef.current.turn();

        if (turn === "w") return whitePlayer !== "human";
        if (turn === "b") return blackPlayer !== "human";
        return false;
    }

    useEffect(() => {
        const chess = chessRef.current;

        if (isBotTurn) {
            applyBotMove();
        }
    }, [position, whitePlayer, blackPlayer]);



    function getMoveOptions(square: Square): boolean {
        const chess = chessRef.current;
        const moves = chess.moves({ square, verbose: true });

        if (moves.length === 0) {
            setOptionSquares({});
            return false;
        }

        const highlights: Record<string, React.CSSProperties> = {
            [square]: { background: "rgba(255, 255, 0, 0.4)" },
        };

        for (const move of moves) {
            const isCapture =
                chess.get(move.to) && chess.get(move.to)?.color !== chess.get(square)?.color;

            highlights[move.to] = {
                background: isCapture
                    ? "radial-gradient(circle, rgba(0,0,0,.2) 85%, transparent 85%)"
                    : "radial-gradient(circle, rgba(0,0,0,.2) 25%, transparent 25%)",
                borderRadius: "50%",
            };
        }

        setOptionSquares(highlights);
        return true;
    }

    function recordCapture(capturedPiece: PieceType, capturedColor: Color) {
        setCapturedPieces((prev) => ({
            ...prev,
            [capturedColor]: {
                ...prev[capturedColor],
                [capturedPiece]: prev[capturedColor][capturedPiece] + 1,
            },
        }));
    }

    function makeMove(from: Square, to: Square) {
        const chess = chessRef.current;

        const moves = chess.moves({
            square: from,
            verbose: true,
        });

        const isPromotion = moves.some(
            m => m.from === from && m.to === to && m.promotion
        );

        if (isPromotion) {
            setPendingPromotion({ from, to });
            return;
        }

        applyMove(from, to);
    }

    function applyMove(from: Square, to: Square, promotion: PieceSymbol = "q") {
        const chess = chessRef.current;

        try {
            const move = chess.move({ from, to, promotion });

            if (move.captured) {
                const capturedColor: Color =
                    move.color === "w" ? "b" : "w";

                recordCapture(move.captured as PieceType, capturedColor);
            }

            if (move.promotion) {
                const bonus = PIECE_VALUES[move.promotion as PieceType] - PIECE_VALUES["p"];
                setPromotionBonus(prev => ({
                    ...prev,
                    [move.color]: prev[move.color as Color] + bonus,
                }));
            }

            setPosition(chess.fen());
            setGameStatus(checkGameStatus(chess));
            setMoveFrom("");
            setOptionSquares({});
            if (!checkHumanTurn()) {
                applyBotMove();
            }
        } catch {
            const hasMoveOptions = getMoveOptions(to);
            setMoveFrom(hasMoveOptions ? to : "");
        }
    }

    async function applyBotMove() {
        const chess = chessRef.current;
        const bot = chess.turn() === "w" ? whitePlayer : blackPlayer;

        const result = await SelectMove(chess.fen(), bot);

        if (!result?.bestmove) return;

        const move = result.bestmove;

        const from = move.slice(0, 2) as Square;
        const to = move.slice(2, 4) as Square;
        const promotion = move.slice(4, 5) || undefined;

        applyMove(from, to, promotion as PieceSymbol);
    }

    function checkGameStatus(chess: Chess): GameStatus {
        if (chess.isCheckmate()) {
            return {
                type: "checkmate",
                winner: chess.turn() === "w" ? "b" : "w",
            };
        }
        if (chess.isStalemate()) {
            return {
                type: "stalemate",
            };
        }
        if (chess.isDraw()) {
            return {
                type: "draw",
            };
        }
        if (chess.isInsufficientMaterial()) {
            return {
                type: "insufficient_material",
            };
        }
        return null;
    }

    function onSquareClick({ square, piece }: SquareHandlerArgs) {
        if (!checkHumanTurn()) return false
        if (!moveFrom && piece) {
            const hasMoveOptions = getMoveOptions(square as Square);
            if (hasMoveOptions) setMoveFrom(square);
            return;
        }
        makeMove(moveFrom as Square, square as Square);
    }

    function checkHumanTurn() {
        const chess = chessRef.current;
        if (whitePlayer != "human" && chess.turn() === "w" ||
            blackPlayer != "human" && chess.turn() === "b") {
            return false;
        }
        return true;
    }

    function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean {
        if (!checkHumanTurn()) return false
        if (!targetSquare) return false;
        try {
            makeMove(sourceSquare as Square, targetSquare as Square);
            return true;
        } catch {
            return false;
        }
    }

    function resetGame() {
        chessRef.current.reset();
        setPosition(chessRef.current.fen());
        setCapturedPieces(EMPTY_CAPTURES);
        setMoveFrom("");
        setOptionSquares({});
        setGameStatus(null);
        setPendingPromotion(null);
        setPromotionBonus({ w: 0, b: 0 });
    }

    const whiteScore = materialScore(capturedPieces.w) + promotionBonus.b;
    const blackScore = materialScore(capturedPieces.b) + promotionBonus.w;
    const materialDiff = whiteScore - blackScore; // positive = black is ahead
    const chessFEN = chessRef.current.fen();

    return {
        position,
        turn,
        moveNumber,
        gameStatus,
        optionSquares,
        capturedPieces,
        onSquareClick,
        onPieceDrop,
        pendingPromotion,
        applyMove,
        cancelPromotion: () => setPendingPromotion(null),
        resetGame,
        materialDiff,
        chessFEN,
    };
}