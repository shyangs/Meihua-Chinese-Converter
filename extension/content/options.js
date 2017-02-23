'use strict';
/* MeihuaCC is licensed under GPLv2 or later versions. See the LICENSE file. */
Components.utils.import('resource://meihuacc/lib/constants.js');
Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://meihuacc/lib/Pref.js');
Cu.import('resource://meihuacc/lib/File.js');
Cu.import('resource://meihuacc/content/config.js');
Services.scriptloader.loadSubScript('resource://meihuacc/lib/Utils.js');

let stringBundle = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService).createBundle('chrome://meihuacc/locale/meihuacc.properties');

let MeihuaCC = Utils.getMostRecentWindow('navigator:browser').MeihuaCC,
	pref = Pref('extensions.MeihuaCC.'),
	groupTree = document.getElementById('listTree'),
	hotkeyTree = document.getElementById('hotkeyTree'),
	tableTree = document.getElementById('userTableTree'),
	tbbLeft_inUse_Tree = document.getElementById('tbbLeft_inUse_Tree'),
	tbbMiddle_inUse_Tree = document.getElementById('tbbMiddle_inUse_Tree'),
	tbbRight_inUse_Tree = document.getElementById('tbbRight_inUse_Tree'),
	tbbLeft_available_Tree = document.getElementById('tbbLeft_available_Tree'),
	tbbMiddle_available_Tree = document.getElementById('tbbMiddle_available_Tree'),
	tbbRight_available_Tree = document.getElementById('tbbRight_available_Tree');

let savePref = function(entryName, arr){
	pref.setString(entryName, JSON.stringify(arr));
};

let aUserDefinedTable = File.read(File.open('userDefinedTable', 'MeihuaCC'))||[];

let aDefaultTables, aURLs, aHotkeys, oTBB, aTbls_L, aTbls_M, aTbls_R, availableList_L, availableList_M, availableList_R;

let _Val_init = function(){
	aDefaultTables = JSON.parse(pref.getString('aDefaultTables'));
	aURLs = JSON.parse(pref.getString('aURLs'));
	aHotkeys = JSON.parse(pref.getString('aHotkeys'));
	oTBB = JSON.parse(pref.getString('oTBB'));
	aTbls_L = oTBB.left.aTables||aDefaultTables;
	aTbls_M = oTBB.middle.aTables||aDefaultTables;
	aTbls_R = oTBB.right.aTables||aDefaultTables;
	availableList_L = BUILTIN_TABLE
		.concat(aUserDefinedTable.map(function(aItem){
			return aItem.name;
		})).filter(function(x){
			return (aTbls_L.indexOf(x)===-1);
		});
	availableList_M = BUILTIN_TABLE
		.concat(aUserDefinedTable.map(function(aItem){
			return aItem.name;
		})).filter(function(x){
			return (aTbls_M.indexOf(x)===-1);
		});
	availableList_R = BUILTIN_TABLE
		.concat(aUserDefinedTable.map(function(aItem){
			return aItem.name;
		})).filter(function(x){
			return (aTbls_R.indexOf(x)===-1);
		});
};

