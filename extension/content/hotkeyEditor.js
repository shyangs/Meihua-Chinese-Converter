'use strict';
/* MeihuaCC is licensed under GPLv2 or later versions. See the LICENSE file. */
Components.utils.import('resource://meihuacc/lib/constants.js');
Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://meihuacc/lib/File.js');

Services.scriptloader.loadSubScript('resource://meihuacc/lib/keyCodeMapper.js', this, 'UTF-8');

let stringBundle = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService).createBundle('chrome://meihuacc/locale/meihuacc.properties');

let aDefaultTables = Application.windows[0]._window.MeihuaCC.getConfig('aDefaultTables'),
	aUserDefinedTable = File.read(File.open('userDefinedTable', 'MeihuaCC'))||[],
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

aTables = aTables||aDefaultTables;
let inUseListTreeView = {
	rowCount: aTables.length,
	getCellText: function(row, column){
		switch(column.element.getAttribute('name')){
			case 'indexColumn': return row+1;
			case 'nameColumn': return aTables[row];
		}
	},
	setTree: function(treebox){ this.treebox = treebox; }
};
inUseListTree.view = inUseListTreeView;

let availableList = BUILTIN_TABLE
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


Services.scriptloader.loadSubScript('resource://meihuacc/content/biTreeUtils.js');
let onSelectInUseList = function(){
	_onSelectItem(inUseListTree, document.getElementById('removeButton'), document.getElementById('moveUpButton'), document.getElementById('moveDownButton'), document.getElementById('moveToButton'));
},
onSelectAvailableList = function(){
	_onSelectItem(availableListTree, document.getElementById('addButton'));
},

addTable = function(indexAvailable, indexInUse){
	_addTable(availableListTree, inUseListTree, availableList, aTables, indexAvailable, indexInUse);
},
removeTable = function(indexAvailable, indexInUse){
	_removeTable(availableListTree, inUseListTree, availableList, aTables, indexAvailable, indexInUse);
},

moveUpTable = function(){
	_moveUpTable(inUseListTree, aTables);
},
moveDownTable = function(){
	_moveDownTable(inUseListTree, aTables);
},
moveToTable = function(){
	_moveToTable(inUseListTree, aTables);
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
		name: document.getElementById('nameTextbox').value,
		hotkey: hotkey,
		aTables: aTables
	};
	window.arguments[0].out = { group: group };
	return true;
};