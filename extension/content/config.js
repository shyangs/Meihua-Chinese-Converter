'use strict';
/* MeihuaCC is licensed under GPLv3. See the LICENSE file. */
let config = {
	firstRun: true,
	bConvAlt: true,
	bConvTitle: true,
	bConvFrame:true
};
let prefObserver = (function(){
	let {config: config, pref: pref} = MeihuaCC;
	return {
		observe: function(subject, topic, data) {
			this.reloadConfig();
		},

		start: function() {
			pref.addObserver(this);
		},
		stop: function() {
			pref.removeObserver(this);
		},

		initBool: function(name) {
			let value = pref.getBool(name);
			if (value === null) {
				pref.setBool(name, config[name]);
			} else {
				config[name] = value;
			}
		},
		initString: function(name) {
			let value = pref.getString(name);
			if (value === null) {
				pref.setString(name, config[name]);
			} else {
				config[name] = value;
			}
		},
		initComplex: function(name, converter, defaultValue) {
			let text = pref.getString(name);
			if (text === null) {
				pref.setString(name, defaultValue);
				config[name] = converter(defaultValue);
			} else {
				config[name] = converter(text);
			}
		},

		loadBool: function(name) {
			let value = pref.getBool(name);
			if (value !== null) {
				config[name] = value;
			}
		},
		loadString: function(name) {
			let value = pref.getString(name);
			if (value !== null) {
				config[name] = value;
			}
		},
		loadComplex: function(name, converter) {
			let text = pref.getString(name);
			if (text !== null) {
				config[name] = converter(text);
			}
		},

		initConfig: function() {
			let {initBool, initString, initComplex} = this;
			initBool('firstRun');
			initBool('bConvAlt');
			initBool('bConvTitle');
			initBool('bConvFrame');
		},
		reloadConfig: function() {
			let {loadBool, loadString, loadComplex} = this;
			loadBool('firstRun');
			loadBool('bConvAlt');
			loadBool('bConvTitle');
			loadBool('bConvFrame');
		},
		saveConfig: function() {
			this.stop(); // avoid recursion

			pref.setBool('firstRun', false);

			this.start();
		}
	};
})();