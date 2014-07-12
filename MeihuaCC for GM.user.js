// ==UserScript==
// @author      Shyangs
// @name        Meihua Chinese Converter for Greasemonkey
// @description 梅花繁簡轉換器
// @namespace   https://github.com/shyangs/Meihua-Chinese-Converter
// @include     *
// @version     0.7
// @grant       none
// @require     https://greasyfork.org/scripts/2666-object-assign-shim/code/Objectassign%20shim.js?version=7344
// @require     https://raw.githubusercontent.com/shyangs/Meihua-Chinese-Converter/master/extension/dict/cn2tw_c.js
// @require     https://raw.githubusercontent.com/shyangs/Meihua-Chinese-Converter/master/extension/dict/cn2tw_p.js
// @run-at      document-start
// @icon        http://www.gravatar.com/avatar/b4067537364e89cce0d6f91e193420d0
// @license     GPLv3; http://opensource.org/licenses/gpl-3.0.html
// ==/UserScript==
'use strict';
(function(window){

let MeihuaCC = (function(){
	let doc = document,
		oTables = {},
		oCacheTable = {},
		userOpt = {
			bAlt: true,
			bTitle: true,
			aURLs: [
				{pattern: '\\.tw/', rule: 'exclude'},
				{pattern: 'https?://tw\\.', rule: 'exclude'},
				{pattern: '[/.]big5[/.]', rule: 'exclude'},
				{pattern: '\\.jp/', rule: 'exclude'},
				{pattern: 'https?://jp\\.', rule: 'exclude'},
				{pattern: 'wikipedia\\.org/', rule: 'exclude'},
				{pattern: '[-_=./]cn(?:[./]|$)', rule: 'include',aTables: ['梅花通用單字', '梅花通用詞彙']},
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
				{pattern: 'hao123\\.com/'},
				{pattern: 'hongxiu\\.com/'},
				{pattern: 'ifeng\\.net/'},
				{pattern: 'jjwxc\\.net/'},
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
			]
		},
		observeOpt = {
			childList: true,
			subtree:true
		};
	let addTable = function(table){
		oTables[table.name] = table;
	},
	setTable = function(oURL){
		let table = {mappings:{}, maxLen:0, id:''},
			aTables = oURL.aTables;
		if( 'undefined' === typeof aTables || !Array.isArray(aTables) || aTables.length === 0 ){
			aTables = ['梅花通用單字', '梅花通用詞彙'];
		}

		table.id = aTables.length.toString();
		aTables.forEach(function(tableName){
			let version = oTables[tableName].version || Date.now();
			table.id += ',' + tableName + version;
		});
		if( 'undefined' !== typeof oCacheTable[table.id] ) return oCacheTable[table.id];

		aTables.forEach(function(tableName){
			let item = oTables[tableName];
			Object.assign(table.mappings, item.mappings);
			table.maxLen = Math.max(table.maxLen, item.maxLen);
		});
		oCacheTable[table.id] = table;
		return table;
	},
	observerCallback = function(mutations, self){
		mutations.forEach(function(mutation){
			for( let node of mutation.addedNodes ){
				switch(node.nodeType){
					case 1: // ELEMENT_NODE
						transPage(node, false, self.table);
					break;
					case 3: // TEXT_NODE
						node.nodeValue = convert(node.nodeValue, self.table);
					break;
				}
			}
		});
	},
	convert = function(str, table){
		let leng = Math.min(table.maxLen, str.length);
		let mappings = table.mappings;
		let txt = '';
		for(let idx = 0, strLen = str.length; idx < strLen;){
			let bHit = false;
			for(let j = leng; j > 0; j--){
				let ss = str.substr(idx, j);
				if( 'undefined' !== typeof mappings[ss] ){
					txt += mappings[ss];
					idx += j;
					bHit = true;
					break;
				}
			}

			if(!bHit){
				txt += str.substr(idx, 1);
				idx++;
			}
		}
		if (txt !== '') str = txt;
		return str;
	},
	walkStep = function(walker, attr, startTime, table){
		let node = walker.nextNode();
		if(!node) return;
		if(Date.now() - startTime < 50){
			node[attr] = convert('nodeValue'===attr?node.nodeValue:node.getAttribute(attr), table);
			walkStep(walker, attr, startTime, table);
		}else{
			setTimeout(function(){
				walkStep(walker, attr, Date.now(), table);
			}, 1);
		}
	},
	treeWalker = function(root, whatToShow, attr, table){
		let filter = 'nodeValue' === attr ? {
			acceptNode: function(node){
				switch(node.parentNode.nodeName.toUpperCase()){
					case 'SCRIPT':
					case 'STYLE':
						return NodeFilter.FILTER_REJECT;
				}
				return NodeFilter.FILTER_ACCEPT;
			}
		} : {
			acceptNode: function(node){
				return ( node.hasAttribute(attr) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP );
			}
		},
		walker = document.createTreeWalker(root, whatToShow, filter);
		walkStep(walker, attr, Date.now(), table);
	},
	transPage = function( elmt = doc, bObs = true , table = setTable({}) ){
		if(bObs){
			let observer = new MutationObserver(observerCallback);
			observer.table = table;
			observer.observe(doc, observeOpt);
		}
		
		treeWalker(elmt, NodeFilter.SHOW_TEXT, 'nodeValue', table);
		if(userOpt.bTitle) treeWalker(elmt, NodeFilter.SHOW_ELEMENT, 'title', table);
		if(userOpt.bAlt) treeWalker(elmt, NodeFilter.SHOW_ELEMENT, 'alt', table);
	},
	applyURL = function(href){
		let aURLs = userOpt.aURLs;
		for(let i=0, len=aURLs.length; i<len; i++){
			let oURL = aURLs[i], pattern = oURL.pattern, rule = oURL.rule, 
				regexp = new RegExp(pattern, 'i');
			if( !regexp.test(href) ) continue;
			if(rule !== 'exclude'){
				console.log('MeihuaCC: 網址「 ' + href + ' 」符合包含規則「 ' + pattern + ' 」，繁簡轉換開始...');
				return oURL;
			}else{
				console.log('MeihuaCC: 網址「 ' + href + ' 」符合排除規則「 ' + pattern + ' 」，不進行繁簡轉換。');
				return false;
			}
		}
		console.log('MeihuaCC: 網址「 ' + href + ' 」不符合所有規則，不進行繁簡轉換。');
		return false;
	},
	onPageLoad = function(aEvent){
		doc = aEvent.originalTarget; // doc is document that triggered "onload" event
		// do something with the loaded page.
		let oURL;
		if(!(oURL=applyURL(doc.location.href))) return;
		let table = setTable(oURL);
		let startTime = Date.now();
		MeihuaCC.transPage(doc, true, table);
		console.log('MeihuaCC: 轉換耗時 ' + (Date.now() - startTime) + ' ms.');
	};

	return {
		addTable: addTable,
		onPageLoad: onPageLoad,
		transPage: transPage,
		userOpt: userOpt
	};
})();

MeihuaCC.addTable(cn2tw_c);
MeihuaCC.addTable(cn2tw_p);


let listenElmt = document;
if(listenElmt){
	listenElmt.addEventListener('DOMContentLoaded', MeihuaCC.onPageLoad);
}
window.MeihuaCC = MeihuaCC;

})(window);