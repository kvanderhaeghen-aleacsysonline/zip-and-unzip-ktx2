import * as Pixi from 'Pixi.js';
import { ZippedResource } from './models/zippedResource';
import { Howl } from 'howler';
import _ from 'lodash';
import { BasisBinding, KTX2Parser, detectKTX2, loadBasis, loadKTX2, resolveKTX2TextureUrl } from 'pixi-basis-ktx2';
import { extensions } from '@pixi/core';
import { assetsSoundPaths, getKTX2TypePath, getTextureAssetPaths, serverUrlKtx2Etc1s, serverUrlKtx2Uastc, serverUrlNormal } from './constants/constants';
import { KTX2Types } from './types/compressionTypes';

export interface IProject {
    launch(): void;
}

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
    public resultText?: Pixi.Text;

    private ktx2Type?: KTX2Types;
    private isSaving = false;
    private isLoading = false;
    private ktxBtnTxt = 'KTX2 Disabled';
    private href = window.location.origin + window.location.pathname.replace('index.html','');

    public async launch(): Promise<void> {
        await this.loadKTX2Transcoder();

        this.canvasApp = new Pixi.Application<HTMLCanvasElement>({ background: '#1099bb', powerPreference:'high-performance', width: 1920, height:1080  });
        this.canvasApp.view.id = 'fflate-ktx2'
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
        await KTX2Parser.loadTranscoder(this.href + '/basis_transcoder.js', this.href + '/basis_transcoder.wasm');
        Pixi.Assets.detections.push(detectKTX2);
        Pixi.Assets.loader.parsers.push(loadKTX2);
        Pixi.Assets.resolver.parsers.push(resolveKTX2TextureUrl);
    }

    public async createResources(): Promise<void> {
        const texturePaths = getTextureAssetPaths(this.ktx2Type);
        const length = texturePaths.length;
        for (let i = 0; i < length; i++) {
            const texturePath = this.href + texturePaths[i].replace('./','')
            try {
                const pixiTexture = await Pixi.Assets.load(texturePath);
                this.pixiTextures.push(pixiTexture);
                const pixiSprite = new Pixi.Sprite(pixiTexture);
                this.pixiSprites.push(pixiSprite);
                pixiSprite.position.set(
                    _.random(pixiTexture.width * 0.5, this.canvasApp.screen.width - pixiTexture.width * 0.5),
                    _.random(pixiTexture.height * 0.5, this.canvasApp.screen.height - pixiTexture.height * 0.5)
                );
            } catch (error) {
                console.warn(`Texture [${texturePath}] not found! Continuing...`);
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
        const scaleH = 64;
        
        this.createButton('Save', this.saveContainer, 20, offset, scaleW, scaleH, async () => {
            if (this.isSaving) return;
            this.isSaving = true;
            this.zipperResource.resetZip();
            this.logResults('Saving...\nHas KTX2 textures: ' + this.ktx2Type);
            this.updateButtonText('Save', 'saving...');
            this.disposeTextures();
            const time1 = Date.now();
            const texturePaths = getTextureAssetPaths(this.ktx2Type);
            const length = texturePaths.length;
            for (let i = 0; i < length; i++) {
                await this.zipperResource.zipResource(texturePaths[i]);
            }
            for (let j = 0; j < assetsSoundPaths.length; j++) {
                await this.zipperResource.zipResource(assetsSoundPaths[j]);
            }
            this.zipperResource.download();
            this.isSaving = false;
            this.logResults('Saved in ', Date.now() - time1, ' ms');
            this.updateButtonText('Save', 'Save');
        });

        this.createButton('Sound', this.loadContainer, 20 + scaleW + offset, offset, scaleW, scaleH, async () => {
            _.sample(this.howlSounds)?.play();
        });

        const ktx2Btn = this.createButton(this.ktxBtnTxt, this.loadContainer, 20, offset + height * 1.5 , scaleW, scaleH, async () => {
            this.disposeTextures();

            if (!this.ktx2Type) {
                this.ktx2Type = KTX2Types.ETC1S;
            } else if (this.ktx2Type === KTX2Types.ETC1S) {
                this.ktx2Type = KTX2Types.UASTC;
            } else {
                this.ktx2Type = undefined;
            }

            this.ktxBtnTxt = this.ktx2Type ? 'KTX2 ' + this.ktx2Type?.toUpperCase() : 'KTX2 Disabled';
            ktx2Btn.text.text = this.ktxBtnTxt;
            this.logResults(this.ktxBtnTxt);

            if (this.ktx2Type) {
                const texture: Pixi.Texture = await Pixi.Assets.load(this.href  + getKTX2TypePath(this.ktx2Type).replace('./','/') + '/KTX.ktx2');
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

        this.createButton('Load normal', this.soundContainer, 20  + scaleW + offset, offset + height * 1.5 , scaleW, scaleH, async () => {
            if (this.isLoading) return;
            this.zipperResource.resetUnzip();
            this.isLoading = true;
            this.logResults('Loading...');
            this.updateButtonText('Load normal', 'loading...');
            this.disposeTextures();
            const time1 = Date.now();
            await this.createResources();
            this.isLoading = false;
            const imageExt = this.ktx2Type ? 'KTX2_' + this.ktx2Type?.toUpperCase() :'PNG/JPEG'
            this.logResults(`Total time loading files from assets [${imageExt}] `, Date.now() - time1, 'ms');
            this.updateButtonText('Load normal', 'Load normal');
        });

        this.createButton('Load local zip', this.soundContainer, 20, offset + height * 3 , scaleW, scaleH, async () => {
            if (this.isLoading) return;
            this.zipperResource.resetUnzip();
            this.isLoading = true;
            this.logResults('Loading...');
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
                    this.logResults('Downloaded zip in ', Date.now() - time1, 'ms');
                    const time2 = Date.now();
                    const imageExt = this.ktx2Type ? 'KTX2_' + this.ktx2Type?.toUpperCase() :'PNG/JPEG'
                    this.zipperResource.setZipData(new Uint8Array(buffer));
                    await this.loadResourcesFromZip();
                    this.logResults(`Loaded ${imageExt} textures in `, Date.now() - time2, 'ms');
                    this.logResults('Total time loading zipped files from local ', Date.now() - time1, 'ms');
                
            };
            input.click();
            this.isLoading = false;
            this.updateButtonText('Load local zip', 'Load local zip');
        });

        this.createButton('Load server zip', this.soundContainer, 20 + scaleW + offset, offset + height * 3, scaleW, scaleH, async () => {
            if (this.isLoading) return;
            this.zipperResource.resetUnzip();
            this.isLoading = true;
            this.logResults('Loading...');
            this.updateButtonText('Load server zip', 'loading...');
            this.disposeTextures();
            const time1 = Date.now();
            const url = this.ktx2Type ? serverUrlNormal : (this.ktx2Type === KTX2Types.ETC1S ? serverUrlKtx2Etc1s : serverUrlKtx2Uastc);
            const data = await fetch(url).then(
                (res) => res.arrayBuffer()
            );
            this.logResults('Downloaded zip in ', Date.now() - time1, 'ms');
            const time2 = Date.now();
            const imageExt = this.ktx2Type ? 'KTX2_' + this.ktx2Type.toUpperCase() :'PNG/JPEG'
            this.zipperResource.setZipData(new Uint8Array(data));
            await this.loadResourcesFromZip();
            this.logResults(`Loaded ${imageExt} textures in `, Date.now() - time2, 'ms');
            this.isLoading = false;
            this.logResults('Total time loading zipped files from server ', Date.now() - time1, 'ms'); 
            this.updateButtonText('Load server zip', 'Load server');
        }); 
        
        this.resultText = this.createResultText('Logs:', 20, offset + height * 5).text;
        this.createButton('Print Usage', this.loadContainer, 20 + scaleW + offset, offset + height * 4.5, scaleW, scaleH * 0.5, () => {
            this.printUsageInfo();
        });
    }

    private logResults(message?: any, ...optionalParams: any[]): void {
        const params = optionalParams.length === 0 ? '': optionalParams.join(' ');
        console.log(message, params);
        if(this.resultText) {
            this.resultText.text += '\n  - ' + message + params;
        }
    }

    private updateButtonText(name: string, text: string): void {
        if (!this.buttonTextMap.has(name) || this.buttonTextMap.get(name) === undefined) {
            return;
        }

        this.buttonTextMap.get(name)!.text = text;
    }

    private createButton(name: string, container: Pixi.Container, x: number, y: number, w: number, h: number, callback: () => void): { button:  Pixi.Container, text: Pixi.Text } {
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
        // container.on('click', async () => {
        //     callback();
        // });
        container.on('pointerup', async () => {
            callback();
        });
        container.addChild(g1);
        container.addChild(text);
        this.container.addChild(container);

        return { button: container, text };
    }

    private createResultText(name: string, x: number, y: number): { text: Pixi.Text } {
        const text = new Pixi.Text(name, {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xffffff,
            strokeThickness: 4,
            align: 'left',
        });
        text.position.set(x, y);

        this.container.addChild(text);

        return { text };
    }

    private async loadResourcesFromZip(): Promise<void> {
        const texturePaths = getTextureAssetPaths(this.ktx2Type);
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

    public printUsageInfo(): void {
        // Get the WebGL context
        const canvas = document.getElementById("fflate-ktx2") as HTMLCanvasElement;
        let gl = canvas.getContext("webgl");
        if (!gl) {
            gl = canvas.getContext("webgl2");
        }

        if (!gl) {
            this.logResults("Unable to initialize WebGL. Your browser may not support it.");
        } else {
            // Check for the WEBGL_debug_renderer_info extension
            const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");

            if (debugInfo) {
                // Get GPU information
                const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

                this.logResults("GPU Vendor: ", vendor);
                this.logResults("GPU Renderer: ", renderer);
            } else {
                this.logResults("WEBGL_debug_renderer_info extension not supported.");
            }

            // Check for the WEBGL_memory_info extension
            const memoryInfo = gl.getExtension("WEBGL_memory_info");

            if (memoryInfo) {
                // Get GPU memory information
                const memory = gl.getParameter(memoryInfo.WEBGL_MEMORY_INFO_TOTAL_AVAILABLE_MEMORY_WEBGL);

                this.logResults("Total Available GPU Memory: ", memory, "bytes");
            } else {
                this.logResults("WEBGL_memory_info extension not supported.");
            }
        }
    }
}
