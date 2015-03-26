/**
 * Created by shuyi.wu on 2015/2/12.
 */
define([
    'config',
    'jquery',
    'localforage',
    'qjs',
    'async',
    'lodashJs',
    'umeditorHf',
    'WSY',
    'socketIo',
    'wsy/hf_socket',
    'apps/util/canvas-to-blob',
    'draggabilly',
    'RunTime',
    'DetectRTC',
    'RTCPeerConnection',
    'dust-temp/taskView',
    'dust-temp/classSessionView',
    'wsy/get_offset_point',
    'wsy/hf_canvas_board',
    'wsy/canvas_buff',
    'wsy/stepFn',
    'jScrollPane',
    'jqueryRaty',
    'sweetalert',
    'magnificPopupJs',
    'loadImageAll'
],function(
    config,
    $,
    localforage,
    Q,
    async,
    _,
    UM,
    WSY,
    socketIo,
    io,
    dataURLtoBlob,
    Draggabilly,
    RunTime
){
    'use strict';

    var RTCPeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
    var RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
    var URL = window.URL || window.webkitURL;
    var RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;

    var modelGCtl ={},
        modelUtil ={},
        modelDom ={},
        modelTask = {},
        modelBoard = {},
        modelRtc = {},
        modelClass = {},
        modelSocket = {};

    var $cache = {},
        cache = {},
        jspScrollList = {},
        timerList = {},
        lockCtl = {},
        socket,
        transport = {},
        dataCache = {};

    var pc, dc;

    cache.sketchpadLock = true;

    // 初始化全局缓存
    modelGCtl.init = function(){
        $cache.win = $(window);
        dataCache.quizIdIndex = 0;
        dataCache.quizIdListForServe = null;
        dataCache.quizIdList = [];
        dataCache.userInfo = {};
        dataCache.nowQuiz = {};
        dataCache.taskMsg = [];
    };

    // 加载图片返回Canvas
    modelUtil.loadImg2Canvas = function (imgUrl, options) {
        var deferred = Q.defer();
        options = options ? options : {
            canvas: true
        };
        loadImage(
            imgUrl,
            function (canvas) {
                if (canvas.type === 'error') {
                    deferred.reject('Error loading image :' + canvas.path[0].src);
                    swal('图片加载错误!', '', 'error');
                } else {
                    deferred.resolve(canvas);
                }
            },
            options
        );
        return deferred.promise;
    };

    // 初始化dom选择缓存
    modelDom.initElement = function(){
        var deferred = Q.defer();

        $cache.wrapper = $('#wrapper');
        $cache.leftCent = $('#left-cent');
        $cache.rightCent = $('#right-cent');
        $cache.taskBoxCent = $('#task-box-cent');
        $cache.sketchpadLock = $('#sketchpad-lock');

        $cache.winImg = $('#win-img');
        $cache.winImgClose = $cache.winImg.find('.win-close');
        $cache.winImgZoom = $cache.winImg.find('.zoom-img');

        $cache.winWebrtc = $('#win-webrtc');
        $cache.rtcLocalBox = $cache.winWebrtc.find('.localBox');
        $cache.rtcRemoteBox = $cache.winWebrtc.find('.remoteBox');

        $cache.taskCent = $cache.taskBoxCent.find('.task-cent');

        $cache.leftSessionCent = $cache.leftCent.find('.session-cent');
        $cache.leftSessionScrollCent = $cache.leftSessionCent.find('.scroll-cent');
        $cache.leftSessionScroll = $cache.leftSessionCent.find('.scroll');
        $cache.blankPages = $cache.leftSessionScroll.find('.add-list .class-list ul');

        $cache.sketchpadCent = $cache.leftCent.find('.sketchpad-cent');

        $cache.sketchpadScroll = $cache.sketchpadCent.find('.scroll');

        $cache.leftCentTopBar = $cache.leftCent.find('.topbar');
        $cache.leftCentToolBar = $cache.leftCent.find('.toolbar');

        $cache.leftTitleNum = $cache.leftCentTopBar.find('.title .num');
        $cache.leftPrevBtn =  $cache.leftCentToolBar.find('.prev-btn');
        $cache.leftToolNum = $cache.leftCentToolBar.find('.tool-num');
        $cache.leftNextBtn = $cache.leftCentToolBar.find('.next-btn');

        $cache.addPageBtn = $cache.leftCentToolBar.find('.add-page-btn');

        $cache.taskScroll = $cache.taskCent.find('.scroll');
        $cache.taskName = $cache.taskBoxCent.find('.task-name');

        $cache.popList = $('#pop-list');
        $cache.testMediaPop = $cache.popList.find('.test-media-pop');
        $cache.mediaTest = $cache.testMediaPop.find('.media-test');
        $cache.mediaTestSuccessBtn = $cache.testMediaPop.find('.media-test-success-btn');
        $cache.mediaTestErrorBtn = $cache.testMediaPop.find('.media-test-error-btn');
        $cache.remarkPop = $cache.popList.find('.remark-pop');
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
        $cache.dataSyncingPop = $cache.popList.find('.data-syncing-pop');
        $cache.systemInitErrorPop = $cache.popList.find('.system-init-error');
        $cache.systemHoldingPop = $cache.popList.find('.system-holding');
        $cache.linkErrorHoldingPop = $cache.popList.find('.link-error-holding');

        deferred.resolve();
        return deferred.promise;
    };

    // 运行时间
    modelDom.initRunTime = function(time){
        cache.runTime = new RunTime(time);
        //var jsonDate, min;
        //setInterval(function(){
        //    jsonDate = cache.runTime.getRunTimeJson();
        //    min = jsonDate.day * 24 * 60 + jsonDate.hour * 60 + jsonDate.minute;
        //    $cache.runTimeNum.html(min);
        //}, 10000);
        //$cache.runTimeNum.html(0);
    };

    // 题目切换回调
    modelClass.selectQuizCallbcak = function(quizIndex , quizId, isRemote){
        var stepFn = new WSY.stepFn(['localOk', 'remoteOk'], function(){
            setTimeout(function(){
                $.magnificPopup.close();
            }, 200);
        });
        socket.once('mFC.resAsyncOk', function(){
            stepFn('remoteOk');
        });
        if(!isRemote){
            socket.emit('mFC.reqAsyncNeed');
        }
        modelDom.leftSessionNeedShow(quizIndex - 1);
        if(!isRemote){
            $.magnificPopup.open({
                items: {
                    src: $cache.dataSyncingPop
                },
                type: 'inline',
                modal: true
            });
        }
        modelSocket.saveSyncData()
            .then(function(){
                var nowQuiz = dataCache.nowQuiz;
                nowQuiz.quizId = quizId;
                nowQuiz.index = quizIndex;
                nowQuiz.planIndex = quizIndex;
                nowQuiz.boardType = 1;
                if(!isRemote){
                    socket.emit('mFC.reqSwitchTopics', {
                        quizIndex: quizIndex,
                        quizId: quizId
                    });
                }
                modelClass.initQuiz(dataCache.nowQuiz.quizId)
                    .then(function(){
                        socket.emit('mFC.reqAsyncOk');
                        stepFn('localOk');
                    });
            });
    };

    // 切换白板回调
    modelClass.swichBlankPagesCallBack = function(blankPagesIndex, isRemote){
        var stepFn = new WSY.stepFn(['localOk', 'remoteOk'], function(){
            setTimeout(function(){
                $.magnificPopup.close();
            }, 200);
        });
        socket.once('mFC.resAsyncOk', function(){
            stepFn('remoteOk');
        });
        if(!isRemote){
            socket.emit('mFC.reqAsyncNeed');
        }

        var nowQuiz =  dataCache.nowQuiz;
        if(!isRemote){
            $.magnificPopup.open({
                items: {
                    src: $cache.dataSyncingPop
                },
                type: 'inline',
                modal: true
            });
        }
        if(!isRemote){
            socket.emit('mFC.reqSwitchBlankPages', {
                blankPagesIndex: blankPagesIndex
            });
        }
        var blankData;
        nowQuiz.studyBlankPagesindex = blankPagesIndex;
        nowQuiz.boardType = 2;
        blankData = nowQuiz.studyBlankPages[blankPagesIndex];
        modelBoard.setSketchpadView(blankData.blankPageBgUrl, blankData.blankPageUrl)
            .then(function(){
                socket.emit('mFC.reqAsyncOk');
                stepFn('localOk');
            });
    };

    // 添加白板回调
    modelClass.addBlankPageCallBack = function(isRemote){
        var nowQuiz =  dataCache.nowQuiz;
        var stepFn = new WSY.stepFn(['localOk', 'remoteOk'], function(){
            setTimeout(function(){
                $.magnificPopup.close();
            }, 200);
        });
        socket.once('mFC.resAsyncOk', function(){
            stepFn('remoteOk');
        });
        if(!isRemote){
            socket.emit('mFC.reqAsyncNeed');
        }
        $.magnificPopup.open({
            items: {
                src: $cache.dataSyncingPop
            },
            type: 'inline',
            modal: true
        });
        if(!isRemote){
            socket.emit('mFC.reqAddBlankPage');
        }
        nowQuiz.studyBlankPagesindex = nowQuiz.studyBlankPages.length;
        nowQuiz.boardType = 2;
        nowQuiz.studyBlankPages.push({
            blankPageUrl: '',
            blankPageBgUrl: ''
        });
        modelClass.initBlankPage(nowQuiz.studyBlankPages.length);
        modelBoard.setSketchpadView(null, null)
            .then(function(){
                socket.emit('mFC.reqAsyncOk');
                stepFn('localOk');
            });
    };

    // 结束课程
    modelClass.initExitClass = function(){
        socket.on('mFC.resClassNeedExit', function(data){
            $.magnificPopup.open({
                items: {
                    src: $cache.remarkPop
                },
                type: 'inline',
                modal: true
            });
        });
        $cache.remarkPop.find('.raty').raty({
            numberMax: 5,
            path: 'assets/images/',
            starOff: 'off.png',
            starOn: 'on.png',
            hints: ['1', '2', '3', '4', '5']
        });
        $cache.remarkConfirmBtn.one('click', function(e){
            var data, raty, remark;
            raty = $cache.remarkPop.find('.raty input').val();
            remark = $cache.remarkPop.find('.remark').val();
            data = {
                studentId: dataCache.selfUserId,
                stuToTeaScore: raty,
                stuToTeaEvaluate: remark
            };
            socket.once('dHC.resStuExitRoom', function(data){
                $.magnificPopup.close();
                swal({
                    title: '提交成功!',
                    type: 'success'
                }, function(){
                    location.href = config.endCLassUrl;
                });
            });
            socket.emit('dHC.reqStuExitRoom', data);
            $.magnificPopup.close();
            swal('提交成功!', '', 'success');
        });
    };

    // 远程控制题目滚动条
    modelDom.remoteCtlSketchpadCent = function(data){
        jspScrollList.sketchpadFn.scrollToY(data.scrollY);
    };

    // 初始化画板联滚
    modelDom.initOnScrollSketchpadCent = function(){
        cache.sketchpadOnce = false;
        $cache.sketchpadCent.on('jsp-scroll-y', function(event, scrollPositionY, isAtTop, isAtBottom){
            var data, lock = true;
            var isNotScroll = isAtTop || isAtBottom;
            if(isNotScroll && !cache.sketchpadOnce){
                lock = false;
                cache.sketchpadOnce = true;
            }else if(!isNotScroll && cache.sketchpadOnce){
                lock = false;
                cache.sketchpadOnce = false;
            }else if(!cache.sketchpadOnce){
                lock = false;
            }
            if(!lock && !cache.sketchpadLock){
                data = {
                    scrollY: scrollPositionY
                };
                console.log(data);
                socket.emit('mFC.reqBoardScroll', data);
            }
        });
        socket.on('mFC.resBoardScroll', modelDom.remoteCtlSketchpadCent);
    };

    // 初始化滚动条
    modelDom.initScrollPane = function(){
        var deferred = Q.defer();

        $cache.win.on('resize', function(){
            // jspScroll response
            if(jspScrollList.sketchpadFn ||
                jspScrollList.taskFn){
                if(timerList.timeoutScrollReset){
                    clearTimeout(timerList.timeoutScrollReset);
                }
                timerList.timeoutScrollReset = setTimeout(function(){
                    if(jspScrollList.sketchpadFn){
                        jspScrollList.sketchpadFn.reinitialise();
                    }
                    if(jspScrollList.taskFn && lockCtl.taskBox){
                        jspScrollList.taskFn.reinitialise();
                    }
                }, 600);
            }
        });
        jspScrollList.sketchpadFn = $cache.sketchpadCent.jScrollPane({
            hideFocus: true,
            animateScroll: true
        }).data('jsp');
        jspScrollList.taskFn = $cache.taskCent.jScrollPane({
            hideFocus: true
        }).data('jsp');
        jspScrollList.leftSessionFn = $cache.leftSessionScrollCent.jScrollPane({
            hideFocus: true
        }).data('jsp');
        deferred.resolve();

        $cache.sketchpadCent.on('jsp-scroll-y', function(event, scrollPositionY, isAtTop, isAtBottom){
            if(!cache.sketchpadLock){
                return false;
            }
            var data, lock = true;
            var isNotScroll = isAtTop || isAtBottom;
            if(isNotScroll && !cache.sketchpadOnce){
                lock = false;
                cache.sketchpadOnce = true;
            }else if(!isNotScroll && cache.sketchpadOnce){
                lock = false;
                cache.sketchpadOnce = false;
            }else if(!cache.sketchpadOnce){
                lock = false;
            }
            if(!lock){
                data = {
                    scrollY: scrollPositionY
                };
                console.log(data);
            }
        });
        return deferred.promise;
    };

    // 初始化按钮事件
    modelDom.initCtlBtn = function(){
        var deferred = Q.defer();
        var preventDefault;
        // 阻止默认事件 start

        // 阻止文字选择
        preventDefault = function(e){
            e.preventDefault();
        };
        $cache.leftCentTopBar.on('selectstart',preventDefault);
        $cache.leftCentToolBar.on('selectstart',preventDefault);

        // 阻止右键菜单
        $cache.photoBox.on('contextmenu', preventDefault);
        // 阻止默认事件 end

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
            var videoEl, videoW, videoH, canvasBuffer, uploadSuccess;
            uploadSuccess = function () {
                $.magnificPopup.close();
                $cache.photoBox.attr('src', '');
                $cache.photoCancelBtn.show();
                $cache.photoConfirmBtn.show();
                $cache.photoResetBtn.hide();
                $cache.photoUploadBtn.hide();
            };

            videoEl = $cache.photoBox.get(0);
            videoW = $cache.photoBox.width();
            videoH = $cache.photoBox.height();
            canvasBuffer = new WSY.CanvasBuffer(videoW, videoH);
            canvasBuffer.context.drawImage(videoEl, 0, 0, videoW, videoH);
            cache.photoBlobImg = canvasBuffer.canvas.toBlob(function (blob) {
                modelSocket.uploadBlobToQN(blob)
                    .then(function (imgSrc) {
                        var htmlCent = '<img class="input-img" src="' + imgSrc + '">';
                        modelTask.onSendMsg(htmlCent, modelTask.onRenderTaskView);
                        uploadSuccess();
                    }, function () {
                        console.log(arguments);
                    }, function (progress) {
                        console.log(progress);
                    });
            });
        });
        // 获取摄像头图片上传 end

        // 上传本地图片 start
        $cache.upimgUploadBtn.on('click', function(e){
            var canvas;
            canvas = $cache.upimgViewBox.find('canvas').get(0);
            canvas.toBlob(function(blob){
                console.log(blob);
                modelSocket.uploadBlobToQN(blob)
                    .then(function (imgSrc) {
                        var htmlCent = '<img class="input-img" src="' + imgSrc + '">';
                        modelTask.onSendMsg(htmlCent, modelTask.onRenderTaskView);
                        $.magnificPopup.close();
                    }, function () {
                        console.log(arguments);
                    }, function (progress) {
                        console.log(progress);
                    });
            });
        });
        $cache.upimgCancelBtn.on('click', function(e){
            $.magnificPopup.close();
        });
        // 上传本地图片 end

        // 控制按钮 start
        $cache.leftToolNum.on('click', function(e){
            if(lockCtl.leftSessionCent){
                $cache.leftSessionCent.hide();
                lockCtl.leftSessionCent = false;
            }else{
                $cache.leftSessionCent.show();
                lockCtl.leftSessionCent = true;
            }
        });
        // 控制按钮 end

        // 聊天框图片查看 start
        $cache.taskScroll.on('click', 'img.input-img', function(e){
            var $self = $(this);
            $cache.winImgZoom
                .attr('src', $self.attr('src'));
            $cache.winImg.show();
        });
        $cache.winImgClose.on('click', function(e){
            $cache.winImg.hide();
        });
        $cache.winImgZoom.on('dragstart', function(e){
            e.preventDefault();
        });
        $cache.taskScroll.on('dragstart', 'img', function(e){
            e.preventDefault();
        });
        // 聊天框图片查看 end

        // 点击上课听题目 start
        $cache.leftSessionScroll.on('click', 'li.quiz', function (e) {
            var $self = $(this);
            var quizIndex = +$self.html();
            var quizIdListIndex = quizIndex - 1;
            var quizId = dataCache.quizIdList[quizIdListIndex].quizId;
            modelClass.selectQuizCallbcak(quizIndex, quizId);
        });
        $cache.leftPrevBtn.on('click', function(e){
            var selfIndex = +$cache.leftToolNum.html();
            var quizIdListIndex = selfIndex - 2;
            var quizId = dataCache.quizIdList[quizIdListIndex].quizId;
            var quizIndex = selfIndex - 1;
            modelClass.selectQuizCallbcak(quizIndex, quizId);
        });
        $cache.leftNextBtn.on('click', function(e){
            var selfIndex = +$cache.leftToolNum.html();
            var quizIdListIndex = selfIndex;
            var quizId = dataCache.quizIdList[quizIdListIndex].quizId;
            var quizIndex = selfIndex + 1;
            modelClass.selectQuizCallbcak(quizIndex, quizId);
        });
        // 点击上课听题目 end

        // 对添加画板的操着 start
        $cache.addPageBtn.on('click', function(e){
            modelClass.addBlankPageCallBack();
        });
        $cache.blankPages.on('click', 'li.blank', function(e){
            var $self = $(this);
            var blankPagesIndex = $self.data('index');
            modelClass.swichBlankPagesCallBack(blankPagesIndex);
        });
        // 对添加画板的操着 end

        deferred.resolve();
        return deferred.promise;
    };

    // 可拖拽图片放大框
    modelDom.dragImg = function() {
        function limtImgSize() {
            var winImg;

            $cache.winImgZoom
                .css({
                    'max-width': cache.winW - 2,
                    'max-height': cache.winH - 32
                });
            winImg = {
                left: +$cache.winImg.css('left').split('px')[0],
                top: +$cache.winImg.css('top').split('px')[0],
                width: $cache.winImg.width(),
                height: $cache.winImg.height()
            };

            if (winImg.left + winImg.width > cache.winW) {
                $cache.winImg.css('left', cache.winW - winImg.width);
            }
            if (winImg.top + winImg.height > cache.winH) {
                $cache.winImg.css('top', cache.winH - winImg.height);
            }
        }

        $cache.win.on('resize', function () {
            limtImgSize();
        });
        var draggie1 = new Draggabilly($cache.winImg.get(0), {
            containment: $cache.wrapper.get(0),
            handle: '.win-topbar'
        });
        var draggie2 = new Draggabilly($cache.winWebrtc.get(0), {
            containment: $cache.wrapper.get(0),
            handle: '.win-topbar'
        });
        draggie1 = draggie2 = null;
        limtImgSize();
    };

    // 判断左边边上课题目切换显示
    modelDom.leftSessionNeedShow = function(index){
        if(index === 0){
            $cache.leftPrevBtn.hide();
            $cache.leftNextBtn.show();
        }else if(index === (dataCache.quizIdList.length - 1)){
            $cache.leftPrevBtn.show();
            $cache.leftNextBtn.hide();
        }else{
            $cache.leftPrevBtn.show();
            $cache.leftNextBtn.show();
        }
    };

    // 发送聊天数据调用
    modelTask.onSendMsg = function (data, callback) {
        var htmlCent, msg;
        htmlCent = data;
        if (!htmlCent.length) {
            return false;
        }
        $cache.umMsgBox.html('');

        msg = {userId: dataCache.selfUserId, content: htmlCent};
        console.log(msg);
        socket.emit('mFC.reqChatMessages', msg);
        dataCache.taskMsg.push(msg);
        callback(msg);
    };

    // 当收到聊天数据
    modelTask.onReceiveMsg = function(data, callback){
        var msg = data;
        dataCache.taskMsg = [];
        if($.isArray(msg)){
            dataCache.taskMsg = dataCache.taskMsg.concat(msg);
        }else{
            dataCache.taskMsg.push(msg);
        }
        callback(msg);
    };

    // 聊天渲染完毕回调
    modelTask.onRenderTaskView = function(data) {
        var msg;
        if ($.isArray(data)) {
            msg = data;
        } else {
            msg = [data];
        }
        modelTask.renderTaskView(msg)
            .then(function (data) {
                var $imgs, imgLen, loadLen;
                $imgs = $(data).find('img');
                imgLen = $imgs.size();
                loadLen = 0;
                $imgs.each(function (i, img) {
                    //console.log(img);
                    img.onload = function () {
                        loadLen += 1;
                        if (imgLen === loadLen) {
                            $cache.taskScroll.append(data);
                            setTimeout(function () {
                                jspScrollList.taskFn.reinitialise();
                                jspScrollList.taskFn.scrollToBottom(0.3);
                            }, 0);
                        }
                    };
                });
            });
    };

    // 对话框数据渲染
    modelTask.renderTaskView = function (msgs) {
        var deferred = Q.defer();
        var datas = [];
        if (!(msgs instanceof Array)) {
            throw 'msgs must be array!';
        }
        async.eachSeries(msgs, function (msg, callback) {
            //console.log(msg.userId);
            transport.getUserInfo(msg.userId).then(function (info) {
                //console.log(info);
                var data = {};
                data.portrait = info.headImage;
                data.content = msg.content;
                if (+msg.userId === +dataCache.selfUserId) {
                    //console.log(msg.userId + '"==="' + dataCache.selfUserId);
                    data.userType = 'self';
                } else {
                    data.userType = 'buddy';
                }
                datas.push(data);
                callback();
            });
        }, function (err) {
            console.log(datas);
            dust.render('taskView', {msgs: datas}, function (err, out) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(out);
                }
            });
        });

        return deferred.promise;
    };

    // 富文本编辑器初始化事件
    modelTask.initUMEditorEvent = function() {
        var deferred = Q.defer();

        // fix bug send none msg
        $cache.umMsgBox.html('');


        // 发送按钮
        $cache.taskSumBtn.on('click', function (e) {
            var htmlCent = $cache.umMsgBox.html();
            modelTask.onSendMsg(htmlCent, modelTask.onRenderTaskView);
        });
        // 获取摄像头图片按钮
        $cache.taskWebcamBtn.on('click', function (e) {
            $.magnificPopup.open({
                items: {
                    src: $cache.photoPop
                },
                type: 'inline',
                modal: true
            });
            $cache.photoBox.attr('src', cache.localMediaUrl);
        });
        // 上传本地图片按钮
        $cache.taskUploadBtn.find('input[type="file"]').on('change', function (e) {
            var $self, file, blobUrl;
            var successLoad, loadImg;
            $self = $(this);
            file = e.target.files[0];
            $self.val('');
            if (file.type.indexOf('image') === -1) {
                swal('对不起,不支持该文件类型!', '', 'warning');
                return false;
            }
            blobUrl = URL.createObjectURL(file);
            successLoad = function (canvas) {
                $cache.upimgViewBox.html(canvas);
                $cache.upimgPop.width(canvas.width + 40);
                $.magnificPopup.open({
                    items: {
                        src: $cache.upimgPop
                    },
                    type: 'inline',
                    modal: true
                });
            };
            loadImg = modelUtil.loadImg2Canvas(blobUrl, {
                maxWidth: 600,
                maxHeight: 600,
                canvas: true
            });
            loadImg
                .then(successLoad)
                .done();
        });
        deferred.resolve();
        return deferred.promise;
    };

    modelTask.initUMEditor = function() {
        var deferred = Q.defer();
        var umReady = function (stat) {
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

            deferred.resolve();
        };
        var um = UM.getEditor('myEditor');
        um.addListener('ready', umReady);

        return deferred.promise;
    };

    // 上课试题数据渲染
    modelClass.renderClassSessionView = function(data) {
        var deferred = Q.defer();
        var result, quizIdsList, reQuizIdsList, quizId, listObj, quizNum = 0;

        if (!dataCache.quizIdListForServe) {
            dataCache.quizIdListForServe = data;
        }
        for (var i = 0, len = data.quizIdListResults.length; i < len; i++) {
            result = data.quizIdListResults[i];
            quizIdsList = result.quizIds;
            reQuizIdsList = [];
            for (var j = 0, jlen = quizIdsList.length; j < jlen; j++) {
                quizId = quizIdsList[j];
                listObj = {
                    index: quizNum += 1,
                    quizId: quizId
                };
                reQuizIdsList.push(listObj);
                dataCache.quizIdList.push(listObj);
            }
            result.quizIds = reQuizIdsList;
        }

        dust.render('classSessionView', data, function (err, out) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(out);
            }
        });
        return deferred.promise;
    };

    // 上课试题数据UI输出
    modelClass.showClassSessionView = function(data) {
        var deferred = Q.defer();
        modelClass.renderClassSessionView(data)
            .then(function (data) {
                $cache.leftSessionScroll.find('.session-list').remove();
                $cache.leftSessionScroll.find('> ul').prepend(data);
                jspScrollList.leftSessionFn.reinitialise();

                deferred.resolve();
            });
        return deferred.promise;
    };

    // 通过数据切换题目
    modelClass.initQuiz = function(quizId) {
        var deferred = Q.defer();
        transport.getQuizInfoById(quizId)
            .then(function (data) {
                var onSetSketchpadView;
                dataCache.nowQuiz.quizId = quizId;
                dataCache.nowQuiz.teacherUrl = data.teacherUrl;
                dataCache.nowQuiz.studentUrl = data.studentUrl;
                dataCache.nowQuiz.imageUrl = data.imageUrl;
                dataCache.nowQuiz.studyBlankPages = data.studyBlankPages;
                dataCache.nowQuiz.studyBlankPagesindex = dataCache.nowQuiz.studyBlankPages.length;
                modelClass.initBlankPage(dataCache.nowQuiz.studyBlankPagesindex);
                //modelDom.setPlanBox(dataCache.nowQuiz.teacherUrl);

                if(data.imageUrl){
                    onSetSketchpadView = modelBoard.setSketchpadView(dataCache.nowQuiz.studentUrl, data.imageUrl);
                }else{
                    onSetSketchpadView = modelBoard.setSketchpadView(dataCache.nowQuiz.studentUrl);
                }
                onSetSketchpadView.done(function () {
                    var nowQuizIndex = dataCache.nowQuiz.index;
                    $cache.leftToolNum.text(nowQuizIndex);
                    $cache.leftTitleNum.text(nowQuizIndex);
                    $cache.taskScroll.html('');
                    if(data.chatRecords.length){
                        modelTask.onReceiveMsg(data.chatRecords, modelTask.onRenderTaskView);
                    }
                    deferred.resolve();
                });
            });
        return deferred.promise;
    };

    // 初始化渲染白板选择
    modelClass.initBlankPage = function(num){
        var htmlTmp = '';
        for(var i = 0; i < num; i++){
            htmlTmp += '<li class="blank" data-index="'+i+'">'+(i+1)+'</li>';
        }
        $cache.blankPages.html(htmlTmp);
        jspScrollList.leftSessionFn.reinitialise();
    };

    // 初始化画布远程控制
    modelBoard.initRemoteCtl = function(){
        var myBoard = cache.Board;
        socket.on('mFC.resBoardControl', function(data){
            if(data.type === 'pen'){
                if(data.data.color){
                    myBoard.setStyle('strokeStyle', data.data.color);
                }
            }
        });
    };

    // 初始化画布事件
    modelBoard.initSketchpadEvent = function() {
        var deferred = Q.defer();

        var $canvas, myBoard, parentOffset, offsetPoint;
        lockCtl.drawType = 'pen';
        $canvas = $cache.sketchpadFg;
        myBoard = cache.Board;

        $cache.sketchpadCent.on('jsp-scroll-y', function () {
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
            if (myBoard.isRemoteDraw()) {
                return false;
            }
            var point = offsetPoint.getPoint(e);
            if (lockCtl.drawType === 'pen') {
                myBoard.penOnDown(point);
            } else if (lockCtl.drawType === 'eraser') {
                myBoard.eraserOnDown(point);
            }
        });
        $canvas.on('mousemove touchmove', function (e) {
            e.preventDefault();
            if (myBoard.isRemoteDraw()) {
                return false;
            }
            var point = offsetPoint.getPoint(e);
            if (lockCtl.drawType === 'pen') {
                myBoard.penOnMove(point);
            } else if (lockCtl.drawType === 'eraser') {
                myBoard.eraserOnMove(point);
            }
        });
        $canvas.on('mouseup mouseleave touchend', function (e) {
            e.preventDefault();
            if (myBoard.isRemoteDraw()) {
                return false;
            }
            var point = offsetPoint.getPoint(e);
            if (lockCtl.drawType === 'pen') {
                myBoard.penOnUp(point);
            } else if (lockCtl.drawType === 'eraser') {
                myBoard.eraserOnUp(point);
            }
        });

        myBoard.setStyle('lineWidth', 1.4);
        myBoard.setStyle('lineCap', 'round');
        deferred.resolve();
        return deferred.promise;
    };

    // 重设画布
    modelBoard.setSketchpadView = function(bgUrl, fgUrl) {
        var deferred = Q.defer();

        var loadBg, loadFg, onLoadAll, sketchpadReady, bgCanvas, bgCtx;
        sketchpadReady = function (canvasBg) {
            //console.log('run');
            var $canvas = $(canvasBg);
            canvasBg.className = 'sketchpad-img';
            if (!$cache.sketchpadBg) {
                $cache.sketchpadScroll.prepend($canvas);
            } else {
                $cache.sketchpadBg.replaceWith($canvas);
            }
            $cache.sketchpadBg = $canvas;
            $cache.sketchpadScroll.height($cache.sketchpadFg.height());
            jspScrollList.sketchpadFn.reinitialise();
            deferred.resolve();
        };
        if (bgUrl) {
            loadBg = modelUtil.loadImg2Canvas(bgUrl);
        }
        if(fgUrl){
            loadFg = modelUtil.loadImg2Canvas(fgUrl, {
                canvas: true,
                crossOrigin: '*'
            });
        }

        if (bgUrl && fgUrl) {
            //alert('run bgUrl && fgUrl');
            onLoadAll = WSY.stepFn(['loadBg', 'loadFg'], function (canvasBg, canvasFg) {
                cache.Board.setView({
                    view: canvasFg
                }, function () {
                    sketchpadReady(canvasBg);
                });
            });
            loadBg
                .then(function (canvas) {
                    onLoadAll('loadBg', canvas);
                })
                .fail(function (err) {
                    console.error(err);
                })
                .done();
            loadFg
                .then(function (canvas) {
                    onLoadAll('loadFg', canvas);
                })
                .fail(function (err) {
                    console.error(err);
                })
                .done();
        } else if(bgUrl && !fgUrl){
            //alert('run bgUrl && !fgUrl');
            loadBg
                .then(function (canvas) {
                    cache.Board.resizeAndClear({
                        width: canvas.width === 600 ? canvas.width: 600,
                        height: canvas.height > 1200 ?  canvas.height : 1200
                    });
                    sketchpadReady(canvas);
                })
                .fail(function (err) {
                    console.error(err);
                })
                .done();
        } else if(!bgUrl && fgUrl){
            //alert('run !bgUrl && fgUrl');
            bgCanvas = $cache.sketchpadBg.get(0);
            bgCtx= bgCanvas.getContext('2d');
            bgCtx.clearRect(0,0, bgCanvas.width, bgCanvas.height);
            bgCanvas.width = 600;
            bgCanvas.height = 0;
            loadFg
                .then(function (canvasFg) {
                    cache.Board.setView({
                        view: canvasFg
                    }, function(){
                        deferred.resolve();
                    });
                })
                .fail(function (err) {
                    console.error(err);
                })
                .done();
        } else if(!bgUrl && !fgUrl){
            //alert('run !bgUrl && !fgUrl');
            bgCanvas = $cache.sketchpadBg.get(0);
            bgCtx = bgCanvas.getContext('2d');
            bgCtx.clearRect(0,0, bgCanvas.width, bgCanvas.height);
            bgCanvas.width = 600;
            bgCanvas.height = 0;
            cache.Board.resizeAndClear({
                width: 600,
                height: 1200
            });
            $cache.sketchpadScroll.height($cache.sketchpadFg.height());
            jspScrollList.sketchpadFn.reinitialise();
            deferred.resolve();
        }

        return deferred.promise;
    };

    // 初始化画布框
    modelBoard.initSketchpadBox = function() {
        var deferred = Q.defer();
        var Board, canvas2;
        Board = new WSY.hfCanvasBoard({width: 100, height: 100});
        cache.Board = Board;
        canvas2 = Board.getCanvas();
        $cache.sketchpadFg = $(canvas2);
        canvas2.className = 'sketchpad-img';
        $cache.sketchpadScroll.height(canvas2.height);
        $cache.sketchpadScroll.html('');
        $cache.sketchpadScroll.append(canvas2);
        jspScrollList.sketchpadFn.reinitialise();
        deferred.resolve();
        return deferred.promise;
    };

    //媒体测试弹窗
    modelRtc.mediaTest = function() {
        var deferred = Q.defer();
        var testVideo =  $cache.mediaTest.get(0);
        $cache.mediaTest.on('loadeddata', function () {
            testVideo.play();
        });
        testVideo.src = cache.localMediaUrl;
        testVideo.muted = true;
        $cache.mediaTest.on('contextmenu', function (e) {
            e.preventDefault();
        });
        $cache.mediaTestSuccessBtn.click('click', function (e) {
            $cache.mediaTest.attr('src', '');
            $.magnificPopup.close();
            deferred.resolve();
        });
        $cache.mediaTestErrorBtn.click('click', function (e) {
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
        return deferred.promise;
    };

    // 无法媒体设备不正常
    modelRtc.detectRTCError = function(msg){
        swal({
            title: msg,
            type: 'error'
        }, function(){
            $cache.mediaTestSuccessBtn.hide();
            $.magnificPopup.open({
                items: {
                    src: $cache.systemInitErrorPop
                },
                type: 'inline',
                modal: true
            });
        });
    };

    // 初始化媒体测试
    modelRtc.detectRTCInit =function() {
        var deferred = Q.defer();
        DetectRTC.load(function () {
            if (DetectRTC.browser.isChrome !== true) {
                modelRtc.detectRTCError('对不起,浏览器版本不兼容!');
                return false;
            }
            if (DetectRTC.isWebRTCSupported !== true) {
                modelRtc.detectRTCError('您的浏览器无法支持WebRTC!');
                return false;
            }
            if (DetectRTC.hasWebcam !== true) {
                modelRtc.detectRTCError('无法检测到您的摄像头!');
                return false;
            }
            if (DetectRTC.hasMicrophone !== true) {
                modelRtc.detectRTCError('无法检测到您的麦克风!');
                return false;
            }
            getUserMedia({
                onsuccess: function (media) {
                    cache.localMedia = media;
                    cache.cloneMedia = media.clone();
                    cache.localMediaUrl = URL.createObjectURL(cache.cloneMedia);
                    deferred.resolve();
                },
                onerror: function() {
                    modelRtc.detectRTCError('程序没有权限请求媒体数据!');
                }
            });
        });
        return deferred.promise;
    };

    modelRtc.iceServers = {
        'iceServers': [
            {url: 'stun:stun.l.google.com:19302'},
            {url: 'stun:stun.sipgate.net'},
            {url: 'stun:217.10.68.152'},
            {url: 'stun:stun.sipgate.net:10000'},
            {url: 'stun:217.10.68.152:10000'}
        ]
    };

    modelRtc.onAddStream = function(e){
        $cache.rtcRemoteVideo.src = URL.createObjectURL(e.stream);
        $cache.rtcRemoteVideo.addEventListener('loadedmetadata', function() {
            $cache.rtcRemoteVideo.removeEventListener('loadedmetadata');
            console.log('remoteVideo is ok!');
        });
    };

    modelRtc.onIceCandidate = function (e){
        if(e && e.candidate){
            socket.emit('mFC.reqRtcIce', e.candidate);
        }
    };

    modelRtc.onDataChannel = function(e){
        var channel = e.channel;
        //window.dc = dc = channel;
        modelRtc.initDCEvents(channel);
    };

    modelRtc.onCreateOffer = function (offer){
        pc.setLocalDescription(offer, function(){
            socket.emit('mFC.reqRtcOffer', offer);
        });
    };

    modelRtc.onCreateAnswer = function (answer) {
        pc.setLocalDescription(answer, function(){
            socket.emit('mFC.reqRtcAnswer', answer);
        });
    };

    modelRtc.setOffer = function (offer){
        var offerAnswerConstraints = {
            optional: [],
            mandatory: {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: true
            }
        };
        var error = function(){
            console.log(arguments);
        };
        pc.setRemoteDescription(new RTCSessionDescription(offer), function(){
            pc.createAnswer(modelRtc.onCreateAnswer, error, offerAnswerConstraints);
        });
    };

    modelRtc.setAnswer = function (answer){
        pc.setRemoteDescription(new RTCSessionDescription(answer));
    };

    modelRtc.setIce = function(e){
        if(e && e.candidate){
            pc.addIceCandidate(new RTCIceCandidate(e));
        }
    };

    modelRtc.initRtcEl = function(){
        $cache.rtcLocalVideo = document.createElement('video');
        $cache.rtcRemoteVideo = document.createElement('video');
        $cache.rtcLocalVideo.autoplay = true;
        $cache.rtcLocalVideo.muted = true;
        $cache.rtcRemoteVideo.autoplay = true;
        $cache.rtcRemoteVideo.muted = false;

        $cache.rtcLocalBox.append($cache.rtcLocalVideo);
        $cache.rtcRemoteBox.append($cache.rtcRemoteVideo);

        $cache.rtcLocalVideo.src = cache.localMediaUrl;
    };

    modelRtc.initDCEvents = function(channel) {
        window.dc = dc = channel;
        window.pc = pc;
        console.log('onDataChannel: ', dc);
        dc.onmessage = function (e) {
            console.log(e);
        };

        dc.onopen = function (e) {
            console.log('DEBUG: [PEER] DataChannel opened', dc);
        };

        dc.onclose = function (e) {
            console.log('DEBUG: [PEER] DataChannel closed');
        };

        dc.onerror = function (e) {
            console.log('ERROR: [PEER] DataChannel', e);
        };
    };

    modelRtc.createOffer = function createOffer(){
        window.dc = dc = pc.createDataChannel('RTCDataChannel', {reliable: false});
        pc.createOffer(modelRtc.onCreateOffer, function(e){
            console.log(e);
        });
        modelRtc.initDCEvents(dc);
        modelRtc.isShow = true;
        $cache.winWebrtc.show();
    };

    modelRtc.initPeerEvents = function(){
        pc.removeEventListener('addstream');
        pc.removeEventListener('icecandidate');
        pc.removeEventListener('datachannel');

        pc.addEventListener('addstream', modelRtc.onAddStream);
        pc.addEventListener('icecandidate', modelRtc.onIceCandidate);
        pc.addEventListener('datachannel', modelRtc.onDataChannel);
    };

    modelRtc.addStream = function (stream){
        pc.addStream(stream);
    };

    modelRtc.closePc = function(){
        pc.close();
    };

    modelRtc.initSocket = function (){
        socket.off('mFC.resRtcConn');
        socket.off('mFC.resRtcOffer');
        socket.off('mFC.resRtcAnswer');
        socket.off('mFC.resRtcIce');
        socket.off('mFC.resRtcClose');

        socket.on('mFC.resRtcConn', modelRtc.createOffer);
        socket.on('mFC.resRtcOffer', modelRtc.setOffer);
        socket.on('mFC.resRtcAnswer', modelRtc.setAnswer);
        socket.on('mFC.resRtcIce', modelRtc.setIce);
        socket.on('mFC.resRtcClose', modelRtc.closePc);
    };

    modelRtc.createPC = function(){
        window.pc = pc = new RTCPeerConnection(modelRtc.iceServers, {optional: [{ RtpDataChannels: true}] });
        pc.oniceconnectionstatechange = function(e){
            console.log(arguments);
        };
        pc.onsignalingstatechange = function(e){
            console.log(arguments);
        };
    };

    // 初始化WebRtc
    modelRtc.initWebrtc = function(){
        modelRtc.createPC();
        modelRtc.initSocket();
        modelRtc.initPeerEvents();
        modelRtc.addStream(cache.localMedia);
    };

    // 连接WebRtc
    modelRtc.conn = false;
    modelRtc.isShow = false;
    modelRtc.call = function(){
        if(!modelRtc.conn){
            socket.emit('mFC.reqRtcConn');
        }
        if(!modelRtc.isShow){
            modelRtc.isShow = true;
            $cache.winWebrtc.show();
        }else{
            modelRtc.isShow = false;
            $cache.winWebrtc.hide();
        }
    };

    // 挂断WebRtc
    modelRtc.hang = function(){
        pc.close();
        socket.emit('mFC.reqRtcClose');
    };

    // 清除 clearIndexDb
    modelSocket.clearIndexDb = function(){
        var deferred = Q.defer();
        localforage.keys().then(function(keys){
            async.forEachSeries(keys,
                function(key, callback){
                    localforage.removeItem(key)
                        .then(function(){
                            callback();
                        });
                },
                function(){
                    deferred.resolve();
                });
        });
        return deferred.promise;
    };

    // 初始化 websocket 连接
    modelSocket.initSocekt = function() {
        var deferred = Q.defer();
        socket = io(socketIo, config.WsServer);
        socket.once('connect', function () {
            socket.on('error', function (data) {
                swal('服务器出现错误!', data.emit + ': ' + data.info, 'error');
            });
            setTimeout(function () {
                deferred.resolve();
            }, 600);
        });
        return deferred.promise;
    };

    // 初始化交互接口
    modelSocket.initTransport = function() {
        var deferred = Q.defer();
        var accessToken;
        var onSyncData = function(data){
            var syncData =data;
            var nowQuiz = dataCache.nowQuiz;
            if(syncData.boardType === 1){
                //alert('ok 1');
                nowQuiz.imageUrl = syncData.imageUrl;
            }else if(syncData.boardType === 2){
                //alert('ok 2');
                nowQuiz.studyBlankPages[syncData.index].blankPageUrl = syncData.imageUrl;
            }

        };
        transport.login = function () {
            var deferred = Q.defer();
            socket.once('uC.resLogin', function (data) {
                if (data.status !== 'success') {
                    deferred.reject();
                } else {
                    deferred.resolve();
                }
            });
            socket.emit('uC.reqLogin', {
                accessToken: accessToken
            });
            return deferred.promise;
        };
        transport.getUserId = function () {
            var deferred = Q.defer();
            socket.once('uC.resGetUserId', function (data) {
                deferred.resolve(data);
            });
            socket.emit('uC.reqGetUserId');
            return deferred.promise;
        };
        transport.getUserInfo = function (userId) {
            var deferred = Q.defer();
            var cacheUserInfo = dataCache.userInfo[userId];
            if (cacheUserInfo) {
                deferred.resolve(cacheUserInfo);
            } else {
                socket.once('uC.resGetUserInfo', function (data) {
                    data.userId = userId;
                    dataCache.userInfo[userId] = data;
                    deferred.resolve(data);
                });
                socket.emit('uC.reqGetUserInfo', {
                    userId: userId
                });
            }
            return deferred.promise;
        };
        transport.inRoom = function () {
            var deferred = Q.defer();
            socket.once('uC.resInRoom', function (data) {
                if (data.status !== 'success') {
                    deferred.reject();
                } else {
                    deferred.resolve();
                }
            });
            socket.emit('uC.reqInRoom');
            return deferred.promise;
        };
        transport.classList = function () {
            var deferred = Q.defer();
            socket.once('qC.resClassList', function (data) {
                if(data.currQuizId){
                    dataCache.currQuizId = data.currQuizId;
                    dataCache.runTime = data.studyTime || 0;
                }
                deferred.resolve(data);
            });
            socket.emit('qC.reqClassList');
            return deferred.promise;
        };
        transport.getQuizInfoById = function (quizId) {
            var deferred = Q.defer();
            localforage.getItem('quizId-' + quizId)
                .then(function(cacheQuizIdInfo){
                    if(cacheQuizIdInfo){
                        deferred.resolve(cacheQuizIdInfo);
                    }else{
                        socket.once('qC.resGetQuizInfoById', function (data) {
                            localforage.setItem('quizId-'+quizId, data)
                                .then(function(){
                                    deferred.resolve(data);
                                });
                        });
                        socket.emit('qC.reqGetQuizInfoById', {
                            quizId: quizId
                        });
                    }
                });
            return deferred.promise;
        };
        transport.upLoadToken = function () {
            var deferred = Q.defer();
            socket.once('dHC.resUploadToken', function (data) {
                deferred.resolve(data);
            });
            socket.emit('dHC.reqUploadToken');
            return deferred.promise;
        };
        socket.on('mFC.resAnswerLock', function(data){
            console.log(data);
            if(data.data === 'unLock'){
                $cache.sketchpadLock.show();
                cache.sketchpadLock = true;
            }else if(data.data === 'lock'){
                $cache.sketchpadLock.hide();
                cache.sketchpadLock = false;
            }
        });
        socket.on('mFC.resSwitchTopics', function(data){
            var syncData = data.syncData;
            onSyncData(syncData);
            modelClass.selectQuizCallbcak(data.quizIndex , data.quizId, true);
        });
        socket.on('mFC.resSwitchBlankPages', function(data){
            var syncData = data.syncData;
            onSyncData(syncData);
            modelClass.swichBlankPagesCallBack(data.blankPagesIndex, true);
        });
        socket.on('mFC.resAddBlankPage', function(data){
            var syncData = data.syncData;
            onSyncData(syncData);
            modelClass.addBlankPageCallBack(true);
        });
        socket.on('mFC.resAsyncNeed', function(data){
            $.magnificPopup.open({
                items: {
                    src: $cache.dataSyncingPop
                },
                type: 'inline',
                modal: true
            });
        });
        socket.on('onClose.resPleaseSaveClass', function(data){
            var stepFn = new WSY.stepFn(['locateOk', 'remoteOk'], function(){
                $.magnificPopup.close();
            });
            var saveCurrQuizIdCallBack = function(msg){
                swal({
                    title: msg,
                    type: 'success'
                }, function(){
                    $.magnificPopup.open({
                        items: {
                            src: $cache.linkErrorHoldingPop
                        },
                        type: 'inline',
                        modal: true
                    });
                    stepFn('locateOk');
                });
            };
            socket.once('mFC.resInitOK', function(){
                stepFn('remoteOk');
            });
            $.magnificPopup.open({
                items: {
                    src: $cache.dataSyncingPop
                },
                type: 'inline',
                modal: true
            });
            modelClass.uploadQuizFg()
                .then(modelSocket.uploadQuizData)
                .done(function(){
                    socket.once('qC.resSaveCurrQuizId', function(data){
                        if (data.status !== 'success') {
                            $.magnificPopup.close();
                            swal('网络断线保持题目失败!', '', 'error');
                        } else {
                            $.magnificPopup.close();
                            saveCurrQuizIdCallBack('网络断线保持题目完成');
                        }
                    });
                    socket.emit('qC.reqSaveCurrQuizId', {
                        currQuizId: dataCache.nowQuiz.quizId,
                        studyTime: cache.runTime.getRunTime()
                    });

                });
        });
        config.getToken(function(Token){
            accessToken = Token;
            deferred.resolve();
        });
        return deferred.promise;
    };

    // 对交互接口的逻辑处理
    modelSocket.processTransport = function() {
        var deferred = Q.defer();
        transport.login()
            .then(transport.getUserId, function () {
                swal('服务器链接错误!', '', 'error');
            })
            .then(function (data) {
                dataCache.selfUserId = data;
                $.magnificPopup.open({
                    items: {
                        src: $cache.systemHoldingPop
                    },
                    type: 'inline',
                    modal: true
                });
            })
            .then(transport.inRoom)
            .then(function () {
                transport.classList()
                    .then(function (data) {
                        modelClass.showClassSessionView(data)
                            .then(function () {
                                socket.on('mFC.resChatMessages', function (data) {
                                    modelTask.onRenderTaskView(data);
                                    dataCache.taskMsg.push(data);
                                });
                                socket.on('mFC.resBoardDraw', function (data) {
                                    console.log(data);
                                    cache.Board.onReceiveBoardData(data.draw);
                                });
                                cache.Board.onSendBoardData = function (data) {
                                    socket.emit('mFC.reqBoardDraw', {
                                        draw: data
                                    });
                                };
                                $.magnificPopup.close();
                                deferred.resolve();
                            });
                    });
            });

        return deferred.promise;
    };

    // 上传二进制对象到七牛
    modelSocket.uploadBlobToQN = function(blob) {
        var deferred = Q.defer();
        transport.upLoadToken()
            .then(function (data) {
                console.log(data);
                var token, key, form;

                token = data.token;
                key = data.key;
                form = new FormData();

                form.append('file', blob, key);
                form.append('token', token);
                //alert('run');
                $.ajax({
                    url: 'http://upload.qiniu.com/',
                    type: 'POST',
                    data: form,
                    cache: false,
                    contentType: false,
                    processData: false,
                    forceSync: false,
                    xhr: function () {
                        var xhrobj = $.ajaxSettings.xhr();
                        if (xhrobj.upload) {
                            xhrobj.upload.addEventListener('progress', function (ev) {
                                var percent = 0;
                                var position = ev.loaded || ev.position;
                                var total = ev.total || ev.totalSize;
                                if (ev.lengthComputable) {
                                    percent = Math.ceil(position / total * 100);
                                }
                                console.log(percent);
                                deferred.notify(percent);
                            }, false);
                        }
                        return xhrobj;
                    },
                    success: function (data) {
                        var upImgUrl = 'http://hyphen.qiniudn.com/' + data.key;
                        deferred.resolve(upImgUrl);
                    },
                    error: function () {
                        deferred.reject(arguments);
                    }
                });
            });
        return deferred.promise;
    };

    // 上传当前题目画布
    modelClass.uploadQuizFg = function(){
        var deferred = Q.defer();
        cache.Board._canvas.canvas.toBlob(function(blob){
            modelSocket.uploadBlobToQN(blob)
                .then(function(data){
                    var nowQuiz = dataCache.nowQuiz;
                    if(nowQuiz.boardType === 1){
                        //alert('1');
                        nowQuiz.imageUrl = data;
                    }else if(dataCache.nowQuiz.boardType === 2){
                        //alert('2');
                        nowQuiz.studyBlankPages[nowQuiz.studyBlankPagesindex].blankPageUrl = data;
                        console.log(nowQuiz.studyBlankPages[nowQuiz.studyBlankPagesindex]);
                    }
                    deferred.resolve();
                });
        });
        return deferred.promise;
    };

    // 上传当前数据
    modelSocket.uploadQuizData =  function() {
        var deferred = Q.defer();
        var upData = {
            quizId: dataCache.nowQuiz.quizId,
            chatRecords: dataCache.taskMsg,
            imageUrl: dataCache.nowQuiz.imageUrl,
            studyBlankPages: dataCache.nowQuiz.studyBlankPages
        };

        modelSocket.saveQuizDataLocal(upData)
            .then(function(){
                socket.on('dHC.resSaveQuizInfo', function(data){
                    if(data.status === 'success'){
                        deferred.resolve();
                    }else{
                        deferred.reject();
                    }
                });
                socket.emit('dHC.reqSaveQuizInfo', upData);
            });

        return deferred.promise;
    };

    // 保存同步数据到本地
    modelSocket.saveSyncData = function(){
        var deferred = Q.defer();
        var upData = {
            quizId: dataCache.nowQuiz.quizId,
            chatRecords: dataCache.taskMsg,
            imageUrl: dataCache.nowQuiz.imageUrl,
            studyBlankPages: dataCache.nowQuiz.studyBlankPages
        };
        modelSocket.saveQuizDataLocal(upData)
            .then(function(){
                deferred.resolve();
            });

        return deferred.promise;
    };

    // 保存本地上课数据到本地indexDB
    modelSocket.saveQuizDataLocal = function(upData){
        var deferred = Q.defer();
        var dbKey = 'quizId-' + upData.quizId;
        console.log(dbKey);
        localforage.getItem(dbKey)
            .then(function(data){
                console.log(data);
                data.chatRecords = upData.chatRecords;
                data.imageUrl = upData.imageUrl;
                data.studyBlankPages = upData.studyBlankPages;
                localforage.setItem(dbKey, data)
                    .then(function(){
                        deferred.resolve();
                    });
            });
        return deferred.promise;
    };

    // 初始化上课数据
    modelClass.init = function(){
        var deferred = Q.defer();
        if(dataCache.currQuizId){
            var quizIdIndex;
            dataCache.nowQuiz.quizId = dataCache.currQuizId;
            $.each(dataCache.quizIdList, function(index, data){
                if((''+data.quizId) === (''+ dataCache.currQuizId)){
                    quizIdIndex = data.index;
                    dataCache.nowQuiz.index = quizIdIndex;
                    dataCache.nowQuiz.planIndex = quizIdIndex;
                }
            });
            modelDom.initRunTime(dataCache.runTime);
        }else{
            var quizInitData = dataCache.quizIdList[0];
            dataCache.nowQuiz.quizId = quizInitData.quizId;
            dataCache.nowQuiz.index = 1;
            dataCache.nowQuiz.planIndex = 1;
            modelDom.initRunTime();
        }
        dataCache.nowQuiz.boardType = 1;
        modelDom.leftSessionNeedShow(dataCache.nowQuiz.index - 1);
        modelClass.initQuiz(dataCache.nowQuiz.quizId)
            .then(function () {
                if(dataCache.currQuizId){
                    socket.emit('mFC.reqInitOK');
                }
                deferred.resolve();
            });
        return deferred.promise;
    };

    // 初始化
    function init() {
        modelGCtl.init();
        cache.winW = $cache.win.width();
        cache.winH = $cache.win.height();
        $cache.win.on('resize', function () {
            cache.winW = $cache.win.width();
            cache.winH = $cache.win.height();
        });

        modelDom.initElement()
            .then(modelRtc.detectRTCInit)
            .then(modelRtc.DetectRTC)
            .then(modelRtc.mediaTest)
            .then(modelDom.initScrollPane)
            .then(modelDom.initCtlBtn)
            .then(modelTask.initUMEditor)
            .then(modelTask.initUMEditorEvent)
            .then(modelBoard.initSketchpadBox)
            .then(modelBoard.initSketchpadEvent)
            .then(modelBoard.initSketchpadCtl)
            .then(modelSocket.clearIndexDb)
            .then(modelSocket.initSocekt)
            .then(modelSocket.initTransport)
            .then(modelSocket.processTransport)
            .then(modelClass.init)
            .done(function(){
                modelRtc.initRtcEl();
                modelRtc.initWebrtc();
                modelDom.dragImg();
                modelClass.initExitClass();
                modelBoard.initRemoteCtl();
                modelDom.initOnScrollSketchpadCent();
            });
    }

    init();

    function debug(){
        window.$cache = $cache;
        window.cache = cache;
        window.dataCache = dataCache;
        window.modelRtc = modelRtc;
    }
    window.debug = debug;
});