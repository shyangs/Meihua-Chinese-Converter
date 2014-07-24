'use strict';

const {utils: Cu} = Components;
Cu.import('resource://gre/modules/Services.jsm');
Services.scriptloader.loadSubScript('resource://meihuacc/lib/keyCodeMapper.js', this, 'UTF-8');
Cu.import('resource://meihuacc/lib/Pref.js');
let pref = Pref('extensions.MeihuaCC.');

let setHotkey = function(event){
	let sHotkey = '', 
		nKeyCode = event.keyCode;

	if (nKeyCode in keyCodeMapper){
		sHotkey = keyCodeMapper[nKeyCode];
	}	

	let modifiers = [];
	if(event.ctrlKey) modifiers.push("CONTROL");	
	if(event.altKey) modifiers.push("ALT");	
	if(event.shiftKey) modifiers.push("SHIFT");
	//if(event.metaKey) modifiers.push("META");

	if (modifiers.length > 0){
		if (sHotkey !== ''){
			sHotkey = modifiers.join('+') + '+' + keyCodeMapper[nKeyCode];
		} else {
			sHotkey = modifiers.join('+');
		}
	}

	pref.setString('sConvHotkey', sHotkey);
};

document.getElementById('sConvHotkeyTextbox').onkeydown = setHotkey;