Pankkiparseri = {};

Pankkiparseri.parseSPankkiCSV = function(contents) {
    // CSV ripped from S-Pankki bank statement PDF by Tabula.
    var rows = $.csv.toArrays(contents);
    var entries = [];
    var date = null;
    var m;
    for (var line_num = 1; line_num <= rows.length; line_num++) {
        var row = rows[line_num - 1];
        if ((m = row[0].match(/^KIRJAUSPÄIVÄ (\d{2})\.(\d{2})\.(\d{2})/))) {
            var day = m[1];
            var month = m[2];
            var year = "20"+m[3];
            date = year+"-"+month+"-"+day;
        } else if (row[0].match(/^\d{18} [A-Z]/)) {
            var entry = {};
            entry.date = date;
            entry.archival_id = row[0];
            entry.other_party = row[1];
            entry.amount = row[7];
            entries.push(entry);
        }
    }
    return entries;
}
