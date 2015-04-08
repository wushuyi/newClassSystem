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
    proto.eraserAll = function(){
        var self = this;
        var canvas = self._canvas.canvas;
        var ctx = self._canvas.context;
        ctx.clearRect(0,0, canvas.width, canvas.height);
    };
});