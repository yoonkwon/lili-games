/**
 * Draw Snow White - Forest fairy tale style characters
 */
import { createCharacterRenderer } from '../../shared/AssetLoader.js';

const { assetsReady, drawMom, drawBaby } = createCharacterRenderer('assets/snow-white', 'snow-white', '🌸');

export { assetsReady as snowWhiteAssetsReady };
export { drawMom as drawSnowWhiteMom };
export { drawBaby as drawBabySnowWhite };
