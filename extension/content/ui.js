'use strict';
/* MeihuaCC is licensed under GPLv3. See the LICENSE file. */
let toolbarButtons = {
	createInstance: function(window) {
		let document = window.document;
		let button = (function() {
			let attrs = {
				id: meihuacc.BUTTON_ID,
				"class": 'toolbarbutton-1 chromeclass-toolbar-additional',
				label: meihuacc.EXTENSION_NAME,
				tooltiptext: meihuacc.EXTENSION_NAME,
				removable: true
			};

			let button = document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'toolbarbutton');
			meihuacc.Utils.setAttrs(button, attrs);
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
		meihuacc.ToolbarManager.addWidget(window, button, meihuacc.config.firstRun);
	} catch(error) {
		meihuacc.trace(error);
	}
},
removeToolbarButton = function(window) {
	try {
		meihuacc.ToolbarManager.removeWidget(window, meihuacc.BUTTON_ID);
	} catch(error) {
		meihuacc.trace(error);
	}
};