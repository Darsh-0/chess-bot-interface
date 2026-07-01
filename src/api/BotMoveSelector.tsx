let dotnetExports: any = null;
let dotnetLoading: Promise<any> | null = null;

let dotnetExportsV2: any = null;
let dotnetLoadingV2: Promise<any> | null = null;

function loadDotnet(): Promise<any> {
    if (dotnetExports) return Promise.resolve(dotnetExports);
    if (dotnetLoading) return dotnetLoading;

    dotnetLoading = (async () => {
        while (!(globalThis as any).__dotnet__) {
            await new Promise(r => setTimeout(r, 50));
        }

        const dotnet = (globalThis as any).__dotnet__;

        const { getAssemblyExports, getConfig } = await dotnet
            .withConfig({
                configSrc: '/_framework/dotnet.boot.js',
            })
            .create();

        const config = getConfig();
        const exports = await getAssemblyExports(config.mainAssemblyName);
        dotnetExports = exports;
        return exports;
    })();

    return dotnetLoading;
}

function loadDotnetV2(): Promise<any> {
    if (dotnetExportsV2) return Promise.resolve(dotnetExportsV2);
    if (dotnetLoadingV2) return dotnetLoadingV2;

    dotnetLoadingV2 = (async () => {
        console.log(`Loading dotnet`);
        while (!(globalThis as any).__dotnet_v2__) {
            await new Promise(r => setTimeout(r, 50));
        }
        console.log(`Loading dotnet2`);

        const dotnet = (globalThis as any).__dotnet_v2__;

        const { getAssemblyExports, getConfig } = await dotnet
            .withConfig({
                configSrc: '/_framework-v2/dotnet.boot.js',
            })
            .create();

        const config = getConfig();
        const exports = await getAssemblyExports(config.mainAssemblyName);
        dotnetExportsV2 = exports;
        return exports;
    })();

    return dotnetLoadingV2;
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

        } else if (bot === "darshfish v2 (Basic Search)") {
            console.log("hi");
            loadDotnetV2()
                .then(async exports => {
                    console.log("bro");
                    const move = await exports.chessEngine.ChessEngine.GetBestMove(fen);
                    console.log(move);
                    resolve({ bestmove: move });
                })
                .catch(reject);
            console.log("bye");
        }
    });
}

export default SelectMove;