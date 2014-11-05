'use strict';
/* MeihuaCC is licensed under GPLv2 or later versions. See the LICENSE file. */
let EXPORTED_SYMBOLS = ['tBiTree'];

let tBiTree = '\
<hbox>\
<vbox>\
	{{include "subTmpl" data}}\
	<separator/>\
	<groupbox class="mapping_table_form">\
		<caption label="{{mappingTables_inUse_label}}"/>\
		<tree id="{{id_inUseListTree}}" seltype="single" disabled="{{tree_disabled}}" editable="true" flex="1" onselect="{{onSelect_InUseList}}">\
		<treecols>\
			<treecol name="indexColumn" label="{{treeColumn_indexTitle}}" persist="width hidden"/>\
			<splitter class="tree-splitter"/>\
			<treecol name="nameColumn" label="{{treeColumn_nameTitle}}" flex="1" persist="width hidden"/>\
		</treecols>\
		<treechildren/>\
		</tree>\
	</groupbox>\
</vbox>\
<vbox class="mapping_table_form">\
	<spacer flex="1"/>\
	<button id="{{id_addButton}}" label="{{addTable_button_label}}" disabled="true" oncommand="{{onCommand_addTable}}"/>\
	<button id="{{id_removeButton}}" label="{{removeTable_button_label}}" disabled="true" oncommand="{{onCommand_removeTable}}"/>\
	<separator/>\
	<button id="{{id_moveUpButton}}" disabled="true" label="{{moveUpButton_label}}" oncommand="{{onCommand_moveUpTable}}"/>\
	<button id="{{id_moveDownButton}}" disabled="true" label="{{moveDownButton_label}}" oncommand="{{onCommand_moveDownTable}}"/>\
	<button id="{{id_moveToButton}}" disabled="true" label="{{moveToButton_label}}" oncommand="{{onCommand_moveToTable}}"/>\
	<spacer flex="1"/>\
</vbox>\
<vbox flex="1">\
	<groupbox flex="1" class="mapping_table_form">\
		<caption label="{{mappingTables_available_label}}"/>\
		<tree id="{{id_availableListTree}}" seltype="single" disabled="{{tree_disabled}}" editable="true" flex="1" onselect="{{onSelect_AvailableList}}">\
		<treecols>\
			<treecol name="nameColumn" label="{{treeColumn_nameTitle}}" flex="1" persist="width hidden"/>\
		</treecols>\
		<treechildren/>\
		</tree>\
	</groupbox>\
</vbox>\
</hbox>';