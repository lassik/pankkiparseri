$(function () {
    var fileSelect = document.getElementById('fileSelect')
    var fileElem = document.getElementById('fileElem')

    function handleFiles (files) {
	for (var i = 0; i < files.length; i++) {
	    var file = files[i]
	    if (!/^text\//.test(file.type)) { continue }
	    var reader = new FileReader()
	    var parse
	    parse = Pankkiparseri.parseSPankkiTilioteCSV
	    reader.onload = function (e) {
		console.log(parse(e.target.result))
	    }
	    reader.readAsText(file)
	}
    }

    fileElem.addEventListener('change', function (e) {
	handleFiles(this.files)
    })

    fileSelect.addEventListener('click', function (e) {
	fileElem.click()
	e.preventDefault() // prevent navigation to "#"
    }, false)
})
