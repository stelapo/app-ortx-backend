import { Request, Response, NextFunction } from 'express';

export default class Utils {
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
}