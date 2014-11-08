'use strict';
/* MeihuaCC is licensed under GPLv2 or later versions. See the LICENSE file. */
(function(){
	const {utils: Cu} = Components;
	Cu.import('resource://gre/modules/Services.jsm');
	Services.scriptloader.loadSubScript('resource://meihuacc/lib/template.js');
	Cu.import('resource://meihuacc/templ/tmplUtils.js');
	Cu.import('resource://meihuacc/templ/tBiTree.js');

	let data = fTmplData([['tree_disabled', 'false'], ['id_inUseListTree', 'inUseListTree'], ['id_availableListTree', 'availableListTree'], ['id_addButton', 'addButton'], ['id_removeButton', 'removeButton'], ['id_moveUpButton', 'moveUpButton'], ['id_moveDownButton', 'moveDownButton'], ['id_moveToButton', 'moveToButton'], ['onSelect_InUseList' ,'onSelectInUseList();'], ['onSelect_AvailableList', 'onSelectAvailableList();'], ['onCommand_addTable', 'addTable();'], ['onCommand_removeTable', 'removeTable();'], ['onCommand_moveUpTable', 'moveUpTable();'], ['onCommand_moveDownTable', 'moveDownTable();'], ['onCommand_moveToTable', 'moveToTable();']]),
		subTmpl = '<hbox>\
	<label value="{{name_label}}" control="nameTextbox" class="label"/>\
	<textbox id="nameTextbox" flex="1"/>\
</hbox>\
<hbox>\
	<label value="{{hotkey_label}}" control="hotkeyTextbox" class="label"/>\
	<textbox id="hotkeyTextbox" readonly="true" flex="1" placeholder="{{hotkey_nulltext}}"/>\
</hbox>';

	template.compile(subTmpl, {
		filename: 'subTmpl'
	});
	let render = template.compile(tBiTree),
		sHTML = render(data);

	document.getElementById('dialogGroupEditor').insertAdjacentHTML('afterbegin', sHTML);
})();