let dotnetWorkerV1: Worker | null = null;
let requestIdV1 = 0;
const pendingRequestsV1 = new Map<number, { resolve: (v: string) => void; reject: (e: any) => void }>();

export function getDotnetWorkerV1(): Worker {
    if (dotnetWorkerV1) return dotnetWorkerV1;

    dotnetWorkerV1 = new Worker('/dotnet-worker-v1.js', { type: 'module' });

    dotnetWorkerV1.onmessage = (event) => {
        const { id, bestmove, error } = event.data;
        const pending = pendingRequestsV1.get(id);
        if (!pending) return;
        pendingRequestsV1.delete(id);
        if (error) pending.reject(new Error(error));
        else pending.resolve(bestmove);
    };

    dotnetWorkerV1.onerror = (err) => {
        for (const pending of pendingRequestsV1.values()) {
            pending.reject(err);
        }
        pendingRequestsV1.clear();
    };

    return dotnetWorkerV1;
}

export function getRandomMoveV1(fen: string): Promise<string> {
    const worker = getDotnetWorkerV1();
    const id = requestIdV1++;

    return new Promise((resolve, reject) => {
        pendingRequestsV1.set(id, { resolve, reject });
        worker.postMessage({ id, fen });
    });
}

let dotnetWorkerV2: Worker | null = null;
let requestId = 0;
const pendingRequests = new Map<number, { resolve: (v: string) => void; reject: (e: any) => void }>();

export function preloadDotnetV2(): void {
    const startingFen = "8/8/8/8/8/8/8/k6K w - - 0 1";
    getBestMoveV2(startingFen)
}

export function preloadDotnetV1(): void {
    const startingFen = "8/8/8/8/8/8/8/k6K w - - 0 1";
    getRandomMoveV1(startingFen)
}

function getDotnetWorkerV2(): Worker {
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
        getRandomMoveV1(fen)
            .then(move => resolve({ bestmove: move }))
            .catch(reject);

        } else if (bot === "darshfish v2 (Basic Search)") {
            getBestMoveV2(fen)
                .then(move => resolve({ bestmove: move }))
                .catch(reject);
        }
    });
}

export default SelectMove;