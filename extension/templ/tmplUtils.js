'use strict';
/* MeihuaCC is licensed under GPLv2 or later versions. See the LICENSE file. */
let EXPORTED_SYMBOLS = ['fTmplData'];

const {classes: Cc, interfaces: Ci} = Components;

let stringBundle = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService).createBundle('chrome://meihuacc/locale/options.properties');

let fTmplData = function(arr=[]){
	let data = {},
		enumerator = stringBundle.getSimpleEnumeration();
	while(enumerator.hasMoreElements()){
		let prop = enumerator.getNext().QueryInterface(Ci.nsIPropertyElement);
		data[prop.key.split('.').join('_')] = prop.value;
	}
	if(arr.length===0)return data;
	let ii = arr.length;
	while(ii--){
		let item = arr[ii];
		data[item[0]] = item[1];
	}
	return data;
};