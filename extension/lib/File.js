'use strict';
/*
 This file is modified from S3.Menu Wizard.
 You may find the license in the LICENSE file.
 */
let EXPORTED_SYMBOLS = ['File'];

const {classes: Cc, interfaces: Ci} = Components;

let File={};
File.open = function(fileName, folderName){
	let file = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("ProfD", Ci.nsIFile);
	file.append(folderName);
	file.append(fileName + ".json");
	if (file.exists()) {
		return file;
	} else {
		return false;
	}
};
File.write = function(file, json_data){
	let fileOutputStream = Cc['@mozilla.org/network/file-output-stream;1'].createInstance(Ci.nsIFileOutputStream);
	let converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
	converter.charset = "UTF-8";

	try{
		let json_str = JSON.stringify(json_data);
		fileOutputStream.init(file, parseInt("0x02", 16) | parseInt("0x08", 16) | parseInt("0x20", 16), parseInt("0664", 8), 0);
		fileOutputStream.write(json_str, json_str.length);
	}
	catch(e){
		return false;
	}

	fileOutputStream.close();
	return true;
};
File.create = function(fileName, folderName){
	let file = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("ProfD", Ci.nsIFile);
	file.append(folderName);
	file.append(fileName + ".json");
	try{
		if(file.exists()){
			return file;
		}
		file.create( Ci.nsIFile.NORMAL_FILE_TYPE, parseInt("0664", 8));
	}catch(e){
		file = false;
	}
	return file;
};
File.read = function(file){
	if(!file)return;
	let fileInputStream = Cc['@mozilla.org/network/file-input-stream;1'].createInstance(Ci.nsIFileInputStream);
	let scriptableInputStream = Cc['@mozilla.org/scriptableinputstream;1'].createInstance(Ci.nsIScriptableInputStream);
	let converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
	converter.charset = "UTF-8";
	let json_data = '';

	try{
		fileInputStream.init(file, 1, 0, 0);
		scriptableInputStream.init(fileInputStream);
		json_data = scriptableInputStream.read(-1);
		json_data = converter.ConvertToUnicode(json_data);
	}catch(e){
		return false;
	}

	scriptableInputStream.close();
		fileInputStream.close();

	let is_ok = true;

	try{
		json_data = JSON.parse(json_data);
	}catch(e){
		is_ok = false;
	}

	if(is_ok){
		return json_data;
	}else{
		try{
			file.remove(false);
		}catch(e){
		}
		return false;
	}
};