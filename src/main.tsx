import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import 'doodle.css/doodle.css'

import { preloadDotnetV1, preloadDotnetV2, preloadDotnetV3, preloadDotnetV4 } from './api/BotMoveSelector.tsx';

preloadDotnetV1();
preloadDotnetV2();
preloadDotnetV3();
preloadDotnetV4();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
