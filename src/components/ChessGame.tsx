import { Chessboard } from "react-chessboard";
import { useChessGame } from "./UseChessGame.tsx";
import { useRef, useEffect, useState } from "react";
import type {PieceSymbol, Square } from "chess.js";
import EvalBar from "./EvalBar.tsx";
import type {PlayerType} from "../App.tsx";
const pieces = import.meta.glob("../assets/pieces/*.svg", {
    eager: true,
    import: "default",
}) as Record<string, string>;

function getPiece(name: string) {
    const entry = Object.entries(pieces).find(([path]) =>
        path.includes(name)
    );

    return entry ? entry[1] : "";
}

type Color = "w" | "b";
type PieceType = "p" | "n" | "b" | "r" | "q";

const PROMOTION_PIECES: PieceType[] = ["q", "r", "b", "n"];

const pieceImages = {
    w: {
        p: getPiece("Chess_plt45.svg"),
        n: getPiece("Chess_nlt45.svg"),
        b: getPiece("Chess_blt45.svg"),
        r: getPiece("Chess_rlt45.svg"),
        q: getPiece("Chess_qlt45.svg"),
        k: getPiece("Chess_klt45.svg"),
    },
    b: {
        p: getPiece("Chess_pdt45.svg"),
        n: getPiece("Chess_ndt45.svg"),
        b: getPiece("Chess_bdt45.svg"),
        r: getPiece("Chess_rdt45.svg"),
        q: getPiece("Chess_qdt45.svg"),
        k: getPiece("Chess_kdt45.svg"),
    },
};

const PIECE_ORDER: PieceType[] = ["p", "n", "b", "r", "q"];

function CapturedRow({ capturedColor, captured, advantage }: {
    capturedColor: Color;
    captured: Record<PieceType, number>;
    advantage: number;
}) {
    return (
        <div className="flex flex-col gap-1">
            {PIECE_ORDER.map((p) =>
                    captured[p] > 0 && (
                        <div key={p} className="flex items-center">
                            {Array.from({ length: captured[p] }).map((_, i) => (
                                <img
                                    key={i}
                                    src={pieceImages[capturedColor][p]}
                                    alt={p}
                                    style={{ width: 32, height: 32, marginLeft: i === 0 ? 0 : -10 }}
                                />
                            ))}
                        </div>
                    )
            )}
            {advantage > 0 && (
                <span className="text-sm font-bold">+{advantage}</span>
            )}
        </div>
    );
}

function CapturedPieces({
                            capturedPieces,
                            materialDiff,
                            boardOrientation,
                        }: {
    capturedPieces: Record<Color, Record<PieceType, number>>;
    materialDiff: number;
    boardOrientation: "white" | "black";
}) {
    const whiteRow = (
        <CapturedRow
            capturedColor="w"
            captured={capturedPieces.w}
            advantage={materialDiff > 0 ? materialDiff : 0}
        />
    );
    const blackRow = (
        <CapturedRow
            capturedColor="b"
            captured={capturedPieces.b}
            advantage={materialDiff < 0 ? -materialDiff : 0}
        />
    );

    // The bottom player's opponent lost pieces sit at the bottom (what they captured)
    // white at bottom → black's lost pieces at bottom, white's at top
    // black at bottom → white's lost pieces at bottom, black's at top
    const [top, bottom] = boardOrientation === "white"
        ? [whiteRow, blackRow]
        : [blackRow, whiteRow];

    return (
        <div className="flex flex-col justify-between h-full gap-4">
            <div>{top}</div>
            <div>{bottom}</div>
        </div>
    );
}

function TurnIndicator({ turn }: { turn: Color }) {
    const isWhite = turn === "w";
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
            <p className="text-2xl">{isWhite ? "White to move" : "Black to move"}</p>
        </div>
    );
}

function MoveCounter({ moveNumber }: { moveNumber: number }) {
    return <p className="text-2xl">Move Number {moveNumber}</p>;
}

