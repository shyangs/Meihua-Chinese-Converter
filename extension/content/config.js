'use strict';
/* MeihuaCC is licensed under GPLv2 or later versions. See the LICENSE file. */
let EXPORTED_SYMBOLS = ['config', 'prefObserver'];

Components.utils.import('resource://meihuacc/lib/Pref.js');

let pref = Pref('extensions.MeihuaCC.');

const DEFAULT_ENTRIES_STRING = JSON.stringify([
	{pattern: '\\.tw/', rule: 'exclude'},
	{pattern: 'https?://tw\\.', rule: 'exclude'},
	{pattern: '[/.]big5[/.]', rule: 'exclude'},
	{pattern: '\\.jp/', rule: 'exclude'},
	{pattern: 'https?://jp\\.', rule: 'exclude'},
	{pattern: 'moztw\\.org/', rule: 'exclude'},
	{pattern: 'wikipedia\\.org/', rule: 'exclude'},
	{pattern: '[-_=./]cn(?:[./]|$)', rule: 'include'},
	{pattern: '[-_=./]gbk?(?:[./]|$)'},
	{pattern: '123yq\\.com/'},
	{pattern: '\\.163\\.com/'},
	{pattern: '\\.17k\\.com/'},
	{pattern: '360doc\\.com/'},
	{pattern: 'alipay\\.com/'},
	{pattern: '\\.b5m\\.com/'},
	{pattern: 'baidu\\.com/'},
	{pattern: 'china\\.com/'},
	{pattern: 'douban\\.com/'},
	{pattern: '\\.dm5\\.com/'},
	{pattern: 'hongxiu\\.com/'},
	{pattern: 'ifeng\\.net/'},
	{pattern: 'jjwxc\\.net/'},
	{pattern: 'mozest\\.com/'},
	{pattern: 'qdmm\\.com/'},
	{pattern: 'qidian\\.com/'},
	{pattern: '\\.qq\\.com/'},
	{pattern: 'readnovel\\.com/'},
	{pattern: 'sfacg\\.com/'},
	{pattern: 'sina\\.com/'},
	{pattern: '\\.so\\.com/'},
	{pattern: 'sogou\\.com/'},
	{pattern: 'sohu\\.com/'},
	{pattern: 'soso\\.com/'},
	{pattern: 'taobao\\.com/'},
	{pattern: 'thethirdmedia\\.com/'},
	{pattern: 'tudou\\.com/'},
	{pattern: 'weibo\\.com/'},
	{pattern: 'xinhuanet\\.com/'},
	{pattern: 'youku\\.com/'},
	{pattern: 'zongheng\\.com/'}
]);
let config = {
	firstRun: true,
	bConvAlt: true,
	bConvTitle: true,
	bConvFrame: true,
	aURLs: [],
	aHotkeys: []
};
let prefObserver = {
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
		initComplex('aURLs', JSON.parse, DEFAULT_ENTRIES_STRING);
		initComplex('aHotkeys', JSON.parse, JSON.stringify([]));
	},
	reloadConfig: function() {
		let {loadBool, loadString, loadComplex} = this;
		loadBool('firstRun');
		loadBool('bConvAlt');
		loadBool('bConvTitle');
		loadBool('bConvFrame');
		loadComplex('aURLs', JSON.parse);
		loadComplex('aHotkeys', JSON.parse);
	},
	saveConfig: function() {
		this.stop(); // avoid recursion

		pref.setBool('firstRun', false);

		this.start();
	}
};