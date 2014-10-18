'use strict';
/* MeihuaCC is licensed under GPLv2 or later versions. See the LICENSE file. */
(function(){
	const {utils: Cu} = Components;
	Cu.import('resource://gre/modules/Services.jsm');
	Services.scriptloader.loadSubScript('resource://meihuacc/lib/template.js');
	Cu.import('resource://meihuacc/templ/tmplUtils.js');
	//Cu.import('resource://meihuacc/templ/tBiTree.js');

	let tmpl ='<tabpanel orient="horizontal">\
<label value="{{function_label}}" class="label"/>\
<menulist name="{{menulistName}}" preference="{{menulistName}}">\
<menupopup>\
<menuitem label="{{do_nothing}}" value="dnt"/>\
<menuitem label="{{open_settingWindow}}" value="osw"/>\
<menuitem label="{{conv_webText}}" value="cwt"/>\
</menupopup>\
</menulist>\
</tabpanel>';

	let render = template.compile(tmpl);

	['sToolbarBtnLeftClick', 'sToolbarBtnMiddleClick', 'sToolbarBtnRightClick'].forEach(function(menulistName){
		document.getElementById('tabpanelsTI').insertAdjacentHTML('beforeend', render(fTmplData([['menulistName', menulistName]])));
		document.getElementById(menulistName).updateElements();
	});
})();