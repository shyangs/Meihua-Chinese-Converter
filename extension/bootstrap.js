"use strict";

let {interfaces: Ci, utils: Cu} = Components;

Cu.import("resource://gre/modules/Services.jsm");

var MeihuaCC = {
    ww: Services.ww,       // nsIWindowWatcher
    wm: Services.wm,       // nsIWindowMediator

    aListener: {
        onOpenWindow: function (aWindow) {
            var win = aWindow.docShell.QueryInterface(
                      Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindow);
            win.addEventListener("load", function __handleEvent__() {
                win.removeEventListener("load", __handleEvent__, false);
                MeihuaCC.loadSubScript(this);
            }, false);
        },
        onCloseWindow: function (aWindow) {},
        onWindowTitleChange: function (aWindow, aTitle) {},
    },

    startup: function () {
        this.wm.addListener(this.aListener);
        var cw = this.ww.getWindowEnumerator();
        while (cw.hasMoreElements()) {
            var win = cw.getNext().QueryInterface(Ci.nsIDOMWindow);
            this.loadSubScript(win);
        }
    },
    shutdown: function () {
        this.wm.removeListener(this.aListener);
        var cw = this.ww.getWindowEnumerator();
        while (cw.hasMoreElements()) {
            var win = cw.getNext().QueryInterface(Ci.nsIDOMWindow);
            //this.unloadSubScript(win);
            delete win.MeihuaCC;
        }
    },

   
    loadSubScript: function (win) {
        Services.scriptloader.loadSubScript("resource://meihuacc/content/overlay.js",
                                            win,
                                            "UTF-8"
                                           );
        win.MeihuaCC.init();
    },
    unloadSubScript: function (win) {
    }
}

// 啟用
function startup(data, reason) {
    var ios = Services.io;
    // 註冊 resource://meihuacc/
    var resProtocolHandler = ios.getProtocolHandler("resource")
        .QueryInterface(Ci.nsIResProtocolHandler);
    if (!resProtocolHandler.hasSubstitution("meihuacc")) {
        var resURI = null;
        if (data.resourceURI) { // Gecko 7+
            resURI = data.resourceURI;
        } else {
            if (data.installPath.isDirectory()) {
                resURI = ios.newFileURI(data.installPath);
            } else { // unpacke
                var jarProtocolHandler = ios.getProtocolHandler("jar")
                    .QueryInterface(Ci.nsIJARProtocolHandler);
                var spec = "jar:" + ios.newFileURI(data.installPath).spec + "!/";
                resURI = jarProtocolHandler.newURI(spec, null, null);
            }
        }
        resProtocolHandler.setSubstitution("meihuacc", resURI);
    }

    MeihuaCC.startup();
}

// 停用或關閉Fx
function shutdown(data, reason) {
    MeihuaCC.shutdown();
    var ios = Services.io;
    var resProtocolHandler = ios.getProtocolHandler("resource")
        .QueryInterface(Ci.nsIResProtocolHandler);
    if (resProtocolHandler.hasSubstitution("meihuacc"))
        resProtocolHandler.setSubstitution("meihuacc", null);
}

// 安裝
function install(data, reason) {
}

// 移除
function uninstall(data, reason) {
}
