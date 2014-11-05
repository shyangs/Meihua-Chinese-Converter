'use strict';
/* MeihuaCC is licensed under GPLv2 or later versions. See the LICENSE file. */
//let EXPORTED_SYMBOLS = ['onSelectInUseList', 'onSelectAvailableList', 'addTable', 'removeTable', 'moveUpTable', 'moveDownTable', 'moveToTable'];
let _onSelectItem = function(tree, ...aButtons){
	if(tree.currentIndex >= 0){
		aButtons.forEach(function(btn){
			btn.disabled = false;
		});
	}else{
		aButtons.forEach(function(btn){
			btn.disabled = true;
		});
	}
},
_addTable = function(treeA, treeU, listA, listU, indexA, indexU){
	if(typeof indexA === 'undefined'){
		let selection = treeA.view.selection;
		if(selection.count === 0) return;
		indexA = selection.currentIndex;
	}
	if(typeof indexU === 'undefined'){
		let selection = treeU.view.selection;
		if(selection.count === 0) indexU = listU.length-1;
		else indexU = selection.currentIndex;
	}

	listU.splice(indexU+1, 0, listA[indexA]);
	treeU.boxObject.rowCountChanged(indexU+1, 1);
	treeU.boxObject.ensureRowIsVisible(indexU+1);
	treeU.view.selection.select(indexU+1);
	
	listA.splice(indexA, 1);
	treeA.boxObject.rowCountChanged(indexA, -1);
    if(indexA < listA.length) treeA.view.selection.select(indexA);
    else if(indexA > 0) treeA.view.selection.select(indexA - 1);
},
_removeTable = function(treeA, treeU, listA, listU, indexA, indexU){
	if(typeof indexU === 'undefined'){
		let selection = treeU.view.selection;
		if(selection.count === 0) return;
		indexU = selection.currentIndex;
	}
	if(typeof indexA === 'undefined'){
		let selection = treeA.view.selection;
		if(selection.count === 0) indexA = listA.length-1;
		else indexA = selection.currentIndex;
	}

	listA.splice(indexA+1, 0, listU[indexU]);
	treeA.boxObject.rowCountChanged(indexA+1, 1);
	treeA.boxObject.ensureRowIsVisible(indexA+1);
	treeA.view.selection.select(indexA+1);
	
	listU.splice(indexU, 1);
	treeU.boxObject.rowCountChanged(indexU, -1);
    if(indexU < listU.length) treeU.view.selection.select(indexU);
    else if(indexU > 0) treeU.view.selection.select(indexU - 1);
},
_moveUpTable = function(treeU, listU){
	let selection = treeU.view.selection;
	if(selection.count === 0) return;
	let index = selection.currentIndex;
	if(index === 0) return;
	let table = listU[index];
	listU.splice(index, 1);
	listU.splice(index - 1, 0, table);

	let treeBox = treeU.boxObject;
	treeBox.invalidateRange(index - 1, index);
	treeBox.ensureRowIsVisible(index - 1);
	selection.select(index - 1);
},
_moveDownTable = function(treeU, listU){
	let selection = treeU.view.selection;
	if(selection.count === 0) return;
	let index = selection.currentIndex;
	if(index === listU.length - 1) return;
	let table = listU[index];
	listU.splice(index, 1);
	listU.splice(index + 1, 0, table);

	let treeBox = treeU.boxObject;
	treeBox.invalidateRange(index, index + 1);
	treeBox.ensureRowIsVisible(index + 1);
	selection.select(index + 1);
},
_moveToTable = function(treeU, listU){
	let selection = treeU.view.selection;
	if(selection.count === 0) return;
	let index = selection.currentIndex;
	let table = listU[index];
	let str = stringBundle.GetStringFromName('prompt.newIndex');
	let newIndex = prompt(str, index+1);
	if(null===newIndex) return;
	newIndex = parseInt(newIndex, 10);
	if(Number.isInteger(newIndex) && newIndex >= 1  && newIndex <= listU.length){
		newIndex -= 1;
	}else{
		alert(stringBundle.GetStringFromName('alert.newIndex'));
		return;
	}
	listU.splice(index, 1);
	listU.splice(newIndex, 0, table);

	let treeBox = treeU.boxObject;
	treeBox.invalidateRange(index, newIndex);
	treeBox.ensureRowIsVisible(newIndex);
	selection.select(newIndex);
};