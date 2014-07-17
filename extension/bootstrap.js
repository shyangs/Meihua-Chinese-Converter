'use strict';

const {interfaces: Ci, utils: Cu} = Components;


Cu.import('resource://gre/modules/Services.jsm');

let MeihuaCC = (function(){
	const log = function() { dump(Array.slice(arguments).join(' ') + '\n'); };


	let loadSubScript = function(win){
		Services.scriptloader.loadSubScript('resource://meihuacc/content/overlay.js', MeihuaCC, 'UTF-8');
		win.MeihuaCC = MeihuaCC.Core(win);
		
		win.MeihuaCC.addTable(MeihuaCC.cn2tw_c);
		win.MeihuaCC.addTable(MeihuaCC.cn2tw_p);

		win.addEventListener('keydown', MeihuaCC.onkeyDown.bind(win));
		
		let listenElmt = win.document.getElementById('appcontent');
		if(listenElmt){
			listenElmt.addEventListener('DOMContentLoaded', win.MeihuaCC.onPageLoad);
		}
	},
	unloadSubScript = function(win){
		win.document.getElementById('appcontent').removeEventListener('DOMContentLoaded', win.MeihuaCC.onPageLoad);
		delete win.MeihuaCC;
	},
	
	startup = function(){
		MeihuaCC.EXTENSION_NAME = 'MeihuaCC';
		MeihuaCC.PREF_BRANCH = 'extensions.MeihuaCC.';
		MeihuaCC.BUTTON_ID = 'meihuacc-tbb';	
		MeihuaCC.STYLE_URI = 'chrome://meihuacc/skin/browser.css';

		MeihuaCC.trace = function(error) { log(error); log(error.stack); };

		Services.scriptloader.loadSubScript('resource://meihuacc/lib/Pref.js', MeihuaCC, 'UTF-8');
		Services.scriptloader.loadSubScript('resource://meihuacc/lib/BrowserManager.js', MeihuaCC, 'UTF-8');
		Services.scriptloader.loadSubScript('resource://meihuacc/lib/ToolbarManager.js', MeihuaCC, 'UTF-8');
		Services.scriptloader.loadSubScript('resource://meihuacc/lib/StyleManager.js', MeihuaCC, 'UTF-8');
		Services.scriptloader.loadSubScript('resource://meihuacc/lib/Utils.js', MeihuaCC, 'UTF-8');
		Services.scriptloader.loadSubScript('resource://meihuacc/lib/keyCodeMapper.js', MeihuaCC, "UTF-8");

		Services.scriptloader.loadSubScript('resource://meihuacc/dict/cn2tw_c.js', MeihuaCC, "UTF-8");
		Services.scriptloader.loadSubScript('resource://meihuacc/dict/cn2tw_p.js', MeihuaCC, "UTF-8");

		MeihuaCC.pref = MeihuaCC.Pref(MeihuaCC.PREF_BRANCH);
		Services.scriptloader.loadSubScript('resource://meihuacc/content/config.js', MeihuaCC, 'UTF-8');
		MeihuaCC.prefObserver.initConfig();
		MeihuaCC.prefObserver.start();

		Services.scriptloader.loadSubScript('resource://meihuacc/content/onkeyDown.js', MeihuaCC, 'UTF-8');
		MeihuaCC.BrowserManager.addListener(loadSubScript);
		MeihuaCC.BrowserManager.run(loadSubScript);

		Services.scriptloader.loadSubScript('resource://meihuacc/content/ui.js', MeihuaCC, 'UTF-8');
		MeihuaCC.BrowserManager.run(MeihuaCC.insertToolbarButton);
		MeihuaCC.BrowserManager.addListener(MeihuaCC.insertToolbarButton);

		MeihuaCC.StyleManager.load(MeihuaCC.STYLE_URI);
	},
	shutdown = function(){
		MeihuaCC.prefObserver.saveConfig();
		MeihuaCC.BrowserManager.run(MeihuaCC.removeToolbarButton);
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
