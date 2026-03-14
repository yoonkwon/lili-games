/**
 * Draw Elsa - Disney Frozen style characters
 */
import { createCharacterRenderer } from '../../shared/AssetLoader.js';

const { assetsReady, drawMom, drawBaby } = createCharacterRenderer('assets/elsa', 'elsa', '❄️');

export { assetsReady as elsaAssetsReady };
export { drawMom as drawElsaMom };
export { drawBaby as drawBabyElsa };
