import {
    Chessboard,
    defaultPieces,
    type PieceDropHandlerArgs,
    type PieceRenderObject,
} from 'react-chessboard';
import { Chess, type PieceSymbol, type Square } from 'chess.js';
import { useCallback, useRef, useState } from 'react';

type PromotionMove = { sourceSquare: Square; targetSquare: Square };

function getStatus(game: Chess): string {
    const turn = game.turn() === 'w' ? 'White' : 'Black';
    if (game.isCheckmate()) return `Checkmate — ${turn === 'White' ? 'Black' : 'White'} wins!`;
    if (game.isStalemate()) return 'Stalemate — draw';
    if (game.isThreefoldRepetition()) return 'Draw by repetition';
    if (game.isInsufficientMaterial()) return 'Draw — insufficient material';
    if (game.isDraw()) return 'Draw';
    if (game.isCheck()) return `${turn} is in check`;
    return `${turn}'s turn`;
}

function CustomChessboard() {
    const chessGameRef = useRef(new Chess());
    const chessGame = chessGameRef.current;

    const [position, setPosition] = useState(chessGame.fen());
    const [promotionMove, setPromotionMove] = useState<PromotionMove | null>(null);
    const [status, setStatus] = useState(() => getStatus(chessGame));
    const [isGameOver, setIsGameOver] = useState(false);

    const commitPosition = useCallback(() => {
        setPosition(chessGame.fen());
        setStatus(getStatus(chessGame));
        setIsGameOver(chessGame.isGameOver());
    }, [chessGame]);

    /** Use verbose moves so we can reliably detect promotions for both colours. */
    function isPromotionMove(from: Square, to: Square): boolean {
        return chessGame
            .moves({ verbose: true })
            .some(m => m.from === from && m.to === to && m.promotion !== undefined);
    }

    function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean {
        if (!targetSquare || isGameOver) return false;

        const from = sourceSquare as Square;
        const to = targetSquare as Square;

        if (isPromotionMove(from, to)) {
            setPromotionMove({ sourceSquare: from, targetSquare: to });
            // Return true so the piece snaps back while the dialog is shown.
            // The move isn't committed yet.
            return true;
        }

        try {
            chessGame.move({ from, to });
            commitPosition();
            return true;
        } catch {
            return false;
        }
    }

    function onPromotionPieceSelect(piece: PieceSymbol) {
        if (!promotionMove) return;
        try {
            chessGame.move({
                from: promotionMove.sourceSquare,
                to: promotionMove.targetSquare,
                promotion: piece,
            });
            commitPosition();
        } catch {
            // Move was somehow invalid — silently cancel
        }
        setPromotionMove(null);
    }

    function cancelPromotion() {
        // Re-apply the current FEN so the dragged piece snaps back correctly
        setPosition(chessGame.fen());
        setPromotionMove(null);
    }

    function resetGame() {
        chessGame.reset();
        setPromotionMove(null);
        commitPosition();
    }

    // --- Promotion dialog positioning ---
    // Use percentage-based left so it scales with any board size.
    // Column 'a' = 0, 'h' = 7; each square is 12.5% of board width.
    const promoCol = promotionMove ? 'abcdefgh'.indexOf(promotionMove.targetSquare[0]) : 0;
    const promoRank = promotionMove ? parseInt(promotionMove.targetSquare[1], 10) : 0;
    const isWhitePromo = promoRank === 8; // White promotes on 8, black on 1

    // The pieces shown in the dialog should match the side that is promoting
    const promoColor = chessGame.turn() === 'w' ? 'w' : 'b';

    // Status pill styling
    const statusStyle: React.CSSProperties = (() => {
        if (chessGame.isCheckmate()) return { background: '#fee2e2', color: '#b91c1c' };
        if (chessGame.isCheck())     return { background: '#fef9c3', color: '#a16207' };
        if (chessGame.isGameOver())  return { background: '#f3f4f6', color: '#374151' };
        return chessGame.turn() === 'w'
            ? { background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0' }
            : { background: '#1e293b', color: '#f8fafc' };
    })();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.5rem',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #e0e7ef 0%, #f8fafc 100%)',
        }}>

            {/* Status pill */}
            <div style={{
                padding: '0.4rem 1rem',
                borderRadius: '99px',
                fontSize: '0.875rem',
                fontWeight: 600,
                transition: 'all 0.2s',
                ...statusStyle,
            }}>
                {status}
            </div>

            {/* Board wrapper */}
            <div style={{ position: 'relative', width: '100%', maxWidth: 500 }}>

                {/* Promotion overlay */}
                {promotionMove && (
                    <>
                        {/* Dimmed backdrop — click to cancel */}
                        <div
                            onClick={cancelPromotion}
                            onContextMenu={e => { e.preventDefault(); cancelPromotion(); }}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(0,0,0,0.45)',
                                zIndex: 1000,
                                borderRadius: 4,
                                cursor: 'pointer',
                            }}
                        />

                        {/* Piece picker */}
                        <div style={{
                            position: 'absolute',
                            [isWhitePromo ? 'top' : 'bottom']: 0,
                            left: `${promoCol * 12.5}%`,
                            width: '12.5%',
                            zIndex: 1001,
                            display: 'flex',
                            flexDirection: isWhitePromo ? 'column' : 'column-reverse',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
                            borderRadius: 6,
                            overflow: 'hidden',
                        }}>
                            {(['q', 'r', 'n', 'b'] as PieceSymbol[]).map(piece => (
                                <button
                                    key={piece}
                                    title={piece === 'q' ? 'Queen' : piece === 'r' ? 'Rook' : piece === 'n' ? 'Knight' : 'Bishop'}
                                    onClick={() => onPromotionPieceSelect(piece)}
                                    onContextMenu={e => e.preventDefault()}
                                    style={{
                                        width: '100%',
                                        aspectRatio: '1',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 0,
                                        border: 'none',
                                        cursor: 'pointer',
                                        background: 'white',
                                        transition: 'background 0.12s',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#e0e7ef')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                                >
                                    {defaultPieces[
                                        `${promoColor}${piece.toUpperCase()}` as keyof PieceRenderObject
                                        ]?.()}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                <Chessboard options={{ position, onPieceDrop, id: 'custom-board' }} />
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                    onClick={resetGame}
                    style={{
                        padding: '0.5rem 1.25rem',
                        borderRadius: '0.375rem',
                        border: '1.5px solid #cbd5e1',
                        background: 'white',
                        color: '#1e293b',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        transition: 'all 0.15s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                >
                    New Game
                </button>
            </div>
        </div>
    );
}

export default CustomChessboard;