import type { PlayerType } from "../App.tsx";
import { useEffect } from "react";

type Props = {
    whitePlayer: PlayerType;
    blackPlayer: PlayerType;
    humanPlaysAs: "white" | "black" | "random";
    showEvalBar: boolean;
    setWhitePlayer: (v: PlayerType) => void;
    setBlackPlayer: (v: PlayerType) => void;
    setHumanPlaysAs: (v: "white" | "black" | "random") => void;
    setShowEvalBar: (v: boolean) => void;
};


function PlayerSelect({
                          label,
                          color,
                          value,
                          onChange,
                      }: {
    label: string;
    color: "white" | "black";
    value: PlayerType;
    onChange: (v: PlayerType) => void;
}) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                {label}
            </span>
            <div className="relative">
                {/* Chess square swatch */}
                <div
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-sm border border-black/20 ${
                        color === "white" ? "bg-white border-gray-300" : "bg-black border-black"
                    }`}
                />
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value as PlayerType)}
                    className="w-full appearance-none doodle-border bg-white pl-8 sm:pl-9 pr-6 sm:pr-8 py-2 text-sm font-medium text-gray-800 cursor-pointer
                               focus:outline-none hover:bg-gray-50 transition-colors duration-100 truncate"
                >
                    {["human", "stockfish", "darshfish v1 (Random)", "darshfish v2 (Basic Search)"].map((opt) => (
                        <option key={opt} value={opt}>
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </option>
                    ))}
                </select>
                {/* Custom chevron */}
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                    ▾
                </div>
            </div>
        </div>
    );
}

function OptionsPicker({
                           whitePlayer,
                           blackPlayer,
                           humanPlaysAs,
                           showEvalBar,
                           setWhitePlayer,
                           setBlackPlayer,
                           setHumanPlaysAs,
                           setShowEvalBar,
                       }: Props) {
    const showHumanSideSelect =
        (whitePlayer === "human") !== (blackPlayer === "human");

    useEffect(() => {
        if (!showHumanSideSelect) setHumanPlaysAs("random");
    }, [showHumanSideSelect, setHumanPlaysAs]);

    useEffect(() => {
        if (humanPlaysAs === "white" || humanPlaysAs === "black") {
            const temp = whitePlayer;
            setWhitePlayer(blackPlayer);
            setBlackPlayer(temp);
        }
    }, [humanPlaysAs]);

    return (
        <div className="doodle-border bg-white rounded-xl p-5 flex flex-col gap-5 m-px min-w-64">
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-dashed border-gray-200 pb-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-600">
                    Game Options
                </h2>
            </div>

            {/* Players row */}
            <div className="grid grid-cols-1 gap-3">
                <PlayerSelect
                    label="White"
                    color="white"
                    value={whitePlayer}
                    onChange={setWhitePlayer}
                />
                <PlayerSelect
                    label="Black"
                    color="black"
                    value={blackPlayer}
                    onChange={setBlackPlayer}
                />
            </div>

            <p className="w-64">Initial bot loading may take a few seconds</p>

            {/* Human side picker — slides in when relevant */}
            {showHumanSideSelect && (
                <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                        Human plays as
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {(["white", "black", "random"] as const).map((opt) => (
                            <button
                                key={opt}
                                onClick={() => setHumanPlaysAs(opt)}
                                className={`py-2 text-xs font-semibold rounded-lg border-2 border-black transition-all duration-100
                                    ${
                                    humanPlaysAs === opt
                                        ? "bg-black text-white shadow-none translate-x-[2px] translate-y-[2px]"
                                        : "bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                                }`}
                            >
                                {opt === "white" ? "White" : opt === "black" ? "Black" : "Random"}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Divider */}
            <div className="border-t border-dashed border-gray-200" />

            {/* Eval bar toggle */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700">
                        Evaluation Bar
                    </span>
                    <span className="text-xs text-gray-400">
                        Show engine score
                    </span>
                </div>
                <button
                    role="switch"
                    aria-checked={showEvalBar}
                    onClick={() => setShowEvalBar(!showEvalBar)}
                    className={`relative w-11 h-6 rounded-full border-2 border-black transition-colors duration-200
                        ${showEvalBar ? "bg-black" : "bg-gray-200"}`}
                >
                    <span
                        className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full border-2 border-black bg-white transition-transform duration-200
                            ${showEvalBar ? "translate-x-[18px]" : "translate-x-0"}`}
                    />
                </button>
            </div>
        </div>
    );
}

export default OptionsPicker;