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
    serverToken = 'a0994f63-45f1-4cf4-b994-8889832d2628';
    clientToken = 'bb296bf5-cbe3-4e8b-9aba-8641011c0d14';

    // 发布时为 getTokenFnRelease, debug 时为 getTokenFnDebug
    config.getToken = getTokenFnDebug;

    // WebSocket 服务器地址(注意:是 http 协议头)
    config.WsServer = 'http://192.168.1.109:10010/';

    // 结束上课跳转页面设置
    config.endCLassUrl = 'https://www.baidu.com/';
    return config;
});