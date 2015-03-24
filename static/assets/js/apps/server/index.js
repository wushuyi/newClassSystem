/**
 * Created by shuyi.wu on 2015/2/5.
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
    'DetectRTC',
    'RTCPeerConnection',
    'dust-temp/taskView',
    'dust-temp/classSessionView',
    'dust-temp/ratyListView',
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
    Draggabilly
) {
    'use strict';

    console.log(config);
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
    modelDom.initElement = function() {
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
        $cache.rightSessionCent = $cache.rightCent.find('.session-cent');

        $cache.leftSessionScrollCent = $cache.leftSessionCent.find('.scroll-cent');
        $cache.leftSessionScroll = $cache.leftSessionCent.find('.scroll');
        $cache.rightSessionScrollCent = $cache.rightSessionCent.find('.scroll-cent');
        $cache.rightSessionScroll = $cache.rightSessionCent.find('.scroll');
        $cache.blankPages = $cache.rightSessionScroll.find('.add-list .class-list ul');

        $cache.answerLock = $('#answer-lock');

        $cache.leftCentTopBar = $cache.leftCent.find('.topbar');
        $cache.leftCentToolBar = $cache.leftCent.find('.toolbar');
        $cache.rightCentTopBar = $cache.rightCent.find('.topbar');
        $cache.rightCentToolBar = $cache.rightCent.find('.toolbar');

        $cache.planCent = $cache.leftCent.find('.plan-cent');
        $cache.planScroll = $cache.planCent.find('.scroll');

        $cache.closeClassBtn = $cache.leftCentTopBar.find('.close-class-btn');
        $cache.runTimeNum = $cache.leftCentTopBar.find('.run-time .num');
        $cache.leftTitleNum = $cache.leftCentTopBar.find('.title .num');

        $cache.rightTitleNum = $cache.rightCentTopBar.find('.title .num');

        $cache.addErrorBtn = $cache.leftCentToolBar.find('.add-error-btn');
        $cache.playVideoBtn = $cache.leftCentToolBar.find('.play-video-btn');
        $cache.playSoundBtn = $cache.leftCentToolBar.find('.play-sound-btn');
        $cache.morePlanBtn = $cache.leftCentToolBar.find('.more-plan-btn');

        $cache.leftPrevBtn = $cache.leftCentToolBar.find('.prev-btn');
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
        $cache.dataSyncingPop = $cache.popList.find('.data-syncing-pop');
        $cache.systemInitErrorPop = $cache.popList.find('.system-init-error');
        $cache.systemHoldingPop = $cache.popList.find('.system-holding');
        $cache.linkErrorHoldingPop = $cache.popList.find('.link-error-holding');

        deferred.resolve();
        return deferred.promise;
    };


    // 上课部分题目切换


    // 初始化滚动条
    modelDom.initScrollPane = function(){
        var deferred = Q.defer();

        $cache.win.on('resize', function () {
            // jspScroll response
            if (jspScrollList.planFn ||
                jspScrollList.sketchpadFn ||
                jspScrollList.taskFn) {
                if (timerList.timeoutScrollReset) {
                    clearTimeout(timerList.timeoutScrollReset);
                }
                timerList.timeoutScrollReset = setTimeout(function () {
                    if (jspScrollList.planFn) {
                        jspScrollList.planFn.reinitialise();
                    }
                    if (jspScrollList.sketchpadFn) {
                        jspScrollList.sketchpadFn.reinitialise();
                    }
                    if (jspScrollList.taskFn && lockCtl.taskBox) {
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
        jspScrollList.leftSessionFn = $cache.leftSessionScrollCent.jScrollPane({
            hideFocus: true
        }).data('jsp');
        jspScrollList.rightSessionFn = $cache.rightSessionScrollCent.jScrollPane({
            hideFocus: true
        }).data('jsp');


        deferred.resolve();
        return deferred.promise;
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
        modelDom.rightSessionNeedShow(quizIndex - 1);
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
        modelClass.uploadQuizFg()
            .then(function(syncData){
                return Q.Promise(function (resolve, reject, notify){
                    if(!isRemote){
                        socket.emit('mFC.reqSwitchTopics', {
                            quizIndex: quizIndex,
                            quizId: quizId,
                            syncData: syncData
                        });
                    }
                    modelSocket.uploadQuizData()
                        .then(function(){
                            resolve();
                        });
                });
            })
            .done(function(){
                var nowQuiz = dataCache.nowQuiz;
                nowQuiz.quizId = quizId;
                nowQuiz.index = quizIndex;
                nowQuiz.planIndex = quizIndex;
                nowQuiz.boardType = 1;
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
        modelClass.uploadQuizFg()
            .then(function(syncData){
                var blankData;
                if(!isRemote){
                    socket.emit('mFC.reqSwitchBlankPages', {
                        blankPagesIndex: blankPagesIndex,
                        syncData: syncData
                    });
                }
                nowQuiz.studyBlankPagesindex = blankPagesIndex;
                nowQuiz.boardType = 2;
                blankData = nowQuiz.studyBlankPages[blankPagesIndex];
                modelBoard.setSketchpadView(blankData.blankPageBgUrl, blankData.blankPageUrl)
                    .then(function(){
                        socket.emit('mFC.reqAsyncOk');
                        stepFn('localOk');
                    });
            });
    };

    // 添加白板回调
    modelClass.addBlankPageCallBack = function(isRemote){
        if(!isRemote){
            socket.emit('mFC.reqAddBlankPage');
        }
        $.magnificPopup.open({
            items: {
                src: $cache.dataSyncingPop
            },
            type: 'inline',
            modal: true
        });
        modelClass.uploadQuizFg()
            .then(function(){
                dataCache.nowQuiz.studyBlankPagesindex = dataCache.nowQuiz.studyBlankPages.length;
                dataCache.nowQuiz.boardType = 2;
                dataCache.nowQuiz.studyBlankPages.push({
                    blankPageUrl: '',
                    blankPageBgUrl: ''
                });
                modelClass.initBlankPage(dataCache.nowQuiz.studyBlankPages.length);
                modelBoard.setSketchpadView(null, null)
                    .then(function(){
                        setTimeout(function(){
                            $.magnificPopup.close();
                        }, 600);
                    });
            });
    };
    // 结束课程
    modelClass.initExitClass = function(){
        $cache.closeClassBtn.on('click', function (e) {
            $.magnificPopup.open({
                items: {
                    src: $cache.sureClosePop
                },
                type: 'inline',
                modal: true
            });
        });

        $cache.sureCloseFalseBtn.on('click', function (e) {
            $.magnificPopup.close();
        });
        $cache.sureCloseTrueBtn.on('click', function (e) {
            socket.emit('mFC.reqClassNeedExit');
            var quizIdListResults = dataCache.quizIdListForServe.quizIdListResults;
            var knowledgeIdsList = [];
            var knowledgeVidwData = [];
            for(var i = 0, ilen = quizIdListResults.length; i < ilen; i++){
                var res = quizIdListResults[i];
                knowledgeIdsList.push(res.knowledgeId);
                knowledgeVidwData.push({
                    index: i + 1
                });
            }
            dataCache.knowledgeIdsList = knowledgeIdsList;
            dust.render('ratyListView', {list: knowledgeVidwData}, function (err, out) {
                if (err) {
                    console.log(err);
                } else {
                    $cache.ratyPopScroll.find('.jspPane').html(out);
                    // 需要异步查找
                    $cache.ratyPopScroll.find('.raty').raty({
                        numberMax: 3,
                        path: 'assets/images/',
                        starOff: 'off.png',
                        starOn: 'on.png',
                        hints: ['合格', '良好', '优良']
                    });
                    $.magnificPopup.close();
                    $.magnificPopup.open({
                        items: {
                            src: $cache.ratyPop
                        },
                        type: 'inline',
                        modal: true
                    });
                    jspScrollList.ratyFn.reinitialise();
                }
            });
        });

        $cache.ratyConfirmBtn.on('click', function (e) {
            $.magnificPopup.close();
            $.magnificPopup.open({
                items: {
                    src: $cache.remarkPop
                },
                type: 'inline',
                modal: true
            });
        });

        $cache.remarkPrevBtn.on('click', function (e) {
            $.magnificPopup.open({
                items: {
                    src: $cache.ratyPop
                },
                type: 'inline',
                modal: true
            });
        });

        $cache.remarkConfirmBtn.one('click', function (e) {
            var data,ratyValList = [], feedback, hideFeedback;
            var $remark = $cache.remarkPop.find('.remark');
            feedback = $remark.eq(0).val();
            hideFeedback = $remark.eq(1).val();
            $cache.ratyPopScroll.find('input[name="score"]').each(function(){
                var $slef = $(this);
                ratyValList.push($slef.val());
            });
            data = {
                teacherId: dataCache.selfUserId,
                feedback: feedback,
                hideFeedback: hideFeedback,
                knowledgeIds: dataCache.knowledgeIdsList,
                scores: ratyValList
            };
            socket.once('dHC.resTeaExitRoom', function(data){
                swal('提交成功!', '', 'success');
                $.magnificPopup.close();
            });
            socket.emit('dHC.reqTeaExitRoom', data);
        });
    };

    // 初始化控制按钮事件
    modelDom.initCtlBtn = function () {
        var deferred = Q.defer();
        var preventDefault;
        // 阻止默认事件 start

        // 阻止文字选择
        preventDefault = function (e) {
            e.preventDefault();
        };
        $cache.leftCentTopBar.on('selectstart', preventDefault);
        $cache.leftCentToolBar.on('selectstart', preventDefault);
        $cache.rightCentTopBar.on('selectstart', preventDefault);
        $cache.rightCentToolBar.on('selectstart', preventDefault);

        // 阻止右键菜单
        $cache.photoBox.on('contextmenu', preventDefault);
        // 阻止默认事件 end

        // 获取摄像头图片上传 start
        $cache.photoCancelBtn.on('click', function (e) {
            $.magnificPopup.close();
            $cache.photoBox.attr('src', '');
        });
        $cache.photoConfirmBtn.on('click', function (e) {
            var videoEl;
            videoEl = $cache.photoBox.get(0);
            videoEl.pause();
            $cache.photoCancelBtn.hide();
            $cache.photoConfirmBtn.hide();
            $cache.photoResetBtn.show();
            $cache.photoUploadBtn.show();
        });
        $cache.photoResetBtn.on('click', function (e) {
            var videoEl;
            videoEl = $cache.photoBox.get(0);
            videoEl.play();
            $cache.photoCancelBtn.show();
            $cache.photoConfirmBtn.show();
            $cache.photoResetBtn.hide();
            $cache.photoUploadBtn.hide();
        });
        $cache.photoUploadBtn.on('click', function (e) {
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
        $cache.upimgUploadBtn.on('click', function (e) {
            var canvas;
            canvas = $cache.upimgViewBox.find('canvas').get(0);
            canvas.toBlob(function (blob) {
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
        $cache.upimgCancelBtn.on('click', function (e) {
            $.magnificPopup.close();
        });
        // 上传本地图片 end

        // 聊天框 start
        $cache.taskCtlBtn.on('click', function (e) {
            if (!lockCtl.taskBox) {
                $cache.taskBoxCent.show();
                jspScrollList.taskFn.reinitialise();
                jspScrollList.taskFn.scrollToBottom(0);
                lockCtl.taskBox = true;
            } else {
                $cache.taskBoxCent.hide();
                lockCtl.taskBox = false;
            }
        });
        $cache.taskClose.on('click', function () {
            $cache.taskBoxCent.hide();
            lockCtl.taskBox = false;
        });
        // 聊天框 end

        // 控制按钮 start
        $cache.answerLock.on('change', function (e) {
            var checked = $cache.answerLock.prop('checked');
            if (checked) {
                $cache.sketchpadLock.show();
                socket.emit('mFC.reqAnswerLock', {
                    data: 'lock'
                });
            }else{
                $cache.sketchpadLock.hide();
                socket.emit('mFC.reqAnswerLock', {
                    data: 'unLock'
                });
            }
        });

        $cache.leftToolNum.on('click', function (e) {
            if (lockCtl.leftSessionCent) {
                $cache.leftSessionCent.hide();
                lockCtl.leftSessionCent = false;
            } else {
                $cache.leftSessionCent.show();
                lockCtl.leftSessionCent = true;
            }
        });
        $cache.rightToolNum.on('click', function (e) {
            if (lockCtl.rightSessionCent) {
                $cache.rightSessionCent.hide();
                lockCtl.rightSessionCent = false;
            } else {
                $cache.rightSessionCent.show();
                lockCtl.rightSessionCent = true;
                jspScrollList.rightSessionFn.reinitialise();
            }
        });
        // 控制按钮 end

        // 聊天框图片查看 start
        $cache.taskScroll.on('click', 'img.input-img', function (e) {
            var $self = $(this);
            $cache.winImgZoom
                .attr('src', $self.attr('src'));
            $cache.winImg.show();
        });
        $cache.winImgClose.on('click', function (e) {
            $cache.winImg.hide();
        });
        $cache.winImgZoom.on('dragstart', function (e) {
            e.preventDefault();
        });
        $cache.taskScroll.on('dragstart', 'img', function (e) {
            e.preventDefault();
        });
        // 聊天框图片查看 end

        // 点击上课听题目 start
        $cache.rightSessionScroll.on('click', 'li.quiz', function (e) {
            var $self = $(this);
            var quizIndex = +$self.html();
            var quizIdListIndex = quizIndex - 1;
            var quizId = dataCache.quizIdList[quizIdListIndex].quizId;
            modelClass.selectQuizCallbcak(quizIndex, quizId);
        });
        $cache.rightPrevBtn.on('click', function(e){
            var selfIndex = +$cache.rightToolNum.html();
            var quizIdListIndex = selfIndex - 2;
            var quizId = dataCache.quizIdList[quizIdListIndex].quizId;
            var quizIndex = selfIndex - 1;
            modelClass.selectQuizCallbcak(quizIndex, quizId);
        });
        $cache.rightNextBtn.on('click', function(e){
            var selfIndex = +$cache.rightToolNum.html();
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

        // 老师切换教案 start
        $cache.leftSessionScroll.on('click', 'li.quiz', function (e) {
            var $self = $(this);
            var quizData = $self.data();
            var quizId = quizData.quizId;
            $.magnificPopup.open({
                items: {
                    src: $cache.dataSyncingPop
                },
                type: 'inline',
                modal: true
            });
            dataCache.nowQuiz.planIndex = +$self.html();
            modelClass.swichPlan(quizId)
                .then(function(){
                    setTimeout(function(){
                        $.magnificPopup.close();
                    }, 600);
                });
        });
        $cache.leftPrevBtn.on('click', function(e){
            var selfIndex = +$cache.leftToolNum.html();
            var quizIdListIndex = selfIndex - 2;
            var quizData = dataCache.quizIdList[quizIdListIndex];
            var quizId = quizData.quizId;
            $.magnificPopup.open({
                items: {
                    src: $cache.dataSyncingPop
                },
                type: 'inline',
                modal: true
            });
            dataCache.nowQuiz.planIndex = quizIdListIndex + 1;
            modelDom.leftSessionNeedShow(quizIdListIndex);
            modelClass.swichPlan(quizId)
                .then(function(){
                    setTimeout(function(){
                        $.magnificPopup.close();
                    }, 600);
                });
        });
        $cache.leftNextBtn.on('click', function(e){
            var selfIndex = +$cache.leftToolNum.html();
            var quizIdListIndex = selfIndex;
            var quizData = dataCache.quizIdList[quizIdListIndex];
            var quizId = quizData.quizId;
            $.magnificPopup.open({
                items: {
                    src: $cache.dataSyncingPop
                },
                type: 'inline',
                modal: true
            });
            dataCache.nowQuiz.planIndex = quizIdListIndex + 1;
            modelDom.leftSessionNeedShow(quizIdListIndex);
            modelClass.swichPlan(quizId)
                .then(function(){
                    setTimeout(function(){
                        $.magnificPopup.close();
                    }, 200);
                });
        });
        // 老师切换教案 end

        // 连接WebRtc
        $cache.soundBtn.on('click', function(e){
            modelRtc.call();
        });

        deferred.resolve();
        return deferred.promise;
    };

    // 对没有功能的按钮 做提示处理
    modelDom.initNoFnBtn = function () {
        var deferred = Q.defer();
        var onNoFn;
        onNoFn = function (e) {
            e.preventDefault();
            e.stopPropagation();
            swal('对不起该功能善未开发!', '', 'warning');
        };
        $cache.addErrorBtn.on('click', onNoFn);
        $cache.playVideoBtn.on('click', onNoFn);
        $cache.playSoundBtn.on('click', onNoFn);
        $cache.morePlanBtn.on('click', onNoFn);
        deferred.resolve();
        return deferred.promise;
    };

    // 设置教案图片
    modelDom.setPlanBox = function(imgUrl) {
        var deferred = Q.defer();
        var loadSuccess, loadImg;
        loadSuccess = function (canvas) {
            $cache.planFg = $(canvas);
            canvas.className = 'plan-img';
            $cache.planScroll.html(canvas);
            jspScrollList.planFn.reinitialise();
            deferred.resolve();
        };
        loadImg = modelUtil.loadImg2Canvas(imgUrl);
        loadImg
            .then(loadSuccess)
            .done();
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

    // 判断右边上课题目切换显示
    modelDom.rightSessionNeedShow = function(index){
        if(index === 0){
            $cache.rightPrevBtn.hide();
            $cache.rightNextBtn.show();
        }else if(index === (dataCache.quizIdList.length - 1)){
            $cache.rightPrevBtn.show();
            $cache.rightNextBtn.hide();
        }else{
            $cache.rightPrevBtn.show();
            $cache.rightNextBtn.show();
        }
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
                    console.log(img);
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

    // 初始化富文本编辑器
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

                $cache.rightSessionScroll.find('.session-list').remove();
                $cache.rightSessionScroll.find('> ul').prepend(data);
                jspScrollList.rightSessionFn.reinitialise();

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
                modelDom.setPlanBox(dataCache.nowQuiz.teacherUrl);

                if(data.imageUrl){
                    onSetSketchpadView = modelBoard.setSketchpadView(dataCache.nowQuiz.studentUrl, data.imageUrl);
                }else{
                    onSetSketchpadView = modelBoard.setSketchpadView(dataCache.nowQuiz.studentUrl);
                }
                onSetSketchpadView.done(function () {
                        var nowQuizIndex = dataCache.nowQuiz.index;
                        $cache.leftToolNum.text(nowQuizIndex);
                        $cache.rightToolNum.text(nowQuizIndex);
                        $cache.leftTitleNum.text(nowQuizIndex);
                        $cache.rightTitleNum.text(nowQuizIndex);
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
        jspScrollList.rightSessionFn.reinitialise();
    };

    // 通过数据切换教案
    modelClass.swichPlan = function(quizId){
        var deferred = Q.defer();
        transport.getQuizInfoById(quizId)
            .then(function (data) {
                var planIndex = dataCache.nowQuiz.planIndex;
                modelDom.setPlanBox(data.teacherUrl);
                $cache.leftToolNum.text(planIndex);
                $cache.leftTitleNum.text(planIndex);
                deferred.resolve();
            });
        return deferred.promise;
    };

    // 初始化画布事件
    modelBoard.initSketchpadEvent = function() {
        var deferred = Q.defer();

        var $canvas, myBoard, parentOffset, offsetPoint;
        lockCtl.drawType = 'pen';
        $canvas = $cache.sketchpadFg;
        myBoard = cache.Board;



        parentOffset = $canvas.offset();
        offsetPoint = new WSY.getOffsetPoint(parentOffset);
        $cache.win.on('resize', function(e){
            parentOffset = $canvas.offset();
            offsetPoint.setParentOffset(parentOffset);
        });
        $cache.sketchpadCent.on('jsp-scroll-y', function () {
            parentOffset = $canvas.offset();
            offsetPoint.setParentOffset(parentOffset);
        });

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

        deferred.resolve();
        return deferred.promise;
    };

    // 初始化画布控制
    modelBoard.initSketchpadCtl = function() {
        var deferred = Q.defer();
        var eraser, pen, penBlack, penRed, myBoard;
        myBoard = cache.Board;
        eraser = function (isRemote) {
            lockCtl.drawType = 'eraser';
            if (!isRemote) {
                //socket.emit('boardCtl', gData.otherId, 'eraser');
                return false;
            }
        };
        pen = function (isRemote) {
            lockCtl.drawType = 'pen';
            if (!isRemote) {
                //socket.emit('boardCtl', gData.otherId, 'pen');
                return false;
            }
        };
        penBlack = function () {
            myBoard.setStyle('strokeStyle', 'black');
            socket.emit('mFC.reqBoardControl', {
                type: 'pen',
                data: {
                    color: 'black'
                }
            });
        };
        penRed = function () {
            myBoard.setStyle('strokeStyle', 'red');
            socket.emit('mFC.reqBoardControl', {
                type: 'pen',
                data: {
                    color: 'red'
                }
            });
        };
        myBoard.setStyle('lineWidth', 1.4);
        myBoard.setStyle('lineCap', 'round');

        /* default mod */
        pen();
        myBoard.setStyle('strokeStyle', 'black');

        $cache.penBlackBtn.on('click', function () {
            pen();
            penBlack();
        });
        $cache.penRedBtn.on('click', function () {
            pen();
            penRed();
        });
        $cache.eraserBtn.on('click', function () {
            eraser();
        });
        deferred.resolve();
        return deferred.promise;
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
            bgCtx = bgCanvas.getContext('2d');
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

    // 初始化WebRtc
    modelRtc.initWebrtc = function(){
        var localVideo = document.createElement('video');
        var remoteVideo = document.createElement('video');
        localVideo.autoplay = true;
        localVideo.muted = true;
        remoteVideo.autoplay = true;
        remoteVideo.muted = false;
        var iceServers = {
            'iceServers': [
                //{url: "turn:turn.wushuyi.com"}
                {url: 'stun:stun.l.google.com:19302'},
                {url: 'stun:stun.sipgate.net'},
                {url: 'stun:217.10.68.152'},
                {url: 'stun:stun.sipgate.net:10000'},
                {url: 'stun:217.10.68.152:10000'}
            ]
        };

        function onAddStream(e){
            remoteVideo.src = URL.createObjectURL(e.stream);
            remoteVideo.addEventListener('loadedmetadata', function() {
                console.log('remoteVideo is ok!');
            });
        }
        function onIceCandidate(e) {
            if(e && e.candidate){
                socket.emit('mFC.reqRtcIce', e.candidate);
            }
        }
        function onDataChannel(e) {
            var channel = e.channel;
            window.dc = dc = channel;
            initDCEvents();
        }
        function initDCEvents() {
            window.dc = dc;
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
        }

        function createOffer(){
            window.dc = dc = pc.createDataChannel('RTCDataChannel', {reliable: false});
            pc.createOffer(onCreateOffer, function(e){
                console.log(e);
            });
            initDCEvents();
            modelRtc.isShow = true;
            $cache.winWebrtc.show();
        }
        function onCreateOffer(offer){
            pc.setLocalDescription(offer, function(){
                socket.emit('mFC.reqRtcOffer', offer);
            });
        }
        function setOffer(offer){
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
                pc.createAnswer(onCreateAnswer, error, offerAnswerConstraints);
            });
        }
        function onCreateAnswer(answer) {
            pc.setLocalDescription(answer, function(){
                socket.emit('mFC.reqRtcAnswer', answer);
            });
        }
        function setAnswer(answer){
            pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
        function addStream(stream){
            pc.addStream(stream);
        }
        function setIce(e){
            if(e && e.candidate){
                pc.addIceCandidate(new RTCIceCandidate(e));
            }
        }
        function onOpen(){
            console.log('pc ok!');
        }
        function closePc(){
            pc.close();
        }
        function initPeerEvents(){
            pc.addEventListener('addstream', onAddStream);
            pc.addEventListener('icecandidate', onIceCandidate);
            pc.addEventListener('open', onOpen);
            pc.addEventListener('datachannel', onDataChannel);
        }
        function initSocket(){
            socket.on('mFC.resRtcConn', createOffer);
            socket.on('mFC.resRtcOffer', setOffer);
            socket.on('mFC.resRtcAnswer', setAnswer);
            socket.on('mFC.resRtcIce', setIce);
            socket.on('mFC.resRtcClose', closePc);
        }
        initSocket();

        window.pc = pc = new RTCPeerConnection(iceServers, { optional: [{ RtpDataChannels: true}] });
        pc.oniceconnectionstatechange = function(e){
            console.log(arguments);
        };
        pc.onsignalingstatechange = function(e){
            console.log(arguments);
        };
        initPeerEvents();

        $cache.rtcLocalBox.append(localVideo);
        $cache.rtcRemoteBox.append(remoteVideo);

        localVideo.src = cache.localMediaUrl;
        addStream(cache.localMedia);
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

    // 初始化交互接口
    modelSocket.initTransport = function() {
        var deferred = Q.defer();
        var accessToken;
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
            }else if(data.data === 'lock'){
                $cache.sketchpadLock.hide();
            }

        });
        socket.on('mFC.resSwitchTopics', function(data){
            modelClass.selectQuizCallbcak(data.quizIndex , data.quizId, true);
        });
        socket.on('mFC.resSwitchBlankPages', function(data){
            modelClass.swichBlankPagesCallBack(data.blankPagesIndex, true);
        });
        socket.on('mFC.resAddBlankPage', function(data){
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
                        currQuizId: dataCache.nowQuiz.quizId
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
                    var syncData;
                    if(nowQuiz.boardType === 1){
                        //alert('1');
                        nowQuiz.imageUrl = data;
                        syncData= {
                            imageUrl: data,
                            boardType: 1
                        };
                    }else if(dataCache.nowQuiz.boardType === 2){
                        //alert('2');
                        nowQuiz.studyBlankPages[nowQuiz.studyBlankPagesindex].blankPageUrl = data;
                        syncData= {
                            imageUrl: data,
                            boardType: 2,
                            index: nowQuiz.studyBlankPagesindex
                        };
                        console.log(nowQuiz.studyBlankPages[nowQuiz.studyBlankPagesindex]);
                    }
                    deferred.resolve(syncData);
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
            dataCache.nowQuiz.quizId = dataCache.currQuizId;
        }else{
            var quizInitData = dataCache.quizIdList[0];
            dataCache.nowQuiz.quizId = quizInitData.quizId;
        }
        dataCache.nowQuiz.index = 1;
        dataCache.nowQuiz.planIndex = 1;
        dataCache.nowQuiz.boardType = 1;
        modelDom.rightSessionNeedShow(dataCache.nowQuiz.index - 1);
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
        //modelDom.initElement()
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
            .then(modelDom.initNoFnBtn)
            .done(function(){
                modelBoard.initRemoteCtl();
                modelRtc.initWebrtc();
                modelDom.dragImg();
                modelClass.initExitClass();
                $cache.sketchpadLock.hide();
            });
    }

    init();

    function test() {
        // object to global debug
        window.socketIo = socketIo;
        window.io = io;
        window.$ = $;
        window.localforage = localforage;
        window.socket = socket;
        window.jspScrollList = jspScrollList;
        window.$cache = $cache;
        window.cache = cache;
        window.util = modelUtil;
        window.dataCache = dataCache;
        window.uploadBlobToQN = modelSocket.uploadBlobToQN;
        window.uploadQuizData = modelSocket.uploadQuizData;
        window.async = async;

        window.testBoard = function (bgUrl, fgUrl) {
            //initPlanBox(imgUrl);
            //cache.Board.setBgImg({
            //    image: imgUrl
            //});
            modelBoard.setSketchpadView(bgUrl, fgUrl);
        };

        window.dataURLtoBlob = dataURLtoBlob;
        window.transport = transport;

        // 对话框数据渲染测试
        window.taskViewTest =  function() {
            var msgs = [
                {userId: '234', content: 'test1'},
                {userId: '7310', content: 'test2'},
                {userId: '234', content: 'test3'},
                {userId: '234', content: 'test4'},
                {userId: '7310', content: 'test5'},
                {userId: '234', content: 'test6'},
                {userId: '7310', content: '<img class="input-img" src="./assets/images/beastie.png">'}
            ];
            modelTask.renderTaskView(msgs)
                .then(function (data) {
                    console.log(data);
                    var $imgs, imgLen, loadLen;
                    $cache.taskScroll.append(data);
                    $imgs = $(data).find('img');
                    imgLen = $imgs.size();
                    loadLen = 0;
                    $imgs.each(function (i, img) {
                        img.onload = function () {
                            loadLen += 1;
                            if (imgLen === loadLen) {
                                setTimeout(function () {
                                    jspScrollList.taskFn.reinitialise();
                                    jspScrollList.taskFn.scrollToBottom(0.3);
                                }, 0);
                            }
                        };
                    });
                });
        };
    }
    window.debug = test;
});