let _TreeView_init = function(){
	_Val_init();

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

	let tbbLeft_inUse_TreeView = {
		rowCount: aTbls_L.length,
		getCellText: function(row, column){
			switch(column.element.getAttribute('name')){
				case 'indexColumn': return row+1;
				case 'nameColumn': return aTbls_L[row];
			}
		},
		setTree: function(treebox){ this.treebox = treebox; }
	},
	tbbMiddle_inUse_TreeView = {
		rowCount: aTbls_M.length,
		getCellText: function(row, column){
			switch(column.element.getAttribute('name')){
				case 'indexColumn': return row+1;
				case 'nameColumn': return aTbls_M[row];
			}
		},
		setTree: function(treebox){ this.treebox = treebox; }
	},
	tbbRight_inUse_TreeView = {
		rowCount: aTbls_R.length,
		getCellText: function(row, column){
			switch(column.element.getAttribute('name')){
				case 'indexColumn': return row+1;
				case 'nameColumn': return aTbls_R[row];
			}
		},
		setTree: function(treebox){ this.treebox = treebox; }
	};

	let tbbLeft_available_TreeView = {
		rowCount: availableList_L.length,
		getCellText: function(row, column){
			switch(column.element.getAttribute('name')){
				case 'nameColumn': return availableList_L[row];
			}
		},
		setTree: function(treebox){ this.treebox = treebox; }
	},
	tbbMiddle_available_TreeView = {
		rowCount: availableList_M.length,
		getCellText: function(row, column){
			switch(column.element.getAttribute('name')){
				case 'nameColumn': return availableList_M[row];
			}
		},
		setTree: function(treebox){ this.treebox = treebox; }
	},
	tbbRight_available_TreeView = {
		rowCount: availableList_R.length,
		getCellText: function(row, column){
			switch(column.element.getAttribute('name')){
				case 'nameColumn': return availableList_R[row];
			}
		},
		setTree: function(treebox){ this.treebox = treebox; }
	};

	groupTree.view = groupTreeView;
	hotkeyTree.view = hotkeyTreeView;
	tableTree.view = tableTreeView;
	tbbLeft_inUse_Tree.view = tbbLeft_inUse_TreeView;
	tbbMiddle_inUse_Tree.view = tbbMiddle_inUse_TreeView;
	tbbRight_inUse_Tree.view = tbbRight_inUse_TreeView;
	tbbLeft_available_Tree.view = tbbLeft_available_TreeView;
	tbbMiddle_available_Tree.view = tbbMiddle_available_TreeView;
	tbbRight_available_Tree.view = tbbRight_available_TreeView;
};
_TreeView_init();

let onChange = function(menulist){
	let tabpanel = document.getElementsByClassName(menulist.getAttribute('preference'))[0];
	if(menulist.getAttribute('value')===CONV_WEB_TEXT) {
		let elmts = tabpanel.getElementsByClassName('visibility_hidden'),
			ii = elmts.length;
		while(ii--){
			elmts[ii].classList.remove('visibility_hidden');
		}

		elmts = tabpanel.getElementsByTagName('tree'),
		ii = elmts.length;
		while(ii--){
			elmts[ii].disabled = false;
		}
	}else{
		let elmts = tabpanel.getElementsByClassName('mapping_table_form'),
			ii = elmts.length;
		while(ii--){
			elmts[ii].classList.add('visibility_hidden');
		}

		elmts = tabpanel.getElementsByTagName('tree'),
		ii = elmts.length;
		while(ii--){
			elmts[ii].disabled = true;
		}
	}
},
menulist_init = function(){
	let tbbFn_menulist = document.getElementsByClassName('tbbFn_menulist'),
		ii = tbbFn_menulist.length;
	while(ii--){
		onChange(tbbFn_menulist[ii]);
	}
};
menulist_init();

Services.scriptloader.loadSubScript('resource://meihuacc/content/biTreeUtils.js');
let L_onSelectInUseList = function(){
	_onSelectItem(tbbLeft_inUse_Tree, document.getElementById('L_removeButton'), document.getElementById('L_moveUpButton'), document.getElementById('L_moveDownButton'), document.getElementById('L_moveToButton'));
},
L_onSelectAvailableList = function(){
	_onSelectItem(tbbLeft_available_Tree, document.getElementById('L_addButton'));
},

M_onSelectInUseList = function(){
	_onSelectItem(tbbMiddle_inUse_Tree, document.getElementById('M_removeButton'), document.getElementById('M_moveUpButton'), document.getElementById('M_moveDownButton'), document.getElementById('M_moveToButton'));
},
M_onSelectAvailableList = function(){
	_onSelectItem(tbbMiddle_available_Tree, document.getElementById('M_addButton'));
},

R_onSelectInUseList = function(){
	_onSelectItem(tbbRight_inUse_Tree, document.getElementById('R_removeButton'), document.getElementById('R_moveUpButton'), document.getElementById('R_moveDownButton'), document.getElementById('R_moveToButton'));
},
R_onSelectAvailableList = function(){
	_onSelectItem(tbbRight_available_Tree, document.getElementById('R_addButton'));
};

