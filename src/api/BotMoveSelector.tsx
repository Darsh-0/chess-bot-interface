let dotnetExports: any = null;
let dotnetLoading: Promise<any> | null = null;

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

let dotnetWorkerV2: Worker | null = null;
let requestId = 0;
const pendingRequests = new Map<number, { resolve: (v: string) => void; reject: (e: any) => void }>();

export function preloadDotnetV2(): void {
    const startingFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    getBestMoveV2(startingFen)
        .then(() => console.log('[preload] v2 warmup complete'))
        .catch(err => console.error('[preload] v2 warmup failed', err));
}

function getDotnetWorkerV2(): Worker {
    console.log("getDotnetWorkerV2");
    if (dotnetWorkerV2) return dotnetWorkerV2;

    dotnetWorkerV2 = new Worker('/dotnet-worker-v2.js', { type: 'module' });

    dotnetWorkerV2.onmessage = (event) => {
        const { id, bestmove, error } = event.data;
        const pending = pendingRequests.get(id);
        if (!pending) return;
        pendingRequests.delete(id);
        if (error) pending.reject(new Error(error));
        else pending.resolve(bestmove);
    };

    dotnetWorkerV2.onerror = (err) => {
        for (const pending of pendingRequests.values()) {
            pending.reject(err);
        }
        pendingRequests.clear();
    };

    return dotnetWorkerV2;
}

export function getBestMoveV2(fen: string): Promise<string> {
    const worker = getDotnetWorkerV2();
    const id = requestId++;

    return new Promise((resolve, reject) => {
        pendingRequests.set(id, { resolve, reject });
        worker.postMessage({ id, fen });
    });
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
            getBestMoveV2(fen)
                .then(move => resolve({ bestmove: move }))
                .catch(reject);
        }
    });
}

export default SelectMove;