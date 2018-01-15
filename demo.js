$(function () {
    var allEntries = []

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
})
