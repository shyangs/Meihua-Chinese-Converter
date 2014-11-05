'use strict';
/* MeihuaCC is licensed under GPLv2 or later versions. See the LICENSE file. */
(function(){
	const {utils: Cu} = Components;
	Cu.import('resource://gre/modules/Services.jsm');
	Services.scriptloader.loadSubScript('resource://meihuacc/lib/template.js');
	Cu.import('resource://meihuacc/templ/tmplUtils.js');
	Cu.import('resource://meihuacc/templ/tBiTree.js');

	let subTmpl ='\
<label value="{{function_label}}" class="label"/>\
<menulist class="tbbFn_menulist" preference="{{prefID}}" oncommand="onChange(this);">\
<menupopup>\
<menuitem label="{{do_nothing}}" value="dnt"/>\
<menuitem label="{{open_settingWindow}}" value="osw"/>\
<menuitem label="{{conv_webText}}" value="cwt"/>\
</menupopup>\
</menulist>';

	template.compile(subTmpl, {
		filename: 'subTmpl'
	});
	let render = template.compile(tBiTree);

	let obj = {
		"L_":{
			prefID: "sToolbarBtnLeftClick",
			inUseT: "tbbLeft_inUse_Tree",
			availableT: "tbbLeft_available_Tree",
		},
		"M_":{
			prefID:"sToolbarBtnMiddleClick",
			inUseT: "tbbMiddle_inUse_Tree",
			availableT: "tbbMiddle_available_Tree"
		},
		"R_":{
			prefID:"sToolbarBtnRightClick",
			inUseT: "tbbRight_inUse_Tree",
			availableT: "tbbRight_available_Tree"
		}
	};
	Object.keys(obj).forEach(function(key, ii){
		let oo = obj[key];
		document.getElementsByClassName('tabpanelTBB')[ii].insertAdjacentHTML('beforeend', render(fTmplData([['prefID', oo.prefID], ['id_inUseListTree', oo.inUseT], ['id_availableListTree', oo.availableT], ['id_addButton', key+'addButton'], ['id_removeButton', key+'removeButton'], ['id_moveUpButton', key+'moveUpButton'], ['id_moveDownButton', key+'moveDownButton'], ['id_moveToButton', key+'moveToButton'], ['onSelect_InUseList', key+'onSelectInUseList();'], ['onSelect_AvailableList', key+'onSelectAvailableList();'], ['onCommand_addTable', key+'addTable();'], ['onCommand_removeTable', key+'removeTable();'], ['onCommand_moveUpTable', key+'moveUpTable();'], ['onCommand_moveDownTable', key+'moveDownTable();'], ['onCommand_moveToTable', key+'moveToTable();']])));
		document.getElementById(obj[key].prefID).updateElements();
	});
})();