import _ from "lodash";
import { KTX2Types } from "../types/compressionTypes";

export const assetKtxEtc1sPath = './assets/KTX2_ETC1S'
export const assetKtxUastcPath = './assets/KTX2_UASTC'
export const assetTexturePaths = [
    './assets/texture/dice/die1.png',
    './assets/texture/dice/die2.png',
    './assets/texture/dice/die3.png',
    './assets/texture/dice/die4.png',
    './assets/texture/dice/die5.png',
    './assets/texture/dice/die6.png',
    './assets/texture/dice/die7.png',
    './assets/texture/dice/die8.png',
    './assets/texture/dice/die9.png',
    './assets/texture/dice/die10.png',
    './assets/texture/feature/backgroundBonusGame.png',
    './assets/texture/feature/gridBonusGame.png',
    './assets/texture/feature/skyBonusBackground.jpg',
    './assets/texture/main/backgroundWaterMainGame.jpg',
    './assets/texture/main/gridMainGame.png',
    './assets/texture/splashScreen/splashScreenBonus.png',
    './assets/texture/splashScreen/splashScreenNormal.png',
    './assets/texture/transition/groundLayers.jpg',

    './assets/textureAtlas/blueBonus/blueChanchu.png',

    './assets/textureAtlas/bonus/blueCoin.png',
    './assets/textureAtlas/bonus/bonus_freespinCoin.png',
    './assets/textureAtlas/bonus/bonusWheel.png',
    './assets/textureAtlas/bonus/greenCoin.png',
    './assets/textureAtlas/bonus/redCoin.png',
    './assets/textureAtlas/bonus/segmentHighlight.png',
    './assets/textureAtlas/bonus/wheelArrow.png',
    './assets/textureAtlas/bonus/wheelBorder.png',
    './assets/textureAtlas/bonus/wheelGlow.png',
    './assets/textureAtlas/bonus/wheelOverlay.png',
    './assets/textureAtlas/bonus/wheelSegments.png',

    './assets/textureAtlas/burst/coinburstFrame.png',
    './assets/textureAtlas/burst/featureSpinsAmount.png',
    './assets/textureAtlas/burst/frameCoinBurst.png',

    './assets/textureAtlas/clouds/cloudBackground1.png',
    './assets/textureAtlas/clouds/cloudBackground2.png',
    './assets/textureAtlas/clouds/cloudBackground3.png',
    './assets/textureAtlas/clouds/cloudBackground4.png',
    './assets/textureAtlas/clouds/cloudBackground5.png',
    './assets/textureAtlas/clouds/cloudBackground6.png',

    './assets/textureAtlas/diceLarge/die1.png',
    './assets/textureAtlas/diceLarge/die2.png',
    './assets/textureAtlas/diceLarge/die3.png',
    './assets/textureAtlas/diceLarge/die4.png',
    './assets/textureAtlas/diceLarge/die5.png',
    './assets/textureAtlas/diceLarge/die6.png',
    './assets/textureAtlas/diceLarge/die7.png',
    './assets/textureAtlas/diceLarge/die8.png',
    './assets/textureAtlas/diceLarge/die9.png',

    './assets/textureAtlas/freeSpins/blueLantern.png',
    './assets/textureAtlas/freeSpins/freeSpinPlaque.png',
    './assets/textureAtlas/freeSpins/greenLantern.png',
    './assets/textureAtlas/freeSpins/leftDoor.png',
    './assets/textureAtlas/freeSpins/redLantern.png',
    './assets/textureAtlas/freeSpins/rightDoor.png',
    './assets/textureAtlas/freeSpins/spinDie.png',

    './assets/textureAtlas/greenBonus/greenTerracotta.png',

    './assets/textureAtlas/gridBackPlates/grid0_0.jpg',
    './assets/textureAtlas/gridBackPlates/grid0_1.jpg',
    './assets/textureAtlas/gridBackPlates/grid0_2.jpg',
    './assets/textureAtlas/gridBackPlates/grid1_0.jpg',
    './assets/textureAtlas/gridBackPlates/grid1_1.jpg',
    './assets/textureAtlas/gridBackPlates/grid1_2.jpg',
    './assets/textureAtlas/gridBackPlates/grid2_0.jpg',
    './assets/textureAtlas/gridBackPlates/grid2_1.jpg',
    './assets/textureAtlas/gridBackPlates/grid2_2.jpg',
    './assets/textureAtlas/gridBackPlates/grid3_0.jpg',
    './assets/textureAtlas/gridBackPlates/grid3_1.jpg',
    './assets/textureAtlas/gridBackPlates/grid3_2.jpg',
    './assets/textureAtlas/gridBackPlates/grid4_0.jpg',
    './assets/textureAtlas/gridBackPlates/grid4_1.jpg',
    './assets/textureAtlas/gridBackPlates/grid4_2.jpg',
    './assets/textureAtlas/gridBackPlates/grid5_0.jpg',
    './assets/textureAtlas/gridBackPlates/grid5_1.jpg',
    './assets/textureAtlas/gridBackPlates/grid5_2.jpg',
    './assets/textureAtlas/gridBackPlates/grid6_0.jpg',
    './assets/textureAtlas/gridBackPlates/grid6_1.jpg',
    './assets/textureAtlas/gridBackPlates/grid6_2.jpg',
    './assets/textureAtlas/gridBackPlates/grid7_0.jpg',
    './assets/textureAtlas/gridBackPlates/grid7_1.jpg',
    './assets/textureAtlas/gridBackPlates/grid7_2.jpg',
    './assets/textureAtlas/gridBackPlates/grid8_0.jpg',
    './assets/textureAtlas/gridBackPlates/grid8_1.jpg',
    './assets/textureAtlas/gridBackPlates/grid8_2.jpg',

    './assets/textureAtlas/grids/gridAllMysteryPT.png',
    './assets/textureAtlas/grids/gridAllPT.png',
    './assets/textureAtlas/grids/gridMidLS.png',
    './assets/textureAtlas/grids/gridMidMysteryLS.png',
    './assets/textureAtlas/grids/gridPoints.png',
    './assets/textureAtlas/grids/gridSideLS.png',
    './assets/textureAtlas/grids/gridSideMysteryLS.png',
    './assets/textureAtlas/grids/jackpotField.png',

    './assets/textureAtlas/info/multipliers.png',
    './assets/textureAtlas/info/page1BonusGame.png',
    './assets/textureAtlas/info/page1MainGame.png',
    './assets/textureAtlas/info/page2Grids.png',
    './assets/textureAtlas/info/page2MainGame.png',
    './assets/textureAtlas/info/page2Points.png',
    './assets/textureAtlas/info/page2Prizes.png',
    './assets/textureAtlas/info/page3BonusWheel.png',
    './assets/textureAtlas/info/page3Bonuswinline.png',
    './assets/textureAtlas/info/page3Multiplier9Alike.png',
    './assets/textureAtlas/info/page3MultiplierX2.png',
    './assets/textureAtlas/info/page3MultiplierX3.png',
    './assets/textureAtlas/info/page3PrizeTable.png',
    './assets/textureAtlas/info/page3Scatters.png',
    './assets/textureAtlas/info/page3Wild.png',
    './assets/textureAtlas/info/page4Bastet.png',
    './assets/textureAtlas/info/page4BookOfDice.png',
    './assets/textureAtlas/info/page49AlikeWheel.jpg',

    './assets/textureAtlas/main/alike9Lit.png',
    './assets/textureAtlas/main/alike9Unlit.png',
    './assets/textureAtlas/main/bokeBig.png',
    './assets/textureAtlas/main/bokeBlur.png',
    './assets/textureAtlas/main/bokeMini.png',
    './assets/textureAtlas/main/bookIconHighlighted.png',
    './assets/textureAtlas/main/bookIconNonHighlighted.png',
    './assets/textureAtlas/main/buffer.png',
    './assets/textureAtlas/main/bufferFrame.png',
    './assets/textureAtlas/main/bufferMystery.png',
    './assets/textureAtlas/main/close.png',
    './assets/textureAtlas/main/darkOverlayGrid.png',
    './assets/textureAtlas/main/die1.png',
    './assets/textureAtlas/main/die2.png',
    './assets/textureAtlas/main/die3.png',
    './assets/textureAtlas/main/die4.png',
    './assets/textureAtlas/main/die5.png',
    './assets/textureAtlas/main/die6.png',
    './assets/textureAtlas/main/die7.png',
    './assets/textureAtlas/main/die8.png',
    './assets/textureAtlas/main/die9.png',
    './assets/textureAtlas/main/die10.png',
    './assets/textureAtlas/main/die11.png',
    './assets/textureAtlas/main/die12.png',
    './assets/textureAtlas/main/die13.png',
    './assets/textureAtlas/main/dieWhite.png',
    './assets/textureAtlas/main/expand.png',
    './assets/textureAtlas/main/gameLogo.png',
    './assets/textureAtlas/main/gridWonOverlay.png',
    './assets/textureAtlas/main/hexagon.png',
    './assets/textureAtlas/main/messageBar.png',
    './assets/textureAtlas/main/messageBarLS.png',
    './assets/textureAtlas/main/messageBarPT.png',
    './assets/textureAtlas/main/points.png',
    './assets/textureAtlas/main/pointsPlate.png',
    './assets/textureAtlas/main/prizeTable.png',
    './assets/textureAtlas/main/score.png',
    './assets/textureAtlas/main/set2Lit.png',
    './assets/textureAtlas/main/set2Unlit.png',
    './assets/textureAtlas/main/set3Lit.png',
    './assets/textureAtlas/main/set3Unlit.png',
    './assets/textureAtlas/main/tick.png',

    './assets/textureAtlas/pointsModifiers/200ModifierTxt.png',
    './assets/textureAtlas/pointsModifiers/alike9Icon.png',
    './assets/textureAtlas/pointsModifiers/L200TXT.png',
    './assets/textureAtlas/pointsModifiers/Lx1-5TXT.png',
    './assets/textureAtlas/pointsModifiers/Lx2TXT.png',
    './assets/textureAtlas/pointsModifiers/sets3Icon.png',
    './assets/textureAtlas/pointsModifiers/sets4Icon.png',
    './assets/textureAtlas/pointsModifiers/x1-5ModifierTxt.png',
    './assets/textureAtlas/pointsModifiers/x2ModifierTxt.png',

    './assets/textureAtlas/redBonus/redAttackElectric.png',
    './assets/textureAtlas/redBonus/redAttackRocks.png',
    './assets/textureAtlas/redBonus/redAttackScratch.png',
    './assets/textureAtlas/redBonus/redDragon.png',
    './assets/textureAtlas/redBonus/redIconElectric.png',
    './assets/textureAtlas/redBonus/redIconRocks.png',
    './assets/textureAtlas/redBonus/redIconScratch.png',
    './assets/textureAtlas/redBonus/redRollBlurr.png',
    './assets/textureAtlas/redBonus/redRolls.png',

    './assets/textureAtlas/score/prizeTable.png',
    './assets/textureAtlas/score/prizeTableLS.png',
    './assets/textureAtlas/score/prizeTablePointer.png',
    './assets/textureAtlas/score/prizeTablePT.png',
    './assets/textureAtlas/score/score.png',
    './assets/textureAtlas/score/scoreLS.png',
    './assets/textureAtlas/score/scorePT.png',
];

