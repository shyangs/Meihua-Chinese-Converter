'use strict';

const {interfaces: Ci, utils: Cu} = Components;
Cu.import('resource://gre/modules/Services.jsm');

let meihuacc = (function(){
	const log = function() { dump(Array.slice(arguments).join(' ') + '\n'); };

	let loadSubScript = function(win){
		Services.scriptloader.loadSubScript('resource://meihuacc/content/core.js', meihuacc, 'UTF-8');
		win.MeihuaCC = meihuacc.Core(win);

		let listenElmt = win.document.getElementById('appcontent');
		if(listenElmt){
			listenElmt.addEventListener('DOMContentLoaded', win.MeihuaCC.onPageLoad);
		}

		meihuacc.insertToolbarButton(win);
		win.addEventListener('keydown', meihuacc.onkeyDown.bind(win));
	},
	unloadSubScript = function(win){
		meihuacc.removeToolbarButton(win);
		win.document.getElementById('appcontent').removeEventListener('DOMContentLoaded', win.MeihuaCC.onPageLoad);
		delete win.MeihuaCC;
	},
	
	startup = function(){
		meihuacc.EXTENSION_NAME = 'MeihuaCC';
		meihuacc.PREF_BRANCH = 'extensions.MeihuaCC.';
		meihuacc.BUTTON_ID = 'meihuacc-tbb';	
		meihuacc.STYLE_URI = 'chrome://meihuacc/skin/browser.css';

		meihuacc.trace = function(error) { log(error); log(error.stack); };

		meihuacc.oTables = {};
		meihuacc.oCacheMaps = {};
		meihuacc.addTable = function(table){
			meihuacc.oTables[table.name] = table;
		};

		Services.scriptloader.loadSubScript('resource://meihuacc/lib/Utils.js', meihuacc, 'UTF-8');
		Services.scriptloader.loadSubScript('resource://meihuacc/lib/BrowserManager.js', meihuacc, 'UTF-8');
		Services.scriptloader.loadSubScript('resource://meihuacc/lib/ToolbarManager.js', meihuacc, 'UTF-8');
		Services.scriptloader.loadSubScript('resource://meihuacc/lib/StyleManager.js', meihuacc, 'UTF-8');
		Services.scriptloader.loadSubScript('resource://meihuacc/lib/keyCodeMapper.js', meihuacc, "UTF-8");

		Services.scriptloader.loadSubScript('resource://meihuacc/dict/cn2tw_c.js', meihuacc, "UTF-8");
		Services.scriptloader.loadSubScript('resource://meihuacc/dict/cn2tw_p.js', meihuacc, "UTF-8");
		Services.scriptloader.loadSubScript('resource://meihuacc/dict/tw2cn_c.js', meihuacc, "UTF-8");
		Services.scriptloader.loadSubScript('resource://meihuacc/dict/tw2cn_p.js', meihuacc, "UTF-8");
		meihuacc.addTable(meihuacc.cn2tw_c);
		meihuacc.addTable(meihuacc.cn2tw_p);
		meihuacc.addTable(meihuacc.tw2cn_c);
		meihuacc.addTable(meihuacc.tw2cn_p);
		Cu.import('resource://meihuacc/lib/File.js');
		let aUserDefinedTable = File.read(File.open('userDefinedTable', 'MeihuaCC'))||[];
		aUserDefinedTable.forEach(function(aItem){
			meihuacc.addTable(aItem);
		});

		Cu.import('resource://meihuacc/content/config.js', meihuacc);
		meihuacc.prefObserver.initConfig();
		meihuacc.prefObserver.start();

		Services.scriptloader.loadSubScript('resource://meihuacc/content/onkeyDown.js', meihuacc, 'UTF-8');
		Services.scriptloader.loadSubScript('resource://meihuacc/content/ui.js', meihuacc, 'UTF-8');
		meihuacc.BrowserManager.addListener(loadSubScript);
		meihuacc.BrowserManager.run(loadSubScript);

		meihuacc.StyleManager.load(meihuacc.STYLE_URI);
	},
	shutdown = function(){
		meihuacc.prefObserver.saveConfig(config);
		meihuacc.BrowserManager.run(unloadSubScript);
		meihuacc.BrowserManager.destory();
		meihuacc.StyleManager.destory();
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

	meihuacc.startup();
}

// 停用套件或關閉Fx
function shutdown(data, reason) {
	meihuacc.shutdown();
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
