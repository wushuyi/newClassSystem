/**
 * Created by shuyi.wu on 2014/12/24.
 */
define([
        'WSY'
    ],
    function(
        WSY
    ){
        'use strict';
        var proto;
        WSY.getOffsetPoint = function(ParentOffset){
            if(!arguments[0] || typeof ParentOffset !== 'object'){
                throw 'options must ParentOffset';
            }
            this.parentOffset = ParentOffset;
        };
        proto = WSY.getOffsetPoint.prototype;

        proto.getPoint = function(e){
            if(!arguments[0]){
                throw 'options must event';
            }
            var parentOffset = this.parentOffset;
            var pageX;
            var pageY;
            if(e.originalEvent.touches && e.originalEvent.touches.length){
                pageX = e.originalEvent.touches[0].pageX;
                pageY = e.originalEvent.touches[0].pageY;
            }else{
                pageX = e.pageX;
                pageY = e.pageY;
            }
            return {
                x : pageX - parentOffset.left,
                y : pageY - parentOffset.top
            };
        };

        proto.setParentOffset = function(ParentOffset){
            if(!arguments[0] || typeof ParentOffset !== 'object'){
                throw 'options must ParentOffset';
            }
            this.parentOffset = ParentOffset;
        };
    }
);