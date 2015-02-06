/**
 * Created by shuyi.wu on 2015/2/5.
 */
define([
    'jquery',
    'lodashJs',
    'umeditorHf',
    'jScrollPane',
    'jqueryRaty',
    'sweetalert',
    'magnificPopupJs'
],function(
    $,
    _,
    UM
){
    'use strict';

    var $cache = {},
        jspScrollList = {},
        timerList = {},
        lockCtl = {};

    // object to global debug
    window.jspScrollList = jspScrollList;
    window.$cache = $cache;
    $cache.win = $(window);
    $cache.leftCent = $('#left-cent');
    $cache.rightCent = $('#right-cent');
    $cache.taskBoxCent = $('#task-box-cent');
    $cache.leftCentTopBar = $cache.leftCent.find('.topBar');
    $cache.leftCentToolBar = $cache.leftCent.find('.toolbar');
    $cache.planCent = $cache.leftCent.find('.plan-cent');
    $cache.sketchpadCent = $cache.rightCent.find('.sketchpad-cent');
    $cache.taskCent = $cache.taskBoxCent.find('.task-cent');
    $cache.taskCtlBtn = $cache.leftCentToolBar.find('.task-ctl-btn');
    $cache.taskName = $cache.taskBoxCent.find('.task-name');
    $cache.taskClose = $cache.taskBoxCent.find('.task-close');

    $cache.win.on('resize', function(){
        // jspScroll response
        if(jspScrollList.planFn ||
            jspScrollList.sketchpadFn ||
            jspScrollList.taskFn){
            if(timerList.timeoutScrollReset){
                clearTimeout(timerList.timeoutScrollReset);
            }
            timerList.timeoutScrollReset = setTimeout(function(){
                if(jspScrollList.planFn){
                    jspScrollList.planFn.reinitialise();
                }
                if(jspScrollList.sketchpadFn){
                    jspScrollList.sketchpadFn.reinitialise();
                }
                if(jspScrollList.taskFn && lockCtl.taskBox){
                    jspScrollList.taskFn.reinitialise();
                }
            }, 600);
        }
    });
    jspScrollList.planFn = $cache.planCent.jScrollPane({
        hideFocus: true
    }).data('jsp');
    jspScrollList.sketchpadFn = $cache.sketchpadCent.jScrollPane({
        hideFocus: true
    }).data('jsp');
    jspScrollList.taskFn = $cache.taskCent.jScrollPane({
        hideFocus: true
    }).data('jsp');

    $cache.taskCtlBtn.on('click', function(e){
        if(!lockCtl.taskBox){
            $cache.taskBoxCent.show();
            jspScrollList.taskFn.reinitialise();
            lockCtl.taskBox = true;
        }else{
            $cache.taskBoxCent.hide();
            lockCtl.taskBox = false;
        }
    });
    $cache.taskClose.on('click', function(){
        $cache.taskBoxCent.hide();
        lockCtl.taskBox = false;
    });

    var umReady = function(stat){
        var umDom = um.container;
        $cache.um = $(umDom);
        $cache.umTool = $cache.um.find('.edui-btn-toolbar');
        $cache.umBody = $cache.um.find('.edui-editor-body')
        $cache.umBody.appendTo($cache.um);

        var $sumBtn = $('<div class="task-sum-btn">发送</div>');
        var $webcam = $('<div class="task-webcam-btn"></div>');
        var $uploadImg = $('<div class="task-upload-btn"><input type="file" name="upload"></div>');

        $cache.umTool.append($sumBtn);
        $cache.umTool.append($webcam);
        $cache.umTool.append($uploadImg);
    };
    var um = UM.getEditor('myEditor');
    um.addListener('ready', umReady);
});