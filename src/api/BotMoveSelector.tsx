let dotnetExports: any = null;
let dotnetLoading: Promise<any> | null = null;

async function loadDotnet() {
    while (!(globalThis as any).__dotnet__) {
        await new Promise(r => setTimeout(r, 50));
    }
    const dotnet = (globalThis as any).__dotnet__;
    const { getAssemblyExports, getConfig } = await dotnet
        .withConfig({
            configSrc: '/AppBundle/_framework/dotnet.boot.js',
            scriptDirectory: '/AppBundle/_framework/'
        })
        .withApplicationArguments()
        .create();
    return await getAssemblyExports(getConfig().mainAssemblyName);
}

function SelectMove(fen: string, bot: string): Promise<{ bestmove: string }> {
    return new Promise((resolve, reject) => {

        if (bot === "stockfish") {
            const engine = new Worker('/stockfish.js');

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
                    resolve({ bestmove: line.split(" ")[1] });
                    engine.terminate();
                }
            };

            engine.postMessage("uci");

        } else if (bot === "darshfish v1 (Random)") {
            loadDotnet()
                .then(async exports => {
                    const move = await exports.chessEngine.ChessEngine.GetRandomMove(fen);
                    resolve({ bestmove: move });
                })
                .catch(reject);
        }
    });
}

export default SelectMove;