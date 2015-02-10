/**
 * Created by shuyi.wu on 2014/12/23.
 */
/* global WSY */
(function (module, window) {
    'use strict';

    define(['WSY'], module(WSY, window));
}(function(WSY, window, undefined){
    'use strict';
    var proto;

    WSY.CanvasBuffer = function (width, height) {
        this.width = width;
        this.height = height;
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.canvas.width = width;
        this.canvas.height = height;
    };

    proto = WSY.CanvasBuffer.prototype;

    proto.constructor = WSY.CanvasBuffer;

    proto.clear = function () {
        this.context.clearRect(0, 0, this.width, this.height);
    };

    proto.resize = function (width, height) {
        this.width = this.canvas.width = width;
        this.height = this.canvas.height = height;
    };

}, this));