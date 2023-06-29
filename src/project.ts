import * as PIXI from 'pixi.js';
import { ZippedResource } from './models/zippedResource';
import * as fs from 'fs';

export interface IProject {
    launch(): void;
}

export class TexturesContainer {}

export class Project implements IProject {
    public async launch(): Promise<void> {
        const app = new PIXI.Application<HTMLCanvasElement>({ background: '#1099bb', resizeTo: window });
        const container = new PIXI.Container();
        app.stage.addChild(container);

        const zipperResource = new ZippedResource();

        const saveButton = document.createElement('a');
        saveButton.text = 'Save';
        saveButton.style.padding = '5px 5px 5px 5px';
        saveButton.onclick = (event) => {
            zipperResource.donwload();
        };

        const loadButton = document.createElement('a');
        loadButton.text = 'Load';
        loadButton.onclick = (event) => {
            const str = fs.readFileSync('C:/Users/k.radino/Downloads/test', 'utf8');
            console.error(str);
        };

        document.body.appendChild(app.view);
        document.body.appendChild(document.createElement('hr'));
        document.body.appendChild(saveButton);
        document.body.appendChild(loadButton);
        document.body.appendChild(document.createElement('hr'));

        await zipperResource.zipResource('assets/pixijs.png');
        await zipperResource.zipResource('assets/textureAtlas/blueBonus/blueChanchu.png');
        await zipperResource.zipResource('assets/textureAtlas/main/die1.png');
        await zipperResource.zipResource('assets/textureAtlas/main/die2.png');
        await zipperResource.zipResource('assets/textureAtlas/main/die3.png');
        await zipperResource.zipResource('assets/textureAtlas/main/die4.png');
        await zipperResource.zipResource('assets/textureAtlas/main/die5.png');
        await zipperResource.zipResource('assets/textureAtlas/main/die6.png');
        await zipperResource.zipResource('assets/textureAtlas/main/die7.png');
        await zipperResource.zipResource('assets/textureAtlas/main/die8.png');
        await zipperResource.zipResource('assets/textureAtlas/main/die9.png');
        await zipperResource.zipResource('assets/textureAtlas/main/die10.png');
        await zipperResource.zipResource('assets/textureAtlas/main/die11.png');
        await zipperResource.zipResource('assets/textureAtlas/main/die12.png');
        await zipperResource.zipResource('assets/textureAtlas/main/die13.png');

        await zipperResource.zipResource('assets/soundHowl/soundBonus.mp3');
        await zipperResource.zipResource('assets/soundHowl/soundBonusEnd.mp3');
        await zipperResource.zipResource('assets/soundHowl/soundBonusIdleIntro.mp3');
        await zipperResource.zipResource('assets/soundHowl/soundBonusStart.mp3');

        const image = await zipperResource.getTexture('die8');
        if (image === undefined) return;
        image.addEventListener('click', async () => {
            var audio = await zipperResource.getAudio('soundBonus');
            audio.play();
        });
        const texture = PIXI.Texture.from(image);
        for (let i = 0; i < 25; i++) {
            const bunny = new PIXI.Sprite(texture);

            bunny.anchor.set(0.5);
            bunny.x = (i % 5) * 40;
            bunny.y = Math.floor(i / 5) * 40;
            container.addChild(bunny);
        }

        container.x = app.screen.width / 2;
        container.y = app.screen.height / 2;
        container.pivot.x = container.width / 2;
        container.pivot.y = container.height / 2;
    }
}
