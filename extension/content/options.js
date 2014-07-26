'use strict';

const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import('resource://gre/modules/Services.jsm');
Services.scriptloader.loadSubScript('resource://meihuacc/lib/keyCodeMapper.js', this, 'UTF-8');
Cu.import('resource://meihuacc/lib/Pref.js');
let stringBundle = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService).createBundle('chrome://meihuacc/locale/meihuacc.properties');

let pref = Pref('extensions.MeihuaCC.'),
	aURLs = JSON.parse(pref.getString('aURLs')),
	tree = document.getElementById('listTree');
	
let savePref = function(){
	pref.setString('aURLs', JSON.stringify(aURLs));
};

let treeView = {
	rowCount: aURLs.length,
	getCellText: function(row, column){
		let group = aURLs[row];
		switch(column.id){
			case 'indexColumn': return row+1;
			case 'nameColumn': return group.name||'';
			case 'patternColumn': return group.pattern;
			case 'convOrNotColumn': return group.rule==='exclude'?stringBundle.GetStringFromName('conv.exclude'):stringBundle.GetStringFromName('conv.include');
		}
	},
	setTree: function(treebox){ this.treebox = treebox; }
};

let onSelectGroup = function(){
	let editButton =  document.getElementById('editButton'),
		deleteButton =  document.getElementById('deleteButton'),
		moveUpButton =  document.getElementById('moveUpButton'),
		moveDownButton =  document.getElementById('moveDownButton'),
		moveToButton =  document.getElementById('moveToButton');
	if(tree.currentIndex >= 0) {
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

clearGroup = function(){
	aURLs = [];
	savePref();
},
deleteGroup = function(){
	let selection = tree.view.selection;
	if(selection.count === 0) return;

    let index = selection.currentIndex;
    aURLs.splice(index, 1);
    savePref();
    tree.boxObject.rowCountChanged(index, -1);

    if(index < aURLs.length) selection.select(index);
    else if(index > 0) selection.select(index - 1);
},

editGroup = function(index){
	if (typeof index === 'undefined'){
		let selection = tree.view.selection;
		if(selection.count === 0) return;
		index = selection.currentIndex;
	}

	let group = aURLs[index];
	let params = { "in": { group: group } };

    window.openDialog("chrome://meihuacc/content/groupEditor.xul", "", "chrome,titlebar,centerscreen,modal", params);

	if(params.out){
		aURLs.splice(index, 1, params.out.group);
		savePref();
		tree.boxObject.invalidateRange(index, index);
	}
},
addGroup = function(index){
	if (typeof index === 'undefined'){
		let selection = tree.view.selection;
		if(selection.count === 0) index = aURLs.length;
		else index = selection.currentIndex;
	}
	let params = {};

    window.openDialog("chrome://meihuacc/content/groupEditor.xul", "", "chrome,titlebar,centerscreen,modal", params);

	if(params.out){
		aURLs.splice(index, 0, params.out.group);
		savePref();
		tree.boxObject.rowCountChanged(index, 1);
		tree.boxObject.ensureRowIsVisible(index);
		tree.view.selection.select(index);
	}
},

moveUpGroup = function(){
	let selection = tree.view.selection;
	if (selection.count === 0) return;
	let index = selection.currentIndex;
	if (index === 0) return;
	let group = aURLs[index];
	aURLs.splice(index, 1);
	aURLs.splice(index - 1, 0, group);
	savePref();
	let treeBox = tree.boxObject;
	treeBox.invalidateRange(index - 1, index);
	treeBox.ensureRowIsVisible(index - 1);
	selection.select(index - 1);
},
moveDownGroup = function(){
	let selection = tree.view.selection;
	if (selection.count === 0) return;
	let index = selection.currentIndex;
	if (index === aURLs.length - 1) return;
	let group = aURLs[index];
	aURLs.splice(index, 1);
	aURLs.splice(index + 1, 0, group);
	savePref();
	let treeBox = tree.boxObject;
	treeBox.invalidateRange(index, index + 1);
	treeBox.ensureRowIsVisible(index + 1);
	selection.select(index + 1);
},
moveToGroup = function(){
	let selection = tree.view.selection;
	if (selection.count === 0) return;
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
	let treeBox = tree.boxObject;
	treeBox.invalidateRange(index, newIndex);
	treeBox.ensureRowIsVisible(newIndex);
	selection.select(newIndex);
};

let setHotkey = function(event){
	let sHotkey = '', 
		nKeyCode = event.keyCode;

	if (nKeyCode in keyCodeMapper){
		sHotkey = keyCodeMapper[nKeyCode];
	}	

	let modifiers = [];
	if(event.ctrlKey) modifiers.push("CONTROL");	
	if(event.altKey) modifiers.push("ALT");	
	if(event.shiftKey) modifiers.push("SHIFT");
	//if(event.metaKey) modifiers.push("META");

	if (modifiers.length > 0){
		if (sHotkey !== ''){
			sHotkey = modifiers.join('+') + '+' + keyCodeMapper[nKeyCode];
		} else {
			sHotkey = modifiers.join('+');
		}
	}

	pref.setString('sConvHotkey', sHotkey);
};

tree.view = treeView;
document.getElementById('sConvHotkeyTextbox').onkeydown = setHotkey;