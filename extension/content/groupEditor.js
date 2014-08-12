'use strict';

const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import('resource://meihuacc/lib/File.js');

let stringBundle = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService).createBundle('chrome://meihuacc/locale/meihuacc.properties');

let aUserDefinedTable = File.read(File.open('userDefinedTable', 'MeihuaCC'))||[],
	inUseListTree = document.getElementById('inUseListTree'),
	availableListTree = document.getElementById('availableListTree'),
	aTables;

if(window.arguments[0]['in']){
	let group = window.arguments[0]['in'].group;

	document.getElementById('nameTextbox').value = group.name||'';
	document.getElementById('patternTextbox').value = group.pattern;
	document.getElementById('convOrNotMenulist').selectedIndex = (group.rule==='exclude'?1:0);
	
	aTables = group.aTables;
}

aTables = aTables||['梅花通用單字(繁)', '梅花通用詞彙(繁)'];
let inUseListTreeView = {
	rowCount: aTables.length,
	getCellText: function(row, column){
		switch(column.element.getAttribute('name')){
			case 'indexColumn': return row+1;
			case 'nameColumn': return aTables[row];
		}
	},
	setTree: function(treebox){ this.treebox = treebox; }
}
inUseListTree.view = inUseListTreeView;

let availableList = ['梅花通用單字(繁)', '梅花通用詞彙(繁)']
	.concat(aUserDefinedTable.map(function(aItem){
		return aItem.name;
    })).filter(function(x){
		return (aTables.indexOf(x)===-1);
	});
let availableListTreeView = {
	rowCount: availableList.length,
	getCellText: function(row, column){
		switch(column.element.getAttribute('name')){
			case 'nameColumn': return availableList[row];
		}
	},
	setTree: function(treebox){ this.treebox = treebox; }
}
availableListTree.view = availableListTreeView;

let onChange = function(selectedIndex){
	if(selectedIndex === 0) {
		inUseListTree.disabled = false;
		availableListTree.disabled = false;
	}else{
		inUseListTree.disabled = true;
		availableListTree.disabled = true;
	}
};

onChange(document.getElementById('convOrNotMenulist').selectedIndex);

let onSelectInUseList = function(){
	let removeButton = document.getElementById('removeButton'),
		moveUpButton = document.getElementById('moveUpButton'),
		moveDownButton = document.getElementById('moveDownButton'),
		moveToButton = document.getElementById('moveToButton');
	if(inUseListTree.currentIndex >= 0) {
		removeButton.disabled = false;
		moveUpButton.disabled = false;
		moveDownButton.disabled = false;
		moveToButton.disabled = false;
	}else{
		removeButton.disabled = true;
		moveUpButton.disabled = true;
		moveDownButton.disabled = true;
		moveToButton.disabled = true;
	}
},
onSelectAvailableList = function(){
	let addButton = document.getElementById('addButton');
	if(availableListTree.currentIndex >= 0) {
		addButton.disabled = false;
	}else{
		addButton.disabled = true;
	}
},

addTable = function(indexAvailable, indexInUse){
	if(typeof indexAvailable === 'undefined'){
		let selection = availableListTree.view.selection;
		if(selection.count === 0) return;
		indexAvailable = selection.currentIndex;
	}
	if(typeof indexInUse === 'undefined'){
		let selection = inUseListTree.view.selection;
		if(selection.count === 0) indexInUse = aTables.length-1;
		else indexInUse = selection.currentIndex;
	}

	aTables.splice(indexInUse+1, 0, availableList[indexAvailable]);
	inUseListTree.boxObject.rowCountChanged(indexInUse+1, 1);
	inUseListTree.boxObject.ensureRowIsVisible(indexInUse+1);
	inUseListTree.view.selection.select(indexInUse+1);
	
	availableList.splice(indexAvailable, 1);
	availableListTree.boxObject.rowCountChanged(indexAvailable, -1);
    if(indexAvailable < availableList.length) availableListTree.view.selection.select(indexAvailable);
    else if(indexAvailable > 0) availableListTree.view.selection.select(indexAvailable - 1);
},
removeTable = function(indexAvailable, indexInUse){
	if(typeof indexInUse === 'undefined'){
		let selection = inUseListTree.view.selection;
		if(selection.count === 0) return;
		indexInUse = selection.currentIndex;
	}
	if(typeof indexAvailable === 'undefined'){
		let selection = availableListTree.view.selection;
		if(selection.count === 0) indexAvailable = availableList.length-1;
		else indexAvailable = selection.currentIndex;
	}

	availableList.splice(indexAvailable+1, 0, aTables[indexInUse]);
	availableListTree.boxObject.rowCountChanged(indexAvailable+1, 1);
	availableListTree.boxObject.ensureRowIsVisible(indexAvailable+1);
	availableListTree.view.selection.select(indexAvailable+1);
	
	aTables.splice(indexInUse, 1);
	inUseListTree.boxObject.rowCountChanged(indexInUse, -1);
    if(indexInUse < aTables.length) inUseListTree.view.selection.select(indexInUse);
    else if(indexInUse > 0) inUseListTree.view.selection.select(indexInUse - 1);
},

moveUpTable = function(){
	let selection = inUseListTree.view.selection;
	if(selection.count === 0) return;
	let index = selection.currentIndex;
	if(index === 0) return;
	let table = aTables[index];
	aTables.splice(index, 1);
	aTables.splice(index - 1, 0, table);

	let treeBox = inUseListTree.boxObject;
	treeBox.invalidateRange(index - 1, index);
	treeBox.ensureRowIsVisible(index - 1);
	selection.select(index - 1);
},
moveDownTable = function(){
	let selection = inUseListTree.view.selection;
	if(selection.count === 0) return;
	let index = selection.currentIndex;
	if(index === aTables.length - 1) return;
	let table = aTables[index];
	aTables.splice(index, 1);
	aTables.splice(index + 1, 0, table);

	let treeBox = inUseListTree.boxObject;
	treeBox.invalidateRange(index, index + 1);
	treeBox.ensureRowIsVisible(index + 1);
	selection.select(index + 1);
},
moveToTable = function(){
	let selection = inUseListTree.view.selection;
	if(selection.count === 0) return;
	let index = selection.currentIndex;
	let table = aTables[index];
	let str = stringBundle.GetStringFromName('prompt.newIndex');
	let newIndex = prompt(str, index+1);
	if(null===newIndex) return;
	newIndex = parseInt(newIndex, 10);
	if(Number.isInteger(newIndex) && newIndex >= 1  && newIndex <= aTables.length){
		newIndex -= 1;
	}else{
		alert(stringBundle.GetStringFromName('alert.newIndex'));
		return;
	}
	aTables.splice(index, 1);
	aTables.splice(newIndex, 0, table);

	let treeBox = inUseListTree.boxObject;
	treeBox.invalidateRange(index, newIndex);
	treeBox.ensureRowIsVisible(newIndex);
	selection.select(newIndex);
};

let onDialogAccept = function(){
	let group = {
		name: document.getElementById('nameTextbox').value||'',
		pattern: document.getElementById('patternTextbox').value,
		rule: document.getElementById('convOrNotMenulist').value,
		aTables: aTables
	};
	window.arguments[0].out = { group: group };
	return true;
};