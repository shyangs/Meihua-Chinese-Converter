'use strict';
/* MeihuaCC is licensed under GPLv2 or later versions. See the LICENSE file. */
let EXPORTED_SYMBOLS = ['tBiTree'];

let tBiTree = '\
<hbox>\
<vbox>\
	{{include "subTmpl" data}}\
	<separator/>\
	<groupbox>\
		<caption label="{{mappingTables_inUse_label}}"/>\
		<tree id="inUseListTree" seltype="single" disabled="{{tree_disabled}}" editable="true" flex="1" onselect="onSelectInUseList();">\
		<treecols>\
			<treecol name="indexColumn" label="{{treeColumn_indexTitle}}" persist="width hidden"/>\
			<splitter class="tree-splitter"/>\
			<treecol name="nameColumn" label="{{treeColumn_nameTitle}}" flex="1" persist="width hidden"/>\
		</treecols>\
		<treechildren id="inUseListTreeChildren"/>\
		</tree>\
	</groupbox>\
</vbox>\
<vbox>\
	<spacer flex="1"/>\
	<button id="addButton" label="{{addTable_button_label}}" disabled="true" oncommand="addTable();"/>\
	<button id="removeButton" label="{{removeTable_button_label}}" disabled="true" oncommand="removeTable();"/>\
	<separator/>\
	<button id="moveUpButton" disabled="true" label="{{moveUpButton_label}}" oncommand="moveUpTable();"/>\
	<button id="moveDownButton" disabled="true" label="{{moveDownButton_label}}" oncommand="moveDownTable();"/>\
	<button id="moveToButton" disabled="true" label="{{moveToButton_label}}" oncommand="moveToTable();"/>\
	<spacer flex="1"/>\
</vbox>\
<vbox flex="1">\
	<groupbox flex="1">\
		<caption label="{{mappingTables_available_label}}"/>\
		<tree id="availableListTree" seltype="single" disabled="{{tree_disabled}}" editable="true" flex="1" onselect="onSelectAvailableList();">\
		<treecols>\
			<treecol name="nameColumn" label="{{treeColumn_nameTitle}}" flex="1" persist="width hidden"/>\
		</treecols>\
		<treechildren id="availableListTreeChildren"/>\
		</tree>\
	</groupbox>\
</vbox>\
</hbox>';