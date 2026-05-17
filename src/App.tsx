import './App.css';

import ChessGame from "./components/ChessGame.tsx";
import NavigationBar from "./components/navigationbar.tsx";
import OptionsPicker from "./components/optionspicker.tsx";
import {useState} from "react";

export type PlayerType =
    | "human"
    | "stockfish"
    | "darshfish";

function App() {
    const [whitePlayer, setWhitePlayer] = useState<PlayerType>("human");
    const [blackPlayer, setBlackPlayer] = useState<PlayerType>("stockfish");
    const [humanPlaysAs, setHumanPlaysAs] = useState<"white" | "black" | "random">("white");
    const [showEvalBar, setShowEvalBar] = useState(true);

    return (
        <>
            <div className="pt-5">
                <NavigationBar />
            </div>

            {/* Stack vertically on small screens, side-by-side on large */}
            <div className="flex flex-col items-center gap-6 px-4 pt-10 lg:flex-row lg:items-start lg:justify-center">

                <div className="w-full max-w-xs lg:w-auto lg:max-w-none">
                    <OptionsPicker
                        whitePlayer={whitePlayer}
                        blackPlayer={blackPlayer}
                        humanPlaysAs={humanPlaysAs}
                        showEvalBar={showEvalBar}
                        setShowEvalBar={setShowEvalBar}
                        setWhitePlayer={setWhitePlayer}
                        setBlackPlayer={setBlackPlayer}
                        setHumanPlaysAs={setHumanPlaysAs}
                    />
                </div>

                {/* Board: fluid up to 800px */}
                <div className="w-full max-w-[800px]">
                    <ChessGame
                        humanPlaysAs={humanPlaysAs}
                        whitePlayer={whitePlayer}
                        setWhitePlayer={setWhitePlayer}
                        blackPlayer={blackPlayer}
                        setBlackPlayer={setBlackPlayer}
                        showEvalBar={showEvalBar}
                    />
                </div>

            </div>
        </>
    );
}

export default App;