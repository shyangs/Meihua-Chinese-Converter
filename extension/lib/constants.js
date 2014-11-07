'use strict';
/* MeihuaCC is licensed under GPLv2 or later versions. See the LICENSE file. */

let EXPORTED_SYMBOLS = ['Cc', 'Ci', 'Cu', 'CONV_WEB_TEXT', 'DO_NOTHING', 'OPEN_SETTING_WINDOW', 'BUILTIN_TABLE'];

const {classes: Cc, interfaces: Ci, utils: Cu} = Components;

const CONV_WEB_TEXT = 'conv.webText';
const DO_NOTHING = 'do.nothing';
const OPEN_SETTING_WINDOW = 'open.settingWindow';

const BUILTIN_TABLE = ['\u6885\u82B1\u901A\u7528\u55AE\u5B57(\u7E41)', '\u6885\u82B1\u901A\u7528\u8A5E\u5F59(\u7E41)', '\u6885\u82B1\u901A\u7528\u5355\u5B57(\u7B80)', '\u6885\u82B1\u901A\u7528\u8BCD\u6C47(\u7B80)'];//['梅花通用單字(繁)', '梅花通用詞彙(繁)', '梅花通用单字(简)', '梅花通用词汇(简)'];