'use strict';

const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import('resource://gre/modules/Services.jsm');
Services.scriptloader.loadSubScript('resource://meihuacc/lib/keyCodeMapper.js', this, 'UTF-8');
Cu.import('resource://meihuacc/lib/Pref.js');
Cu.import('resource://meihuacc/lib/File.js');

let stringBundle = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService).createBundle('chrome://meihuacc/locale/meihuacc.properties');

let pref = Pref('extensions.MeihuaCC.'),
	aURLs = JSON.parse(pref.getString('aURLs')),
	groupTree = document.getElementById('listTree'),
	tableTree = document.getElementById('userTableTree');

let aUserDefinedTable = File.read(File.open('userDefinedTable', 'MeihuaCC'))||[];

let savePref = function(){
	pref.setString('aURLs', JSON.stringify(aURLs));
};

let groupTreeView = {
	rowCount: aURLs.length,
	getCellText: function(row, column){
		let group = aURLs[row];
		switch(column.element.getAttribute('name')){
			case 'indexColumn': return row+1;
			case 'nameColumn': return group.name||'';
			case 'patternColumn': return group.pattern;
			case 'convOrNotColumn': return group.rule==='exclude'?stringBundle.GetStringFromName('conv.exclude'):stringBundle.GetStringFromName('conv.include');
		}
	},
	setTree: function(treebox){ this.treebox = treebox; }
},
tableTreeView = {
	rowCount: aUserDefinedTable.length,
	getCellText: function(row, column){
		let group = aUserDefinedTable[row];
		switch(column.element.getAttribute('name')){
			case 'nameColumn': return group[0];
		}
	},
	setTree: function(treebox){ this.treebox = treebox; }
};

groupTree.view = groupTreeView;
tableTree.view = tableTreeView;


let onSelectGroup = function(){
	let editButton = document.getElementById('editButton'),
		deleteButton = document.getElementById('deleteButton'),
		moveUpButton = document.getElementById('moveUpButton'),
		moveDownButton = document.getElementById('moveDownButton'),
		moveToButton = document.getElementById('moveToButton');
	if(groupTree.currentIndex >= 0) {
		editButton.disabled = false;
		deleteButton.disabled = false;
		moveUpButton.disabled = false;
		moveDownButton.disabled = false;
		moveToButton.disabled = false;
	}else{
		editButton.disabled = true;
		deleteButton.disabled = true;
		moveUpButton.disabled = true;
		moveDownButton.disabled = true;
		moveToButton.disabled = true;
	}
},
onSelectTable = function(el){
	el = el.parentNode;
	let editButton = el.getElementsByClassName('editButton')[0],
		deleteButton = el.getElementsByClassName('deleteButton')[0];
	if(tableTree.currentIndex >= 0) {
		editButton.disabled = false;
		deleteButton.disabled = false;
	}else{
		editButton.disabled = true;
		deleteButton.disabled = true;
	}
},

clearGroup = function(){
	aURLs = [];
	savePref();
},
clearTable = function(){
	aUserDefinedTable = [];
	File.write(File.create('userDefinedTable', 'MeihuaCC'), aUserDefinedTable);
},

deleteGroup = function(){
	let selection = groupTree.view.selection;
	if(selection.count === 0) return;

    let index = selection.currentIndex;
    aURLs.splice(index, 1);
    savePref();
    groupTree.boxObject.rowCountChanged(index, -1);

    if(index < aURLs.length) selection.select(index);
    else if(index > 0) selection.select(index - 1);
},
deleteTable = function(){
	let selection = tableTree.view.selection;
	if(selection.count === 0) return;

    let index = selection.currentIndex;
    aUserDefinedTable.splice(index, 1);
    File.write(File.create('userDefinedTable', 'MeihuaCC'), aUserDefinedTable);
    tableTree.boxObject.rowCountChanged(index, -1);

    if(index < aUserDefinedTable.length) selection.select(index);
    else if(index > 0) selection.select(index - 1);
},

