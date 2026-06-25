let dotnetExports: any = null;
let dotnetLoading: Promise<any> | null = null;

function loadDotnet(): Promise<any> {
    if (dotnetExports) return Promise.resolve(dotnetExports);
    if (dotnetLoading) return dotnetLoading;

    dotnetLoading = (async () => {
        // dotnet.js is now inside src/ so Vite can import it as a module
        const { dotnet } = await import('./AppBundle/_framework/dotnet.js');

        const { getAssemblyExports, getConfig } = await dotnet
            .withConfig({
                // Point to where your _framework files live at runtime
                // Vite will serve src/ contents, so this path is relative to site root
                configSrc: '/src/api/AppBundle/_framework/dotnet.boot.js',
            })
            .create();

        const config = getConfig();
        console.log("Config:", config);
        console.log("Assembly:", config.mainAssemblyName);

        const exports = await getAssemblyExports(config.mainAssemblyName);
        console.log("Exports:", exports);

        dotnetExports = exports;
        return exports;
    })();

    return dotnetLoading;
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