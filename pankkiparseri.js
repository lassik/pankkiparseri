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

Pankkiparseri.centsFromAmountParsed = function (eurosStr, centsStr, signStr) {
    var euros = parseInt(eurosStr)
    var cents = !centsStr ? 0 : parseInt(centsStr.slice(1).padStart(2, '0'))
    var sign = (signStr === '-') ? -1 : 1
    return sign * ((100 * euros) + cents)
}

Pankkiparseri.centsFromAmountSignFirst = function (formattedAmount) {
    var g = formattedAmount.match(/^([+-]?)(\d{1,5})(,\d{1,2})?$/)
    if (!g) {
        return null
    }
    return Pankkiparseri.centsFromAmountParsed(g[2], g[3], g[1])
}

Pankkiparseri.centsFromAmountSignLast = function (formattedAmount) {
    var g = formattedAmount.match(/^(\d{1,5})(,\d{1,2})?([+-?])$/)
    if (!g) {
        return null
    }
    return Pankkiparseri.centsFromAmountParsed(g[1], g[2], g[3])
}

Pankkiparseri.parseOmaSaastopankkiTilitapahtumatCSV = function (contents) {
    // Official CSV download from online banking "tilitapahtumat" section.
    var rows = $.csv.toArrays(contents, {separator: ';'})
    var entries = []
    var m
    for (var lineNum = 2; lineNum <= rows.length; lineNum++) {
        var row = rows[lineNum - 1]
        var entry = {}
        entry.date = Pankkiparseri.isoDateFromFinnishDate(row[0])
        entry.otherParty = row[1]
        entry.message = row[3]
        entry.cents = Pankkiparseri.centsFromAmountSignFirst(row[4])
        entries.push(entry)
    }
    return entries
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
