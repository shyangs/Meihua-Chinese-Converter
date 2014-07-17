'use strict';

let onkeyDown = function(event){
	if ( !MeihuaCC.config.sConvHotkey ) return;

	var keytext = "";
	var akeycode = event.keyCode;

	if (akeycode in MeihuaCC.keyCodeMapper){
		keytext = MeihuaCC.keyCodeMapper[akeycode];
	}	

	var modifiers = [];
	if(event.ctrlKey) modifiers.push("CONTROL");	
	if(event.altKey) modifiers.push("ALT");	
	if(event.shiftKey) modifiers.push("SHIFT");
	//if(event.metaKey) modifiers.push("META");
	

	if (modifiers.length > 0){
		if (keytext != ""){
			keytext = modifiers.join("+") +  "+" + MeihuaCC.keyCodeMapper[akeycode];
		} else {
			keytext = modifiers.join("+");
		}
	}
	
	//quit function if keytext is empty
	if(keytext === "") {
		return;
	}else if(keytext === MeihuaCC.config.sConvHotkey){
		this.MeihuaCC.transPage(this.content.document, true);		
	}
};