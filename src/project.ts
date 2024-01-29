import * as Pixi from 'Pixi.js';
import { ZippedResource } from './models/zippedResource';
import { Howl } from 'howler';
import _ from 'lodash';
import { BasisBinding, KTX2Parser, detectKTX2, loadBasis, loadKTX2, resolveKTX2TextureUrl } from 'pixi-basis-ktx2';
import { extensions } from '@pixi/core';

export interface IProject {
    launch(): void;
}

const assetKTXPath = './assets/KTX2'
const assetTexturePaths = [
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

export function getTextureAssetPaths(useKTX2: boolean): string[] {
    if (useKTX2) {
        return assetTexturePaths.map((item) => item.replace('./assets', assetKTXPath).replace(/jpg|jpeg|png/g,'ktx2'));
    }
    return assetTexturePaths
}

const assetsSoundPaths = [
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

export class Project implements IProject {
    public zipperResource: ZippedResource;
    public container: Pixi.Container;
    public canvasApp: Pixi.Application<HTMLCanvasElement>;

    public pixiTextures: Pixi.Texture<Pixi.Resource>[];
    public pixiSprites: Pixi.Sprite[];
    public howlSounds: Howl[];

    public contentContainer: Pixi.Container;
    public saveContainer: Pixi.Container;
    public loadContainer: Pixi.Container;
    public soundContainer: Pixi.Container;
    public buttonTextMap: Map<string, Pixi.Text>;

    private isSaving = false;
    private isLoading = false;
    private isKTX2Enabled = false;
    private ktxBtnTxt = 'KTX2 Disabled';

    public async launch(): Promise<void> {
        await this.loadKTX2Transcoder();

        this.canvasApp = new Pixi.Application<HTMLCanvasElement>({ background: '#1099bb', resizeTo: window, powerPreference:'high-performance' });
        this.container = new Pixi.Container();
        this.contentContainer = new Pixi.Container();
        this.buttonTextMap = new Map<string, Pixi.Text>();

        this.container.addChild(this.contentContainer);

        this.pixiSprites = [];
        this.pixiTextures = [];
        this.howlSounds = [];
        this.canvasApp.stage.addChild(this.container);
        this.zipperResource = new ZippedResource();
        this.createButtons();
        document.body.appendChild(this.canvasApp.view);
    }


    public async loadKTX2Transcoder(): Promise<void> {
        await KTX2Parser.loadTranscoder(window.location.origin + '/basis_transcoder.js', window.location.origin + '/basis_transcoder.wasm');
        Pixi.Assets.detections.push(detectKTX2);
        Pixi.Assets.loader.parsers.push(loadKTX2);
        Pixi.Assets.resolver.parsers.push(resolveKTX2TextureUrl);
    }

    public async createResources(): Promise<void> {
        const texturePaths = getTextureAssetPaths(this.isKTX2Enabled);
        const length = texturePaths.length;
        for (let i = 0; i < length; i++) {
            try {
                const pixiTexture = await Pixi.Assets.load(texturePaths[i]);
                this.pixiTextures.push(pixiTexture);
                const pixiSprite = new Pixi.Sprite(pixiTexture);
                this.pixiSprites.push(pixiSprite);
                pixiSprite.position.set(
                    _.random(pixiTexture.width * 0.5, this.canvasApp.screen.width - pixiTexture.width * 0.5),
                    _.random(pixiTexture.height * 0.5, this.canvasApp.screen.height - pixiTexture.height * 0.5)
                );
            } catch (error) {
                console.warn(`Texture [${texturePaths[i]}] not found! Continuing...`);
            } finally {
                continue;
            }
        }

        this.pixiSprites.forEach((sprite: Pixi.Sprite) => {
            this.contentContainer.addChild(sprite);
        });

        const length2 = assetsSoundPaths.length;
        for (let j = 0; j < length2; j++) {
            const sound = new Howl({ src: assetsSoundPaths[j], autoplay: false, loop: false, volume: 0.5 });
            this.howlSounds.push(sound);
        }
    }

    private createButtons(): void {
        const offset = 32;
        const width = 128;
        const height = 64;
        const scaleW = width * 1.5;

        this.createButton('Save', this.saveContainer, width * 0.5, offset, width, async () => {
            if (this.isSaving) return;
            this.isSaving = true;
            this.zipperResource.resetZip();
            console.log('Saving...\nHas KTX2 textures: ' + this.isKTX2Enabled);
            this.updateButtonText('Save', 'saving...');
            this.disposeTextures();
            const time1 = Date.now();
            const texturePaths = getTextureAssetPaths(this.isKTX2Enabled);
            const length = texturePaths.length;
            for (let i = 0; i < length; i++) {
                await this.zipperResource.zipResource(texturePaths[i]);
            }
            for (let j = 0; j < assetsSoundPaths.length; j++) {
                await this.zipperResource.zipResource(assetsSoundPaths[j]);
            }
            this.zipperResource.download();
            this.isSaving = false;
            console.log('Saved in ', Date.now() - time1, ' ms');
            this.updateButtonText('Save', 'Save');
        });

        this.createButton('Sound', this.loadContainer, width * 0.5 + width + offset, offset, width, async () => {
            _.sample(this.howlSounds)?.play();
        });

        const ktx2Btn = this.createButton(this.ktxBtnTxt, this.loadContainer, width * 0.5 + (width + offset) * 2, offset, scaleW, async () => {
            this.disposeTextures();

            this.isKTX2Enabled = !this.isKTX2Enabled;
            this.ktxBtnTxt = this.isKTX2Enabled ? 'KTX2 Enabled': 'KTX2 Disabled';
            ktx2Btn.text.text = this.ktxBtnTxt;

            if (this.isKTX2Enabled) {
                const texture: Pixi.Texture = await Pixi.Assets.load(window.location.origin + '/assets/KTX2/KTX.ktx2');
                this.pixiTextures.push(texture);
                const sprite = new Pixi.Sprite(texture);
                sprite.position.set(
                    _.random(texture.width * 0.5, this.canvasApp.screen.width - texture.width * 0.5),
                    _.random(texture.height * 0.5, this.canvasApp.screen.height - texture.height * 0.5)
                );
                this.pixiSprites.push(sprite);
                this.contentContainer.addChild(sprite);
            }
        });

        this.createButton('Load normal', this.soundContainer, width * 0.5, offset * 2 + height, scaleW, async () => {
            if (this.isLoading) return;
            const time1 = Date.now();
            this.isLoading = true;
            console.log('Loading...');
            this.updateButtonText('Load normal', 'loading...');
            await this.createResources();
            this.isLoading = false;
            console.log('Total time loading files from assets ', Date.now() - time1, 'ms');
            this.updateButtonText('Load normal', 'Load normal');
        });

        this.createButton('Load local zip', this.soundContainer, width * 0.5 + scaleW + offset, offset * 2 + height, scaleW, async () => {
            if (this.isLoading) return;
            this.zipperResource.resetUnzip();
            this.isLoading = true;
            console.log('Loading...');
            this.updateButtonText('Load local zip', 'loading...');
            this.disposeTextures();
            let input: HTMLInputElement = document.createElement('input');
            input.type = 'file';
            input.onchange = async (_) => {
                if (input.files === undefined) return;
                    const time1 = Date.now();
                    const arry = Array.from(input.files!);
                    const binaryFile = arry[0];
                    const buffer = await binaryFile.arrayBuffer();
                    console.log('Downloaded zip in ', Date.now() - time1, 'ms');
                    const time2 = Date.now();
                    const imageExt = this.isKTX2Enabled ? 'KTX2' :'PNG/JPEG'
                    this.zipperResource.setZipData(new Uint8Array(buffer));
                    await this.loadResourcesFromZip();
                    console.log(`Loaded ${imageExt} textures in `, Date.now() - time2, 'ms');
                    console.log('Total time loading zipped files from local ', Date.now() - time1, 'ms');
                
            };
            input.click();
            this.isLoading = false;
            this.updateButtonText('Load local zip', 'Load local zip');
        });

        this.createButton('Load server zip', this.soundContainer, width * 0.5 + (scaleW + offset) * 2, offset * 2 + height, scaleW, async () => {
            if (this.isLoading) return;
            this.zipperResource.resetUnzip();
            const time1 = Date.now();
            this.isLoading = true;
            console.log('Loading...');
            this.updateButtonText('Load server zip', 'loading...');
            this.disposeTextures();
            const url = this.isKTX2Enabled ? 
                'https://raw.githubusercontent.com/kvanderhaeghen-aleacsysonline/zip-and-unzip-ktx2/main/examples/ktx2_images.alon' :
                'https://raw.githubusercontent.com/kvanderhaeghen-aleacsysonline/zip-and-unzip-ktx2/main/examples/normal_images.alon';
            const data = await fetch(url).then(
                (res) => res.arrayBuffer()
            );
            console.log('Downloaded zip in ', Date.now() - time1, 'ms');
            const time2 = Date.now();
            const imageExt = this.isKTX2Enabled ? 'KTX2' :'PNG/JPEG'
            this.zipperResource.setZipData(new Uint8Array(data));
            await this.loadResourcesFromZip();
            console.log(`Loaded ${imageExt} textures in `, Date.now() - time2, 'ms');
            this.isLoading = false;
            console.log('Total time loading zipped files from server ', Date.now() - time1, 'ms'); 
            this.updateButtonText('Load server zip', 'Load server');
        });        
    }

    private updateButtonText(name: string, text: string): void {
        if (!this.buttonTextMap.has(name) || this.buttonTextMap.get(name) === undefined) {
            return;
        }

        this.buttonTextMap.get(name)!.text = text;
    }

    private createButton(name: string, container: Pixi.Container, x: number, y: number, w: number, callback: () => void): { button:  Pixi.Container, text: Pixi.Text } {
        const h = 64;

        const g1 = new Pixi.Graphics();
        g1.beginFill(0x000000, 0.9);
        g1.drawRect(0, 0, w, h);
        g1.endFill();

        const text = new Pixi.Text(name, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff,
            align: 'center',
        });
        text.anchor.set(0.5, 0.5);
        text.position.set(w * 0.5, h * 0.5);
        this.buttonTextMap.set(name, text);

        container = new Pixi.Container();
        container.hitArea = new Pixi.Rectangle(0, 0, w, h);
        container.interactive = true;
        container.position.set(x, y);
        container.on('click', async () => {
            callback();
        });
        container.addChild(g1);
        container.addChild(text);
        this.container.addChild(container);

        return { button: container, text };
    }

    private async loadResourcesFromZip(): Promise<void> {
        const texturePaths = getTextureAssetPaths(this.isKTX2Enabled);
        const length = texturePaths.length;
        for (let i = 0; i < length; i++) {
            // console.warn('Texture ' + i, texturePaths[i]);
            const texture = await this.zipperResource.getPixiTexture(texturePaths[i]);
            if (!texture) {
                console.warn(`Texture [${texturePaths[i]}] not found! Continuing...`);
                continue;
            }

            this.pixiTextures.push(texture);
            const sprite = new Pixi.Sprite(texture);
            sprite.position.set(
                _.random(texture.width * 0.5, this.canvasApp.screen.width - texture.width * 0.5),
                _.random(texture.height * 0.5, this.canvasApp.screen.height - texture.height * 0.5)
            );
            this.pixiSprites.push(sprite);
            this.contentContainer.addChild(sprite);
        }
        for (let i = 0; i < assetsSoundPaths.length; i++) {
            const audio = this.zipperResource.getAudio(assetsSoundPaths[i]);
            this.howlSounds.push(audio);
        }
    }

    public disposeTextures(): void {
        for (let i = 0; i < this.pixiTextures.length; i++) {
            Pixi.Texture.removeFromCache(this.pixiTextures[i]);
            delete this.pixiTextures[i];
            this.pixiSprites[i].removeFromParent();
            delete this.pixiSprites[i];
        }
        this.howlSounds.splice(0);
        this.pixiTextures.splice(0);
        this.pixiSprites.splice(0);
    }
}
