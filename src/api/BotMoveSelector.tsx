type PendingMap = Map<number, { resolve: (v: string) => void; reject: (e: any) => void }>;

function createEngineWorker(scriptUrl: string) {
    let worker: Worker | null = null;
    let requestId = 0;
    const pending: PendingMap = new Map();

    function getWorker(): Worker {
        if (worker) return worker;

        worker = new Worker(scriptUrl, { type: 'module' });

        worker.onmessage = (event) => {
            const { id, bestmove, error } = event.data;
            const p = pending.get(id);
            if (!p) return;
            pending.delete(id);
            if (error) p.reject(new Error(error));
            else p.resolve(bestmove);
        };

        worker.onerror = (err) => {
            for (const p of pending.values()) {
                p.reject(err);
            }
            pending.clear();
        };

        return worker;
    }

    function getMove(fen: string): Promise<string> {
        const w = getWorker();
        const id = requestId++;

        return new Promise((resolve, reject) => {
            pending.set(id, { resolve, reject });
            w.postMessage({ id, fen });
        });
    }

    function preload(): void {
        const startingFen = "8/8/8/8/8/8/8/k6K w - - 0 1";
        getMove(startingFen).catch(err => console.error(`[preload] ${scriptUrl} warmup failed`, err));
    }

    return { getWorker, getMove, preload };
}

const v1 = createEngineWorker('/dotnet-worker-v1.js');
const v2 = createEngineWorker('/dotnet-worker-v2.js');
const v3 = createEngineWorker('/dotnet-worker-v3.js');

export const getDotnetWorkerV1 = v1.getWorker;
export const getRandomMoveV1 = v1.getMove;
export const preloadDotnetV1 = v1.preload;

export const getDotnetWorkerV2 = v2.getWorker;
export const getBestMoveV2 = v2.getMove;
export const preloadDotnetV2 = v2.preload;

export const getDotnetWorkerV3 = v3.getWorker;
export const getBestMoveV3 = v3.getMove;
export const preloadDotnetV3 = v3.preload;

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
        getRandomMoveV1(fen)
            .then(move => resolve({ bestmove: move }))
            .catch(reject);

        } else if (bot === "darshfish v2 (Basic Search)") {
            getBestMoveV2(fen)
                .then(move => resolve({ bestmove: move }))
                .catch(reject);

        } else if (bot === "darshfish v3 (Smart Search)") {
            getBestMoveV3(fen)
                .then(move => resolve({ bestmove: move }))
                .catch(reject);
        }
    });
}

export default SelectMove;