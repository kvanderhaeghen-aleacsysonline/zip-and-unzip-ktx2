import * as Pixi from "pixi.js";
import { ZippedResource } from "./models/zippedResource";
import { Howl } from "howler";
import _ from "lodash";
//import { KTX2Parser } from 'pixi-basis-ktx2';
import {
  assetsSoundPaths,
  getKTX2TypePath,
  getTextureAssetPaths,
  serverUrlKtx2Etc1s,
  serverUrlKtx2Uastc,
  serverUrlNormal,
} from "./constants/constants";
import { KTX2Types } from "./types/compressionTypes";
import { KTXTestView } from "./ktxTestView";

export interface IProject {
  launch(): void;
}

export class Project implements IProject {
  private zipperResource: ZippedResource;
  private container: Pixi.Container;
  private canvasApp: Pixi.Application;

  private pixiTextures: Pixi.Texture[];
  private pixiSprites: Pixi.Sprite[];
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
  private isPOTS = false;
  private href =
    window.location.origin + window.location.pathname.replace("index.html", "");

  public async launch(): Promise<void> {
    const params = new URLSearchParams(window.location.search);
    const prefParam = (params.get("renderer") as "webgl" | "webgpu") ?? "webgl";

    this.loadKTX2Transcoder();

    this.canvasApp = new Pixi.Application();
    await this.canvasApp.init({
      background: "#1099bb",
      powerPreference: "high-performance",
      width: this.isMobileDevice ? 1920 : window.innerWidth - 20,
      height: this.isMobileDevice ? 1080 : window.innerHeight - 20,
      preference: prefParam,
      resolution: 1,
      antialias: false,
      hello: true,
      clearBeforeRender: true,
    });

    this.canvasApp.canvas.id = "fflate-ktx2";
    if (this.isMobileDevice) {
      this.canvasApp.canvas.style.position = "absolute";
      this.canvasApp.canvas.style.top = "40px";
      this.canvasApp.canvas.style.left = "40px";
    }

    this.container = new Pixi.Container();
    this.contentContainer = new Pixi.Container();
    this.buttonTextMap = new Map<string, Pixi.Text>();
    this.container.addChild(this.contentContainer);
    document.body.appendChild(this.canvasApp.canvas);

    this.pixiSprites = [];
    this.pixiTextures = [];
    this.howlSounds = [];
    this.canvasApp.stage.addChild(this.container);
    this.zipperResource = new ZippedResource();
    void this.createButtons();

    this.ktxTestViewer.init(this.canvasApp);
  }