editGroup = function(index){
	if(typeof index === 'undefined'){
		let selection = groupTree.view.selection;
		if(selection.count === 0) return;
		index = selection.currentIndex;
	}

	let group = aURLs[index];
	let params = { "in": { group: group } };

    window.openDialog("chrome://meihuacc/content/groupEditor.xul", "", "chrome,titlebar,centerscreen,modal", params);

	if(params.out){
		aURLs.splice(index, 1, params.out.group);
		savePref();
		groupTree.boxObject.invalidateRange(index, index);
	}
},
addGroup = function(index){
	if(typeof index === 'undefined'){
		let selection = groupTree.view.selection;
		if(selection.count === 0) index = aURLs.length;
		else index = selection.currentIndex;
	}
	let params = {};

    window.openDialog("chrome://meihuacc/content/groupEditor.xul", "", "chrome,titlebar,centerscreen,modal", params);

	if(params.out){
		aURLs.splice(index+1, 0, params.out.group);
		savePref();
		groupTree.boxObject.rowCountChanged(index+1, 1);
		groupTree.boxObject.ensureRowIsVisible(index+1);
		groupTree.view.selection.select(index+1);
	}
},

editTable = function(index){
	if(typeof index === 'undefined'){
		let selection = tableTree.view.selection;
		if(selection.count === 0) return;
		index = selection.currentIndex;
	}

	let group = aUserDefinedTable[index];
	let params = { "in": { group: group } };

    window.openDialog("chrome://meihuacc/content/tableEditor.xul", "", "chrome,titlebar,centerscreen,modal", params);

	if(params.out){
		aUserDefinedTable.splice(index, 1, params.out.group);

		File.write(File.create('userDefinedTable', 'MeihuaCC'), aUserDefinedTable);
		tableTree.boxObject.invalidateRange(index, index);
	}
},
addTable = function(index){
	if(typeof index === 'undefined'){
		let selection = tableTree.view.selection;
		if(selection.count === 0) index = aUserDefinedTable.length;
		else index = selection.currentIndex;
	}
	let group = ['',{"name":'',"maxPhLen":0,"version":1,"aMappings":[]}];
	let params = { "in": { group: group } };

    window.openDialog("chrome://meihuacc/content/tableEditor.xul", "", "chrome,titlebar,centerscreen,modal", params);

	if(params.out){
		aUserDefinedTable.splice(index+1, 0, params.out.group);

		File.write(File.create('userDefinedTable', 'MeihuaCC'), aUserDefinedTable);

		tableTree.boxObject.rowCountChanged(index+1, 1);
		tableTree.boxObject.ensureRowIsVisible(index+1);
		tableTree.view.selection.select(index+1);
	}
},

moveUpGroup = function(){
	let selection = groupTree.view.selection;
	if(selection.count === 0) return;
	let index = selection.currentIndex;
	if(index === 0) return;
	let group = aURLs[index];
	aURLs.splice(index, 1);
	aURLs.splice(index - 1, 0, group);
	savePref();
	let treeBox = groupTree.boxObject;
	treeBox.invalidateRange(index - 1, index);
	treeBox.ensureRowIsVisible(index - 1);
	selection.select(index - 1);
},
moveDownGroup = function(){
	let selection = groupTree.view.selection;
	if(selection.count === 0) return;
	let index = selection.currentIndex;
	if(index === aURLs.length - 1) return;
	let group = aURLs[index];
	aURLs.splice(index, 1);
	aURLs.splice(index + 1, 0, group);
	savePref();
	let treeBox = groupTree.boxObject;
	treeBox.invalidateRange(index, index + 1);
	treeBox.ensureRowIsVisible(index + 1);
	selection.select(index + 1);
},
moveToGroup = function(){
	let selection = groupTree.view.selection;
	if(selection.count === 0) return;
	let index = selection.currentIndex;
	let group = aURLs[index];
	let str = stringBundle.GetStringFromName('prompt.newIndex');
	let newIndex = prompt(str, index+1);
	if(null===newIndex) return;
	newIndex = parseInt(newIndex, 10);
	if(Number.isInteger(newIndex) && newIndex >= 1  && newIndex <= aURLs.length){
		newIndex -= 1;
	}else{
		alert(stringBundle.GetStringFromName('alert.newIndex'));
		return;
	}
	aURLs.splice(index, 1);
	aURLs.splice(newIndex, 0, group);
	savePref();
	let treeBox = groupTree.boxObject;
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

	pref.setString('sConvHotkey', sHotkey);
};

document.getElementById('sConvHotkeyTextbox').onkeydown = setHotkey;