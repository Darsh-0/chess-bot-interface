import type {PlayerType} from "../App.tsx";
import {useEffect} from "react";

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

    const showHumanSideSelect = (whitePlayer === "human") !== (blackPlayer === "human");
    useEffect(() => {
        if (!showHumanSideSelect) {
            setHumanPlaysAs("random");
        }
    }, [showHumanSideSelect, setHumanPlaysAs]);

    return (
        <fieldset className="doodle-border flex flex-col gap-4 pt-5">
            <legend>Options picker</legend>

            <div className="flex items-center gap-3">
                <p>player one is</p>

                <select
                    className="doodle-border"
                    value={whitePlayer}
                    onChange={(e) =>
                        setWhitePlayer(
                            e.target.value as PlayerType
                        )
                    }
                >
                    <option value="human">human</option>
                    <option value="stockfish">stockfish</option>
                    <option value="darshfish">darshfish</option>
                </select>
            </div>

            <div className="flex items-center gap-3">
                <p>player two is</p>

                <select
                    className="doodle-border"
                    value={blackPlayer}
                    onChange={(e) =>
                        setBlackPlayer(
                            e.target.value as PlayerType
                        )
                    }
                >
                    <option value="human">human</option>
                    <option value="stockfish">stockfish</option>
                    <option value="darshfish">darshfish</option>
                </select>
            </div>

            {showHumanSideSelect && (
                <div className="flex items-center gap-3 pt-2">
                    <p>human plays as</p>

                    <select
                        className="doodle-border"
                        value={humanPlaysAs}
                        onChange={(e) =>
                            setHumanPlaysAs(
                                e.target.value as
                                    | "white"
                                    | "black"
                                    | "random"
                            )
                        }
                    >
                        <option value="random">random</option>
                        <option value="white">white</option>
                        <option value="black">black</option>
                    </select>
                </div>
            )}
            <div className="flex items-center gap-3">
                <label htmlFor="showEvalBar">Show evaluation bar</label>
                <div className="doodle !bg-transparent">
                    <input
                        type="checkbox"
                        id="showEvalBar"
                        checked={showEvalBar}
                        onChange={(e) => setShowEvalBar(e.target.checked)}
                    />
                </div>
            </div>
        </fieldset>
    );
}

export default OptionsPicker;