import * as Path from 'path';

export class Config {
    public static readonly outputName = 'testProject';
    public static readonly outPath: string = Path.join(__dirname, '..', 'dist');
    public static readonly outFileName: string = Config.outputName + '.js';
}
