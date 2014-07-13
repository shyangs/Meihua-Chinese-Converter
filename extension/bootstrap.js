'use strict';

const {interfaces: Ci, utils: Cu} = Components;

Cu.import('resource://gre/modules/Services.jsm');

var MeihuaCC = {
    startup: function () {
		Services.scriptloader.loadSubScript('resource://meihuacc/lib/BrowserManager.js', MeihuaCC, 'UTF-8');
		MeihuaCC.BrowserManager.addListener( MeihuaCC.loadSubScript );
		MeihuaCC.BrowserManager.run( MeihuaCC.loadSubScript );
    },
    shutdown: function () {
		MeihuaCC.BrowserManager.destory();
		MeihuaCC.BrowserManager.run( MeihuaCC.unloadSubScript );
    },

    loadSubScript: function (win) {
        Services.scriptloader.loadSubScript('resource://meihuacc/content/overlay.js', win, 'UTF-8');

    },
    unloadSubScript: function (win) {
		win.document.getElementById('appcontent').removeEventListener('DOMContentLoaded', win.MeihuaCC.onPageLoad);
        delete win.MeihuaCC;
    }
}

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
