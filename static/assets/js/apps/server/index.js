/**
 * Created by shuyi.wu on 2015/2/5.
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


    function initElement(callBack){
        $cache.win = $(window);
        $cache.leftCent = $('#left-cent');
        $cache.rightCent = $('#right-cent');
        $cache.taskBoxCent = $('#task-box-cent');

        $cache.taskCent = $cache.taskBoxCent.find('.task-cent');
        $cache.leftSessionCent = $cache.leftCent.find('.session-cent');
        $cache.rightSessionCent = $cache.rightCent.find('.session-cent');

        $cache.answerLock = $('#answer-lock');

        $cache.leftCentTopBar = $cache.leftCent.find('.topbar');
        $cache.leftCentToolBar = $cache.leftCent.find('.toolbar');
        $cache.rightCentTopBar= $cache.rightCent.find('.topbar');
        $cache.rightCentToolBar = $cache.rightCent.find('.toolbar');

        $cache.planCent = $cache.leftCent.find('.plan-cent');
        $cache.planScroll = $cache.planCent.find('.scroll');

        $cache.closeClassBtn = $cache.leftCentTopBar.find('.close-class-btn');
        $cache.runTimeNum = $cache.leftCentToolBar.find('.run-time .num');
        $cache.leftTitleNum = $cache.leftCentToolBar.find('.title .num');

        $cache.rightTitleNum = $cache.rightCentToolBar.find('.title .num');

        $cache.addErrorBtn = $cache.leftCentToolBar.find('.add-error-btn');
        $cache.playVideoBtn = $cache.leftCentToolBar.find('.play-video-btn');
        $cache.playSoundBtn = $cache.leftCentToolBar.find('.play-sound-btn');
        $cache.morePlanBtn = $cache.leftCentToolBar.find('.more-plan-btn');

        $cache.leftPrevBtn =  $cache.leftCentToolBar.find('.prev-btn');
        $cache.leftToolNum = $cache.leftCentToolBar.find('.tool-num');
        $cache.leftNextBtn = $cache.leftCentToolBar.find('.next-btn');

        $cache.sketchpadCent = $cache.rightCent.find('.sketchpad-cent');
        $cache.sketchpadScroll = $cache.sketchpadCent.find('.scroll');

        $cache.soundBtn = $cache.rightCentToolBar.find('.sound-btn');
        $cache.answerBtn = $cache.rightCentToolBar.find('.answer-btn');
        $cache.eraserBtn = $cache.rightCentToolBar.find('.eraser-btn');
        $cache.penRedBtn = $cache.rightCentToolBar.find('.pen-red-btn');
        $cache.penBlackBtn = $cache.rightCentToolBar.find('.pen-black-btn');
        $cache.addPageBtn = $cache.rightCentToolBar.find('.add-page-btn');

        $cache.rightPrevBtn = $cache.rightCentToolBar.find('.prev-btn');
        $cache.rightToolNum = $cache.rightCentToolBar.find('.tool-num');
        $cache.rightNextBtn = $cache.rightCentToolBar.find('.next-btn');


        $cache.taskScroll = $cache.taskCent.find('.scroll');
        $cache.taskCtlBtn = $cache.leftCentToolBar.find('.task-ctl-btn');
        $cache.taskName = $cache.taskBoxCent.find('.task-name');
        $cache.taskClose = $cache.taskBoxCent.find('.task-close');

        $cache.popList = $('#pop-list');
        $cache.testMediaPop = $cache.popList.find('.test-media-pop');
        $cache.mediaTest = $cache.testMediaPop.find('.media-test');
        $cache.mediaTestSuccessBtn = $cache.testMediaPop.find('.media-test-success-btn');
        $cache.mediaTestErrorBtn = $cache.testMediaPop.find('.media-test-error-btn');
        $cache.sureClosePop = $cache.popList.find('.sure-close-pop');
        $cache.sureCloseFalseBtn = $cache.sureClosePop.find('.sure-close-false-btn');
        $cache.sureCloseTrueBtn = $cache.sureClosePop.find('.sure-close-true-btn');
        $cache.ratyPop = $cache.popList.find('.raty-pop');
        $cache.ratyPopScroll = $cache.ratyPop.find('.pop-box-mid');
        $cache.ratyConfirmBtn = $cache.ratyPop.find('.raty-confirm-btn');
        $cache.remarkPop = $cache.popList.find('.remark-pop');
        $cache.remarkPrevBtn = $cache.remarkPop.find('.remark-prev-btn');
        $cache.remarkConfirmBtn = $cache.remarkPop.find('.remark-confirm-btn');
        $cache.photoPop = $cache.popList.find('.photo-pop');
        $cache.photoBox = $cache.photoPop.find('.photo-box');
        $cache.photoResetBtn = $cache.photoPop.find('.photo-reset-btn');
        $cache.photoUploadBtn = $cache.photoPop.find('.photo-upload-btn');
        $cache.photoConfirmBtn = $cache.photoPop.find('.photo-confirm-btn');
        $cache.photoCancelBtn = $cache.photoPop.find('.photo-cancel-btn');
        $cache.upimgPop = $cache.popList.find('.upimg-pop');
        $cache.upimgViewBox = $cache.upimgPop.find('.view-box');
        $cache.upimgUploadBtn = $cache.upimgPop.find('.upimg-upload-btn');
        $cache.upimgCancelBtn = $cache.upimgPop.find('.upimg-cancel-btn');

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
        jspScrollList.ratyFn = $cache.ratyPopScroll.jScrollPane({
            hideFocus: true
        }).data('jsp');
        if(callBack){
            callBack();
        }
    }

    function initCtlBtn(callBack){
        var preventDefault;
        // 阻止默认事件 start

        // 阻止文字选择
        preventDefault = function(e){
            e.preventDefault();
        };
        $cache.leftCentTopBar.on('selectstart',preventDefault);
        $cache.leftCentToolBar.on('selectstart',preventDefault);
        $cache.rightCentTopBar.on('selectstart',preventDefault);
        $cache.rightCentToolBar.on('selectstart',preventDefault);

        // 阻止右键菜单
        $cache.photoBox.on('contextmenu', preventDefault);
        // 阻止默认事件 end

        // 结束课程 start
        $cache.closeClassBtn.on('click', function(e){
            $.magnificPopup.open({
                items: {
                    src: $cache.sureClosePop
                },
                type: 'inline',
                modal: true
            });
        });

        // 需要异步查找
        $cache.ratyPopScroll.find('.raty').raty({
            numberMax: 3,
            path: 'assets/images/',
            starOff: 'off.png',
            starOn: 'on.png',
            hints: ['合格', '良好', '优良']
        });

        $cache.sureCloseFalseBtn.on('click', function(e){
            $.magnificPopup.close();
        });
        $cache.sureCloseTrueBtn.on('click', function(e){
            $.magnificPopup.close();
            $.magnificPopup.open({
                items: {
                    src: $cache.ratyPop
                },
                type: 'inline',
                modal: true
            });
            jspScrollList.ratyFn.reinitialise();
        });

        $cache.ratyConfirmBtn.on('click', function(e){
            $.magnificPopup.close();
            $.magnificPopup.open({
                items: {
                    src: $cache.remarkPop
                },
                type: 'inline',
                modal: true
            });
        });

        $cache.remarkPrevBtn.on('click', function(e){
            $.magnificPopup.open({
                items: {
                    src: $cache.ratyPop
                },
                type: 'inline',
                modal: true
            });
        });

        $cache.remarkConfirmBtn.on('click', function(e){
            $.magnificPopup.close();
            swal('提交成功!', '', 'success');
        });
        // 结束课程 end

        // 获取摄像头图片上传 start
        $cache.photoCancelBtn.on('click', function(e){
            $.magnificPopup.close();
            $cache.photoBox.attr('src', '');
        });
        $cache.photoConfirmBtn.on('click', function(e){
            var videoEl, videoW, videoH, canvasEl, base64Img;
            videoEl = $cache.photoBox.get(0);
            videoW = $cache.photoBox.width();
            videoH = $cache.photoBox.height();
            videoEl.pause();
            canvasEl = new WSY.CanvasBuffer(videoW, videoH);
            canvasEl.context.drawImage(videoEl, 0, 0, videoW, videoH);
            base64Img = canvasEl.canvas.toDataURL();
            cache.photoBase64Img = base64Img;
            $cache.photoCancelBtn.hide();
            $cache.photoConfirmBtn.hide();
            $cache.photoResetBtn.show();
            $cache.photoUploadBtn.show();
        });
        $cache.photoResetBtn.on('click', function(e){
            var videoEl;
            videoEl = $cache.photoBox.get(0);
            videoEl.play();
            $cache.photoCancelBtn.show();
            $cache.photoConfirmBtn.show();
            $cache.photoResetBtn.hide();
            $cache.photoUploadBtn.hide();
        });
        $cache.photoUploadBtn.on('click', function(e){
            console.log(cache.photoBase64Img);
            $.magnificPopup.close();
            $cache.photoBox.attr('src', '');
            $cache.photoCancelBtn.show();
            $cache.photoConfirmBtn.show();
            $cache.photoResetBtn.hide();
            $cache.photoUploadBtn.hide();
        });
        // 获取摄像头图片上传 end

        // 上传本地图片 start
        $cache.upimgUploadBtn.on('click', function(e){
            var canvas;
            canvas = $cache.upimgViewBox.find('canvas').get(0);
            canvas.toBlob(function(blob){
               //console.log(blob);
                // wait add code...
                $.magnificPopup.close();
            });
        });
        $cache.upimgCancelBtn.on('click', function(e){
            $.magnificPopup.close();
        });
        // 上传本地图片 end


        // 聊天框 start
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
        // 聊天框 end

        // 控制按钮 start
        $cache.answerLock.on('change', function(e) {
            var checked = $cache.answerLock.get(0).checked;
            if (checked) {
                $cache.answerBtn.trigger('answerLock');
            }
        });
        $cache.addPageBtn.on('click', function(e){
            var myBoard, canvasEl;
            myBoard = cache.Board;
            myBoard.addPartitionPage({});
            canvasEl = myBoard.getCanvas();
            $cache.sketchpadScroll.height(canvasEl.height);
            jspScrollList.sketchpadFn.reinitialise();
        });
        $cache.leftToolNum.on('click', function(e){
            if(lockCtl.leftSessionCent){
                $cache.leftSessionCent.hide();
                lockCtl.leftSessionCent = false;
            }else{
                $cache.leftSessionCent.show();
                lockCtl.leftSessionCent = true;
            }
        });
        $cache.rightToolNum.on('click', function(e){
            if(lockCtl.rightSessionCent){
                $cache.rightSessionCent.hide();
                lockCtl.rightSessionCent = false;
            }else{
                $cache.rightSessionCent.show();
                lockCtl.rightSessionCent = true;
            }
        });
        // 控制按钮 end

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
                var $imgs, imgLen, loadLen;
                $imgs = $(data).find('img');
                imgLen = $imgs.size();
                loadLen = 0;
                $imgs.each(function(i ,img){
                    img.onload = function(){
                        loadLen +=1;
                        if(imgLen === loadLen){
                            $cache.taskScroll.append(data);
                            setTimeout(function(){
                                jspScrollList.taskFn.reinitialise();
                                jspScrollList.taskFn.scrollToBottom(0.3);
                            }, 0);
                        }
                    };
                });
            });
        };
        $cache.taskSumBtn.on('click', function(e){
            onSendMsg();
        });
        $cache.taskWebcamBtn.on('click', function(e){
            $.magnificPopup.open({
                items: {
                    src: $cache.photoPop
                },
                type: 'inline',
                modal: true
            });
            $cache.photoBox.attr('src', cache.webMediaUrl);
        });
        $cache.taskUploadBtn.find('input[type="file"]').on('change', function(e){
            var $self,file, blobUrl;
            $self = $(this);
            file = e.target.files[0];
            $self.val('');
            if(file.type.indexOf('image') === -1){
                swal('对不起,不支持该文件类型!', '', 'warning');
                return false;
            }
            blobUrl = window.URL.createObjectURL(file);
            loadImage(
                blobUrl,
                function(canvas){
                    $cache.upimgViewBox.html(canvas);
                    $cache.upimgPop.width(canvas.width + 40);
                    $.magnificPopup.open({
                        items:{
                            src: $cache.upimgPop
                        },
                        type: 'inline',
                        modal: true
                    });
                },
                {
                    maxWidth: 600,
                    maxHeight: 600,
                    canvas: true
                }
            );
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

            Board = new WSY.hfCanvasBoard({
                width: canvas.width,
                height: canvas.height});

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
                $cache.mediaTest.on('contextmenu', function(e){
                    e.preventDefault();
                });
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
                    webMedia = media.clone();
                    cache.webMediaUrl = URL.createObjectURL(webMedia);
                    $cache.mediaTest.attr('src', cache.webMediaUrl);

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

    //initElement(function(){
    //    initApp();
    //
    //});
    mediaTest();

    // object to global debug
    window.jspScrollList = jspScrollList;
    window.$cache = $cache;
    window.cache = cache;

    window.initSketchpadBox = initSketchpadBox;

    window.dataURLtoBlob = dataURLtoBlob;
});