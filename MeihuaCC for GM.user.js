// ==UserScript==
// @author      Shyangs
// @name        Meihua Chinese Converter for Greasemonkey
// @description 梅花繁簡轉換器
// @namespace   https://github.com/shyangs/Meihua-Chinese-Converter
// @include     *
// @version     0.3
// @grant       none
// @require     https://raw.githubusercontent.com/shyangs/Meihua-Chinese-Converter/master/cn2tw_1.js
// @run-at      document-start
// @icon        http://www.gravatar.com/avatar/b4067537364e89cce0d6f91e193420d0
// @license     GPLv3; http://opensource.org/licenses/gpl-3.0.html
// ==/UserScript==
'use strict';
(function(window){

let MeihuaCC = (function(){
	let doc = document,
		cn2twMap = {},
		userOpt = {
			blnAlt: true,
			blnTitle: true,
			aURLs: [
				['\\.tw', 'exclude'],
				['https?://tw\\.', 'exclude'],
				['[/.]big5[/.]', 'exclude'],
				['\\.jp', 'exclude'],
				['https?://jp\\.', 'exclude'],
				['wikipedia\\.org', 'exclude'],
				['[-_=./]cn(?:[./]|$)'],
				['[-_=./]gbk?(?:[./]|$)'],
				['123yq\\.com'],
				['\\.163\\.com'],
				['\\.17k\\.com'],
				['360doc\\.com'],
				['alipay\\.com'],
				['\\.b5m\\.com'],
				['baidu\\.com'],
				['china\\.com'],
				['douban\\.com'],
				['\\.dm5\\.com'],
				['hao123\\.com'],
				['hongxiu\\.com'],
				['ifeng\\.net'],
				['jjwxc\\.net'],
				['qdmm\\.com'],
				['qidian\\.com'],
				['\\.qq\\.com'],
				['readnovel\\.com'],
				['sfacg\\.com'],
				['sina\\.com'],
				['\\.so\\.com'],
				['sogou\\.com'],
				['sohu\\.com'],
				['soso\\.com'],
				['taobao\\.com'],
				['thethirdmedia\\.com'],
				['tudou\\.com'],
				['weibo\\.com'],
				['xinhuanet\\.com'],
				['youku\\.com'],
				['zongheng\\.com']
			]
		},
		observeOpt = {
			childList: true,
			subtree:true
		};
	let fnObserverCallback = function(mutations, self){
		if( 'undefined' === typeof self.target ) self.target = doc;
		mutations.forEach(function(mutation){
			self.disconnect();
			for( let node of mutation.addedNodes ){
				switch(node.nodeType){
					case 1: // ELEMENT_NODE
						transPage(node, false);
					break;
					case 3: // TEXT_NODE
						node.nodeValue = convert(node.nodeValue)
					break;
				}
			}
			self.observe(self.target, observeOpt);
		});
	};
	let convert = function(str){
		let leng = Math.min(1, str.length);
		let cn2twMap = MeihuaCC.cn2twMap;
		let txt = '';
		for(let idx = 0, strLen = str.length; idx < strLen;){
			let bHit = false;
			for(let j = leng; j > 0; j--){
				let ss = str.substr(idx, j);
				if( 'undefined' !== typeof cn2twMap[ss] ){
					txt += cn2twMap[ss];
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
	walkStep = function(walker, attr, startTime){
		let node = walker.nextNode();
		if( node && (Date.now() - startTime < 50) ){
			node[attr] = convert('nodeValue'===attr?node.nodeValue:node.getAttribute(attr));
			walkStep(walker, attr, startTime);
		}else if(node){
			setTimeout(function(){
				walkStep(walker, attr, Date.now());
			}, 1);
		}
	},
	treeWalker = function(root, whatToShow, attr){
		let walker = document.createTreeWalker(root, whatToShow, {
			acceptNode: function(node){
				return ( node.hasAttribute(attr) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP );
			}
		});
		walkStep(walker, attr, Date.now());
	},
	transPage = function( elmt = doc, blnObs = true ){
		let walker = document.createTreeWalker(elmt, NodeFilter.SHOW_TEXT, null);
		walkStep(walker, 'nodeValue', Date.now());
		
		if(userOpt.blnTitle) treeWalker(elmt, NodeFilter.SHOW_ELEMENT, 'title');
		if(userOpt.blnAlt) treeWalker(elmt, NodeFilter.SHOW_ELEMENT, 'alt');
		if(blnObs) new MutationObserver(fnObserverCallback).observe(doc, observeOpt);
	},
	applyURL = function(href){
		let aURLs = userOpt.aURLs;
		for(let i=0, len=aURLs.length; i<len; i++){
			let aURL = aURLs[i], sReg = aURL[0], rule = aURL[1], 
				regexp = new RegExp(sReg, 'i');
			if( !regexp.test(href) ) continue;
			if(rule !== 'exclude'){
				console.log('MeihuaCC: 網址「 ' + href + ' 」符合包含規則「 ' + sReg + ' 」，繁簡轉換開始...');
				return true;
			}else{
				console.log('MeihuaCC: 網址「 ' + href + ' 」符合排除規則「 ' + sReg + ' 」，不進行繁簡轉換。');
				return false;
			}
		}
		console.log('MeihuaCC: 網址「 ' + href + ' 」不符合所有規則，不進行繁簡轉換。');
		return false;
	},
	onPageLoad = function(aEvent){
		doc = aEvent.originalTarget; // doc is document that triggered "onload" event
		// do something with the loaded page.
		if(!applyURL(doc.location.href)) return;
		let startTime = Date.now();
		MeihuaCC.transPage(doc, true);
		console.log('MeihuaCC: 轉換耗時 ' + (Date.now() - startTime) + ' ms.');
	};

	return {
		userOpt: userOpt,
		cn2twMap: cn2twMap,
		transPage: transPage,
		onPageLoad: onPageLoad
	};
})();

MeihuaCC.cn2twMap = cn2tw_1;


let listenElmt = document;
if(listenElmt){
	listenElmt.addEventListener('DOMContentLoaded', MeihuaCC.onPageLoad);
}
window.MeihuaCC = MeihuaCC;

})(window);