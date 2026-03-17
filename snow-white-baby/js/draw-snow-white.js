/**
 * Draw Snow White - Forest fairy tale style characters
 */
import { createCharacterRenderer } from '../../shared/AssetLoader.js';

const { assetsReady, drawMom, drawBaby, drawVillain } = createCharacterRenderer('assets/snow-white', 'snow-white', '🌸', 'assets/witch.png');

export { assetsReady as snowWhiteAssetsReady };
export { drawMom as drawSnowWhiteMom };
export { drawBaby as drawBabySnowWhite };
export { drawVillain as drawWitch };