let L_addTable = function(indexAvailable, indexInUse){
	_addTable(tbbLeft_available_Tree, tbbLeft_inUse_Tree, availableList_L, aTbls_L);
},
L_removeTable = function(indexAvailable, indexInUse){
	_removeTable(tbbLeft_available_Tree, tbbLeft_inUse_Tree, availableList_L, aTbls_L);
},
L_moveUpTable = function(){
	_moveUpTable(tbbLeft_inUse_Tree, aTbls_L);
},
L_moveDownTable = function(){
	_moveDownTable(tbbLeft_inUse_Tree, aTbls_L);
},
L_moveToTable = function(){
	_moveToTable(tbbLeft_inUse_Tree, aTbls_L);
};

let M_addTable = function(indexAvailable, indexInUse){
	_addTable(tbbMiddle_available_Tree, tbbMiddle_inUse_Tree, availableList_M, aTbls_M);
},
M_removeTable = function(indexAvailable, indexInUse){
	_removeTable(tbbMiddle_available_Tree, tbbMiddle_inUse_Tree, availableList_M, aTbls_M);
},
M_moveUpTable = function(){
	_moveUpTable(tbbMiddle_inUse_Tree, aTbls_M);
},
M_moveDownTable = function(){
	_moveDownTable(tbbMiddle_inUse_Tree, aTbls_M);
},
M_moveToTable = function(){
	_moveToTable(tbbMiddle_inUse_Tree, aTbls_M);
};

