import * as Pixi from 'pixi.js';
import { ZippedResource } from './models/zippedResource';
import { Howl } from 'howler';
import _ from 'lodash';
import { KTX2Parser, detectKTX2, loadKTX2, resolveKTX2TextureUrl } from 'pixi-basis-ktx2';
import { assetsSoundPaths, getKTX2TypePath, getTextureAssetPaths, serverUrlKtx2Etc1s, serverUrlKtx2Uastc, serverUrlNormal } from './constants/constants';
import { KTX2Types } from './types/compressionTypes';
import { KTXTestView } from './ktxTestView';

export interface IProject {
    launch(): void;
}

export class NamedSprite extends Pixi.Sprite {
    public name: string = '';

    constructor() {
        super();
    }
}

export class Project implements IProject {
    private zipperResource: ZippedResource;
    private container: Pixi.Container;
    private canvasApp: Pixi.Application<HTMLCanvasElement>;

    private pixiTextures: Pixi.Texture<Pixi.Resource>[];
    private pixiSprites: NamedSprite[];
    private howlSounds: Howl[];

    private contentContainer: Pixi.Container;
    private saveContainer: Pixi.Container;
    private loadContainer: Pixi.Container;
    private soundContainer: Pixi.Container;
    private buttonTextMap: Map<string, Pixi.Text>;
    private resultText?: Pixi.Text;

    private ktxTestViewer: KTXTestView = new KTXTestView();

    private ktx2Type?: KTX2Types;
    private isSaving = false;
    private isLoading = false;
    private isSpritesTest = false;
    private ktxBtnTxt = 'KTX2 Disabled';
    private href = window.location.origin + window.location.pathname.replace('index.html','');

    public async launch(): Promise<void> {
        await this.loadKTX2Transcoder();

        this.canvasApp = new Pixi.Application<HTMLCanvasElement>({ background: '#1099bb', powerPreference:'high-performance', width: window.innerWidth - 20, height:window.innerHeight - 20 });
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

        window.addEventListener("resize", (event) => {
            this.canvasApp.view.width =  window.innerWidth - 20;
            this.canvasApp.view.height = window.innerHeight - 20 
        });

        this.ktxTestViewer.init(this.canvasApp);
    }


    public async loadKTX2Transcoder(): Promise<void> {
        await KTX2Parser.loadTranscoder(this.href + '/basis_transcoder.js', this.href + '/basis_transcoder.wasm');
        Pixi.Assets.detections.push(detectKTX2);
        Pixi.Assets.loader.parsers.push(loadKTX2);
        Pixi.Assets.resolver.parsers.push(resolveKTX2TextureUrl);
    }

