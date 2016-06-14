'use strict';
/* MeihuaCC is licensed under GPLv2 or later versions. See the LICENSE file. */
let EXPORTED_SYMBOLS = ['config', 'prefObserver', 'DEFAULT_TABLE', 'DEFAULT_PATTERN', 'DEFAULT_TABLE_TW', 'DEFAULT_PATTERN_TW', 'DEFAULT_TABLE_CN', 'DEFAULT_PATTERN_CN'];

Components.utils.import('resource://meihuacc/lib/constants.js');
Cu.import('resource://meihuacc/lib/Pref.js');

let pref = Pref('extensions.MeihuaCC.'),
	locale = Cc['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch).getCharPref('general.useragent.locale');

const DEFAULT_TABLE_TW = ['\u6885\u82B1\u6A19\u9EDE\u7B26\u865F(\u7E41)', '\u6885\u82B1\u901A\u7528\u55AE\u5B57(\u7E41)', '\u6885\u82B1\u901A\u7528\u8A5E\u5F59(\u7E41)']; // ['梅花標點符號(繁)', '梅花通用單字(繁)', '梅花通用詞彙(繁)']
const DEFAULT_TABLE_CN = ['\u6885\u82B1\u901A\u7528\u5355\u5B57(\u7B80)', '\u6885\u82B1\u901A\u7528\u8BCD\u6C47(\u7B80)']; // ['梅花通用单字(简)', '梅花通用词汇(简)']
const DEFAULT_TABLE = ('zh-CN'===locale)?DEFAULT_TABLE_CN:DEFAULT_TABLE_TW;

const DEFAULT_PATTERN_TW = [
	{pattern: '^about:', rule: 'exclude'},
	{pattern: '\\.tw/', rule: 'exclude'},
	{pattern: '^https?://tw\\.', rule: 'exclude'},
	{pattern: '[/.]big5[/.]', rule: 'exclude'},
	{pattern: '\\.jp/', rule: 'exclude'},
	{pattern: '^https?://jp\\.', rule: 'exclude'},
	{pattern: 'moztw\\.org/', rule: 'exclude'},
	{pattern: 'wikipedia\\.org/', rule: 'exclude'},
	{pattern: '[-_=./]cn(?:[./:]|$)'},
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
	{pattern: 'haosou\\.com/'},
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
];
const DEFAULT_PATTERN_CN = [
	{pattern: '^about:', rule: 'exclude'},
	{pattern: '\\.cn/', rule: 'exclude'},
	{pattern: '^https?://cn\\.', rule: 'exclude'},
	{pattern: '\\.jp/', rule: 'exclude'},
	{pattern: '^https?://jp\\.', rule: 'exclude'},
	{pattern: 'wikipedia\\.org/', rule: 'exclude'},
	{pattern: '[-_=./]tw(?:[./:]|$)'},
	{pattern: '[-_=./]big5(?:[./]|$)'},
	{pattern: 'chinatimes\\.com/'},
	{pattern: '[./]ck101\\.com/'},
	{pattern: 'ettoday\\.net/'},
	{pattern: '\\.eyny\\.com/'},
	{pattern: 'mobile01\\.com/'},
	{pattern: 'moztw\\.org/'},
	{pattern: 'nownews\\.com/'},
	{pattern: 'pixnet\\.net/'},
	{pattern: '[./]udn\\.com/'},
	{pattern: 'xuite\\.net/'}
];
const DEFAULT_PATTERN = ('zh-CN'===locale)?DEFAULT_PATTERN_CN:DEFAULT_PATTERN_TW;

let config = {
	bFirstRun: true,
	bConvAlt: true,
	bConvTitle: true,
	bConvFrame: true,
	bLogEnable: false,
	sToolbarBtnLeftClick: CONV_WEB_TEXT,
	sToolbarBtnMiddleClick: DO_NOTHING,
	sToolbarBtnRightClick: OPEN_SETTING_WINDOW,
	aDefaultTables: DEFAULT_TABLE,
	aURLs: DEFAULT_PATTERN,
	aHotkeys: [],
	oTBB: {
		left:{},
		middle:{},
		right:{}
	}
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
		initBool('bFirstRun');
		initBool('bConvAlt');
		initBool('bConvTitle');
		initBool('bConvFrame');
		initBool('bLogEnable');
		initString('sToolbarBtnLeftClick');
		initString('sToolbarBtnMiddleClick');
		initString('sToolbarBtnRightClick');
		initComplex( 'aDefaultTables', JSON.parse, JSON.stringify(DEFAULT_TABLE) );
		initComplex( 'aURLs', JSON.parse, JSON.stringify(config.aURLs) );
		initComplex( 'aHotkeys', JSON.parse, JSON.stringify(config.aHotkeys) );
		initComplex( 'oTBB', JSON.parse, JSON.stringify(config.oTBB) );
	},
	reloadConfig: function() {
		let {loadBool, loadString, loadComplex} = this;
		loadBool('bFirstRun');
		loadBool('bConvAlt');
		loadBool('bConvTitle');
		loadBool('bConvFrame');
		loadBool('bLogEnable');
		loadString('sToolbarBtnLeftClick');
		loadString('sToolbarBtnMiddleClick');
		loadString('sToolbarBtnRightClick');
		loadComplex('aDefaultTables', JSON.parse);
		loadComplex('aURLs', JSON.parse);
		loadComplex('aHotkeys', JSON.parse);
		loadComplex('oTBB', JSON.parse);
	},
	saveConfig: function(config) {
		this.stop(); // avoid recursion

		pref.setBool('bFirstRun', false);
		pref.setBool('bConvAlt', config.bConvAlt);
		pref.setBool('bConvTitle', config.bConvTitle);
		pref.setBool('bConvFrame', config.bConvFrame);
		pref.setBool('bLogEnable', config.bLogEnable);
		pref.setString('sToolbarBtnLeftClick', config.sToolbarBtnLeftClick);
		pref.setString('sToolbarBtnMiddleClick', config.sToolbarBtnMiddleClick);
		pref.setString('sToolbarBtnRightClick', config.sToolbarBtnRightClick);
		pref.setString('aDefaultTables', JSON.stringify(config.aDefaultTables));
		pref.setString('aURLs', JSON.stringify(config.aURLs));
		pref.setString('aHotkeys', JSON.stringify(config.aHotkeys));
		pref.setString('oTBB', JSON.stringify(config.oTBB));

		this.start();
	}
};