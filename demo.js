$(function () {
    var allEntries = []

    function downloadXmlFile (filename, xmlString) {
        var base64 = btoa(unescape(encodeURIComponent(xmlString)))
        var hiddenLink = document.createElement('a')
        hiddenLink.download = filename
        hiddenLink.href = 'data:text/xml;charset=utf-8;base64,' + base64
        document.body.appendChild(hiddenLink)
        hiddenLink.click()
        document.body.removeChild(hiddenLink)
    }

    function downloadOfxFile () {
        downloadXmlFile('pankkiparseri.ofx',
                        Pankkiparseri.ofxStringFromEntries(allEntries))
    }

    function updateEntriesTable () {
        $('#entries').empty()
        $('#entries').append(
            $('<tr/>')
                .append($('<th/>').text('Pvm'))
                .append($('<th/>').text('Määrä'))
                .append($('<th/>').text('Kuka'))
                .append($('<th/>').text('Viesti')))
        allEntries.forEach(function (entry) {
            $('#entries').append(
                $('<tr/>')
                    .append($('<td/>').text(entry.date.iso))
                    .append($('<td/>').text(entry.amount ? entry.amount.eurosCommaCents+' €' : '').addClass('right'))
                    .append($('<td/>').text(entry.otherParty))
                    .append($('<td/>').text(entry.message)))
        })
    }

    function addEntries (newEntries) {
        newEntries.forEach(function (entry) { allEntries.push(entry) })
        allEntries.sort(function (a, b) { return a.date.iso.localeCompare(b.date.iso) })
        updateEntriesTable()
    }

    Pankkiparseri.addToForm('pankki', addEntries)
    $('#downloadButton').click(downloadOfxFile)
})
