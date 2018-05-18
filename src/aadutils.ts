import xml2js from 'xml2js';
import request from 'request';
import utils from './utils';
import async from 'async';

export default class Metadata {
    private _url: any;
    private _metadata: any;
    private _saml: any;
    private _wsfed: any;
    private _oauth: any;


    constructor(url: string) {
        if (!url) {
            throw new Error("Metadata: url is a required argument");
        }
        this._url = url;
        this._metadata = null;
        this._saml = null;
        this._wsfed = null;
        this._oauth = null;
    };

    get url(): any {
        return this._url;
    }

    get metadata(): any {
        return this._metadata;
    }

    set metadata(data: any) {
        this._metadata = data;
    }

    get saml(): any {
        return this._saml;
    }

    get wsfed(): any {
        return this._wsfed;
    }

    get oauth(): any {
        return this._oauth;
    }

    updateSamlMetadata(doc: any, next: any) {
        try {
            this._saml = {};

            let entity = utils.getElement(doc, 'EntityDescriptor');
            let idp = utils.getElement(entity, 'IDPSSODescriptor');
            let signOn = utils.getElement(idp[0], 'SingleSignOnService');
            let signOff = utils.getElement(idp[0], 'SingleLogoutService');
            let keyDescriptor = utils.getElement(idp[0], 'KeyDescriptor');
            this._saml.loginEndpoint = signOn[0].$.Location;
            this._saml.logoutEndpoint = signOff[0].$.Location;

            // copy the x509 certs from the metadata
            this._saml.certs = [];
            for (let j = 0; j < keyDescriptor.length; j++) {
                this._saml.certs.push(keyDescriptor[j].KeyInfo[0].X509Data[0].X509Certificate[0]);
            }
            next(null);
        } catch (e) {
            next(new Error('Invalid SAMLP Federation Metadata ' + e.message));
        }
    };

    updateWsfedMetadata(doc: any, next: any) {
        try {
            this._wsfed = {};
            let entity = utils.getElement(doc, 'EntityDescriptor');
            let roles = utils.getElement(entity, 'RoleDescriptor');
            for (let i = 0; i < roles.length; i++) {
                let role = roles[i];
                if (role['fed:SecurityTokenServiceEndpoint']) {
                    let endpoint = role['fed:SecurityTokenServiceEndpoint'];
                    let endPointReference = utils.getFirstElement(endpoint[0], 'EndpointReference');
                    this._wsfed.loginEndpoint = utils.getFirstElement(endPointReference, 'Address');

                    let keyDescriptor = utils.getElement(role, 'KeyDescriptor');
                    // copy the x509 certs from the metadata
                    this._wsfed.certs = [];
                    for (let j = 0; j < keyDescriptor.length; j++) {
                        this._wsfed.certs.push(keyDescriptor[j].KeyInfo[0].X509Data[0].X509Certificate[0]);
                    }
                    break;
                }
            }

            return next(null);
        } catch (e) {
            next(new Error('Invalid WSFED Federation Metadata ' + e.message));
        }
    };

    updateOAuthMetadata(doc: any, next: any) {
        try {
            this._oauth = {};
            let entity = utils.getElement(doc, 'EntityDescriptor');
            let roles = utils.getElement(entity, 'RoleDescriptor');
            for (let i = 0; i < roles.length; i++) {
                let role = roles[i];
                if (role['fed:SecurityTokenServiceEndpoint']) {
                    let endpoint = role['fed:SecurityTokenServiceEndpoint'];
                    let endPointReference = utils.getFirstElement(endpoint[0], 'EndpointReference');
                    this._oauth.loginEndpoint = utils.getFirstElement(endPointReference, 'Address');

                    let keyDescriptor = utils.getElement(role, 'KeyDescriptor');
                    // copy the x509 certs from the metadata
                    this._oauth.certs = [];
                    for (let j = 0; j < keyDescriptor.length; j++) {
                        this._oauth.certs.push(keyDescriptor[j].KeyInfo[0].X509Data[0].X509Certificate[0]);
                    }
                    break;
                }
            }

            return next(null);
        } catch (e) {
            next(new Error('Invalid OAuth Federation Metadata ' + e.message));
        }
    };

    fetch(callback: any) {
        let self = this;

        async.waterfall([
            // fetch the Federation metadata for the AAD tenant
            function (next: any) {
                request(self.url, function (err: any, response: any, body: any) {
                    if (err) {
                        next(err);
                    } else if (response.statusCode !== 200) {
                        next(new Error("Error:" + response.statusCode + " Cannot get AAD Federation metadata from " + self.url));
                    } else {
                        next(null, body);
                    }
                });
            },
            function (body: any, next: any) {
                // parse the AAD Federation metadata xml
                var parser = new xml2js.Parser({ explicitRoot: true });
                // Note: xml responses from Azure AAD have a leading \ufeff which breaks xml2js parser!
                parser.parseString(body.replace("\ufeff", ""), function (err: any, data: any) {
                    self.metadata = data;
                    next(err);

                });
            },
            function (next: any) {
                // update the SAML SSO endpoints and certs from the metadata
                self.updateSamlMetadata(self.metadata, next);
            },
            function (next: any) {
                // update the SAML SSO endpoints and certs from the metadata
                self.updateWsfedMetadata(self.metadata, next);
            },
            function (next: any) {
                // update the SAML SSO endpoints and certs from the metadata
                self.updateOAuthMetadata(self.metadata, next);
            }
        ], function (err) {
            // return err or success (err === null) to callback
            callback(err);
        });
    };

}