'use strict';
/* MeihuaCC is licensed under GPLv3. See the LICENSE file. */
let Core = function(win){
	Components.utils.import('resource://gre/modules/Services.jsm');
	Services.scriptloader.loadSubScript('resource://meihuacc/lib/Object.assign_shim.js');
	let {document: document, MutationObserver: MutationObserver, NodeFilter: NodeFilter, setTimeout: setTimeout, console: console} = win,
		doc = document,
		oTables = {},
		oCacheTable = {},
		config = meihuacc.config,
		userOpt = {
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
	walkStep = function(walker, type, startTime, table){
		let node = walker.nextNode();
		if(!node) return;
		switch(type){
			case 'frame':
				let doc = node.contentDocument;
				if('undefined' !== typeof doc) win.MeihuaCC.transPage(doc, true, table);
			break;
			case 'nodeValue':
				node[type] = convert(node.nodeValue, table);
			break;
			case 'alt':
			case 'title':
				node[type] = convert(node.getAttribute(type), table);
			break;
		}

		if(Date.now() - startTime < 50){
			walkStep(walker, type, startTime, table);
		}else{
			setTimeout(function(){
				walkStep(walker, type, Date.now(), table);
			}, 1);
		}
	},
	treeWalker = function(root, whatToShow, type, table){
		let filter;
		switch(type){
			case 'nodeValue':
				filter = {
					acceptNode: function(node){
						switch(node.parentNode.nodeName.toUpperCase()){
							case 'SCRIPT':
							case 'STYLE':
								return NodeFilter.FILTER_REJECT;
						}
						return NodeFilter.FILTER_ACCEPT;
					}
				};
			break;
			case 'frame':
				filter = {
					acceptNode: function(node){
						let tag = node.nodeName.toUpperCase();
						return ( (tag === 'FRAME' || tag === 'IFRAME') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP );
					}
				};
			break;
			case 'alt':
			case 'title':
				filter = {
					acceptNode: function(node){
						return ( node.hasAttribute(type) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP );
					}
				};
			break;
		}
		
		let doc = (root.nodeType === 9 ? root : root.ownerDocument),
		walker = doc.createTreeWalker(root, whatToShow, filter);
		walkStep(walker, type, Date.now(), table);
	},
	transPage = function( elmt = doc, bObs = true , table = setTable({}), bFrame = true ){
		if(bObs){
			let observer = new MutationObserver(observerCallback);
			observer.table = table;
			observer.observe(elmt, observeOpt);
		}

		treeWalker(elmt, NodeFilter.SHOW_TEXT, 'nodeValue', table);
		if(bFrame&&config.bConvFrame) treeWalker(elmt, NodeFilter.SHOW_ELEMENT, 'frame', table);
		if(config.bConvTitle) treeWalker(elmt, NodeFilter.SHOW_ELEMENT, 'title', table);
		if(config.bConvAlt) treeWalker(elmt, NodeFilter.SHOW_ELEMENT, 'alt', table);
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
		win.MeihuaCC.transPage(doc, true, table, false);
		console.log('MeihuaCC: 轉換耗時 ' + (Date.now() - startTime) + ' ms.');
	};

	return {
		addTable: addTable,
		onPageLoad: onPageLoad,
		transPage: transPage,
		userOpt: userOpt
	};
};