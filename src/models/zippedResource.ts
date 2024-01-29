import { ALPHA_MODES, BufferResource, FORMATS, MIPMAP_MODES, Resource, TYPES } from '@pixi/core';
import * as fflate from 'fflate';
import { Howl } from 'howler';
import { BASIS_FORMAT_TO_INTERNAL_FORMAT, BASIS_FORMAT_TO_TYPE, BASIS_FORMATS, KTX2Parser, loadKTX2, TranscoderWorkerKTX2, loadKTX2BufferToTexture } from 'pixi-basis-ktx2';
import { CompressedTextureResource } from '@pixi/compressed-textures'
import * as Pixi from 'Pixi.js';
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
        const fullName = pathArray[pathArray.length - 1];

        const isKtx2 = fullName.includes('ktx2');
        if (isKtx2) {
            const texture = await this.getKTX2Texture(path, {});
            return texture;
        }
        const byteArr = this.unzipResource(fullName);
        if (!byteArr) return undefined;

        const byteStr = this.uint8ToBase64(byteArr!);
        const image = `data:image/png;base64,${byteStr}`;

        const texture = await Pixi.Texture.from(image);
        return texture;
    }

    public async getKTX2Texture(path: string, asset: Pixi.ResolvedAsset): Promise<Pixi.Texture | undefined> {
        const pathArray = path.split('/');
        const fullName = pathArray[pathArray.length - 1];

        const byteArr = this.unzipResource(fullName);
        if (!byteArr) return undefined;
        return (await loadKTX2BufferToTexture(byteArr!, fullName, asset, Pixi.Assets.loader));

        // await TranscoderWorkerKTX2.onTranscoderInitialized;
        // const resources = await KTX2Parser.transcode(byteArr!.buffer);
        // const type: TYPES | undefined = resources?.basisFormat ? BASIS_FORMAT_TO_TYPE[resources?.basisFormat] : undefined;
        // const format: FORMATS = resources?.basisFormat !== BASIS_FORMATS.cTFRGBA32 ? FORMATS.RGB : FORMATS.RGBA;

        // console.error(format);
        // console.error(!!(KTX2Parser.ktx2Binding && KTX2Parser.TranscoderWorker.wasmSource));

        // asset.format = 'ktx2';
        // asset.alias = [path];
        // asset.name = [path];
        // asset.src = path;
        // asset.srcs = path;
        // asset.loadParser = undefined;
        // asset.data = {};
        // const textures =
        //     resources?.map((resource) => {
        //         const base = new Pixi.BaseTexture(resource, {
        //             mipmap: resource instanceof CompressedTextureResource && resource.levels > 1 ? MIPMAP_MODES.ON_MANUAL : MIPMAP_MODES.OFF,
        //             alphaMode: ALPHA_MODES.NO_PREMULTIPLIED_ALPHA,
        //             type,
        //             format,
        //             ...asset.data,
        //         });
        //         const texture = Pixi.createTexture(base, Pixi.Assets.loader, path);
        //         console.error(texture);
        //         console.error(base);
        //         return texture;
        //     }) ?? [];

        // return textures[0];
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
