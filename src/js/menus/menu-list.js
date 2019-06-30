/*
    所有菜单的汇总
*/

// 存储菜单的构造函数
const MenuConstructors = {}

import Bold from './bold/index.js'
MenuConstructors.bold = Bold

import Head from './head/index.js'
MenuConstructors.head = Head

import FontSize from './fontSize/index.js'
MenuConstructors.fontSize = FontSize

import FontName from './fontName/index.js'
MenuConstructors.fontName = FontName

import Link from './link/index.js'
MenuConstructors.link = Link

import Italic from './italic/index.js'
MenuConstructors.italic = Italic

import Redo from './redo/index.js'
MenuConstructors.redo = Redo

import StrikeThrough from './strikethrough/index.js'
MenuConstructors.strikeThrough = StrikeThrough

import Underline from './underline/index.js'
MenuConstructors.underline = Underline

import Undo from './undo/index.js'
MenuConstructors.undo = Undo

import List from './list/index.js'
MenuConstructors.list = List

import OrderedList from './orderedList/index.js'
MenuConstructors.orderedList = OrderedList

import Justify from './justify/index.js'
MenuConstructors.justify = Justify

import ForeColor from './foreColor/index.js'
MenuConstructors.foreColor = ForeColor

import BackColor from './backColor/index.js'
MenuConstructors.backColor = BackColor

import Quote from './quote/index.js'
MenuConstructors.quote = Quote

import Code from './code/index.js'
MenuConstructors.code = Code

import Emoticon from './emoticon/index.js'
MenuConstructors.emoticon = Emoticon

import Table from './table/index.js'
MenuConstructors.table = Table

import Video from './video/index.js'
MenuConstructors.video = Video

// import Image from './img/index.js'
import Image from './image/index.js'
MenuConstructors.image = Image

import Youtube from './youtube/index.js'
MenuConstructors.youtube = Youtube

import Inst from './instagram/index.js'
MenuConstructors.instagram = Inst

import Geo from './geo/index.js'
MenuConstructors.geo = Geo

import RemoveFormat from './removeFormat/index.js'
MenuConstructors.removeformat = RemoveFormat

import Indent from './indent/index.js'
MenuConstructors.indent = Indent

import LineHeight from './lineHeight/index.js'
MenuConstructors.lineHeight = LineHeight

import Audio from './audio/index.js'
MenuConstructors.audio = Audio

import Fullsize from './fullsize/index.js'
MenuConstructors.fullsize = Fullsize

import Spliter from './spliter/index.js'
MenuConstructors.spliter = Spliter

// 吐出所有菜单集合
export default MenuConstructors