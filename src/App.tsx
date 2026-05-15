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

    const [whitePlayer, setWhitePlayer] =
        useState<PlayerType>("human");

    const [blackPlayer, setBlackPlayer] =
        useState<PlayerType>("stockfish");

    const [humanPlaysAs, setHumanPlaysAs] =
        useState<"white" | "black" | "random">("white");

    const [showEvalBar, setShowEvalBar] = useState(true);

    return (
        <>
            <div className="pt-5">
                <NavigationBar />
            </div>

            <div className="relative flex items-center justify-center pt-10">
                <div className="absolute left-5">
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

                <div className="w-[800px]">
                    <ChessGame humanPlaysAs={humanPlaysAs} setHumanPlaysAs={setHumanPlaysAs} whitePlayer={whitePlayer} blackPlayer={blackPlayer} showEvalBar={showEvalBar}/>
                </div>
            </div>
        </>
    );
}

export default App;