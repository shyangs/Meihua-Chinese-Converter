'use strict';
/*
 This file is modified from New Tong Wen Tang.
 You may find the license in the LICENSE file.
 */
let onkeyDown = function(event){
	if (meihuacc.config.aHotkeys.length === 0) return;

	let win = this;
	var keytext = "";
	var akeycode = event.keyCode;

	if (akeycode in meihuacc.keyCodeMapper){
		keytext = meihuacc.keyCodeMapper[akeycode];
	}	

	var modifiers = [];
	if(event.ctrlKey) modifiers.push("CONTROL");	
	if(event.altKey) modifiers.push("ALT");	
	if(event.shiftKey) modifiers.push("SHIFT");
	//if(event.metaKey) modifiers.push("META");
	

	if (modifiers.length > 0){
		if (keytext != ""){
			keytext = modifiers.join("+") +  "+" + meihuacc.keyCodeMapper[akeycode];
		} else {
			keytext = modifiers.join("+");
		}
	}
	
	//quit function if keytext is empty
	if(keytext === "") {
		return;
	}else{
		meihuacc.config.aHotkeys.forEach(function(item){
			if(keytext !== item.hotkey) return;
			win.MeihuaCC.transPage(win.content.document, true, win.MeihuaCC.setTable(item));
		});
	}
};