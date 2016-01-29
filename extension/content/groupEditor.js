'use strict';
/* MeihuaCC is licensed under GPLv2 or later versions. See the LICENSE file. */
Components.utils.import('resource://meihuacc/lib/constants.js');
Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://meihuacc/lib/File.js');
Services.scriptloader.loadSubScript('resource://meihuacc/lib/Utils.js');

let stringBundle = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService).createBundle('chrome://meihuacc/locale/meihuacc.properties');

let aDefaultTables = Utils.getMostRecentWindow('navigator:browser').MeihuaCC.getConfig('aDefaultTables'),
	aUserDefinedTable = File.read(File.open('userDefinedTable', 'MeihuaCC'))||[],
	inUseListTree = document.getElementById('inUseListTree'),
	availableListTree = document.getElementById('availableListTree'),
	aTables;

if(window.arguments[0]['in']){
	let group = window.arguments[0]['in'].group;

	document.getElementById('nameTextbox').value = group.name||'';
	document.getElementById('patternTextbox').value = group.pattern;
	document.getElementById('convOrNotMenulist').checked = (group.rule==='exclude'?false:true);
	
	aTables = group.aTables;
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
}
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

let onChange = function(checked){
	if(checked) {
		let elmts = document.getElementsByClassName('visibility_hidden'),
			ii = elmts.length;
		while(ii--){
			elmts[ii].classList.remove('visibility_hidden');
		}

		inUseListTree.disabled = false;
		availableListTree.disabled = false;
	}else{
		let elmts = document.getElementsByClassName('mapping_table_form'),
			ii = elmts.length;
		while(ii--){
			elmts[ii].classList.add('visibility_hidden');
		}

		inUseListTree.disabled = true;
		availableListTree.disabled = true;
	}
};

onChange(document.getElementById('convOrNotMenulist').checked);

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


var onDialogAccept = function(){
	let pattern = document.getElementById('patternTextbox').value;
	if(''===pattern){
		alert(stringBundle.GetStringFromName('alert.patternTextbox.isEmpty'));
		return false;
	}
	let group = {
		name: document.getElementById('nameTextbox').value,
		pattern: pattern,
		rule: document.getElementById('convOrNotMenulist').checked?'include':'exclude',
		aTables: aTables
	};
	window.arguments[0].out = { group: group };
	return true;
};