export const assetsKTXTestPaths = [
    './assets/ktxTest/x2Portrait.png',
    './assets/ktxTest/x2Portrait-etc1s.ktx2',
    './assets/ktxTest/x2Portrait-etc1s3.ktx2',
    './assets/ktxTest/x2Portrait-uastc-high.ktx2',
    './assets/ktxTest/x2Portrait-uastc-mid3.ktx2',
    './assets/ktxTest/x2Portrait-uastc-high3.ktx2',
    './assets/ktxTest/x2Portrait-uastc-high4.ktx2',
    // './assets/ktxTest/x2Portrait-uastc-mid3-zlib.ktx2', // zlib not yet supported in current ktx2 library
    // './assets/ktxTest/x2Portrait-uastc-high3-zlib.ktx2',
    // './assets/ktxTest/x2Portrait-uastc-high4-zlib.ktx2'
];

export const animTestPath = {
    path: './assets/animTest/anematicDragonFire',
    ext: 'jpg',
    length: 16
}

export const assetsSoundPaths = [
    './assets/variant/ogg/soundHowl/soundAmbientBonus.ogg',
    './assets/variant/ogg/soundHowl/soundAmbientMain.ogg',
    './assets/variant/ogg/soundHowl/soundBastetBufferSymbolExpand.ogg',
    './assets/variant/ogg/soundHowl/soundBastetCoinburst.ogg',
    './assets/variant/ogg/soundHowl/soundBastetCoinburstFeature.ogg',
    './assets/variant/ogg/soundHowl/soundBastetIdle1.ogg',
    './assets/variant/ogg/soundHowl/soundBastetIdle2.ogg',
    './assets/variant/ogg/soundHowl/soundBastetIntroBookOpening.ogg',
    './assets/variant/ogg/soundHowl/soundBastetNineAlike.ogg',
    './assets/variant/ogg/soundHowl/soundBastetNineAlikeOutro.ogg',
    './assets/variant/ogg/soundHowl/soundBastetNormalReaction1.ogg',
    './assets/variant/ogg/soundHowl/soundBastetNormalReaction2.ogg',
    './assets/variant/ogg/soundHowl/soundBastetNormalReaction3.ogg',
    './assets/variant/ogg/soundHowl/soundBastetNormalReaction4.ogg',
    './assets/variant/ogg/soundHowl/soundBastetNormalReaction5.ogg',
    './assets/variant/ogg/soundHowl/soundBastetScatterAbsorb.ogg',
    './assets/variant/ogg/soundHowl/soundBastetSymbolReaction1.ogg',
    './assets/variant/ogg/soundHowl/soundBastetSymbolReaction2.ogg',
    './assets/variant/ogg/soundHowl/soundBastetSymbolReaction3.ogg',
    './assets/variant/ogg/soundHowl/soundBastetSymbolReaction4.ogg',
    './assets/variant/ogg/soundHowl/soundBastetSymbolReaction5.ogg',
    './assets/variant/ogg/soundHowl/soundBastetWin.ogg',
    './assets/variant/ogg/soundHowl/soundBastetWinReaction1.ogg',
    './assets/variant/ogg/soundHowl/soundBastetWinReaction2.ogg',
    './assets/variant/ogg/soundHowl/soundBastetWinReaction3.ogg',
    './assets/variant/ogg/soundHowl/soundBastetWinReaction4.ogg',
    './assets/variant/ogg/soundHowl/soundBastetWinReaction5.ogg',
    './assets/variant/ogg/soundHowl/soundBonusInBuffer.ogg',
    './assets/variant/ogg/soundHowl/soundBonusInGrid.ogg',
    './assets/variant/ogg/soundHowl/soundBonusTrail.ogg',
    './assets/variant/ogg/soundHowl/soundBonusTransitionIn.ogg',
    './assets/variant/ogg/soundHowl/soundBonusTransitionOut.ogg',
    './assets/variant/ogg/soundHowl/soundBookClose.ogg',
    './assets/variant/ogg/soundHowl/soundBookOpen.ogg',
    './assets/variant/ogg/soundHowl/soundBookPageFlip1.ogg',
    './assets/variant/ogg/soundHowl/soundBookPageFlip2.ogg',
    './assets/variant/ogg/soundHowl/soundBookPageFlip3.ogg',
    './assets/variant/ogg/soundHowl/soundBookPageInsert1.ogg',
    './assets/variant/ogg/soundHowl/soundBookPageInsert2.ogg',
    './assets/variant/ogg/soundHowl/soundBookPageInsert3.ogg',
    './assets/variant/ogg/soundHowl/soundBufferFill.ogg',
    './assets/variant/ogg/soundHowl/soundBufferSymbolExpand1.ogg',
    './assets/variant/ogg/soundHowl/soundBufferSymbolExpand2.ogg',
    './assets/variant/ogg/soundHowl/soundButtonClick.ogg',
    './assets/variant/ogg/soundHowl/soundCoinburst.ogg',
    './assets/variant/ogg/soundHowl/soundCoinburstBonus.ogg',
    './assets/variant/ogg/soundHowl/soundCreditCountEnd.ogg',
    './assets/variant/ogg/soundHowl/soundCreditCountLoop.ogg',
    './assets/variant/ogg/soundHowl/soundCreditCountStart.ogg',
    './assets/variant/ogg/soundHowl/soundDicePlaced1.ogg',
    './assets/variant/ogg/soundHowl/soundDicePlaced2.ogg',
    './assets/variant/ogg/soundHowl/soundDicePlaced3.ogg',
    './assets/variant/ogg/soundHowl/soundEnvironmentalBonus.ogg',
    './assets/variant/ogg/soundHowl/soundEnvironmentalMain.ogg',
    './assets/variant/ogg/soundHowl/soundFallingRocks.ogg',
    './assets/variant/ogg/soundHowl/soundGridPoints.ogg',
    './assets/variant/ogg/soundHowl/soundGridPointsWithFeature.ogg',
    './assets/variant/ogg/soundHowl/soundLineHint.ogg',
    './assets/variant/ogg/soundHowl/soundLineHintBonus1.ogg',
    './assets/variant/ogg/soundHowl/soundLineHintBonus2.ogg',
    './assets/variant/ogg/soundHowl/soundNineAlike.ogg',
    './assets/variant/ogg/soundHowl/soundNineAlikeActivated.ogg',
    './assets/variant/ogg/soundHowl/soundNineAlikeBurst.ogg',
    './assets/variant/ogg/soundHowl/soundNineAlikeGlow.ogg',
    './assets/variant/ogg/soundHowl/soundNoWin.ogg',
    './assets/variant/ogg/soundHowl/soundPointsCountEnd.ogg',
    './assets/variant/ogg/soundHowl/soundPointsCountLoop.ogg',
    './assets/variant/ogg/soundHowl/soundRoundStart.ogg',
    './assets/variant/ogg/soundHowl/soundRoundStartBonus.ogg',
    './assets/variant/ogg/soundHowl/soundScarabBonusCoinburstFeature.ogg',
    './assets/variant/ogg/soundHowl/soundScarabBonusNineAlikeOutro.ogg',
    './assets/variant/ogg/soundHowl/soundScarabCoinburstFeature.ogg',
    './assets/variant/ogg/soundHowl/soundScarabFlyAroundCane.ogg',
    './assets/variant/ogg/soundHowl/soundScarabFlyIdle.ogg',
    './assets/variant/ogg/soundHowl/soundScarabFlyToCane1.ogg',
    './assets/variant/ogg/soundHowl/soundScarabFlyToCane2.ogg',
    './assets/variant/ogg/soundHowl/soundScarabFlyToCane3.ogg',
    './assets/variant/ogg/soundHowl/soundScarabFlyToWheel1.ogg',
    './assets/variant/ogg/soundHowl/soundScarabFlyToWheel2.ogg',
    './assets/variant/ogg/soundHowl/soundScarabFlyToWheel3.ogg',
    './assets/variant/ogg/soundHowl/soundScarabIdle1.ogg',
    './assets/variant/ogg/soundHowl/soundScarabIdle2.ogg',
    './assets/variant/ogg/soundHowl/soundScarabIdle3.ogg',
    './assets/variant/ogg/soundHowl/soundScarabIdle4.ogg',
    './assets/variant/ogg/soundHowl/soundScarabNineAlike.ogg',
    './assets/variant/ogg/soundHowl/soundScarabNineAlikeOutro.ogg',
    './assets/variant/ogg/soundHowl/soundScatterSelect.ogg',
    './assets/variant/ogg/soundHowl/soundScatterWin.ogg',
    './assets/variant/ogg/soundHowl/soundStakeChange1.ogg',
    './assets/variant/ogg/soundHowl/soundStakeChange2.ogg',
    './assets/variant/ogg/soundHowl/soundStakeChange3.ogg',
    './assets/variant/ogg/soundHowl/soundThreeGridMultiplier.ogg',
    './assets/variant/ogg/soundHowl/soundTwoGridMultiplier.ogg',
    './assets/variant/ogg/soundHowl/soundWinline.ogg',
    './assets/variant/ogg/soundHowl/soundWinlineBonus.ogg',
    './assets/variant/ogg/soundHowl/soundWinlineScatter.ogg',
];