  private get isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  }
  private calculateScaleRatio(): number {
    const standardWidth = 1920;
    const standardHeight = 1080;

    // Get current screen size
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Calculate scaling ratios
    const scaleX = screenWidth / standardWidth;
    const scaleY = screenHeight / standardHeight;
    return window.screen.orientation.type.includes("landscape")
      ? scaleX
      : scaleY;
  }

  private loadKTX2Transcoder(): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    Pixi.Assets.loader.parsers.push(Pixi.loadKTX2 as any);
    Pixi.Assets.resolver.parsers.push(Pixi.resolveCompressedTextureUrl);
  }

  private async printRenderer(): Promise<void> {
    const webGPUResult =
      (await Pixi.isWebGPUSupported()) && navigator.gpu !== undefined
        ? "Available"
        : "Unavailable";
    this.logResults(
      `WebGPU: ${webGPUResult} | Render type: ${Pixi.RendererType[this.canvasApp.renderer.type]}`,
    );
  }

  private createButtons(): void {
    const screenScale = 1; // this.calculateScaleRatio();
    const offset = 20 * screenScale;
    const width = 128 * screenScale;
    const height = 48 * screenScale;
    const scaleW = width * 1.5 * screenScale;
    const scaleH = 56 * screenScale;

    this.resultText = this.createResultText(
      "Logs:",
      20 * screenScale,
      20,
      offset + height * 6,
    ).text;
    void this.printRenderer();

    this.createButton(
      "Save",
      this.saveContainer,
      20,
      offset,
      scaleW,
      scaleH,
      24 * screenScale,
      async () => {
        if (this.isSaving) return;
        this.isSaving = true;
        this.isSpritesTest = false;
        this.disposeAll();
        this.zipperResource.resetZip();

        const addon = this.ktx2Type
          ? "[Has KTX2 textures: " + this.ktx2Type?.toUpperCase() + "]"
          : "";
        this.logResults("Saving... " + addon);
        this.updateButtonText("Save", "saving...");
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
        this.logResults("Saved in ", Date.now() - time1, " ms");
        this.updateButtonText("Save", "Save");
      },
    );

    this.createButton(
      "Sound",
      this.loadContainer,
      20 + scaleW + offset,
      offset,
      scaleW * 0.45,
      scaleH,
      24 * screenScale,
      () => {
        _.sample(this.howlSounds)?.play();
      },
    );

    this.createButton(
      "Clear\nAll",
      this.loadContainer,
      20 + scaleW + scaleW * 0.45 + offset * 2,
      offset,
      scaleW * 0.45,
      scaleH,
      20 * screenScale,
      () => {
        this.isSpritesTest = false;
        this.disposeAll();
        this.zipperResource.resetUnzip();
        this.zipperResource.resetZip();
        this.resultText!.text = "Logs:";
        void this.printRenderer().then(() => {
          this.logResults("Cleared all sprites & logs");
        });
      },
    );

    const ktx2Btn = this.createButton(
      "KTX2 Disabled",
      this.loadContainer,
      20,
      offset + height * 1.5,
      scaleW,
      scaleH,
      24 * screenScale,
      async () => {
        this.isSpritesTest = false;
        this.disposeAll();

        if (!this.ktx2Type) {
          this.ktx2Type = KTX2Types.ETC1S;
        } else if (this.ktx2Type === KTX2Types.ETC1S) {
          this.ktx2Type = KTX2Types.UASTC;
        } else {
          this.ktx2Type = undefined;
        }

        ktx2Btn.text.text = this.ktx2Type
          ? "KTX2 " + this.ktx2Type?.toUpperCase()
          : "KTX2 Disabled";
        this.logResults(ktx2Btn.text.text);

        if (this.ktx2Type) {
          const url =
            this.href +
            getKTX2TypePath(this.ktx2Type).replace("./", "/") +
            "/KTX.ktx2";
          const texture = await Pixi.Assets.load<Pixi.Texture>({
            src: url,
            loadParser: "loadKTX2",
          });
          this.pixiTextures.push(texture);
          const sprite = new Pixi.Sprite(texture);
          sprite.label = "KTX.ktx2";
          sprite.position.set(
            _.random(
              sprite.width * 0.5,
              this.canvasApp.screen.width - sprite.width * 0.5,
            ),
            _.random(
              sprite.height * 0.5,
              this.canvasApp.screen.height - sprite.height * 0.5,
            ),
          );
          this.pixiSprites.push(sprite);
          this.contentContainer.addChild(sprite);
        }
      },
    );

    this.createButton(
      "Load normal",
      this.soundContainer,
      20 + scaleW + offset,
      offset + height * 1.5,
      scaleW,
      scaleH,
      24 * screenScale,
      async () => {
        if (this.isLoading) return;
        this.isLoading = true;
        this.isSpritesTest = false;
        this.disposeAll();
        this.zipperResource.resetUnzip();
        this.logResults("Loading...");
        this.updateButtonText("Load normal", "loading...");

        const time1 = Date.now();
        await this.createResources();
        this.isLoading = false;
        const imageExt = this.ktx2Type
          ? "KTX2_" + this.ktx2Type?.toUpperCase()
          : "PNG/JPEG";
        this.logResults(
          `Total time loading files from assets [${imageExt}] `,
          Date.now() - time1,
          "ms",
        );
        this.updateButtonText("Load normal", "Load normal");
      },
    );

    this.createButton(
      "Load local zip",
      this.soundContainer,
      20,
      offset + height * 3,
      scaleW,
      scaleH,
      24 * screenScale,
      () => {
        if (this.isLoading) return;
        this.isLoading = true;
        this.isSpritesTest = false;
        this.disposeAll();
        this.zipperResource.resetUnzip();
        this.logResults("Loading...");
        this.updateButtonText("Load local zip", "loading...");

        const input: HTMLInputElement = document.createElement("input");
        input.type = "file";
        input.onchange = async () => {
          if (input.files === undefined) return;
          const time1 = Date.now();
          const arrey = Array.from(input.files!);
          const binaryFile = arrey[0];
          const buffer = await binaryFile.arrayBuffer();
          this.logResults("Downloaded zip in ", Date.now() - time1, "ms");
          const time2 = Date.now();
          const imageExt = this.ktx2Type
            ? "KTX2_" + this.ktx2Type?.toUpperCase()
            : "PNG/JPEG";
          this.zipperResource.setZipData(new Uint8Array(buffer));
          this.loadResourcesFromZip();
          this.logResults(
            `Loaded ${imageExt} textures in `,
            Date.now() - time2,
            "ms",
          );
          this.logResults(
            "Total time loading zipped files from local ",
            Date.now() - time1,
            "ms",
          );
        };
        input.click();
        this.isLoading = false;
        this.updateButtonText("Load local zip", "Load local zip");
      },
    );

    this.createButton(
      "Load server zip",
      this.soundContainer,
      20 + scaleW + offset,
      offset + height * 3,
      scaleW,
      scaleH,
      24 * screenScale,
      async () => {
        if (this.isLoading) return;
        this.isLoading = true;
        this.isSpritesTest = false;
        this.disposeAll();
        this.zipperResource.resetUnzip();
        this.logResults("Loading...");
        this.updateButtonText("Load server zip", "loading...");

        const time1 = Date.now();
        const url = this.ktx2Type
          ? this.ktx2Type === KTX2Types.ETC1S
            ? serverUrlKtx2Etc1s
            : serverUrlKtx2Uastc
          : serverUrlNormal;
        const timestamp = new Date().getTime();
        const data = await fetch(url + `?${timestamp}`).then((res) =>
          res.arrayBuffer(),
        );
        this.logResults("Downloaded zip in ", Date.now() - time1, "ms");
        const time2 = Date.now();
        const imageExt = this.ktx2Type
          ? "KTX2_" + this.ktx2Type.toUpperCase()
          : "PNG/JPEG";
        this.zipperResource.setZipData(new Uint8Array(data));
        this.loadResourcesFromZip();
        this.logResults(
          `Loaded ${imageExt} textures in `,
          Date.now() - time2,
          "ms",
        );
        this.isLoading = false;
        this.logResults(
          "Total time loading zipped files from server ",
          Date.now() - time1,
          "ms",
        );
        this.updateButtonText("Load server zip", "Load server");
      },
    );

    this.createButton(
      "Quality\nSprite",
      this.loadContainer,
      20,
      offset + height * 4.5,
      scaleW * 0.45,
      scaleH,
      18 * screenScale,
      async () => {
        this.isSpritesTest = false;
        this.disposeAll();

        this.logResults("Loading quality sprite test...");
        await this.ktxTestViewer.createQualityTextures(this.isPOTS);
        this.logResults("Quality sprites loaded!");
      },
    );

    this.createButton(
      "Quality\nAnim",
      this.loadContainer,
      20 + scaleW * 0.45 + offset,
      offset + height * 4.5,
      scaleW * 0.45,
      scaleH,
      18 * screenScale,
      async () => {
        this.isSpritesTest = false;
        this.disposeAll();

        this.logResults("Loading quality animation test...");
        await this.ktxTestViewer.createQualityAnimations(this.isPOTS, 0.2);
        this.logResults("Quality animations loaded!");
      },
    );

    this.createButton(
      "Test\nSprites",
      this.loadContainer,
      20 + scaleW + offset,
      offset + height * 4.5,
      scaleW * 0.45,
      scaleH,
      18 * screenScale,
      async () => {
        if (!this.isSpritesTest) this.disposeAll();

        const imageExt = this.ktx2Type
          ? "KTX2_" + this.ktx2Type.toUpperCase()
          : "PNG";
        this.logResults(`Loading 1000 ${imageExt} sprites...`);
        await this.ktxTestViewer.createTestSprites(
          1000,
          this.isPOTS,
          this.ktx2Type,
        );
        this.logResults(`${imageExt} sprites loaded!`);
        this.isSpritesTest = true;
      },
    );

    this.createButton(
      "Test\nAnims",
      this.loadContainer,
      20 + scaleW + scaleW * 0.45 + offset * 2,
      offset + height * 4.5,
      scaleW * 0.45,
      scaleH,
      18 * screenScale,
      async () => {
        if (!this.isSpritesTest) this.disposeAll();

        const imageExt = this.ktx2Type
          ? "KTX2_" + this.ktx2Type.toUpperCase()
          : "PNG";
        const loadText = this.isSpritesTest ? "Adding" : "Loading";
        this.logResults(`${loadText} 1000 ${imageExt} animation...`);
        await this.ktxTestViewer.createTestAnimation(
          1000,
          this.isPOTS,
          this.ktx2Type,
          0.2,
        );
        this.logResults(`${imageExt} animation loaded!`);
        this.isSpritesTest = true;
      },
    );

    const potsBtn = this.createButton(
      "POTS\nOff",
      this.loadContainer,
      20 + scaleW + scaleW * 0.45 * 2 + offset * 3,
      offset + height * 4.5,
      scaleW * 0.45,
      scaleH,
      18 * screenScale,
      () => {
        this.isPOTS = !this.isPOTS;
        potsBtn.text.text = this.isPOTS ? "POTS\nOn" : "POTS\nOff";
        this.logResults(potsBtn.text.text.replace("\n", " "));
      },
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private logResults(message?: any, ...optionalParams: any[]): void {
    const params = optionalParams.length === 0 ? "" : optionalParams.join(" ");
    console.log(message, params);
    if (this.resultText) {
      this.resultText.text += "\n  - " + message + params;
    }
  }

  private updateButtonText(name: string, text: string): void {
    if (
      !this.buttonTextMap.has(name) ||
      this.buttonTextMap.get(name) === undefined
    ) {
      return;
    }

    this.buttonTextMap.get(name)!.text = text;
  }

  private createButton(
    name: string,
    container: Pixi.Container,
    x: number,
    y: number,
    w: number,
    h: number,
    fontSize: number,
    callback: () => void,
  ): { button: Pixi.Container; text: Pixi.Text } {
    const g1 = new Pixi.Graphics();
    const gradient = new Pixi.FillGradient(0, 0, w, h);
    gradient.addColorStop(0, 0x000000);
    gradient.addColorStop(1, 0x333333);
    g1.roundRect(0, 0, w, h, 5).fill(gradient);

    const text = new Pixi.Text({
      text: name,
      style: {
        fontFamily: "Arial",
        fontSize: fontSize,
        fill: 0xffffff,
        align: "center",
      },
    });
    text.anchor.set(0.5, 0.5);
    text.position.set(w * 0.5, h * 0.5);
    this.buttonTextMap.set(name, text);

    container = new Pixi.Container();
    container.hitArea = new Pixi.Rectangle(0, 0, w, h);
    container.eventMode = "dynamic";
    container.position.set(x, y);
    // container.on('click', async () => {
    //     callback();
    // });
    container.on("pointerup", () => {
      callback();
    });
    container.addChild(g1);
    container.addChild(text);
    this.container.addChild(container);

    return { button: container, text };
  }

  private createResultText(
    name: string,
    fontSize: number,
    x: number,
    y: number,
  ): { text: Pixi.Text } {
    const text = new Pixi.Text({
      text: name,
      style: {
        fontFamily: "Arial",
        fontSize: fontSize,
        fill: 0xffffff,
        stroke: "black",
        align: "left",
      },
    });
    text.position.set(x, y);

    this.container.addChild(text);

    return { text };
  }

  public async createResources(): Promise<void> {
    const texturePaths = getTextureAssetPaths(this.ktx2Type);
    console.error(texturePaths);
    const length = texturePaths.length;
    const timestamp = new Date().getTime();
    for (let i = 0; i < length; i++) {
      const texturePath =
        this.href + texturePaths[i].replace("./", "") + `?${timestamp}`;
      try {
        const assetLoad = texturePath.includes(".ktx2")
          ? { src: texturePath, loadParser: "loadKTX2" }
          : { src: texturePath };
        const pixiTexture = await Pixi.Assets.load<Pixi.Texture>(assetLoad);
        this.pixiTextures.push(pixiTexture);
        const pixiSprite = new Pixi.Sprite(pixiTexture);
        pixiSprite.label = texturePaths[i];
        this.makeDraggableSprite(pixiSprite);
        this.pixiSprites.push(pixiSprite);
        pixiSprite.position.set(
          _.random(
            pixiTexture.width * 0.5,
            this.canvasApp.screen.width - pixiTexture.width * 0.5,
          ),
          _.random(
            pixiTexture.height * 0.5,
            this.canvasApp.screen.height - pixiTexture.height * 0.5,
          ),
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      } catch (error: any) {
        console.warn(`Texture [${texturePath}] not found! Continuing...`);
      } finally {
        // eslint-disable-next-line no-unsafe-finally
        continue;
      }
    }

    this.pixiSprites.forEach((sprite: Pixi.Sprite) => {
      this.contentContainer.addChild(sprite);
    });

    const length2 = assetsSoundPaths.length;
    for (let i = 0; i < length2; i++) {
      const timestamp = new Date().getTime();
      const soundPath =
        this.href + assetsSoundPaths[i].replace("./", "") + `?${timestamp}`;
      const sound = new Howl({
        src: soundPath,
        autoplay: false,
        loop: false,
        volume: 0.5,
      });
      this.howlSounds.push(sound);
    }
  }

  private loadResourcesFromZip(): void {
    const texturePaths = getTextureAssetPaths(this.ktx2Type);
    const length = texturePaths.length;
    for (let i = 0; i < length; i++) {
      // console.warn('Texture ' + i, texturePaths[i]);
      const texture = this.zipperResource.getPixiTexture(texturePaths[i]);
      if (!texture) {
        console.warn(`Texture [${texturePaths[i]}] not found! Continuing...`);
        continue;
      }

      this.pixiTextures.push(texture);
      const sprite = new Pixi.Sprite(texture);
      sprite.label = texturePaths[i];
      this.makeDraggableSprite(sprite);
      sprite.position.set(
        _.random(
          texture.width * 0.5,
          this.canvasApp.screen.width - texture.width * 0.5,
        ),
        _.random(
          texture.height * 0.5,
          this.canvasApp.screen.height - texture.height * 0.5,
        ),
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
    sprite.eventMode = "dynamic";
    sprite
      .on("pointerdown", this.onDragStart.bind(this, sprite))
      .on("pointerup", this.onDragEnd.bind(this), sprite)
      .on("pointerupoutside", this.onDragEnd.bind(this), sprite)
      .on("pointermove", this.onDragMove.bind(this), sprite);
  }
  private dragTarget?: Pixi.Sprite;
  private tooltipText?: Pixi.Text;
  private onDragStart(target: Pixi.Sprite): void {
    this.dragTarget = target;
    const container = (this.dragTarget as Pixi.Container).parent;
    container?.setChildIndex(this.dragTarget, container.children.length - 1);

    this.tooltipText = new Pixi.Text({
      text: target.label,
      style: {
        fontSize: 15,
        fill: "white",
        align: "center",
      },
    });
    this.tooltipText.anchor.set(0.5);
    this.tooltipText.position.set(0, -15);
    target.addChild(this.tooltipText);
  }
  private onDragEnd(): void {
    this.dragTarget = undefined;
    this.tooltipText?.destroy();
    this.tooltipText = undefined;
  }
  private onDragMove(event: Pixi.FederatedPointerEvent): void {
    if (this.dragTarget) {
      this.dragTarget.parent?.toLocal(
        event.global,
        undefined,
        this.dragTarget.position,
      );
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
      this.howlSounds.splice(i, 1);
    }
    this.howlSounds.splice(0);
  }

  public disposeTextures(): void {
    console.error(this.pixiTextures.length, this.pixiSprites.length);
    for (let i = 0; i < this.pixiTextures.length; i++) {
      this.pixiTextures[i].destroy(true);
      this.pixiSprites[i].removeFromParent();
      this.pixiSprites[i].destroy();
    }

    this.pixiTextures.splice(0);
    this.pixiSprites.splice(0);
  }

  private getWebGLContext(): WebGLRenderingContext | WebGL2RenderingContext {
    const canvas = document.getElementById("fflate-ktx2") as HTMLCanvasElement;
    let gl = canvas.getContext("webgl");
    if (!gl) {
      gl = canvas.getContext("webgl2");
    }
    return gl!;
  }
}
