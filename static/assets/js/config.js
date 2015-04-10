/**
 * Created by shuyi.wu on 2015/3/24.
 */
define([
    'jquery'
],function(
    $
){
    'use strict';
    var config = {};
    var getTokenFnRelease, getTokenFnDebug, serverToken, clientToken;

    getTokenFnRelease = function(callback){
        console.log = function(){};
        var thisFn,lessonPlanId;
        lessonPlanId = location.search.split('?')[1].split('lessonPlanId=')[1];
        thisFn = function(){
            $.ajax({
                url:'../../teacher/createEnterClassRoomCode',
                type:'post',
                dataType:'json',
                data:{lessonPlanId: lessonPlanId},
                success: function (data){
                    callback(data.data);
                    console.log(data);
                },
                error: function(){
                    setTimeout(function(){
                        thisFn();
                    }, 1000);
                }
            });
        };
        thisFn();
    };

    getTokenFnDebug = function(callback){
        var token, isServer, isClient;
        isServer = location.pathname.indexOf('service.html') !== -1;
        isClient = location.pathname.indexOf('client.html') !== -1;
        if(isServer){
            token =  serverToken;
        }
        if(isClient){
            token = clientToken;
        }
        callback(token);
    };


    // 发布时注释,debug时拥有改成静态 token
    serverToken = 'ddeead23-602f-4533-938a-0fffcd63e107';
    clientToken = 'e00f148c-1aa6-4ebe-9ab9-be03aef00dbc';

    // 发布时为 getTokenFnRelease, debug 时为 getTokenFnDebug
    config.getToken = getTokenFnDebug;

    // WebSocket 服务器地址(注意:是 http 协议头)
    config.WsServer = 'http://192.168.1.143:10010/';

    // 结束上课跳转页面设置
    config.endCLassUrl = 'https://www.baidu.com/';

    // WebRtc server list
    config.iceServers = {
        'iceServers': [
            {url: 'turn:112.124.33.246'}
            //{url: 'stun:stun.l.google.com:19302'},
            //{url: 'stun:stun.sipgate.net'},
            //{url: 'stun:217.10.68.152'},
            //{url: 'stun:stun.sipgate.net:10000'},
            //{url: 'stun:217.10.68.152:10000'}
        ]
    };
    return config;
});