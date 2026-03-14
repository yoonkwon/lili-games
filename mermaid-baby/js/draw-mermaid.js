/**
 * Draw Mermaid - Underwater fairy tale style characters
 */
import { createCharacterRenderer } from '../../shared/AssetLoader.js';

const { assetsReady, drawMom, drawBaby } = createCharacterRenderer('assets/mermaid', 'mermaid', '🫧');

export { assetsReady as mermaidAssetsReady };
export { drawMom as drawMermaidMom };
export { drawBaby as drawBabyMermaid };
