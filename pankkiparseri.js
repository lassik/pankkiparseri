Pankkiparseri = {}

Pankkiparseri.withoutLeadingDayAndMonth = function (s) {
    var g = s.match(/^[0-3]\d[0-1]\d (.*)$/)
    return g ? g[1] : s
}

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
    return g ? Pankkiparseri.centsFromAmountParsed(g[2], g[3], g[1]) : null
}

Pankkiparseri.centsFromAmountSignLast = function (formattedAmount) {
    var g = formattedAmount.match(/^(\d{1,5})(,\d{1,2})?([+-?])$/)
    return g ? Pankkiparseri.centsFromAmountParsed(g[1], g[2], g[3]) : null
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

Pankkiparseri.parseSPankkiTilioteTabulaCSV = function (contents) {
    // CSV ripped from S-Pankki bank statement PDF by Tabula.
    var rows = $.csv.toArrays(contents)
    var entries = []
    var entry = null
    var sinceEntry = null
    var date = null
    var g
    for (var lineNum = 1; lineNum <= rows.length; lineNum++) {
        var row = rows[lineNum - 1]
        if ((g = row[0].match(/^KIRJAUSPÄIVÄ (\d{2}\.\d{2}\.\d{2})/))) {
            date = Pankkiparseri.isoDateFromFinnishDate(g[1])
            entry = sinceEntry = null
        } else if (row[0].match(/^\d{18} [A-Z]/)) {
            sinceEntry = 0
            entry = {}
            entry.date = date
            entry.archivalId = row[0]
            entry.otherParty = Pankkiparseri.withoutLeadingDayAndMonth(row[1])
            entry.cents = Pankkiparseri.centsFromAmountSignLast(row[row.length - 1])
            entry.message = ''
            entries.push(entry)
        } else if ((sinceEntry === 1 || sinceEntry === 2)) {
            if (entry.message.length > 0) {
                entry.message += ' '
            }
            entry.message += Pankkiparseri.withoutLeadingDayAndMonth(row[1])
        }
        if (sinceEntry !== null) {
            sinceEntry += 1
        }
    }
    return entries
}

Pankkiparseri.handleFiles = function (files, entriesCallback, parse) {
    for (var i = 0; i < files.length; i++) {
        var file = files[i]
        if (!/^text\//.test(file.type)) { continue }
        var reader = new FileReader()
        reader.onload = function (e) {
            entriesCallback(parse(e.target.result))
        }
        reader.readAsText(file)
    }
}

Pankkiparseri.addBankToForm = function (form, entriesCallback, bankTitle, parse) {
    var hiddenInput = document.createElement('input')
    hiddenInput.style.display = 'none'
    hiddenInput.type = 'file'
    hiddenInput.accept = '.csv,text/csv'
    hiddenInput.multiple = true
    hiddenInput.addEventListener('change', function (e) {
        Pankkiparseri.handleFiles(this.files, entriesCallback, parse)
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

Pankkiparseri.addToForm = function (formId, entriesCallback) {
    var form = document.getElementById(formId)
    Pankkiparseri.addBankToForm(
        form, entriesCallback,
        'S-Pankki (tiliote Tabula CSV)',
        Pankkiparseri.parseSPankkiTilioteTabulaCSV)
    Pankkiparseri.addBankToForm(
        form, entriesCallback,
        'Oma Säästöpankki (tilitapahtumat CSV)',
        Pankkiparseri.parseOmaSaastopankkiTilitapahtumatCSV)
}
