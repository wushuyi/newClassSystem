/**
 * Created by shuyi.wu on 2015/2/12.
 */
define([
    'jquery',
    'lodashJs',
    'umeditorHf',
    'WSY',
    'apps/util/canvas-to-blob',
    'DetectRTC',
    'RTCPeerConnection',
    'dust-temp/taskView',
    'wsy/get_offset_point',
    'wsy/hf_canvas_board',
    'wsy/canvas_buff',
    'jScrollPane',
    'jqueryRaty',
    'sweetalert',
    'magnificPopupJs',
    'loadImageAll'
],function(
    $,
    _,
    UM,
    WSY,
    dataURLtoBlob
){
    'use strict';

    var $cache = {},
        cache = {},
        jspScrollList = {},
        timerList = {},
        lockCtl = {},
        localMedia,
        webMedia,
        sendMedia;

    // 初始化dom选择缓存
    function initElement(callBack){
        $cache.win = $(window);
        $cache.leftCent = $('#left-cent');
        $cache.rightCent = $('#right-cent');
        $cache.taskBoxCent = $('#task-box-cent');

        $cache.taskCent = $cache.taskBoxCent.find('.task-cent');

        $cache.leftCentTopBar = $cache.leftCent.find('.topbar');
        $cache.leftCentToolBar = $cache.leftCent.find('.toolbar');

        $cache.leftPrevBtn =  $cache.leftCentToolBar.find('.prev-btn');
        $cache.leftToolNum = $cache.leftCentToolBar.find('.tool-num');
        $cache.leftNextBtn = $cache.leftCentToolBar.find('.next-btn');

        $cache.taskScroll = $cache.taskCent.find('.scroll');
        $cache.taskName = $cache.taskBoxCent.find('.task-name');

        if(callBack){
            callBack();
        }
    }
    // 富文本编辑器初始化事件
    function initUMEditorEvent(){

    }

    // 初始化富文本编辑器
    function initUMEditor(callBack){
        var umReady = function(stat){
            var umDom = um.container;
            $cache.um = $(umDom);
            $cache.umTool = $cache.um.find('.edui-btn-toolbar');
            $cache.umBody = $cache.um.find('.edui-editor-body');
            $cache.umMsgBox = $cache.um.find('.edui-body-container');
            $cache.umBody.appendTo($cache.um);

            $cache.taskSumBtn = $('<div class="btn btn-primary task-sum-btn">发送</div>');
            $cache.taskWebcamBtn = $('<div class="task-webcam-btn"></div>');
            $cache.taskUploadBtn = $('<div class="task-upload-btn"><input type="file" name="upload" ' +
            'accept=".gif,.jpeg,.jpg,.png,wbmp,.bmp,.svg,.svgz,.webp"></div>');

            $cache.umTool.append($cache.taskSumBtn);
            $cache.umTool.append($cache.taskWebcamBtn);
            $cache.umTool.append($cache.taskUploadBtn);

            initUMEditorEvent();
            if(callBack){
                callBack();
            }
        };
        var um = UM.getEditor('myEditor');
        um.addListener('ready', umReady);
    }

    initElement(function(){
        initUMEditor();
    });
});