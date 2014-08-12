'use strict';

const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import('resource://meihuacc/lib/File.js');
Cu.import('resource://gre/modules/Services.jsm');
Services.scriptloader.loadSubScript('resource://meihuacc/lib/keyCodeMapper.js', this, 'UTF-8');

let stringBundle = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService).createBundle('chrome://meihuacc/locale/meihuacc.properties');

let aUserDefinedTable = File.read(File.open('userDefinedTable', 'MeihuaCC'))||[],
	inUseListTree = document.getElementById('inUseListTree'),
	availableListTree = document.getElementById('availableListTree'),
	aTables;

if(window.arguments[0]['in']){
	var aHotkeyList = window.arguments[0]['in'].aHotkeyList||[];

	let group = window.arguments[0]['in'].group;
	if(group){
		document.getElementById('nameTextbox').value = group.name||'';
		document.getElementById('hotkeyTextbox').value = group.hotkey;
		
		aTables = group.aTables;
	}
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

let setHotkey = function(event){
	let sHotkey = '', 
		nKeyCode = event.keyCode;

	if(nKeyCode in keyCodeMapper){
		sHotkey = keyCodeMapper[nKeyCode];
	}	

	let modifiers = [];
	if(event.ctrlKey) modifiers.push("CONTROL");	
	if(event.altKey) modifiers.push("ALT");	
	if(event.shiftKey) modifiers.push("SHIFT");
	//if(event.metaKey) modifiers.push("META");

	if(modifiers.length > 0){
		if(sHotkey !== ''){
			sHotkey = modifiers.join('+') + '+' + keyCodeMapper[nKeyCode];
		} else {
			sHotkey = modifiers.join('+');
		}
	}

	document.getElementById('hotkeyTextbox').value = sHotkey;
};
document.getElementById('hotkeyTextbox').onkeydown = setHotkey;

let onDialogAccept = function(){
	let hotkey = document.getElementById('hotkeyTextbox').value;
	if(aHotkeyList.indexOf(hotkey)!==-1){
		alert(stringBundle.GetStringFromName('alert.hotkeyTextbox.isDuplicated'));
		return false;
	}

	let group = {
		name: document.getElementById('nameTextbox').value||'',
		hotkey: hotkey,
		aTables: aTables
	};
	window.arguments[0].out = { group: group };
	return true;
};