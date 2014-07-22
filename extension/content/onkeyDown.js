'use strict';

let onkeyDown = function(event){
	if ( !meihuacc.config.sConvHotkey ) return;

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
	}else if(keytext === meihuacc.config.sConvHotkey){
		this.MeihuaCC.transPage(this.content.document, true);		
	}
};