let R_addTable = function(indexAvailable, indexInUse){
	_addTable(tbbRight_available_Tree, tbbRight_inUse_Tree, availableList_R, aTbls_R);
},
R_removeTable = function(indexAvailable, indexInUse){
	_removeTable(tbbRight_available_Tree, tbbRight_inUse_Tree, availableList_R, aTbls_R);
},
R_moveUpTable = function(){
	_moveUpTable(tbbRight_inUse_Tree, aTbls_R);
},
R_moveDownTable = function(){
	_moveDownTable(tbbRight_inUse_Tree, aTbls_R);
},
R_moveToTable = function(){
	_moveToTable(tbbRight_inUse_Tree, aTbls_R);
};

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
clearUMT = function(){
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
	_TreeView_init();
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
deleteUMT = function(){
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
	_TreeView_init();
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
addUMT = function(index){
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
		_TreeView_init();
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
editUMT = function(index){
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
		_TreeView_init();
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

let _reset = function(config){
	prefObserver.saveConfig(config);
	prefObserver.reloadConfig();

	menulist_init();	
	_TreeView_init();
};
let btn_pref_reset = function(){
	_reset({
		bFirstRun: true,
		bConvAlt: true,
		bConvTitle: true,
		bConvFrame: true,
		sToolbarBtnLeftClick: CONV_WEB_TEXT,
		sToolbarBtnMiddleClick: DO_NOTHING,
		sToolbarBtnRightClick: OPEN_SETTING_WINDOW,
		aDefaultTables: DEFAULT_TABLE,
		aURLs: DEFAULT_PATTERN,
		aHotkeys: [],
		oTBB: {
			left:{},
			middle:{},
			right:{}
		}
	});
},
btn_pref_tw = function(){
	_reset({
		bFirstRun: true,
		bConvAlt: true,
		bConvTitle: true,
		bConvFrame: true,
		sToolbarBtnLeftClick: CONV_WEB_TEXT,
		sToolbarBtnMiddleClick: DO_NOTHING,
		sToolbarBtnRightClick: OPEN_SETTING_WINDOW,
		aDefaultTables: DEFAULT_TABLE_TW,
		aURLs: DEFAULT_PATTERN_TW,
		aHotkeys: [],
		oTBB: {
			left:{},
			middle:{},
			right:{}
		}
	});
},
btn_pref_cn = function(){
	_reset({
		bFirstRun: true,
		bConvAlt: true,
		bConvTitle: true,
		bConvFrame: true,
		sToolbarBtnLeftClick: CONV_WEB_TEXT,
		sToolbarBtnMiddleClick: DO_NOTHING,
		sToolbarBtnRightClick: OPEN_SETTING_WINDOW,
		aDefaultTables: DEFAULT_TABLE_CN,
		aURLs: DEFAULT_PATTERN_CN,
		aHotkeys: [],
		oTBB: {
			left:{},
			middle:{},
			right:{}
		}
	});
};

let isJsonValid = function(aData){
  try {
		JSON.parse(aData);
  } catch(e){
		return false;
  }
  return true;
};

let btn_pref_export = function(){
	try {
		let fileType = "json";
		let nsIFilePicker = Ci.nsIFilePicker;
		let fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		let stream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);

		fp.init(window, null, nsIFilePicker.modeSave);
		fp.defaultExtension = fileType;
		fp.defaultString = "MeihuaCC_Preferences." + fileType;

		fp.appendFilters(nsIFilePicker.filterAll);
		
		if (fp.show() != nsIFilePicker.returnCancel){
			let file = fp.file;

			if (!/\.json$/.test(file.leafName.toLowerCase())) file.leafName += ".json";

			if (file.exists()) file.remove(true);
			file.create(file.NORMAL_FILE_TYPE, parseInt("0666", 8));
			stream.init(file, 0x02, 0x200, null);


			var patternItems = JSON.stringify(
				(function(arr){
					let obj = Object.create(null);
					obj["preferences"] = Object.create(null);
					arr.forEach(function(elmt){
							obj["preferences"][elmt] = pref.getPrefValue(elmt);
					});

					obj["userDefinedTable"] = aUserDefinedTable;

					return obj;
				})( pref.getChildList() )
			);

			let converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
			converter.charset = "UTF-8";
			let json_str = converter.ConvertFromUnicode(patternItems);
			stream.write(json_str, json_str.length);

			stream.close();
		}

		return true;

	} catch (e) {
		Cu.reportError(e);
	}
};

let loadFromFile = function(){
  try{
		let aType = "json";
		
		let nsIFilePicker = Ci.nsIFilePicker;
		let fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		let stream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
		let streamIO = Cc["@mozilla.org/scriptableinputstream;1"].createInstance(Ci.nsIScriptableInputStream);

		fp.defaultExtension = aType;
		fp.defaultString = "MeihuaCC_Preferences." + aType;
		fp.init(window, null, nsIFilePicker.modeOpen);

		fp.appendFilters(nsIFilePicker.filterAll);

		if (fp.show() != nsIFilePicker.returnCancel) {
		  stream.init(fp.file, 0x01, parseInt("0444", 8), null);
		  streamIO.init(stream);
		  let input = streamIO.read(stream.available());

			let converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
			converter.charset = "UTF-8";
		  input = converter.ConvertToUnicode(input);

		  streamIO.close();
		  stream.close();

		  let text = input;
		  if (!isJsonValid(text)) {
				alert(stringBundle.GetStringFromName("import.error"));
				return false;
		  } else {
				return JSON.parse(input);
		  }

		}
		return null;
  } catch(e) {
		Cu.reportError(e);
  }
};

let btn_pref_import = function(){
		let jsonObj = loadFromFile();
		
		if (!jsonObj) return false;
			  try {
			  	// 1. save preferences 
			  	Object.keys(jsonObj["preferences"]).forEach(function(prefKey){
			  			pref.setPrefValue(prefKey, jsonObj["preferences"][prefKey]);
					});
			  	// 2. update `aUserDefinedTable` ,and save `userDefinedTable.json` 
			  	aUserDefinedTable = jsonObj["userDefinedTable"];
			  	File.write(File.create('userDefinedTable', 'MeihuaCC'), aUserDefinedTable);
			  } catch(e) {
				// Report errors to console
				Cu.reportError(e);
			  }

		alert(stringBundle.GetStringFromName("import.finish"));
		return true;
};

var onDialogAccept = function(){
	oTBB = {
		left:{
			aTables: aTbls_L
		},
		middle:{
			aTables: aTbls_M
		},
		right:{
			aTables: aTbls_R
		}
	};
	savePref('oTBB', oTBB);
	return true;
};