import dotenv from 'dotenv';

class Config {
    private _port: number;

    // File log configuration
    private _logPath: string;
    private _logLevel: string;
    private _consoleOutput: boolean;
    private _winstonFilename: string;

    //Mongo DB
    private _mongoUrl: string;

    private _creds = {
        //mongoose_auth_local: 'mongodb://localhost/tasklist', // Your mongo auth uri goes here
        tokenEndpoint: 'https://login.microsoftonline.com/1f991ab0-af89-4a9a-b74d-b0b5bcb487cc/oauth2/token',
        authEndpoint: 'https://login.microsoftonline.com/1f991ab0-af89-4a9a-b74d-b0b5bcb487cc/oauth2/authorize',
        clientSecret: '/0JIBbMFkImoj2fp/zdMGtcBylLAH3tpJfY1wSnstb8=', // this is the Secret you generated when configuring your Web API app on Azure AAD

        // required options
        federation_metadata: 'https://login.microsoftonline.com/1f991ab0-af89-4a9a-b74d-b0b5bcb487cc/federationmetadata/2007-06/federationmetadata.xml', // this is the metadata URL from the AAD Portal
        callbackURL: 'http://10.55.55.67:3001/auth/provider/callback', // this is the Callback URI you entered for APP ID URI when configuring your Web API app on Azure AAD
        issuer: 'http://10.55.55.67:3001/',  // this is the URI you entered for APP ID URI when configuring your Web API app on Azure AAD
        clientID: 'dc4a4897-0555-41be-af75-1e8467f71322' // this is the Client ID you received after configuring your Web API app on Azure AAD
    };

    constructor() {
        dotenv.load();
        this._port = parseInt(process.env.PORT || '3000');
        this._logPath = 'log/';
        this._logLevel = process.env.LOG_LEVEL || 'info';
        this._consoleOutput = ((process.env.CONSOLE_OUTPUT || 'off') === 'on');
        this._winstonFilename = this._logPath + '%DATE%_winston.log';
        this._mongoUrl = 'mongodb://' + (process.env.MONGODB_URL || '127.0.0.1/rtx_ordini');
    }

    get port(): number {
        return this._port;
    }

    get logPath(): string {
        return this._logPath;
    }

    get logLevel(): string {
        return this._logLevel;
    }

    get consoleOutput(): boolean {
        return this._consoleOutput;
    }

    get winstonFilename(): string {
        return this._winstonFilename;
    }

    get creds(): any {
        return this._creds;
    }

    get mongoUrl(): string {
        return this._mongoUrl;
    }
}

export default Config;