export const serverUrlNormal = 'https://raw.githubusercontent.com/kvanderhaeghen-aleacsysonline/zip-and-unzip-ktx2/main/examples/normal_images.alon';
export const serverUrlKtx2Etc1s = 'https://raw.githubusercontent.com/kvanderhaeghen-aleacsysonline/zip-and-unzip-ktx2/main/examples/ktx2_etc1s_images.alon';
export const serverUrlKtx2Uastc = 'https://raw.githubusercontent.com/kvanderhaeghen-aleacsysonline/zip-and-unzip-ktx2/main/examples/ktx2_uastc_images.alon';

export function getKTX2TypePath(ktx2Type: KTX2Types): string {
    return ktx2Type === KTX2Types.ETC1S ? assetKtxEtc1sPath : assetKtxUastcPath;
}
export function getTextureAssetPaths(ktx2Type?: KTX2Types): string[] {
    if (ktx2Type) {
        const texturePath = getKTX2TypePath(ktx2Type);
        return assetTexturePaths.map((item) => item.replace('./assets', texturePath).replace(/jpg|jpeg|png/g,'ktx2'));
    }
    return assetTexturePaths
}
export function getAnimationAssetPaths(ktx2Type?: KTX2Types): string[] {
    const paths = _.times(animTestPath.length, (index) => `${animTestPath.path}${index + 1}.${animTestPath.ext}`);
    if (ktx2Type) {
        const texturePath = getKTX2TypePath(ktx2Type);
        return paths.map((item) => item.replace('./assets', texturePath).replace(/jpg|jpeg|png/g,'ktx2'));
    }
    return paths;
}