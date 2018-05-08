export default class Utils {
    public static getTimestamp(): Date {
        var date = new Date(); // Or the date you'd like converted.
        var isoDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        return isoDate;
    }

    public static formattedTimestamp(): String {
        return Utils.getTimestamp().toISOString().replace(/z|t/gi, ' ').trim();
    };
}