function PromotionPicker({ color, targetSquare, boardOrientation, onSelect, onCancel }: {
    color: Color;
    targetSquare: string;
    boardOrientation: "white" | "black";
    onSelect: (piece: PieceSymbol) => void;
    onCancel: () => void;
}) {
    const fileIndex = targetSquare.charCodeAt(0) - "a".charCodeAt(0); // a=0, h=7
    const rank = parseInt(targetSquare[1]);

    // Flip file position if board is flipped
    const colIndex = boardOrientation === "white" ? fileIndex : 7 - fileIndex;
    const left = `${colIndex * 12.5}%`;
    const squareSize = 12.5; // percent

    // White promotes on rank 8 (top), black on rank 1 (bottom)
    const fromTop = boardOrientation === "white" ? rank === 8 : rank === 1;
    const top = fromTop ? "0%" : `${squareSize * 3}%`;
    const pieces = fromTop ? PROMOTION_PIECES : [...PROMOTION_PIECES].reverse();

    return (
        <div className="absolute inset-0 z-10" onClick={onCancel}>
            <div
                className="absolute flex flex-col"
                style={{ left, top, width: "12.5%" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Cancel button on top if pieces go up (black promoting on white-oriented board) */}
                {!fromTop && (
                    <button
                        onClick={onCancel}
                        style={{ background: "#1a1a1a", width: "100%", aspectRatio: "1" }}
                        className="flex items-center justify-center"
                    >
                        <span style={{ color: "#fff", fontSize: 18 }}>✕</span>
                    </button>
                )}

                {pieces.map((p) => (
                    <button
                        key={p}
                        onClick={() => onSelect(p)}
                        style={{
                            background: "#fff",
                            width: "100%",
                            aspectRatio: "1",
                            border: "1px solid #ccc",
                        }}
                        className="flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                        <img
                            src={pieceImages[color][p]}
                            alt={p}
                            style={{ width: "80%", height: "80%" }}
                        />
                    </button>
                ))}

                {/* Cancel button on bottom if pieces go down (white promoting) */}
                {fromTop && (
                    <button
                        onClick={onCancel}
                        style={{ background: "#1a1a1a", width: "100%", aspectRatio: "1" }}
                        className="flex items-center justify-center"
                    >
                        <span style={{ color: "#fff", fontSize: 18 }}>✕</span>
                    </button>
                )}
            </div>
        </div>
    );
}

function PromotionOverlay({ pendingPromotion, turn, boardOrientation, applyMove, cancelPromotion }: {
    pendingPromotion: { from: Square; to: Square } | null;
    turn: Color;
    boardOrientation: "white" | "black";
    applyMove: (from: Square, to: Square, piece: PieceSymbol) => void;
    cancelPromotion: () => void;
}) {
    if (!pendingPromotion) return null;
    return (
        <PromotionPicker
            color={turn}
            targetSquare={pendingPromotion.to}
            boardOrientation={boardOrientation}
            onSelect={(piece) => {
                applyMove(pendingPromotion.from, pendingPromotion.to, piece);
                cancelPromotion();
            }}
            onCancel={cancelPromotion}
        />
    );
}

function GameOverOverlay({ gameStatus, onReset }: {
    gameStatus: { type: string; winner?: string } | null;
    onReset: () => void;
}) {
    if (!gameStatus) return null;
    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
            <div className="doodle-border p-6 flex flex-col gap-4 text-center">
                <p className="text-xl font-bold">Game Over</p>
                <p>
                    {gameStatus.type === "checkmate" &&
                        `${gameStatus.winner === "w" ? "White" : "Black"} wins by checkmate`}
                    {gameStatus.type === "stalemate" && "Draw by stalemate"}
                    {gameStatus.type === "draw" && "Draw"}
                    {gameStatus.type === "insufficient_material" && "Draw by insufficient material"}
                </p>
                <button onClick={onReset} className="doodle-border">New Game</button>
            </div>
        </div>
    );
}

function ChessGame({
                       humanPlaysAs,
                       whitePlayer,
                       setWhitePlayer,
                       blackPlayer,
                       setBlackPlayer,
                       showEvalBar,
                   }: {
    humanPlaysAs: "white" | "black" | "random";
    whitePlayer: PlayerType;
    setWhitePlayer: React.Dispatch<React.SetStateAction<PlayerType>>;
    blackPlayer: PlayerType;
    setBlackPlayer: React.Dispatch<React.SetStateAction<PlayerType>>;
    showEvalBar: boolean;
}) {

    const {
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
        cancelPromotion,
        resetGame,
        materialDiff,
        chessFEN
    } = useChessGame(whitePlayer, blackPlayer);

    const boardRef = useRef<HTMLDivElement>(null);
    const [boardHeight, setBoardHeight] = useState(644);

    useEffect(() => {
        if (!boardRef.current) return;
        const ro = new ResizeObserver(entries => {
            setBoardHeight(entries[0].contentRect.height);
        });
        ro.observe(boardRef.current);
        return () => ro.disconnect();
    }, []);

    const boardOrientation: "white" | "black" =
        whitePlayer === "human"
            ? "white"
            : blackPlayer === "human"
                ? "black"
                : "white";

    function handleReset() {
        resetGame();

        if (humanPlaysAs === "random" && (Math.random() < 0.5)) {
            const oldWhitePlayer: PlayerType = whitePlayer;

            setWhitePlayer(blackPlayer);
            setBlackPlayer(oldWhitePlayer);
        }
    }

    return (
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-8">
            <div />

            {/* Center column: EvalBar + Board side by side */}
            <div className="flex items-start gap-2">  {/* ← back to items-start */}
                <div className={`doodle ${showEvalBar ? "" : "invisible"}`}>
                    <EvalBar fen={chessFEN} depth={15} height={boardHeight} />  {/* ← pass height */}
                </div>
                <div ref={boardRef} className="doodle-border doodle relative w-fit rounded-lg">
                    <Chessboard
                        options={{
                            position,
                            squareStyles: optionSquares,
                            onSquareClick,
                            onPieceDrop,
                            boardOrientation,
                            id: "click-or-drag-to-move",
                        }}
                    />

                    <PromotionOverlay
                        pendingPromotion={pendingPromotion}
                        turn={turn}
                        boardOrientation={boardOrientation}
                        applyMove={applyMove}
                        cancelPromotion={cancelPromotion}
                    />

                    <GameOverOverlay
                        gameStatus={gameStatus}
                        onReset={handleReset}
                    />

                    <div className="grid grid-cols-1">
                        <div className="grid grid-cols-2">
                            <TurnIndicator turn={turn} />
                            <div className="text-right">
                                <MoveCounter moveNumber={moveNumber} />
                            </div>
                        </div>

                        <div className="w-full flex justify-center">
                            <button
                                onClick={handleReset}
                                className="hover:cursor-pointer active:!bg-gray-300 rounded-2xl"
                            >
                                New Game
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right column: Captured pieces */}
            <div className="self-stretch w-32">
                <CapturedPieces
                    capturedPieces={capturedPieces}
                    boardOrientation={boardOrientation}
                    materialDiff={materialDiff}
                />
            </div>
        </div>
    );
}

export default ChessGame;