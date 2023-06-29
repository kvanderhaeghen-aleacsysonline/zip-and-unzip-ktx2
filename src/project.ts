import * as PIXI from 'pixi.js';
import { ZippedResource } from './models/zippedResource';

export interface IProject {
    launch(): void;
}

export class TexturesContainer {}

export class Project implements IProject {
    public zipperResource: ZippedResource;
    public container: PIXI.Container;

    public async launch(): Promise<void> {
        const app = new PIXI.Application<HTMLCanvasElement>({ background: '#1099bb', resizeTo: window });
        this.container = new PIXI.Container();
        app.stage.addChild(this.container);

        this.zipperResource = new ZippedResource();

        const saveButton = document.createElement('a');
        saveButton.text = 'Save';
        saveButton.style.padding = '5px 5px 5px 5px';
        saveButton.onclick = (event) => {
            this.zipperResource.donwload();
        };

        const loadButton = document.createElement('a');
        loadButton.text = 'Load';
        loadButton.style.padding = '5px 5px 5px 5px';
        loadButton.onclick = (event) => {
            let input: HTMLInputElement = document.createElement('input');
            input.type = 'file';
            input.onchange = async (_) => {
                if (input.files === undefined) return;
                const arry = Array.from(input.files!);
                const binaryFile = arry[0];
                const buffer = await binaryFile.arrayBuffer();
                this.zipperResource.setZipData(new Uint8Array(buffer));
                this.update(app);
            };
            input.click();
        };

        const createButton = document.createElement('a');
        createButton.text = 'Create';
        createButton.style.padding = '5px 5px 5px 5px';
        createButton.onclick = async (event) => {
            await this.zipperResource.zipResource('assets/pixijs.png');
            await this.zipperResource.zipResource('assets/textureAtlas/blueBonus/blueChanchu.png');
            await this.zipperResource.zipResource('assets/textureAtlas/main/die1.png');
            await this.zipperResource.zipResource('assets/textureAtlas/main/die2.png');
            await this.zipperResource.zipResource('assets/textureAtlas/main/die3.png');
            await this.zipperResource.zipResource('assets/textureAtlas/main/die4.png');
            await this.zipperResource.zipResource('assets/textureAtlas/main/die5.png');
            await this.zipperResource.zipResource('assets/textureAtlas/main/die6.png');
            await this.zipperResource.zipResource('assets/textureAtlas/main/die7.png');
            await this.zipperResource.zipResource('assets/textureAtlas/main/die8.png');
            await this.zipperResource.zipResource('assets/textureAtlas/main/die9.png');
            await this.zipperResource.zipResource('assets/textureAtlas/main/die10.png');
            await this.zipperResource.zipResource('assets/textureAtlas/main/die11.png');
            await this.zipperResource.zipResource('assets/textureAtlas/main/die12.png');
            await this.zipperResource.zipResource('assets/textureAtlas/main/die13.png');
            await this.zipperResource.zipResource('assets/soundHowl/soundBonus.mp3');
            await this.zipperResource.zipResource('assets/soundHowl/soundBonusEnd.mp3');
            await this.zipperResource.zipResource('assets/soundHowl/soundBonusIdleIntro.mp3');
            await this.zipperResource.zipResource('assets/soundHowl/soundBonusStart.mp3');
            this.update(app);
        };

        document.body.appendChild(app.view);
        document.body.appendChild(document.createElement('hr'));
        document.body.appendChild(saveButton);
        document.body.appendChild(loadButton);
        document.body.appendChild(createButton);
        document.body.appendChild(document.createElement('hr'));
    }

    public async update(app: PIXI.Application<HTMLCanvasElement>): Promise<void> {
        const image = await this.zipperResource.getTexture('die8');
        if (image === undefined) return;
        image.addEventListener('click', async () => {
            var audio = await this.zipperResource.getAudio('soundBonus');
            audio.play();
        });
        const texture = PIXI.Texture.from(image);
        for (let i = 0; i < 25; i++) {
            const bunny = new PIXI.Sprite(texture);

            bunny.anchor.set(0.5);
            bunny.x = (i % 5) * 40;
            bunny.y = Math.floor(i / 5) * 40;
            this.container.addChild(bunny);
        }

        this.container.x = app.screen.width / 2;
        this.container.y = app.screen.height / 2;
        this.container.pivot.x = this.container.width / 2;
        this.container.pivot.y = this.container.height / 2;
    }
}
