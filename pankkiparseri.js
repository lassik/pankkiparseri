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

Pankkiparseri.centsFromAmountParsed = function (euros, commaCents, sign) {
    var euros = parseInt(euros)
    var cents = !commaCents ? 0 : parseInt(commaCents.slice(1).padEnd(2, '0'))
    var sign = (sign === '-') ? -1 : 1
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
    for (var lineNum = 2; lineNum <= rows.length; lineNum++) {
        var row = rows[lineNum - 1]
        var entry = {}
        entry.date = Pankkiparseri.isoDateFromFinnishDate(row[0])
        entry.otherParty = row[1]
        entry.message = (row[3].match(/^'/) ? row[3].slice(1) : '')
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

Pankkiparseri.handleFiles = function (files, callback, parse) {
    for (var i = 0; i < files.length; i++) {
        var file = files[i]
        if (!/^text\//.test(file.type)) { continue }
        var reader = new FileReader()
        reader.onload = function (e) {
            callback(parse(e.target.result))
        }
        reader.readAsText(file)
    }
}

Pankkiparseri.addBankToForm = function (form, callback, bankTitle, parse) {
    var hiddenInput = document.createElement('input')
    hiddenInput.style.display = 'none'
    hiddenInput.type = 'file'
    hiddenInput.accept = '.csv,text/csv'
    hiddenInput.multiple = true
    hiddenInput.addEventListener('change', function (e) {
        Pankkiparseri.handleFiles(this.files, callback, parse)
    })
    form.appendChild(hiddenInput)
    var button = document.createElement('button')
    button.appendChild(document.createTextNode(bankTitle))
    button.addEventListener('click', function (e) {
        hiddenInput.click()
        e.preventDefault() // prevent navigation to "#"
    }, false)
    form.appendChild(button)
}

Pankkiparseri.addToForm = function (formId, callback) {
    var form = document.getElementById(formId)
    Pankkiparseri.addBankToForm(
        form, callback,
        'S-Pankki (tiliote Tabula CSV)',
        Pankkiparseri.parseSPankkiTilioteCSV)
    Pankkiparseri.addBankToForm(
        form, callback,
        'Oma Säästöpankki (tilitapahtumat CSV)',
        Pankkiparseri.parseOmaSaastopankkiTilitapahtumatCSV)
}
