'use strict';

const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import('resource://gre/modules/Services.jsm');
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
	document.getElementById('convOrNotMenulist').checked = (group.rule==='exclude'?false:true);
	
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

let onChange = function(checked){
	if(checked) {
		inUseListTree.disabled = false;
		availableListTree.disabled = false;
	}else{
		inUseListTree.disabled = true;
		availableListTree.disabled = true;
	}
};

onChange(document.getElementById('convOrNotMenulist').checked);

Services.scriptloader.loadSubScript('resource://meihuacc/content/biTreeUtils.js');

let onDialogAccept = function(){
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