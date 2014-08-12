'use strict';

const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import('resource://meihuacc/lib/Pref.js');
Cu.import('resource://meihuacc/lib/File.js');

let stringBundle = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService).createBundle('chrome://meihuacc/locale/meihuacc.properties');

let MeihuaCC = Application.windows[0]._window.MeihuaCC,
	pref = Pref('extensions.MeihuaCC.'),
	aURLs = JSON.parse(pref.getString('aURLs')),
	aHotkeys = JSON.parse(pref.getString('aHotkeys')),
	groupTree = document.getElementById('listTree'),
	hotkeyTree = document.getElementById('hotkeyTree'),
	tableTree = document.getElementById('userTableTree');

let aUserDefinedTable = File.read(File.open('userDefinedTable', 'MeihuaCC'))||[];

let savePref = function(entryName, arr){
	pref.setString(entryName, JSON.stringify(arr));
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
hotkeyTreeView = {
	rowCount: aHotkeys.length,
	getCellText: function(row, column){
		let group = aHotkeys[row];
		switch(column.element.getAttribute('name')){
			case 'nameColumn': return group.name;
			case 'hotkeyColumn': return group.hotkey;
		}
	},
	setTree: function(treebox){ this.treebox = treebox; }
},
tableTreeView = {
	rowCount: aUserDefinedTable.length,
	getCellText: function(row, column){
		let group = aUserDefinedTable[row];
		switch(column.element.getAttribute('name')){
			case 'nameColumn': return group.name;
			case 'countColumn': return group.count;
		}
	},
	setTree: function(treebox){ this.treebox = treebox; }
};

groupTree.view = groupTreeView;
hotkeyTree.view = hotkeyTreeView;
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
	let pN = el.parentNode,
		editButton = pN.getElementsByClassName('editButton')[0],
		deleteButton = pN.getElementsByClassName('deleteButton')[0];
	if(el.currentIndex >= 0){
		editButton.disabled = false;
		deleteButton.disabled = false;
	}else{
		editButton.disabled = true;
		deleteButton.disabled = true;
	}
},

clearGroup = function(){
	let ii = aURLs.length;
	aURLs = [];
	savePref('aURLs', aURLs);
	while(ii--){
		groupTree.boxObject.rowCountChanged(ii, -1);
	}
},
clearHotkey = function(){
	let ii = aHotkeys.length;
	aHotkeys = [];
	savePref('aHotkeys', aHotkeys);
	while(ii--){
		hotkeyTree.boxObject.rowCountChanged(ii, -1);
	}
},
clearTable = function(){
	aUserDefinedTable.forEach(function(aItem){
		MeihuaCC.removeTable(aItem);
	});

	let ii = aUserDefinedTable.length;
	aUserDefinedTable = [];
	File.write(File.create('userDefinedTable', 'MeihuaCC'), aUserDefinedTable);
	while(ii--){
		tableTree.boxObject.rowCountChanged(ii, -1);
	}

	aURLs.forEach(function(oURL){
		if(!oURL.hasOwnProperty('aTables')) return;
		delete oURL.aTables;
	});
	savePref('aURLs', aURLs);
},

