Pankkiparseri = {}

Pankkiparseri.isoDateFromFinnishDate = function (finnishDate) {
    var g = finnishDate.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/)
    if (!g) {
        return null
    }
    var year = (g[3].length === 2) ? ('20' + g[3]) : g[3]
    var month = g[2].padStart(2, '0')
    var day = g[1].padStart(2, '0')
    return year + '-' + month + '-' + day
}

Pankkiparseri.centsFromAmountSignLast = function (formattedAmount) {
    var g = formattedAmount.match(/^(\d{1,5}),(\d{2})([+-])$/)
    if (!g) {
        return null
    }
    var euros = parseInt(g[1])
    var cents = parseInt(g[2])
    var sign = parseInt(g[3] + '1')
    return sign * ((100 * euros) + cents)
}

Pankkiparseri.parseSPankkiTilioteCSV = function (contents) {
    // CSV ripped from S-Pankki bank statement PDF by Tabula.
    var rows = $.csv.toArrays(contents)
    var entries = []
    var date = null
    var g
    for (var lineNum = 1; lineNum <= rows.length; lineNum++) {
        var row = rows[lineNum - 1]
        if ((g = row[0].match(/^KIRJAUSPÄIVÄ (\d{2}\.\d{2}\.\d{2})/))) {
            date = Pankkiparseri.isoDateFromFinnishDate(g[1])
        } else if (row[0].match(/^\d{18} [A-Z]/)) {
            var entry = {}
            entry.date = date
            entry.archivalId = row[0]
            entry.otherParty = row[1]
            entry.cents = Pankkiparseri.centsFromAmountSignLast(row[row.length - 1])
            entries.push(entry)
        }
    }
    return entries
}
