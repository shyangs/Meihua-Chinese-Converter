'use strict';

const {utils: Cu} = Components;
Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://meihuacc/lib/Pref.js');

let pref = Pref('extensions.MeihuaCC.');

if(window.arguments[0]['in']){
	let group = window.arguments[0]['in'].group;

	document.getElementById('nameTextbox').value = group.name||'';
	document.getElementById('patternTextbox').value = group.pattern;
	document.getElementById('convOrNotMenulist').selectedIndex = (group.rule==='exclude'?1:0);
}

let onDialogAccept = function(){
	let group = {
		name: document.getElementById('nameTextbox').value||'',
		pattern: document.getElementById('patternTextbox').value,
		rule: document.getElementById('convOrNotMenulist').value
	};
	window.arguments[0].out = { group: group };
	return true;
};