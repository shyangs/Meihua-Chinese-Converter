'use strict';
/* MeihuaCC is licensed under GPLv3. See the LICENSE file. */
let toolbarButtons = {
	createInstance: function(window) {
		let document = window.document;
		let button = (function() {
			let attrs = {
				id: MeihuaCC.BUTTON_ID,
				class: 'toolbarbutton-1 chromeclass-toolbar-additional',
				label: MeihuaCC.EXTENSION_NAME,
				tooltiptext: MeihuaCC.EXTENSION_NAME,
				removable: true
			};

			let button = document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'toolbarbutton');
			MeihuaCC.Utils.setAttrs(button, attrs);
			button.addEventListener('click', function(event){
				switch(event.button){
					case 0://left_click
						window.MeihuaCC.transPage(window.content.document, true);
					break/*
					case 2://right_click
						//設定介面，施工中
					break*/
				}
			});
			return button;
		})();

		return button;
	}
},
insertToolbarButton = function(window) {
	let button = toolbarButtons.createInstance(window);
	try {
		MeihuaCC.ToolbarManager.addWidget(window, button, MeihuaCC.config.firstRun);
	} catch(error) {
		MeihuaCC.trace(error);
	}
},
removeToolbarButton = function(window) {
	try {
		MeihuaCC.ToolbarManager.removeWidget(window, MeihuaCC.BUTTON_ID);
	} catch(error) {
		MeihuaCC.trace(error);
	}
};