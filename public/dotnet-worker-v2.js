import { dotnet } from '/_framework-v2/dotnet.js';

let exportsPromise = null;

async function init() {
    console.log('[worker] dotnet init starting', performance.now());
    const { getAssemblyExports, getConfig } = await dotnet
        .withConfig({
            configSrc: '/_framework-v2/dotnet.boot.js',
        })
        .create();

    const config = getConfig();
    return await getAssemblyExports(config.mainAssemblyName);
}

self.onmessage = async (event) => {
    const { id, fen } = event.data;

    try {
        if (!exportsPromise) {
            exportsPromise = init();
        }
        const exports = await exportsPromise;
        const move = await exports.chessEngine.ChessEngine.GetBestMove(fen);
        self.postMessage({ id, bestmove: move });
    } catch (err) {
        self.postMessage({ id, error: String(err) });
    }
};