/**
 * Created by shuyi.wu on 2015/2/5.
 */
define([
    'jquery',
    'lodashJs',
    'umeditorHf',
    'DetectRTC',
    'RTCPeerConnection',
    'dust-temp/taskView',
    'wsy/get_offset_point',
    'wsy/hf_canvas_board',
    'jScrollPane',
    'jqueryRaty',
    'sweetalert',
    'magnificPopupJs',
    'loadImageAll'
],function(
    $,
    _,
    UM
){
    'use strict';

    var $cache = {},
        cache = {},
        jspScrollList = {},
        timerList = {},
        lockCtl = {},
        localMedia,
        sendMedia;


    function initElement(callBack){
        $cache.win = $(window);
        $cache.leftCent = $('#left-cent');
        $cache.rightCent = $('#right-cent');
        $cache.taskBoxCent = $('#task-box-cent');
        $cache.answerLock = $('#answer-lock');
        $cache.taskCent = $cache.taskBoxCent.find('.task-cent');

        $cache.leftCentTopBar = $cache.leftCent.find('.topbar');
        $cache.leftCentToolBar = $cache.leftCent.find('.toolbar');
        $cache.rightCentToolBar = $cache.rightCent.find('.toolbar');

        $cache.planCent = $cache.leftCent.find('.plan-cent');
        $cache.planScroll = $cache.planCent.find('.scroll');

        $cache.addErrorBtn = $cache.leftCentToolBar.find('.add-error-btn');
        $cache.playVideoBtn = $cache.leftCentToolBar.find('.play-video-btn');
        $cache.playSoundBtn = $cache.leftCentToolBar.find('.play-sound-btn');
        $cache.morePlanBtn = $cache.leftCentToolBar.find('.more-plan-btn');

        $cache.sketchpadCent = $cache.rightCent.find('.sketchpad-cent');
        $cache.sketchpadScroll = $cache.sketchpadCent.find('.scroll');
        $cache.soundBtn = $cache.rightCentToolBar.find('.sound-btn');
        $cache.answerBtn = $cache.rightCentToolBar.find('.answer-btn');
        $cache.eraserBtn = $cache.rightCentToolBar.find('.eraser-btn');
        $cache.penRedBtn = $cache.rightCentToolBar.find('.pen-red-btn');
        $cache.penBlackBtn = $cache.rightCentToolBar.find('.pen-black-btn');
        $cache.addPageBtn = $cache.rightCentToolBar.find('.add-page-btn');

        $cache.taskScroll = $cache.taskCent.find('.scroll');
        $cache.taskCtlBtn = $cache.leftCentToolBar.find('.task-ctl-btn');
        $cache.taskName = $cache.taskBoxCent.find('.task-name');
        $cache.taskClose = $cache.taskBoxCent.find('.task-close');

        $cache.popList = $('#pop-list');
        $cache.testMediaPop = $cache.popList.find('.test-media-pop');
        $cache.mediaTest = $cache.testMediaPop.find('.media-test');
        $cache.mediaTestSuccessBtn = $cache.testMediaPop.find('.media-test-success-btn');
        $cache.mediaTestErrorBtn = $cache.testMediaPop.find('.media-test-error-btn');

        if(callBack){
            callBack();
        }
    }

    function initScrollPane(callBack){
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
        if(callBack){
            callBack();
        }
    }

    function initCtlBtn(callBack){
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
        $cache.answerLock.on('change', function (e) {
            var checked = $cache.answerLock.get(0).checked;
            if (checked) {
                $cache.answerBtn.trigger('answerLock');
            }
        });

        if(callBack){
            callBack();
        }
    }

    function initNoFnBtn(){
        var onNoFn;
        onNoFn = function(e){
            e.preventDefault();
            e.stopPropagation();
            swal('对不起该功能善未开发!', '', 'warning');
        };
        $cache.addErrorBtn.on('click', onNoFn);
        $cache.playVideoBtn.on('click', onNoFn);
        $cache.playSoundBtn.on('click', onNoFn);
        $cache.morePlanBtn.on('click', onNoFn);
    }

    function renderTaskView(msgs, callBack){
        var portraits, datas = [];
        if(!(msgs instanceof Array)){
            throw 'msgs must be array!';
        }
        portraits = [
            './assets/images/portrait1.png',
            './assets/images/portrait2.png'
        ];
        for(var i = 0, len = msgs.length; i < len; i ++){
            var data, msg = msgs[i];
            data = {
                userType: msg.type,
                content: msg.msg
            };
            if(msg.type === 'self'){
                data.portrait = portraits[0];
            }else{
                data.portrait = portraits[1];
            }
            datas.push(data);
        }
        dust.render('taskView', {msgs: datas}, function(err, out){
            callBack(out);
        });
    }

    function taskViewTest(){
        var msgs = [
            {type: 'buddy', msg: 'test1'},
            {type: 'self', msg: 'test2'},
            {type: 'buddy', msg: 'test3'},
            {type: 'buddy', msg: 'test4'},
            {type: 'self', msg: 'test5'},
            {type: 'buddy', msg: 'test6'},
            {type: 'self', msg: 'test7'}
        ];
        renderTaskView(msgs, function(data){
            $cache.taskScroll.append(data);
            jspScrollList.taskFn.reinitialise();
            jspScrollList.taskFn.scrollToBottom(0.6);
        });
    }

    window.taskViewTest = taskViewTest;

    function initUMEditorEvent(){
        var onSendMsg;
        cache.taskMsg = [];

        onSendMsg = function(){
            var cent, msg;
            cent = $cache.umMsgBox.html();
            $cache.umMsgBox.html('');
            msg = {type: 'self', msg: cent};
            cache.taskMsg.push(msg);

            renderTaskView([msg], function(data){
                $cache.taskScroll.append(data);
                jspScrollList.taskFn.reinitialise();
                jspScrollList.taskFn.scrollToBottom(0.6);
            });
        };
        $cache.taskSumBtn.on('click', function(e){
            onSendMsg();
        });
    }

    function initUMEditor(callBack){
        var umReady = function(stat){
            var umDom = um.container;
            $cache.um = $(umDom);
            $cache.umTool = $cache.um.find('.edui-btn-toolbar');
            $cache.umBody = $cache.um.find('.edui-editor-body');
            $cache.umMsgBox = $cache.um.find('.edui-body-container');
            $cache.umBody.appendTo($cache.um);

            $cache.taskSumBtn = $('<div class="task-sum-btn">发送</div>');
            $cache.taskWebcamBtn = $('<div class="task-webcam-btn"></div>');
            $cache.taskUploadBtn = $('<div class="task-upload-btn"><input type="file" name="upload"></div>');

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

    function initSketchpadEvent(callBack){
        var $canvas, myBoard, parentOffset, offsetPoint;
        lockCtl.drawType = 'pen';
        $canvas = $cache.sketchpadFg;
        myBoard = cache.Board;

        $cache.sketchpadCent.on('jsp-scroll-y', function(){
            parentOffset = $canvas.offset();
            offsetPoint.setParentOffset(parentOffset);
        });

        parentOffset = $canvas.offset();
        offsetPoint = new WSY.getOffsetPoint(parentOffset);

        $canvas.on('contextmenu', function (e) {
            e.preventDefault();
        });
        $canvas.on('mousedown touchstart', function (e) {
            e.preventDefault();
            if (e.originalEvent.button === 2) {
                return false;
            }
            if(myBoard.isRemoteDraw()){
                return false;
            }
            var point = offsetPoint.getPoint(e);
            if(lockCtl.drawType === 'pen'){
                myBoard.penOnDown(point);
            }else if(lockCtl.drawType === 'eraser'){
                myBoard.eraserOnDown(point);
            }
        });
        $canvas.on('mousemove touchmove', function (e) {
            e.preventDefault();
            if(myBoard.isRemoteDraw()){
                return false;
            }
            var point = offsetPoint.getPoint(e);
            if(lockCtl.drawType === 'pen'){
                myBoard.penOnMove(point);
            }else if(lockCtl.drawType === 'eraser'){
                myBoard.eraserOnMove(point);
            }
        });
        $canvas.on('mouseup mouseleave touchend', function (e) {
            e.preventDefault();
            if(myBoard.isRemoteDraw()){
                return false;
            }
            var point = offsetPoint.getPoint(e);
            if(lockCtl.drawType === 'pen'){
                myBoard.penOnUp(point);
            }else if(lockCtl.drawType === 'eraser'){
                myBoard.eraserOnUp(point);
            }
        });

        initSketchpadCtl();
        if(callBack){
            callBack();
        }
    }

    function initSketchpadCtl(){
        var eraser, pen, penBlack, penRed, myBoard;
        myBoard = cache.Board;
        eraser = function(isRemote){
            lockCtl.drawType = 'eraser';
            if(!isRemote){
                //socket.emit('boardCtl', gData.otherId, 'eraser');
                return false;
            }
        };
        pen = function(isRemote){
            lockCtl.drawType = 'pen';
            if(!isRemote) {
                //socket.emit('boardCtl', gData.otherId, 'pen');
                return false;
            }
        };
        penBlack = function(isRemote){
            myBoard.setStyle('strokeStyle', 'black');
            if(!isRemote) {
                //socket.emit('boardCtl', gData.otherId, 'penBlack');
                return false;
            }
        };
        penRed = function(isRemote){
            myBoard.setStyle('strokeStyle', 'red');
            if(!isRemote) {
                //socket.emit('boardCtl', gData.otherId, 'penRed');
                return false;
            }
        };
        myBoard.setStyle('lineWidth', 1.4);
        myBoard.setStyle('lineCap', 'round');

        /* default mod */
        pen();
        myBoard.setStyle('strokeStyle', 'black');

        $cache.penBlackBtn.on('click', function(){
            pen();
            penBlack();
        });
        $cache.penRedBtn.on('click', function(){
            pen();
            penRed();
        });
        $cache.eraserBtn.on('click', function(){
           eraser();
        });
    }

    function initSketchpadBox(imgUrl ,callBack){
        var loadSuccess;
        loadSuccess = function(canvas){
            var Board, canvas2;
            $cache.sketchpadBg = $(canvas);
            canvas.className = 'sketchpad-img';

            Board = new WSY.CanvasBoard({
                width: canvas.width,
                height: canvas.height + 1000});

            cache.Board = Board;

            canvas2 = Board.getCanvas();
            $cache.sketchpadFg = $(canvas2);

            canvas2.className = 'sketchpad-img';
            $cache.sketchpadScroll.height(canvas2.height);
            $cache.sketchpadScroll.html('');
            $cache.sketchpadScroll.append(canvas);
            $cache.sketchpadScroll.append(canvas2);

            jspScrollList.sketchpadFn.reinitialise();

            if(callBack){
                initSketchpadEvent(callBack);
            }else{
                initSketchpadEvent();
            }
        };

        loadImage(
            imgUrl,
            function (canvas) {
                if(canvas.type === 'error') {
                    console.error('Error loading image :' + canvas.path[0].src);
                    swal('图片加载错误!', '', 'error');
                } else {
                    loadSuccess(canvas);
                }
            },
            {
                canvas: true
            }
        );
    }

    function initPlanBox(imgUrl, callBack){
        var loadSuccess;
        loadSuccess = function(canvas){
            $cache.planFg = $(canvas);
            canvas.className = 'plan-img';
            $cache.planScroll.html(canvas);
            jspScrollList.planFn.reinitialise();

            if(callBack){
                callBack();
            }
        };
        loadImage(
            imgUrl,
            function (canvas){
                if(canvas.type === 'error') {
                    console.error('Error loading image :' + canvas.path[0].src);
                    swal('图片加载错误!', '', 'error');
                } else {
                    loadSuccess(canvas);
                }
            },
            {
                canvas: true
            }
        );
    }

    function mediaTest(){
        DetectRTC.load(function(){
            initElement(function(){
                $cache.mediaTestSuccessBtn.click('click', function(e){
                    initApp();
                    $cache.mediaTest.attr('src', '');
                    $.magnificPopup.close();
                });
                $cache.mediaTestErrorBtn.click('click', function(e){
                    $cache.mediaTestSuccessBtn.hide();
                    swal('请调整设备, 或联系老师!', '', 'warning');
                });
                $.magnificPopup.open({
                    items: {
                        src: $cache.testMediaPop
                    },
                    type: 'inline',
                    modal: true
                });
            });

            if(!DetectRTC.browser.isChrome){
                swal('对不起,浏览器版本不兼容!', '请使用Google Chrome浏览器!', 'error');
                $cache.mediaTestSuccessBtn.hide();
                return false;
            }
            if(!DetectRTC.isWebRTCSupported){
                swal('您的浏览器无法支持WebRTC!', '', 'error');
                $cache.mediaTestSuccessBtn.hide();
                return false;
            }
            if(!DetectRTC.hasWebcam){
                swal('无法检测到您的摄像头!', '', 'error');
                $cache.mediaTestSuccessBtn.hide();
                return false;
            }
            if(!DetectRTC.hasMicrophone){
                swal('无法检测到您的麦克风!', '', 'error');
                $cache.mediaTestSuccessBtn.hide();
                return false;
            }
            getUserMedia({
                onsuccess: function(media){
                    localMedia = media;
                    sendMedia = media.clone();
                    $cache.mediaTest.attr('src', window.URL.createObjectURL(sendMedia));

                    window.localMedia = localMedia;
                    window.sendMedia = sendMedia;
                }
            });
        });
    }

    function initApp(){
        initScrollPane(function(){
            initCtlBtn(function(){
                initUMEditor(function(){
                    var imgUrl = 'http://localhost:63342/newClassSystem/static/assets/images/width600.png';
                    initSketchpadBox(imgUrl);
                    initPlanBox(imgUrl);
                    initNoFnBtn();
                });
            });
        });
    }

    mediaTest();

    // object to global debug
    window.jspScrollList = jspScrollList;
    window.$cache = $cache;
    window.cache = cache;

    window.initSketchpadBox = initSketchpadBox;
});