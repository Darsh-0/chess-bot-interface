import StockfishWorker from "../api/stockfish-18-lite.js?worker";

function SelectMove(fen: string, bot: string): Promise<{ bestmove: string }> {
    return new Promise((resolve) => {
        const engine = new StockfishWorker;

        if (bot === "stockfish") {

            engine.onmessage = (event) => {
                const line = event.data;

                if (line === "uciok") {
                    engine.postMessage("isready");
                }

                if (line === "readyok") {
                    engine.postMessage("position fen " + fen);
                    engine.postMessage("go depth 12");
                }

                if (line.startsWith("bestmove")) {
                    const bestMove = {bestmove: line.split(" ")[1]};
                    resolve(bestMove);
                    engine.terminate();
                }
            };

            engine.postMessage("uci");
        }
    });
}



export default SelectMove;
