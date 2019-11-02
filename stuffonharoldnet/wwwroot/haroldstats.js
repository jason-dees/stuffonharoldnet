(function () {
	var haroldWeightLbs = 8;
	function fillInStuff(stuff) {
		var total = 0;
		var stuffTable = document.querySelector("#stuff_body");
		var rowTemplate = document.querySelector("#stuff_row");

		stuff.sort(sortStuff);

		for (var i = 0; i < stuff.length; i++) {
			var thing = stuff[i];
			total += parseFloat(thing.weight);
			var cells = rowTemplate.content.querySelectorAll("td");
			rowTemplate.content.querySelector('.item').textContent = thing.name;
			rowTemplate.content.querySelector('.weight').textContent = thing.weight + 'g';
			stuffTable.appendChild(document.importNode(rowTemplate.content, true));
		}

		document.querySelector('#total_stuff_weight').innerHTML = total + "g";
		document.querySelector('#interesting').onclick = function () {
			document.querySelector('#stats_view').className = 'hidden';
		}
	}

	function sortStuff(a, b) {
		var nameA = a.name.toUpperCase();
		var nameB = b.name.toUpperCase();
		if (nameA < nameB) {
			return -1;
		}
		if (nameA > nameB) {
			return 1;
		}
		return 0;
	}
	function setHaroldWeight() {
		document.querySelector('#harold_weight').innerHTML = poundsToGrams(haroldWeightLbs) + "g";
	};
	setHaroldWeight();

	function poundsToGrams(pounds) {
		var onePound = 453.59;
		return pounds * 453.59;
	}

	document.querySelector('#stats').onclick = function () {
		document.querySelector('#stats_view').className = '';
	}
	document.addEventListener("keydown", function (e) {
		if (e.keyCode == 27) {
			document.querySelector('#stats_view').className = 'hidden';
		}
	});

	fetch("stuff.json")
		.then(response => response.json())
		.then(json => fillInStuff(json));
})();