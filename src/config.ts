class Config {
    private _port: number;

    // File log configuration
    private _logpath: string;
    private _winstonFilename: string;

    constructor() {
        this._port = parseInt(process.env.PORT || '3000');
        this._logpath = 'log/';
        this._winstonFilename = this._logpath + '%DATE%_winston.log';
    }

    get port(): number {
        return this._port;
    }

    get logpath(): string {
        return this._logpath;
    }

    get winstonFilename(): string {
        return this._winstonFilename;
    }
}

export default Config;