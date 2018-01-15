$(function () {
    var allEntries = []

    function downloadXmlFile (filename, xmlString) {
        var hiddenLink = document.createElement('a')
        hiddenLink.download = filename
        hiddenLink.href = 'data:text/xml;charset=utf-8;base64,' + btoa(xmlString)
        document.body.appendChild(hiddenLink)
        hiddenLink.click()
        document.body.removeChild(hiddenLink)
    }

    function downloadOFX () {
        downloadXmlFile('pankkiparseri.ofx',
                        Pankkiparseri.ofxStringFromEntries(allEntries))
    }

    function updateEntriesTable () {
        $('#entries').empty()
        allEntries.forEach(function (entry) {
            $('#entries').append(
                $('<tr/>')
                    .append($('<td/>').text(entry.date))
                    .append($('<td/>').text(entry.cents).addClass('right'))
                    .append($('<td/>').text(entry.otherParty))
                    .append($('<td/>').text(entry.message)))
        })
    }

    function addEntries (newEntries) {
        newEntries.forEach(function (entry) { allEntries.push(entry) })
        allEntries.sort(function (a, b) { return a.date.localeCompare(b.date) })
        updateEntriesTable()
    }

    Pankkiparseri.addToForm('pankki', addEntries)
    $('#downloadButton').click(downloadOFX)
})
