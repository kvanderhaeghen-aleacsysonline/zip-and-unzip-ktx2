import * as Pixi from 'pixi.js';
import { getAnimationAssetPaths, getAssetsKTXTestPaths } from './constants/constants';
import _ from 'lodash';
import { KTX2Types } from './types/compressionTypes';

export class KTXTestView {
    private canvasApp: Pixi.Application;
    private container: Pixi.Container = new Pixi.Container();
    private lastPosition: Pixi.Point;
    private mousePosition: Pixi.Point;
    private testObjects: { sprites: Pixi.Sprite[]; animations: Pixi.AnimatedSprite[]; texts: Pixi.Text[] } = {
        sprites: [],
        animations: [],
        texts: [],
    };

    private readonly columnCount = 4;
    private readonly spacing = 10;
    private zoomFactor = 1.0;
    private initialPinchDistance = 0;
    private initialScale = 0;
    private isPointerDown = false;
    private isDragging = false;
    private isPinching = false;

    public init(app: Pixi.Application): void {
        this.canvasApp = app;
        this.container.eventMode = 'dynamic';
        app.stage.addChildAt(this.container, 0);

        // Mouse click movement
        window.addEventListener('pointerdown', (event) => {
            if (event.target === app.canvas) {
                this.lastPosition = new Pixi.Point(event.clientX, event.clientY);
                this.isPointerDown = true;
            }
        });

        window.addEventListener('pointermove', (event) => {
            if (this.isPinching) return;
            if (this.isPointerDown) {
                this.isDragging = true;
                this.mousePosition = new Pixi.Point(event.clientX, event.clientY);
                const deltaX = this.mousePosition.x - this.lastPosition.x;
                const deltaY = this.mousePosition.y - this.lastPosition.y;
                this.container.x += deltaX;
                this.container.y += deltaY;
                this.lastPosition = this.mousePosition;
            }
        });

        window.addEventListener('pointerup', () => {
            this.isDragging = false;
            this.isPointerDown = false;
        });

        document.addEventListener('wheel', (event) => {
            if (!this.container || !this.mousePosition) return;
            const zoomSpeed = 0.1;

            // Calculate the mouse position relative to the container
            const containerMouseX = this.mousePosition.x - this.container.x;
            const containerMouseY = this.mousePosition.y - this.container.y;

            // Adjust container position to keep the mouse position stable during zoom
            const newContainerMouseX = containerMouseX * this.container.scale.x;
            const newContainerMouseY = containerMouseY * this.container.scale.y;

            if (event.deltaY > 0) {
                // Zoom out
                this.zoomFactor *= 1 - zoomSpeed;
            } else {
                // Zoom in
                this.zoomFactor *= 1 + zoomSpeed;
            }

            this.container.scale.set(this.zoomFactor);
            this.container.position.set(containerMouseX - newContainerMouseX, containerMouseY - newContainerMouseY);
        });

        window.addEventListener('touchstart', (event) => {
            if (event.touches.length === 2) {
                this.isPinching = true;

                const touch1 = event.touches[0];
                const touch2 = event.touches[1];
                this.initialPinchDistance = this.getDistance(touch1, touch2);
                this.initialScale = this.container.scale.x;
            }
        });
        window.addEventListener('touchmove', (event) => {
            if (this.isDragging) return;
            if (event.touches.length === 2) {
                const touch1 = event.touches[0];
                const touch2 = event.touches[1];
                const currentPinchDistance = this.getDistance(touch1, touch2);

                this.container.scale.set(this.initialScale * (currentPinchDistance / this.initialPinchDistance));
            }
        });
        window.addEventListener('touchend', () => {
            this.initialPinchDistance = 0;
            this.initialScale = 1;
            this.isPinching = false;
        });
    }

