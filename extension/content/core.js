'use strict';
/* MeihuaCC is licensed under GPLv2 or later versions. See the LICENSE file. */
let Core = function(win){
	let {document: document, MutationObserver: MutationObserver, NodeFilter: NodeFilter, setTimeout: setTimeout, console: console} = win,
		doc = document,
		oTables = meihuacc.oTables,
		oCacheMaps = meihuacc.oCacheMaps,
		config = meihuacc.config,
		observeOpt = {
			childList: true,
			subtree:true
		};
	let getConfig = function(name){
		return config[name];
	},
	addTable = function(table){
		oTables[table.name] = table;
	},
	removeTable = function(table){
		delete oTables[table.name];
	},
	setTable = function(oURL){
		let table = {aMappings:[], maxPhLen:0, id:''},
			aTables = oURL.aTables;
		if( 'undefined' === typeof aTables || !Array.isArray(aTables) || aTables.length === 0 ){
			aTables = config.aDefaultTables;
		}

		table.id = aTables.length.toString();
		aTables.forEach(function(tableName){
			let version = oTables[tableName].version || Date.now();
			table.id += ',' + tableName + version;
		});
		if( 'undefined' !== typeof oCacheMaps[table.id] ) return oCacheMaps[table.id];

		aTables.forEach(function(tableName){
			let item = oTables[tableName];
			table.aMappings = table.aMappings.concat(item.aMappings);
			table.maxPhLen = Math.max(table.maxPhLen, item.maxPhLen);
		});
		oCacheMaps[table.id] = {
			mPhrases: new Map(table.aMappings),
			maxPhLen: table.maxPhLen,
			id: table.id
		};
		return oCacheMaps[table.id];
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
		let leng = Math.min(table.maxPhLen, str.length);
		let mPhrases = table.mPhrases;
		let txt = '';
		for(let idx = 0, strLen = str.length; idx < strLen;){
			let bHit = false;
			for(let j = leng; j > 0; j--){
				let ss = str.substr(idx, j);
				if(mPhrases.has(ss)){
					txt += mPhrases.get(ss);
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
	transPage = function( elmt = doc, bObs = true, table = setTable({}) ){
		if(bObs){
			let observer = new MutationObserver(observerCallback);
			observer.table = table;
			observer.observe(elmt, observeOpt);
		}

		treeWalker(elmt, NodeFilter.SHOW_TEXT, 'nodeValue', table);
		if(config.bConvFrame) treeWalker(elmt, NodeFilter.SHOW_ELEMENT, 'frame', table);
		if(config.bConvTitle) treeWalker(elmt, NodeFilter.SHOW_ELEMENT, 'title', table);
		if(config.bConvAlt) treeWalker(elmt, NodeFilter.SHOW_ELEMENT, 'alt', table);
	},
	applyURL = function(href){
		let aURLs = config.aURLs;
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
		win.MeihuaCC.transPage(doc, true, table);
		console.log('MeihuaCC: 轉換耗時 ' + (Date.now() - startTime) + ' ms.');
	};

	return {
		addTable: addTable,
		removeTable: removeTable,
		setTable: setTable,
		onPageLoad: onPageLoad,
		transPage: transPage,
		getConfig: getConfig
	};
};