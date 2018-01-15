$(function () {
    function entriesCallback (entries) {
        entries.forEach(function (entry) {
            $('#entries').append(
                $('<tr/>')
                    .append($('<td/>').text(entry.date))
                    .append($('<td/>').text(entry.cents).addClass('right'))
                    .append($('<td/>').text(entry.otherParty))
                    .append($('<td/>').text(entry.message)))
        })
    }
    Pankkiparseri.addToForm('pankki', entriesCallback)
})
