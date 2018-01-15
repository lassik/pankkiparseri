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
	    var formattedAmount = row[row.length-1];
	    if ((m = formattedAmount.match(/^(\d{1,5}),(\d{2})([+-])$/))) {
		entry.cents = (100*parseInt(m[1]) + parseInt(m[2]))
		    * parseInt(m[3]+"1");
	    } else {
		entry.cents = null;
	    }
            entries.push(entry);
        }
    }
    return entries;
}
