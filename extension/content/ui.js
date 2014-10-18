'use strict';
/* MeihuaCC is licensed under GPLv2 or later versions. See the LICENSE file. */
let toolbarButtons = {
	createInstance: function(window) {
		let stringBundle = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://meihuacc/locale/meihuacc.properties');
		let document = window.document;
		let button = (function(){
			let _fTooltiptext = function(name){
				switch(meihuacc.config[name]){
					case 'cwt':
						return stringBundle.GetStringFromName('conv.webText');
					case 'osw':
						return stringBundle.GetStringFromName('open.settingWindow');
					default:
						return stringBundle.GetStringFromName('do.nothing');
				}
			},
			fTooltiptext = function(){
				return ( stringBundle.GetStringFromName('toolbarButton.leftClick') +
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
				let task = function(name){
					switch(meihuacc.config[name]){
						case 'cwt':
							window.MeihuaCC.transPage(window.content.document, true);
						break;
						case 'osw':
							window.openDialog('chrome://meihuacc/content/options.xul', '', 'chrome,titlebar,centerscreen,modal');
						break;
						default:
						return;
					}
				};
				switch(event.button){
					case 0://left_click
						task('sToolbarBtnLeftClick');
					break;
					case 1://middle _click
						task('sToolbarBtnMiddleClick');
					break;
					case 2://right_click
						event.preventDefault();//not popup context menu
						task('sToolbarBtnRightClick');
					break;
				}
			});
			
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