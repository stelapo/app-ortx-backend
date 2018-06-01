import { Request, Response, NextFunction } from 'express';
import sqlite3, { RunResult } from 'sqlite3';
import Logger from './logger';
import Config from './config';

export default class Utils {

    public static c: Config;
    public static l: Logger;

    public static getTimestamp(): Date {
        var date = new Date(); // Or the date you'd like converted.
        var isoDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        return isoDate;
    }

    public static formattedTimestamp(): String {
        return Utils.getTimestamp().toISOString().replace(/z|t/gi, ' ').trim();
    };



    public static getElement(parentElement: any, elementName: any) {
        if (parentElement['saml:' + elementName]) {
            return parentElement['saml:' + elementName];
        } else if (parentElement['samlp:' + elementName]) {
            return parentElement['samlp:' + elementName];
        }
        return parentElement[elementName];
    };


    public static getFirstElement(parentElement: any, elementName: any) {
        var element = null;

        if (parentElement['saml:' + elementName]) {
            element = parentElement['saml:' + elementName];
        } else if (parentElement['samlp:' + elementName]) {
            element = parentElement['samlp:' + elementName];
        } else {
            element = parentElement[elementName];
        }
        return Array.isArray(element) ? element[0] : element;
    };

    private static doPromiseNextOff(sqliteFile: string, logger: Logger) {
        return new Promise((resolve, reject) => {
            try {
                const db = new sqlite3.Database(sqliteFile);
                db.serialize(function () {
                    let ok: boolean = true;
                    db.exec("BEGIN").
                        run("CREATE TABLE IF NOT EXISTS Chiavi (tipo TEXT, anno INTEGER, num INTEGER, CONSTRAINT Chiavi_pk PRIMARY KEY (tipo, anno));").
                        run("INSERT OR IGNORE INTO Chiavi(tipo, anno, num) VALUES ('offers', strftime('%Y','now'), 0)", [],
                            (err: Error, result: RunResult) => {
                                logger.debug("getNextOfferNum - after insert");
                                if (err) {
                                    logger.error("getNextOfferNum - Error inserting into table Chiavi:" + JSON.stringify(err));
                                    reject(err);
                                    ok = false;
                                }
                                if (result)
                                    logger.debug("getNextOfferNum - after insert changes = " + result.changes);
                            }).
                        run("UPDATE Chiavi SET num = num + 1 WHERE tipo = 'offers' and anno = strftime('%Y','now')", [],
                            (err: Error, result: RunResult) => {
                                logger.debug("getNextOfferNum - after update");
                                if (err) {
                                    logger.error("getNextOfferNum - Error updating num column:" + JSON.stringify(err));
                                    reject(err);
                                    ok = false;
                                }
                                if (result)
                                    logger.debug("getNextOfferNum - after update changes = " + result.changes);
                            }).
                        get("SELECT num FROM Chiavi c where tipo = 'offers' and anno=strftime('%Y','now')",
                            (err: Error, row: any) => {
                                logger.debug("getNextOfferNum - after select");
                                if (err) {
                                    logger.error("getNextOfferNum - Error selecting num column:" + JSON.stringify(err));
                                    reject(err);
                                    ok = false;
                                }
                                if (ok && row) {
                                    logger.debug("getNextOfferNum - DATA FOUND=" + row.num);
                                    resolve(row.num);
                                    db.exec("COMMIT").close();
                                } else {
                                    reject(err);
                                    db.close();
                                }
                            });
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    public static async getNextOfferNum(sqliteFile: string, logger: Logger) {        
        let y = await this.doPromiseNextOff(sqliteFile, logger);
        logger.debug("!!!!! getNextOfferNum = " + y);
        return y;
    }
}