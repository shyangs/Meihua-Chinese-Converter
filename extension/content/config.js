'use strict';
/* MeihuaCC is licensed under GPLv3. See the LICENSE file. */
let config = {
	firstRun: true
},
prefObserver = {
	observe: function(subject, topic, data) {
		this.reloadConfig();
	},

	start: function() {
		MeihuaCC.pref.addObserver(this);
	},
	stop: function() {
		MeihuaCC.pref.removeObserver(this);
	},

	initBool: function(name) {
		let value = MeihuaCC.pref.getBool(name);
		if (value === null) {
			MeihuaCC.pref.setBool(name, config[name]);
		} else {
			config[name] = value;
		}
	},
	initString: function(name) {
		let value = MeihuaCC.pref.getString(name);
		if (value === null) {
			MeihuaCC.pref.setString(name, config[name]);
		} else {
			config[name] = value;
		}
	},
	initComplex: function(name, converter, defaultValue) {
		let text = MeihuaCC.pref.getString(name);
		if (text === null) {
			MeihuaCC.pref.setString(name, defaultValue);
			config[name] = converter(defaultValue);
		} else {
			config[name] = converter(text);
		}
	},

	loadBool: function(name) {
		let value = MeihuaCC.pref.getBool(name);
		if (value !== null) {
			config[name] = value;
		}
	},
	loadString: function(name) {
		let value = MeihuaCC.pref.getString(name);
		if (value !== null) {
			config[name] = value;
		}
	},
	loadComplex: function(name, converter) {
		let text = MeihuaCC.pref.getString(name);
		if (text !== null) {
			config[name] = converter(text);
		}
	},

	initConfig: function() {
		let {initBool, initString, initComplex} = this;
		initBool('firstRun');
	},
	reloadConfig: function() {
		let {loadBool, loadString, loadComplex} = this;
		loadBool('firstRun');
	},
	saveConfig: function() {
		this.stop(); // avoid recursion

		MeihuaCC.pref.setBool('firstRun', false);

		this.start();
	}
};