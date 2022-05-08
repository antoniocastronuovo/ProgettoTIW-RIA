"use strict";

// TABLE SORTING MANAGEMENT FUNCTIONS

/*
 * Self invoking unnamed function. This generates a scope around the code which
 * causes variables and functions not to end up in the global scope.
 */

(function() {

	var asc = true;

	// Returns the text content of a cell.
	function getCellValue(tr, idx) {
		return tr.children[idx].textContent; // idx indexes the columns of the tr row
	}

	/*
	 * Creates a function that compares two rows based on the cell in the idx
	 * position.
	 */
	function createComparer(idx, asc) {
		return function(a, b) {
			// get values to compare at column idx
			// if order is ascending, compare 1st row to 2nd , otherwise 2nd to
			// 1st
			var v1 = getCellValue(asc ? a : b, idx), v2 = getCellValue(asc ? b
					: a, idx);
			// If non numeric value
			if (v1 === '' || v2 === '' || isNaN(v1) || isNaN(v2)) {
				return v1.toString().localeCompare(v2); // lexical comparison
			}
			// If numeric value
			return v1 - v2; // v1 greater than v2 --> true
		};
	}

	function resetArrows(rowHeaders) {
		for (var j = 0; j < rowHeaders.length; j++) {
			var toReset = rowHeaders[j].querySelectorAll("span");
			for (var i = 0; i < toReset.length; i++) {
				toReset[i].setAttribute("hidden", true);
			}
		}
	}

	function changeArrow(th) {
		var toChange = asc ? th.querySelector("span:last-child") : th
				.querySelector("span:first-child");
		toChange.removeAttribute("hidden");
	}

	// For all table headers f class sortable
	var rowHeaders = document.querySelectorAll('th.sortable');

	rowHeaders.forEach(function(th) {
		// Add a listener on the click event
		th.addEventListener('click', function() {
			var table = th.closest('table'); // get the closest table tag
			// For every row in the table body
			// Use Array.from to build an array from table.querySelectorAll
			// result
			// which is an Array Like Object (see DOM specifications)
			var rowsArray = Array.from(table.querySelectorAll('tbody > tr'));
			// sort rows with the comparator function passing
			// index of column to compare, sort criterion asc or desc)
			rowsArray.sort(
					createComparer(Array.from(th.parentNode.children).indexOf(
							th), this.asc = !this.asc)).forEach(function(tr) {
				table.querySelector('tbody').appendChild(tr)
			});

			// toggle the criterion
			asc = !asc;
			// Change arrow colors
			resetArrows(rowHeaders);
			changeArrow(th);
		});
	});
})(); // evaluate the function after its definition
