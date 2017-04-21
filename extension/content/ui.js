'use strict';
/* MeihuaCC is licensed under GPLv2 or later versions. See the LICENSE file. */
var toolbarButtons = {
	createInstance: function(window) {
		let stringBundle = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://meihuacc/locale/meihuacc.properties');
		let document = window.document;
		let button = (function(){
			let _fTooltiptext = function(name){
				return stringBundle.GetStringFromName(meihuacc.config[name]);
			},
			fTooltiptext = function(){
				return ( meihuacc.EXTENSION_NAME + '\n' +
					stringBundle.GetStringFromName('toolbarButton.leftClick') +
					_fTooltiptext('sToolbarBtnLeftClick') + '\n' +
					stringBundle.GetStringFromName('toolbarButton.middleClick') +
					_fTooltiptext('sToolbarBtnMiddleClick') + '\n' +
					stringBundle.GetStringFromName('toolbarButton.rightClick') +
					_fTooltiptext('sToolbarBtnRightClick')
				);
			}
				
			let attrs = {
				id: meihuacc.BUTTON_ID,
				"class": 'toolbarbutton-1 chromeclass-toolbar-additional',
				label: meihuacc.EXTENSION_NAME,
				tooltiptext: meihuacc.EXTENSION_NAME + '\n' + fTooltiptext(),
				removable: true
			};

			let button = document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'toolbarbutton');
			meihuacc.Utils.setAttrs(button, attrs);
			button.addEventListener('click', function(event){
				let task = function(name, btn){
					switch(meihuacc.config[name]){
						case 'conv.webText':
							window.MeihuaCC.transPage(window.content.document, true, window.MeihuaCC.setTable(meihuacc.config.oTBB[btn]));
						break;
						case 'open.settingWindow':
							window.openDialog('chrome://meihuacc/content/options.xul', '', 'chrome,titlebar,centerscreen,modal');
						break;
						default:
						return;
					}
				};
				switch(event.button){
					case 0://left_click
						task('sToolbarBtnLeftClick', 'left');
					break;
					case 1://middle _click
						task('sToolbarBtnMiddleClick', 'middle');
					break;
					case 2://right_click
						event.preventDefault();//not popup context menu
						task('sToolbarBtnRightClick', 'right');
					break;
				}
			});
			//not popup context menu // for Fx53+
			button.addEventListener('contextmenu', function (event) {
				event.preventDefault();
			}, false);

			button.addEventListener('mouseover', function(){
				let tooltiptext = fTooltiptext();
				if( tooltiptext === button.getAttribute('tooltiptext') ) return;
				button.setAttribute('tooltiptext', tooltiptext);
			});
			
			return button;
		})();

		return button;
	}
},
insertToolbarButton = function(window) {
	let button = toolbarButtons.createInstance(window);
	try {
		meihuacc.ToolbarManager.addWidget(window, button, meihuacc.config.bFirstRun);
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