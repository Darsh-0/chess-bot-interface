import { useEffect, useRef, useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EvalScore {
    type: "cp" | "mate";
    value: number; // always from White's POV (centipawns or mate-in-N, negative = Black winning)
}

interface EvalBarProps {
    fen: string;
    depth?: number;                   // search depth (default 15)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse side-to-move from FEN (second token) */
function sideToMove(fen: string): "w" | "b" {
    return (fen.split(" ")[1] ?? "w") as "w" | "b";
}

/** Extract score from a Stockfish "info … score cp/mate N …" line */
function parseScore(line: string): EvalScore | null {
    const m = line.match(/score (cp|mate) (-?\d+)/);
    if (!m) return null;
    return { type: m[1] as "cp" | "mate", value: parseInt(m[2], 10) };
}

/**
 * Convert a score (White's POV) → percentage of the bar that is WHITE.
 * 50 % = equal; 95 % = White completely winning; 5 % = Black completely winning.
 */
function scoreToWhitePct(score: EvalScore | null): number {
    if (!score) return 50;
    if (score.type === "mate") return score.value > 0 ? 96 : 4;
    // Sigmoid mapped to [5, 95]
    const pct = 50 + 50 * (2 / (1 + Math.exp(-0.004 * score.value)) - 1);
    return Math.max(4, Math.min(96, pct));
}

/** Human-readable label: "+1.3", "-0.8", "M4", "-M3" */
function formatScore(score: EvalScore | null): string {
    if (!score) return "0.0";
    if (score.type === "mate") {
        return score.value > 0 ? `M${score.value}` : `-M${Math.abs(score.value)}`;
    }
    const pawns = (score.value / 100).toFixed(1);
    return score.value >= 0 ? `+${pawns}` : pawns;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EvalBar({
                                    fen,
                                    depth = 15,
                                }: EvalBarProps) {
    const [score, setScore] = useState<EvalScore | null>(null);
    const [thinking, setThinking] = useState(false);
    const engineRef = useRef<Worker | null>(null);

    const runEngine = useCallback(
        (currentFen: string) => {
            // Kill previous worker if still running
            if (engineRef.current) {
                engineRef.current.terminate();
                engineRef.current = null;
            }

            setThinking(true);

            const worker = new Worker('/stockfish.js')
            engineRef.current = worker;
            const stm = sideToMove(currentFen);

            worker.onmessage = (e: MessageEvent<string>) => {
                const line = e.data;

                if (line === "uciok") {
                    worker.postMessage("isready");
                }

                if (line === "readyok") {
                    worker.postMessage(`position fen ${currentFen}`);
                    worker.postMessage(`go depth ${depth}`);
                }

                // Update incrementally on every info line so the bar animates as Stockfish thinks
                if (line.startsWith("info") && line.includes("score")) {
                    const raw = parseScore(line);
                    if (raw) {
                        // Stockfish score is from side-to-move perspective → convert to White's POV
                        const whitePov: EvalScore = {
                            type: raw.type,
                            value: stm === "b" ? -raw.value : raw.value,
                        };
                        setScore(whitePov);
                    }
                }

                if (line.startsWith("bestmove")) {
                    setThinking(false);
                    worker.terminate();
                    engineRef.current = null;
                }
            };

            worker.postMessage("uci");
        },
        [depth]
    );

    useEffect(() => {
        if (!fen) return;
        runEngine(fen);
        return () => {
            engineRef.current?.terminate();
            engineRef.current = null;
        };
    }, [fen, runEngine]);

    // ── Layout ──────────────────────────────────────────────────────────────────

    const whitePct = scoreToWhitePct(score);
    // If board is flipped, black is at the bottom → invert which end grows
    const bottomPct = 100 - whitePct;
    // The "top" slice is always the opponent of whoever is at the bottom
    const topPct = whitePct;

    const label = formatScore(score);
    const whiteWinning = (score?.value ?? 0) >= 0;
    // Label floats near the boundary, inside the larger section
    const labelOnTop = !whiteWinning

    return (
        <div style={styles.wrapper}>
            {/* ── Bar ── */}
            <div style={{ ...styles.track }}>
                {/* Black slice (top) */}
                <div
                    style={{
                        ...styles.slice,
                        background: "#1a1a1a",
                        height: `${topPct}%`,
                        transition: "height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                />

                {/* White slice (bottom) */}
                <div
                    style={{
                        ...styles.slice,
                        background: "#f0ede8",
                        height: `${bottomPct}%`,
                        transition: "height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                />

                {/* Eval label – floats near the midpoint inside the dominant side */}
                <div
                    style={{
                        ...styles.label,
                        top: labelOnTop ? `${topPct * 0.18}%` : undefined,
                        bottom: !labelOnTop ? `${bottomPct * 0.18}%` : undefined,
                        color: labelOnTop ? "#f0ede8" : "#1a1a1a",
                    }}
                >
                    {label}
                </div>

                {/* Thinking pulse on the dividing line */}
                {thinking && (
                    <div
                        style={{
                            ...styles.thinkingDot,
                            top: `${topPct}%`,
                        }}
                    />
                )}
            </div>
        </div>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
    wrapper: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        userSelect: "none",
    },
    track: {
        position: "relative",
        width: 30,
        height: 644,
        borderRadius: 4,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
        border: "1px solid rgba(255,255,255,0.06)",
    },
    slice: {
        width: "100%",
        flexShrink: 0,
    },
    label: {
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        // Slight text shadow so it's readable in both sections
        textShadow: "0 1px 3px rgba(0,0,0,0.4)",
        transition: "top 0.4s, bottom 0.4s, color 0.4s",
    },
    thinkingDot: {
        position: "absolute",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: "#81b64c",
        animation: "pulse 1s ease-in-out infinite",
        boxShadow: "0 0 6px #81b64c",
    },
};

/*
  Add this to your global CSS (e.g. index.css):

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    50%       { opacity: 0.4; transform: translate(-50%, -50%) scale(0.6); }
  }
*/
