/**
 * Created by Administrator on 2014/12/25.
 */
define([
    'WSY',

    'wsy/canvas_board'
], function(
    WSY
){
    'use strict';
    var proto;
    WSY.hfCanvasBoard = function(options){
        WSY.CanvasBoard.call(this, options);
    };
    WSY.hfCanvasBoard.prototype =  WSY.CanvasBoard.prototype;
    proto = WSY.hfCanvasBoard.prototype;
});