    private createButtons(): void {
        const offset = 20;
        const width = 128;
        const height = 48;
        const scaleW = width * 1.5;
        const scaleH = 56;
        
        this.createButton('Save', this.saveContainer, 20, offset, scaleW, scaleH, 24, async () => {
            if (this.isSaving) return;
            this.isSaving = true;
            this.isSpritesTest = false;
            this.disposeAll();
            this.zipperResource.resetZip();

            const addon = this.ktx2Type ? "[Has KTX2 textures: " + this.ktx2Type?.toUpperCase() + "]" : "";
            this.logResults('Saving... ' + addon);
            this.updateButtonText('Save', 'saving...');
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

        this.createButton('Sound', this.loadContainer, 20 + scaleW + offset, offset, scaleW  * 0.45, scaleH, 24, async () => {
            _.sample(this.howlSounds)?.play();
        });

        this.createButton('Clear\nAll', this.loadContainer, 20 + scaleW + (scaleW  * 0.45) + (offset * 2), offset, scaleW  * 0.45, scaleH, 20, async () => {
            this.isSpritesTest = false;
            this.disposeAll();
            this.zipperResource.resetUnzip();
            this.zipperResource.resetZip();
            this.resultText!.text = 'Logs:';
            this.logResults('Cleared all sprites & logs');
        });

        const ktx2Btn = this.createButton(this.ktxBtnTxt, this.loadContainer, 20, offset + height * 1.5 , scaleW, scaleH, 24, async () => {
            this.isSpritesTest = false;
            this.disposeAll();

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
                const url = this.href  + getKTX2TypePath(this.ktx2Type).replace('./','/') + '/KTX.ktx2';
                const texture: Pixi.Texture = await Pixi.Assets.load(url);
                this.pixiTextures.push(texture);
                const sprite = new Pixi.Sprite(texture) as NamedSprite;
                sprite.name = 'KTX.ktx2';
                sprite.position.set(
                    _.random(texture.width * 0.5, this.canvasApp.screen.width - texture.width * 0.5),
                    _.random(texture.height * 0.5, this.canvasApp.screen.height - texture.height * 0.5)
                );
                this.pixiSprites.push(sprite);
                this.contentContainer.addChild(sprite);
            }
        });

        this.createButton('Load normal', this.soundContainer, 20  + scaleW + offset, offset + height * 1.5 , scaleW, scaleH, 24, async () => {
            if (this.isLoading) return;
            this.isLoading = true;
            this.isSpritesTest = false;
            this.disposeAll();
            this.zipperResource.resetUnzip();
            this.logResults('Loading...');
            this.updateButtonText('Load normal', 'loading...');
            
            const time1 = Date.now();
            await this.createResources();
            this.isLoading = false;
            const imageExt = this.ktx2Type ? 'KTX2_' + this.ktx2Type?.toUpperCase() :'PNG/JPEG'
            this.logResults(`Total time loading files from assets [${imageExt}] `, Date.now() - time1, 'ms');
            this.updateButtonText('Load normal', 'Load normal');
        });

        this.createButton('Load local zip', this.soundContainer, 20, offset + height * 3 , scaleW, scaleH, 24, async () => {
            if (this.isLoading) return;
            this.isLoading = true;
            this.isSpritesTest = false;
            this.disposeAll();
            this.zipperResource.resetUnzip();
            this.logResults('Loading...');
            this.updateButtonText('Load local zip', 'loading...');

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

        this.createButton('Load server zip', this.soundContainer, 20 + scaleW + offset, offset + height * 3, scaleW, scaleH, 24, async () => {
            if (this.isLoading) return;
            this.isLoading = true;
            this.isSpritesTest = false;
            this.disposeAll();
            this.zipperResource.resetUnzip();
            this.logResults('Loading...');
            this.updateButtonText('Load server zip', 'loading...');

            const time1 = Date.now();
            const url = this.ktx2Type ? (this.ktx2Type === KTX2Types.ETC1S ? serverUrlKtx2Etc1s : serverUrlKtx2Uastc) : serverUrlNormal;
            const timestamp = new Date().getTime();
            const data = await fetch(url + `?${timestamp}`).then(
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
        
        this.resultText = this.createResultText('Logs:', 20, offset + height * 6).text;

        // this.createButton('Print Usage', this.loadContainer, 20 + scaleW + offset, offset + height * 4.5, scaleW, scaleH * 0.5, () => {
        //     this.printUsageInfo();
        // });

        this.createButton('Quality\nSprite', this.loadContainer, 20, offset + height * 4.5, scaleW * 0.45, scaleH, 18, async () => {
            this.isSpritesTest = false;
            this.disposeAll();

            this.logResults('Loading quality sprite test...');
            await this.ktxTestViewer.createQualityTextures();
            this.logResults('Quality sprites loaded!');
        });

        this.createButton('Quality\nAnim', this.loadContainer, 20 + (scaleW  * 0.45) + offset, offset + height * 4.5, scaleW * 0.45, scaleH, 18, async () => {
            this.isSpritesTest = false;
            this.disposeAll();

            this.logResults('Loading quality animation test...');
            await this.ktxTestViewer.createQualityAnimations(0.2);
            this.logResults('Quality animations loaded!');
        });

        this.createButton('Test\nSprites', this.loadContainer, 20 + scaleW + offset, offset + height * 4.5, scaleW * 0.45, scaleH, 18, async () => {
            if (!this.isSpritesTest) this.disposeAll();

            const imageExt = this.ktx2Type ? 'KTX2_' + this.ktx2Type.toUpperCase() :'PNG'
            this.logResults(`Loading 1000 ${imageExt} sprites...`);
            await this.ktxTestViewer.createTestSprites(1000, this.ktx2Type);
            this.logResults(`${imageExt} sprites loaded!`);
            this.isSpritesTest = true;
        });

        this.createButton('Test\nAnims', this.loadContainer, 20 + scaleW + (scaleW  * 0.45) + (offset * 2), offset + height * 4.5, scaleW * 0.45, scaleH, 18, async () => {
            if (!this.isSpritesTest) this.disposeAll();

            const imageExt = this.ktx2Type ? 'KTX2_' + this.ktx2Type.toUpperCase() :'PNG'
            const loadText = this.isSpritesTest ? 'Adding' : 'Loading';
            this.logResults(`${loadText} 1000 ${imageExt} animation...`);
            await this.ktxTestViewer.createTestAnimation(1000, this.ktx2Type, 0.2);
            this.logResults(`${imageExt} animation loaded!`);
            this.isSpritesTest = true;
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

    private createButton(name: string, container: Pixi.Container, x: number, y: number, w: number, h: number, fontSize: number, callback: () => void): { button:  Pixi.Container, text: Pixi.Text } {
        const g1 = new Pixi.Graphics();
        g1.beginFill(0x000000, 0.9);
        g1.drawRect(0, 0, w, h);
        g1.endFill();

        const text = new Pixi.Text(name, {
            fontFamily: 'Arial',
            fontSize: fontSize,
            fill: 0xffffff,
            align: 'center',
        });
        text.anchor.set(0.5, 0.5);
        text.position.set(w * 0.5, h * 0.5);
        this.buttonTextMap.set(name, text);

        container = new Pixi.Container();
        container.hitArea = new Pixi.Rectangle(0, 0, w, h);
        container.eventMode = 'dynamic';
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

    
    public async createResources(): Promise<void> {
        const texturePaths = getTextureAssetPaths(this.ktx2Type);
        const length = texturePaths.length;
        const timestamp = new Date().getTime();
        for (let i = 0; i < length; i++) {
            const texturePath = this.href + texturePaths[i].replace('./','') + `?${timestamp}`;
            try {
                const pixiTexture = await Pixi.Assets.load(texturePath);
                this.pixiTextures.push(pixiTexture);
                const pixiSprite = new Pixi.Sprite(pixiTexture) as NamedSprite;
                pixiSprite.name = texturePaths[i];
                this.makeDraggableSprite(pixiSprite);
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
        for (let i = 0; i < length2; i++) {
            const timestamp = new Date().getTime();
            const soundPath = this.href + assetsSoundPaths[i].replace('./','') + `?${timestamp}`;
            const sound = new Howl({ src: soundPath, autoplay: false, loop: false, volume: 0.5 });
            this.howlSounds.push(sound);
        }
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
            const sprite = new Pixi.Sprite(texture) as NamedSprite;
            sprite.name = texturePaths[i];
            this.makeDraggableSprite(sprite);
            sprite.position.set(
                _.random(texture.width * 0.5, this.canvasApp.screen.width - texture.width * 0.5),
                _.random(texture.height * 0.5, this.canvasApp.screen.height - texture.height * 0.5)
            );
            this.pixiSprites.push(sprite);
            this.contentContainer.addChild(sprite);
        }
        for (let i = 0; i < assetsSoundPaths.length; i++) {
            const audio = this.zipperResource.getAudio(assetsSoundPaths[i]);
            if (!audio) {
                console.warn(`Sound [${assetsSoundPaths[i]}] not found! Continuing...`);
                continue;
            }
            this.howlSounds.push(audio);
        }
    }

    private makeDraggableSprite(sprite: Pixi.Sprite): void {
        sprite.anchor.set(0.5);
        sprite.eventMode = 'dynamic';
        sprite.on('pointerdown', this.onDragStart, sprite)
            .on('pointerup', this.onDragEnd, sprite)
            .on('pointerupoutside', this.onDragEnd, sprite)
            .on('pointermove', this.onDragMove, sprite);
    }
    private dragTarget?: any;
    private tooltipText?: Pixi.Text;
    private onDragStart(): void {
        this.dragTarget = this;
        const container =  this.dragTarget.parent as Pixi.Container;
        container?.setChildIndex(this.dragTarget, container.children.length - 1);

        const sprite = (this.dragTarget as NamedSprite);
        this.tooltipText = new Pixi.Text(sprite.name, { fontSize: 15, fill: 'white', align: 'center' });
        this.tooltipText.anchor.set(0.5);
        this.tooltipText.position.set(0, -15);
        sprite.addChild(this.tooltipText);
    }
    private onDragEnd(): void {
        this.dragTarget = undefined;
        this.tooltipText?.destroy();
        this.tooltipText = undefined;
    }
    private onDragMove(event: Pixi.FederatedPointerEvent): void {
        if (this.dragTarget) {
            this.dragTarget.parent?.toLocal(event.global, null, this.dragTarget.position);
        }
    }

    public disposeAll(): void {
        this.disposeSounds();
        this.disposeTextures();
        this.ktxTestViewer.dispose();
    }

    public disposeSounds(): void {
        for (let i = 0; i < this.howlSounds.length; i++) {
            this.howlSounds[i].unload();
            delete this.howlSounds[i];
        }
        this.howlSounds.splice(0);
    }

    public disposeTextures(): void {
        for (let i = 0; i < this.pixiTextures.length; i++) {
            Pixi.Texture.removeFromCache(this.pixiTextures[i]);
            delete this.pixiTextures[i];
            this.pixiSprites[i].removeFromParent();
            this.pixiSprites[i].destroy();
        }
        this.pixiTextures.splice(0);
        this.pixiSprites.splice(0);
    }

    private getWebGLContext(): WebGLRenderingContext | WebGL2RenderingContext  {
        const canvas = document.getElementById("fflate-ktx2") as HTMLCanvasElement;
        let gl = canvas.getContext("webgl");
        if (!gl) {
            gl = canvas.getContext("webgl2");
        }
        return gl!;
    }

    public printUsageInfo(): void {
        // Get the WebGL context
        let gl = this.getWebGLContext();

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
