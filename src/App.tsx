import './App.css';

import CustomChessboard from "./components/chessboard.tsx";
import NavigationBar from "./components/navigationbar.tsx";
import OptionsPicker from "./components/optionspicker.tsx";

function App() {
    return (
        <>
            <div className="pt-5">
                <NavigationBar />
            </div>

            <div className="relative flex items-center justify-center pt-10">
                <div className="absolute left-5">
                    <OptionsPicker />
                </div>

                <div className="doodle">
                    <CustomChessboard />
                </div>
            </div>
        </>
    );
}

export default App;