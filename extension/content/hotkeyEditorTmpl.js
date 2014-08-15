'use strict';
/* MeihuaCC is licensed under GPLv3. See the LICENSE file. */
(function(){
	const {utils: Cu} = Components;
	Cu.import('resource://gre/modules/Services.jsm');
	Services.scriptloader.loadSubScript('resource://meihuacc/lib/template.js');
	Cu.import('resource://meihuacc/templ/tmplUtils.js');
	Cu.import('resource://meihuacc/templ/tBiTree.js');

	let data = fTmplData([['tree_disabled', 'false']]),
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