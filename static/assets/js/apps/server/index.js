/**
 * Created by shuyi.wu on 2015/2/5.
 */
define([
    'jquery',
    'lodashJs',
    'jScrollPane',
    'jqueryRaty',
    'sweetalert',
    'magnificPopupJs'
],function(
    $,
    _
){
    'use strict';
    var swalTest, magnificTest;
    window.swalTest = swalTest = function(){
        swal({
            title: '网络出现错误...',
            text: '',
            type: 'error',
            allowOutsideClick: false,
            showCancelButton: false,
            closeOnConfirm: true,
            closeOnCancel: true,
            confirmButtonText: 'OK',
            confirmButtonColor: '#AEDEF4',
            cancelButtonText: 'Cancel',
            imageUrl: null,
            imageSize: null,
            timer: null,
            customClass: '',
            html: false,
            animation: true,
            allowEscapeKey: true
        });
    };

    window.magnificTest = magnificTest = function(){
        $('.image-link').magnificPopup({type:'image'});
    };



});