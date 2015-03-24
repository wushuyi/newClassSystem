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
                        thisFn(callback);
                    }, 1000);
                }
            });
        };
    };

    getTokenFnDebug = function(callback){
        var token, isServer, isClient;
        isServer = location.pathname.indexOf('server.html') !== -1;
        isClient = location.pathname.indexOf('client.html') !== -1;
        if(isServer){
            token =  serverToken;
        }
        if(isClient){
            token = clientToken;
        }
        callback(token);
    };

    config.getToken = getTokenFnDebug;
    serverToken = '2a02dc23-bdb1-4c40-9b35-40009e0bc4bb';
    clientToken = '5b12ec5a-e331-47ec-b7f2-50e59532a246';
    config.WsServer = 'http://192.168.1.109:10010/';
    return config;
});