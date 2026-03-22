/**
 * Draw Mermaid - Underwater fairy tale style characters
 */
import { createCharacterRenderer } from '../../shared/AssetLoader.js';

const { assetsReady, drawMom, drawBaby, drawVillain } = createCharacterRenderer('assets/mermaid', 'mermaid', '🫧', 'assets/sea-witch.png');

export { assetsReady as mermaidAssetsReady };
export { drawMom as drawMermaidMom };
export { drawBaby as drawBabyMermaid };
export { drawVillain as drawSeaWitch };
