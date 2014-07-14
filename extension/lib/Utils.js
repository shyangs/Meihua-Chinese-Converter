'use strict';
/*
 This file is modified from User Agent Overrider.
 You may find the license in the LICENSE file.
 */
const Utils = (function() {
    const {classes: Cc, interfaces: Ci} = Components;
    const sbService = Cc['@mozilla.org/intl/stringbundle;1']
                         .getService(Ci.nsIStringBundleService);
    const windowMediator = Cc['@mozilla.org/appshell/window-mediator;1']
                              .getService(Ci.nsIWindowMediator);

    let localization = function(id, name) {
        let uri = 'chrome://' + id + '/locale/' + name + '.properties';
        return sbService.createBundle(uri).GetStringFromName;
    };

    let setAttrs = function(widget, attrs) {
        for (let [key, value] in Iterator(attrs)) {
            widget.setAttribute(key, value);
        }
    };

    let getMostRecentWindow = function(winType) {
        return windowMediator.getMostRecentWindow(winType);
    };

    let exports = {
        localization: localization,
        setAttrs: setAttrs,
        getMostRecentWindow: getMostRecentWindow,
    };
    return exports;
})();