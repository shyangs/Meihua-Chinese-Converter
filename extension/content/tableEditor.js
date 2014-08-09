'use strict';

const {classes: Cc, interfaces: Ci} = Components;
let stringBundle = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService).createBundle('chrome://meihuacc/locale/meihuacc.properties');

let tableTree = document.getElementById('phraseTree')

if(window.arguments[0]['in']){
	var group = window.arguments[0]['in'].group,
		name = group[0],
		aMappings = group[1].aMappings,
		aNameList = window.arguments[0]['in'].aNameList||[];

	document.getElementById('nameTextbox').value = name||'';

	let tableTreeView = {
		rowCount: group[1].aMappings.length,
		getCellText: function(row, column){
			switch(column.element.getAttribute('name')){
				case 'inputColumn': return aMappings[row][0];
				case 'outputColumn': return aMappings[row][1];
			}
		},
		setTree: function(treebox){ this.treebox = treebox; }
	};

	tableTree.view = tableTreeView;
}

let clearPhrase = function(){
	let ii = aMappings.length;
	aMappings = [];

	while(ii--){
		tableTree.boxObject.rowCountChanged(ii, -1);
	}
},
deletePhrase = function(){
	let selection = tableTree.view.selection;
	if(selection.count === 0) return;

    let index = selection.currentIndex;
    aMappings.splice(index, 1);

    tableTree.boxObject.rowCountChanged(index, -1);

    if(index < aMappings.length) selection.select(index);
    else if(index > 0) selection.select(index - 1);
},

editPhrase = function(index){
	if(document.getElementById('inputStringTextbox').value===''){
		alert(stringBundle.GetStringFromName('alert.inputStringTextbox.isEmpty'));
		return;
	}
	if(typeof index === 'undefined'){
		let selection = tableTree.view.selection;
		if(selection.count === 0) return;
		index = selection.currentIndex;
	}

	aMappings.splice(index, 1, [document.getElementById('inputStringTextbox').value, document.getElementById('outputStringTextbox').value]);
	document.getElementById('inputStringTextbox').value = '';
	document.getElementById('outputStringTextbox').value = '';

	tableTree.boxObject.invalidateRange(index, index);
},
addPhrase = function(index){
	if(document.getElementById('inputStringTextbox').value===''){
		alert(stringBundle.GetStringFromName('alert.inputStringTextbox.isEmpty'));
		return;
	}
	if(typeof index === 'undefined'){
		let selection = tableTree.view.selection;
		if(selection.count === 0) index = aMappings.length;
		else index = selection.currentIndex;
	}

	aMappings.splice(index+1, 0, [document.getElementById('inputStringTextbox').value, document.getElementById('outputStringTextbox').value]);

	document.getElementById('inputStringTextbox').value = '';
	document.getElementById('outputStringTextbox').value = '';

	tableTree.boxObject.rowCountChanged(index+1, 1);
	tableTree.boxObject.ensureRowIsVisible(index+1);
	tableTree.view.selection.select(index+1);
};

let onSelectGroup = function(el){
	let editButton = document.getElementsByClassName('editButton')[0],
		deleteButton = document.getElementsByClassName('deleteButton')[0];
	if(tableTree.currentIndex >= 0) {
		editButton.disabled = false;
		deleteButton.disabled = false;
	}else{
		editButton.disabled = true;
		deleteButton.disabled = true;
	}
};

let onDialogAccept = function(){
	let name = document.getElementById('nameTextbox').value;
	if(name===''){
		alert(stringBundle.GetStringFromName('alert.nameTextbox.isEmpty'));
		return false;
	}else if(aNameList.indexOf(name)!==-1){
		alert(stringBundle.GetStringFromName('alert.nameTextbox.isDuplicated'));
		return false;
	}
	
	let count = aMappings.length;
	if(count===0){
		alert(stringBundle.GetStringFromName('alert.aMappings.isEmpty'));
		return false;
	}
	
	let group = [name, {
		name: name,
		maxPhLen: (function(aMappings, len, maxPhLen){
			aMappings.forEach(function(item){
				maxPhLen = Math.max(maxPhLen, item[0].length);
			});
			return maxPhLen;
		})(aMappings, count, 0),
		count: count,
		version: Date.now(),
		aMappings: aMappings
	}];
	window.arguments[0].out = { group: group };
	return true;
};