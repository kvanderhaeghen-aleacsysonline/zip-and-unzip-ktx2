import * as Pixi from 'pixi.js';
import { assetsKTXTestPaths } from './constants/constants';

export class KTXTestView {
    private container: Pixi.Container = new Pixi.Container();
    private lastPosition: Pixi.Point;
    private mousePosition: Pixi.Point;
    private sprites: Pixi.Sprite[] = []
    private texts: Pixi.Text[] = []

    private readonly columnCount = 4;
    private readonly spacing = 10;
    private zoomFactor = 1.0;
    private isDragging = false;

    public init(app: Pixi.Application): void {
        this.container.interactive = true;
        app.stage.addChildAt(this.container, 0);

        // Mouse click movement
        window.addEventListener('pointerdown', (event) => {
            if (event.target === app.view) {
                this.isDragging = true;
                this.lastPosition = new Pixi.Point(event.clientX, event.clientY);
            }
        });
    
        window.addEventListener('pointerup', () => {
            this.isDragging = false;
        });
    
        window.addEventListener('pointermove', (event) => {
            this.mousePosition = new Pixi.Point(event.clientX, event.clientY);
            if (this.isDragging) {
                const deltaX = this.mousePosition.x - this.lastPosition.x;
                const deltaY = this.mousePosition.y - this.lastPosition.y;
                this.container.x += deltaX;
                this.container.y += deltaY;
                this.lastPosition = this.mousePosition;
            }
        });

        document.addEventListener('wheel', (event) => {
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
    }

    public async createTextures (): Promise<void> {
        return new Promise<void>((res) => {
            assetsKTXTestPaths.map(async (path, index) => {
                const texture = await Pixi.Assets.load(path);
                const sprite = new Pixi.Sprite(texture);
                sprite.anchor.set(0.5);
        
                // Calculate position in the grid
                const row = Math.floor(index / this.columnCount);
                const column = index % this.columnCount;
        
                // Set position with spacing
                sprite.x = column * (sprite.width + this.spacing) + sprite.width / 2;
                sprite.y = row * (sprite.height + this.spacing) + sprite.height / 2;
                this.container.addChild(sprite);
        
                // Create Pixi text for texture name
                const fileSize = (await this.getFileSize(path)).toFixed(2);
                const text = new Pixi.Text(`${path}\nSize: ${fileSize} Kb`, { fill: 'white', align: 'center' });
                text.anchor.set(0.5);
                text.position.set(sprite.x, sprite.y - sprite.height / 2 + 25); // Adjust the offset as needed
                this.container.addChild(text);
        
                this.texts.push(text);
                this.sprites.push(sprite);
                return sprite;
            });
            res();
        });
    }

    private async getFileSize(path: string):  Promise<number>{
        const response = await fetch(path);
        const blob = await response.blob();
        const fileSizeInBytes = blob.size;
        const fileSizeInKB = fileSizeInBytes / 1024; // Convert to kilobytes
        return fileSizeInKB; // Limit decimal places to 2
    }

    public dispose(): void {
        for (let i = 0; i < this.sprites.length; i++) {
            this.sprites[i].removeFromParent();
            this.sprites[i].destroy();
        }
        for (let i = 0; i < this.texts.length; i++) {
            this.texts[i].removeFromParent();
            this.texts[i].destroy();
        }
        this.sprites.splice(0);
        this.texts.splice(0);

        this.zoomFactor = 1.0;
        this.container.scale.set(this.zoomFactor);
        this.container.position.set(0, 0);
    }
}
