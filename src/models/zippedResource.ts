import * as fflate from 'fflate';
import { Howl } from 'howler';
import { loadKTX2BufferToTexture } from 'pixi-basis-ktx2';
import * as Pixi from 'pixi.js';
import _ from 'lodash';

type CompressionLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export class ZippedResource {
    private zipData: Uint8Array;
    private compressionLvl: CompressionLevel;
    private zipInfo: fflate.Zippable;
    private unzipped?: fflate.Unzipped;

    uint8ToBase64 = (arr: Uint8Array): string =>
        btoa(
            Array(arr.length)
                .fill('')
                .map((_, i) => String.fromCharCode(arr[i]))
                .join('')
        );

    public constructor(compressionLevel: CompressionLevel = 6) {
        this.compressionLvl = compressionLevel;
        this.zipInfo = {};
    }

    public resetZip(): void  {
        this.zipInfo = {};
    }

    public resetUnzip(): void {
        if(this.unzipped) {
            const keys = Object.keys(this.unzipped);
            keys.forEach((key)=> {
                delete this.unzipped![key];
            });
            this.unzipped = undefined;
        }
    }

    public download(): void {
        this.zipUp();
        const blob = new Blob([this.zipData], { type: 'application/plain' });
        const blobUrl = URL.createObjectURL(blob);
        console.log('Generated Blob; object URL: %s', blobUrl);

        const downloadURL = (data: string, fileName: string) => {
            const a = document.createElement('a');
            a.href = data;
            a.download = fileName;
            document.body.appendChild(a);
            a.style.display = 'none';
            a.click();
        };
        downloadURL(blobUrl, 'bundle.alon');
    }

    public async zipResource(path: string): Promise<void> {
        const buffer = await fetch(path,  {
            method: 'get',
            mode: 'no-cors',
        }).then((res) => res.arrayBuffer());
        const pathArr = path.split('/');
        const name = pathArr[pathArr.length - 1];
        this.zipInfo[name] = {};
        this.zipInfo[name] = [
            new Uint8Array(buffer),
            {
                level: this.compressionLvl,
                mem: 12,
            },
        ];
    }

    public zipUp(): void {
        this.setZipData(fflate.zipSync(this.zipInfo));
    }

    public setZipData(data: Uint8Array): void {
        this.zipData = data;
    }

    public unzipResource(name: string): Uint8Array | undefined {
        if (this.unzipped === undefined) {
            this.unzipped = fflate.unzipSync(this.zipData);
        }
        return this.unzipped[name];
    }

    public async getPixiTexture(path: string): Promise<Pixi.Texture | undefined> {
        const pathArray = path.split('/');
        const fileName = pathArray[pathArray.length - 1];

        const isKtx2 = fileName.includes('ktx2');
        if (isKtx2) {
            const texture = await this.getKTX2Texture(fileName);
            return texture;
        }

        const texture = await this.getNormalTexture(fileName);
        return texture;
    }

    public async getNormalTexture(fileName: string): Promise<Pixi.Texture | undefined> {
        const byteArr = this.unzipResource(fileName);
        if (!byteArr) return undefined;

        const byteStr = this.uint8ToBase64(byteArr!);
        const image = `data:image/png;base64,${byteStr}`;
        return Pixi.Texture.from(image);
    }

    public async getKTX2Texture(fileName: string): Promise<Pixi.Texture | undefined> {
        const byteArr = this.unzipResource(fileName);
        if (!byteArr) return undefined;

        return loadKTX2BufferToTexture(byteArr!, fileName, Pixi.Assets.loader);
    }

    public getAudio(path: string): Howl {
        const pathArray = path.split('/');
        const fullName = pathArray[pathArray.length - 1];
        const audioResource = this.unzipResource(fullName);

        const properties = fullName.split('.');

        const blob = new Blob([audioResource!], { type: 'audio/mp3' });
        const uri = window.URL.createObjectURL(blob);
        const howlSound = new Howl({ src: uri, autoplay: false, loop: false, volume: 0.5, format: properties[1] });
        return howlSound;
    }
}
