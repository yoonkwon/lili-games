/**
 * Draw Elsa - Disney Frozen style characters
 */
import { createCharacterRenderer } from '../../shared/AssetLoader.js';

const { assetsReady, drawMom, drawBaby, drawVillain } = createCharacterRenderer('assets/elsa', 'elsa', '❄️', 'assets/troll.png');

export { assetsReady as elsaAssetsReady };
export { drawMom as drawElsaMom };
export { drawBaby as drawBabyElsa };
export { drawVillain as drawTroll };
