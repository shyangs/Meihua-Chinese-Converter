'use strict';

const {interfaces: Ci, utils: Cu} = Components;


Cu.import('resource://gre/modules/Services.jsm');

let MeihuaCC = (function(){
	const NS_XUL = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
	const log = function() { dump(Array.slice(arguments).join(' ') + '\n'); };
	const trace = function(error) { log(error); log(error.stack); };
	const EXTENSION_NAME = 'MeihuaCC';
	const BUTTON_ID = 'meihuacc-tbb';
	const STYLE_URI = 'chrome://meihuacc/skin/browser.css';

	let toolbarButtons = {
		createInstance: function(window) {
			let document = window.document;
			let button = (function() {
				let attrs = {
					id: BUTTON_ID,
					class: 'toolbarbutton-1 chromeclass-toolbar-additional',
					label: EXTENSION_NAME,
					tooltiptext: EXTENSION_NAME,
					removable: true
					//image: image
				};

				let button = document.createElementNS(NS_XUL, 'toolbarbutton');
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
			MeihuaCC.ToolbarManager.addWidget(window, button, false);
		} catch(error) {
			trace(error);
		}
	},
	removeToolbarButton = function(window) {
        try {
            MeihuaCC.ToolbarManager.removeWidget(window, BUTTON_ID);
        } catch(error) {
            trace(error);
        }
    },

	loadSubScript = function(win){
		Services.scriptloader.loadSubScript('resource://meihuacc/content/overlay.js', win, 'UTF-8');
	},
	unloadSubScript = function(win){
		win.document.getElementById('appcontent').removeEventListener('DOMContentLoaded', win.MeihuaCC.onPageLoad);
		delete win.MeihuaCC;
	},
	
	startup = function(){
		Services.scriptloader.loadSubScript('resource://meihuacc/lib/BrowserManager.js', MeihuaCC, 'UTF-8');
		Services.scriptloader.loadSubScript('resource://meihuacc/lib/ToolbarManager.js', MeihuaCC, 'UTF-8');
		Services.scriptloader.loadSubScript('resource://meihuacc/lib/StyleManager.js', MeihuaCC, 'UTF-8');
		Services.scriptloader.loadSubScript('resource://meihuacc/lib/Utils.js', MeihuaCC, 'UTF-8');
		MeihuaCC.BrowserManager.addListener(loadSubScript);
		MeihuaCC.BrowserManager.run(loadSubScript);
		MeihuaCC.BrowserManager.run(insertToolbarButton);
		MeihuaCC.BrowserManager.addListener(insertToolbarButton);
		MeihuaCC.StyleManager.load(STYLE_URI);
	},
	shutdown = function(){
		MeihuaCC.BrowserManager.run(removeToolbarButton);
		MeihuaCC.BrowserManager.run(unloadSubScript);
		MeihuaCC.BrowserManager.destory();
		MeihuaCC.StyleManager.destory();
	};

	return {
		startup: startup,
		shutdown: shutdown
	};
})();

// 啟用
function startup(data, reason) {
	var ios = Services.io;
	// 註冊 resource://meihuacc/
	var resProtocolHandler = ios.getProtocolHandler('resource')
		.QueryInterface(Ci.nsIResProtocolHandler);
	if (!resProtocolHandler.hasSubstitution('meihuacc')) {
		var resURI = null;
		if (data.resourceURI) { // Gecko 7+
			resURI = data.resourceURI;
		} else {
			if (data.installPath.isDirectory()) {
				resURI = ios.newFileURI(data.installPath);
			} else { // unpacke
				var jarProtocolHandler = ios.getProtocolHandler('jar')
					.QueryInterface(Ci.nsIJARProtocolHandler);
				var spec = 'jar:' + ios.newFileURI(data.installPath).spec + '!/';
				resURI = jarProtocolHandler.newURI(spec, null, null);
			}
		}
		resProtocolHandler.setSubstitution('meihuacc', resURI);
	}

	MeihuaCC.startup();
}

// 停用套件或關閉Fx
function shutdown(data, reason) {
	MeihuaCC.shutdown();
	var ios = Services.io;
	var resProtocolHandler = ios.getProtocolHandler('resource')
		.QueryInterface(Ci.nsIResProtocolHandler);
	if (resProtocolHandler.hasSubstitution('meihuacc'))
		resProtocolHandler.setSubstitution('meihuacc', null);
}

// 安裝
function install(data, reason) {
}

// 移除
function uninstall(data, reason) {
}