deleteGroup = function(){
	let selection = groupTree.view.selection;
	if(selection.count === 0) return;

    let index = selection.currentIndex;
    aURLs.splice(index, 1);
    savePref('aURLs', aURLs);
    groupTree.boxObject.rowCountChanged(index, -1);

    if(index < aURLs.length) selection.select(index);
    else if(index > 0) selection.select(index - 1);
},
deleteHotkey = function(){
	let selection = hotkeyTree.view.selection;
	if(selection.count === 0) return;

    let index = selection.currentIndex;
    aHotkeys.splice(index, 1);
    savePref('aHotkeys', aHotkeys);
    hotkeyTree.boxObject.rowCountChanged(index, -1);

    if(index < aHotkeys.length) selection.select(index);
    else if(index > 0) selection.select(index - 1);
},
deleteTable = function(){
	let selection = tableTree.view.selection;
	if(selection.count === 0) return;

    let index = selection.currentIndex;
    let aDel = aUserDefinedTable.splice(index, 1);
    File.write(File.create('userDefinedTable', 'MeihuaCC'), aUserDefinedTable);
    tableTree.boxObject.rowCountChanged(index, -1);

    if(index < aUserDefinedTable.length) selection.select(index);
    else if(index > 0) selection.select(index - 1);

	let delTableName = aDel[0].name;
	aURLs.forEach(function(oURL){
		if( typeof oURL.aTables === 'undefined' ) return;
		let aTables = oURL.aTables, ii;
		if( -1 === (ii=aTables.indexOf(delTableName)) ) return;
		aTables.splice(ii, 1);
	});
	savePref('aURLs', aURLs);

	MeihuaCC.removeTable(aDel[0]);
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
		savePref('aURLs', aURLs);
		groupTree.boxObject.rowCountChanged(index+1, 1);
		groupTree.boxObject.ensureRowIsVisible(index+1);
		groupTree.view.selection.select(index+1);
	}
},
addHotkey = function(index){
	if(typeof index === 'undefined'){
		let selection = hotkeyTree.view.selection;
		if(selection.count === 0) index = aHotkeys.length;
		else index = selection.currentIndex;
	}

	let group = null,
	oldHotkey = null,
	aHotkeyList = aHotkeys.map(function(aItem){
        return aItem.hotkey;
    }).filter(function(x){
        return (x!==oldHotkey);
    }),
	params = { "in": {
		group: group,
		aHotkeyList: aHotkeyList
	} };

    window.openDialog("chrome://meihuacc/content/hotkeyEditor.xul", "", "chrome,titlebar,centerscreen,modal", params);

	if(params.out){
		aHotkeys.splice(index+1, 0, params.out.group);
		savePref('aHotkeys', aHotkeys);
		hotkeyTree.boxObject.rowCountChanged(index+1, 1);
		hotkeyTree.boxObject.ensureRowIsVisible(index+1);
		hotkeyTree.view.selection.select(index+1);
	}
},
addTable = function(index){
	if(typeof index === 'undefined'){
		let selection = tableTree.view.selection;
		if(selection.count === 0) index = aUserDefinedTable.length;
		else index = selection.currentIndex;
	}

	let group = {"name":'',"maxPhLen":0,"version":1,"aMappings":[]},
	aNameList = aUserDefinedTable.map(function(aItem){
		return aItem.name;
    }).filter(function(x){
        return (x!==group.name);
    }),
	params = { "in": { 
		group: group,
		aNameList: aNameList
	} };

    window.openDialog("chrome://meihuacc/content/tableEditor.xul", "", "chrome,titlebar,centerscreen,modal", params);

	if(params.out){
		aUserDefinedTable.splice(index+1, 0, params.out.group);

		File.write(File.create('userDefinedTable', 'MeihuaCC'), aUserDefinedTable);

		tableTree.boxObject.rowCountChanged(index+1, 1);
		tableTree.boxObject.ensureRowIsVisible(index+1);
		tableTree.view.selection.select(index+1);

		MeihuaCC.addTable(params.out.group);
	}
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
		savePref('aURLs', aURLs);
		groupTree.boxObject.invalidateRange(index, index);
	}
},
editHotkey = function(index){
	if(typeof index === 'undefined'){
		let selection = hotkeyTree.view.selection;
		if(selection.count === 0) return;
		index = selection.currentIndex;
	}

	let group = aHotkeys[index],
	oldHotkey = group.hotkey,
	aHotkeyList = aHotkeys.map(function(aItem){
        return aItem.hotkey;
    }).filter(function(x){
        return (x!==oldHotkey);
    }),
	params = { "in": {
		group: group,
		aHotkeyList: aHotkeyList
	} };

    window.openDialog("chrome://meihuacc/content/hotkeyEditor.xul", "", "chrome,titlebar,centerscreen,modal", params);

	if(params.out){
		aHotkeys.splice(index, 1, params.out.group);
		savePref('aHotkeys', aHotkeys);
		hotkeyTree.boxObject.invalidateRange(index, index);
	}
},
editTable = function(index){
	if(typeof index === 'undefined'){
		let selection = tableTree.view.selection;
		if(selection.count === 0) return;
		index = selection.currentIndex;
	}

	let group = aUserDefinedTable[index],
	oldName = group.name,
	aNameList = aUserDefinedTable.map(function(aItem){
		return aItem.name;
    }).filter(function(x){
        return (x!==oldName);
    }),
	params = { "in": {
		group: group,
		aNameList: aNameList
	} };

    window.openDialog("chrome://meihuacc/content/tableEditor.xul", "", "chrome,titlebar,centerscreen,modal", params);

	if(params.out){
		aUserDefinedTable.splice(index, 1, params.out.group);

		File.write(File.create('userDefinedTable', 'MeihuaCC'), aUserDefinedTable);
		tableTree.boxObject.invalidateRange(index, index);
		
		MeihuaCC.addTable(params.out.group);

		let newName = params.out.group.name;
		if(oldName===newName) return;
		aURLs.forEach(function(oURL){
			if( typeof oURL.aTables === 'undefined' ) return;
			let aTables = oURL.aTables, ii;
			if( -1 === (ii=aTables.indexOf(oldName)) ) return;
			aTables.splice(ii, 1, newName);
		});
		savePref('aURLs', aURLs);
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
	savePref('aURLs', aURLs);
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
	savePref('aURLs', aURLs);
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
	savePref('aURLs', aURLs);
	let treeBox = groupTree.boxObject;
	treeBox.invalidateRange(index, newIndex);
	treeBox.ensureRowIsVisible(newIndex);
	selection.select(newIndex);
};