    private getDistance(touch1: Touch, touch2: Touch): number {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    public async createQualityTextures(isPOTS: boolean): Promise<void> {
        const paths = getAssetsKTXTestPaths(isPOTS);
        return new Promise<void>((res) => {
            paths.map(async (path, index) => {
                await this.setQualitySprite(path, index);
                if (index === paths.length - 1) {
                    res();
                }
            });
        });
    }

    public async createQualityAnimations(isPOTS: boolean, animationSpeed = 1): Promise<void> {
        return new Promise<void>((res) => {
            const allPaths: string[][] = [
                getAnimationAssetPaths(isPOTS),
                getAnimationAssetPaths(isPOTS, KTX2Types.ETC1S),
                getAnimationAssetPaths(isPOTS, KTX2Types.UASTC),
            ];
            allPaths.map(async (paths, index) => {
                await this.setQualitySprite(paths, index, animationSpeed);
                if (index === allPaths.length - 1) {
                    res();
                }
            });
        });
    }

    private async setQualitySprite(
        path: string | string[],
        index: number,
        animationSpeed = 1
    ): Promise<Pixi.Sprite | Pixi.AnimatedSprite | undefined> {
        let sprite: Pixi.Sprite | Pixi.AnimatedSprite | undefined = undefined;
        if (Array.isArray(path)) {
            const textureArray = await this.getAnimationTextures(path);
            sprite = new Pixi.AnimatedSprite(textureArray, true);
            this.testObjects.animations.push(sprite as Pixi.AnimatedSprite);

            (sprite as Pixi.AnimatedSprite).loop = true;
            (sprite as Pixi.AnimatedSprite).animationSpeed = animationSpeed;
            (sprite as Pixi.AnimatedSprite).play();
        } else {
            const texture = await Pixi.Assets.load<Pixi.Texture>(path);
            sprite = new Pixi.Sprite(texture);
            this.testObjects.sprites.push(sprite as Pixi.Sprite);
        }
        sprite.anchor.set(0.5);

        // Calculate position in the grid
        const row = Math.floor(index / this.columnCount);
        const column = index % this.columnCount;

        // Set position with spacing
        sprite.x = column * (sprite.width + this.spacing) + sprite.width / 2;
        sprite.y = row * (sprite.height + this.spacing) + sprite.height / 2;
        this.container.addChild(sprite);

        // Create Pixi text for texture name
        const currentPath = Array.isArray(path) ? path[0] : path;
        const frameCount = Array.isArray(path) ? path.length : 1;
        const fileSize = (await this.getFileSize(currentPath)) * frameCount;
        const text = new Pixi.Text({
            text: `${currentPath}\nSize: ${fileSize.toFixed(2)} Kb | Resolution: ${sprite.width}x${sprite.height}`,
            style: {
                fill: 'white',
                align: 'center',
                fontSize: 28,
                stroke: 'black',
            },
        });
        text.anchor.set(0.5);
        text.position.set(sprite.x, sprite.y - sprite.height / 2 + 25); // Adjust the offset as needed
        this.container.addChild(text);
        this.testObjects.texts.push(text);

        return sprite;
    }

    public async createTestSprites(spriteCount: number, isPOTS: boolean, type?: KTX2Types): Promise<void> {
        for (let i = 0; i < spriteCount; i++) {
            const paths = getAssetsKTXTestPaths(isPOTS);
            const path = type === undefined ? paths[0] : type === KTX2Types.ETC1S ? paths[1] : paths[4];
            const texture = await Pixi.Assets.load(path);
            const sprite = new Pixi.Sprite(texture);
            sprite.interactive = false;
            sprite.scale.set(0.1);
            sprite.anchor.set(0.5);
            sprite.position.set(
                _.random(texture.width * 0.05, this.canvasApp.screen.width - texture.width * 0.05),
                _.random(texture.height * 0.05, this.canvasApp.screen.height - texture.height * 0.05)
            );

            this.container.addChild(sprite);
            this.testObjects.sprites.push(sprite);
        }
    }

    public async createTestAnimation(spriteCount: number, isPOTS: boolean, type?: KTX2Types, animationSpeed = 1.0): Promise<void> {
        const spritePaths = getAnimationAssetPaths(isPOTS, type);
        const textureArray = await this.getAnimationTextures(spritePaths);

        for (let i = 0; i < spriteCount; i++) {
            const sprite = new Pixi.AnimatedSprite(textureArray);
            sprite.scale.set(0.1);
            sprite.anchor.set(0.5);
            sprite.position.set(
                _.random(sprite.width * 0.05, this.canvasApp.screen.width - sprite.width * 0.05),
                _.random(sprite.height * 0.05, this.canvasApp.screen.height - sprite.height * 0.05)
            );
            sprite.autoUpdate = true;
            sprite.loop = true;
            sprite.animationSpeed = animationSpeed;
            sprite.play();

            this.container.addChild(sprite);
            this.testObjects.animations.push(sprite);
        }
    }

    public async getAnimationTextures(paths: string[]): Promise<Pixi.Texture[]> {
        const textureArray: Pixi.Texture[] = [];
        for (let i = 0; i < paths.length; i++) {
            // To avoid Pixi.Texture being another instance, we need to create a new texture from a loaded base texture for our KTX2 texture.
            // This way the object was made with the same constructor instead of another one, because of it being seen as another instance.
            const texture = await Pixi.Assets.load<Pixi.Texture>(paths[i]);
            textureArray.push(texture);
        }
        return Promise.resolve(textureArray);
    }

    private async getFileSize(path: string): Promise<number> {
        const response = await fetch(path);
        const blob = await response.blob();
        const fileSizeInBytes = blob.size;
        const fileSizeInKB = fileSizeInBytes / 1024; // Convert to kilobytes
        return fileSizeInKB; // Limit decimal places to 2
    }

    public dispose(): void {
        for (let i = 0; i < this.testObjects.sprites.length; i++) {
            this.testObjects.sprites[i].removeFromParent();
            this.testObjects.sprites[i].destroy();
        }
        for (let i = 0; i < this.testObjects.animations.length; i++) {
            this.testObjects.animations[i].removeFromParent();
            this.testObjects.animations[i].destroy();
        }
        for (let i = 0; i < this.testObjects.texts.length; i++) {
            this.testObjects.texts[i].removeFromParent();
            this.testObjects.texts[i].destroy();
        }
        this.testObjects.sprites.splice(0);
        this.testObjects.animations.splice(0);
        this.testObjects.texts.splice(0);

        this.zoomFactor = 1.0;
        this.container.scale.set(this.zoomFactor);
        this.container.position.set(0, 0);
    }
}
