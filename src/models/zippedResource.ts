import * as fflate from 'fflate';

type CompressionLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export class ZippedResource {
    private zippedInfo: Uint8Array;
    private compressionLvl: CompressionLevel;
    private zipData: fflate.Zippable;

    private resourceMap: Map<string, object>;

    uint8ToBase64 = (arr: Uint8Array): string =>
        btoa(
            Array(arr.length)
                .fill('')
                .map((_, i) => String.fromCharCode(arr[i]))
                .join('')
        );

    public constructor(compressionLevel: CompressionLevel = 6) {
        this.compressionLvl = compressionLevel;
        this.zipData = {};
        this.resourceMap = new Map<string, object>();
    }

    public donwload(): void {
        const blob = new Blob([this.zippedInfo], { type: 'application/plain' });
        const blobUrl = URL.createObjectURL(blob);
        console.log('Generated Blob; object URL: %s', blobUrl);

        const downloadURL = (data: string, fileName: string) => {
            const a = document.createElement('a');
            a.href = data;
            a.download = fileName;
            document.body.appendChild(a);
            a.style.display = 'none';
            a.click();
            // a.remove();
        };
        downloadURL(blobUrl, 'test');
    }

    public async zipResource(path: string): Promise<void> {
        const buffer = await fetch(path).then((res) => res.arrayBuffer());
        const pathArr = path.split('/');
        const name = pathArr[pathArr.length - 1];
        this.zipData[name] = {};
        this.zipData[name] = [
            new Uint8Array(buffer),
            {
                level: this.compressionLvl,
                mem: 12,
            },
        ];
        this.zippedInfo = fflate.zipSync(this.zipData);
    }

    public setZipData(data: Uint8Array): void {
        this.zippedInfo = data;
    }

    public async unzipResource(name: string): Promise<Uint8Array | undefined> {
        let orgSize = 0;
        let size = 0;
        const unzipped = fflate.unzipSync(this.zippedInfo, {
            filter(file) {
                orgSize += file.originalSize;
                size += file.size;
                return file.name === name;
            },
        });
        // console.log(orgSize / 1024 / 1024, size / 1024 / 1024);
        return unzipped[name];
    }

    public async getTexture(name: string, extensions: string = '.png'): Promise<HTMLImageElement | undefined> {
        const fullname = name + extensions;
        const element = this.hasElement<HTMLImageElement>(fullname);
        if (element !== undefined) {
            return element;
        } else {
            const image = document.createElement('img');
            const byteArr = await this.unzipResource(fullname);
            if (byteArr === undefined) return;
            const byteStr = this.uint8ToBase64(byteArr!);
            // const byteStr = fflate.strFromU8(byteArr!);
            image.src = `data:image/png;base64,${byteStr}`;
            this.resourceMap.set(fullname, image);
            document.body.appendChild(image);
            return image;
        }
    }

    public async getAudio(name: string, extensions: string = '.mp3'): Promise<HTMLAudioElement> {
        const fullname = name + extensions;
        const element = this.hasElement<HTMLAudioElement>(fullname);
        if (element !== undefined) {
            const audioElement = this.resourceMap.get(fullname) as HTMLAudioElement;
            audioElement.pause();
            audioElement.currentTime = 0;
            return audioElement;
        } else {
            const audioResource = await this.unzipResource(fullname);
            const newAudio = new Audio();
            const blob = new Blob([audioResource!], { type: 'audio/mp3' });
            newAudio.src = window.URL.createObjectURL(blob);
            newAudio.muted = false;
            newAudio.autoplay = true;

            this.resourceMap.set(fullname, newAudio);
            return newAudio;
        }
    }

    private hasElement<T>(name: string): T | undefined {
        if (this.resourceMap.has(name)) {
            return this.resourceMap.get(name) as T;
        } else {
            return undefined;
        }
    }
}
