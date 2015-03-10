/**
 * Created by shuyi.wu on 2015/3/10.
 */
define([
        'wsy/emitter'
    ],
    function (
        emitter
    ) {
        'use strict';

        function Content(io, uri, opts){
            var socket, mySocket = {}, events, bindFn;
            events = [
                'connect',
                'connect_error',
                'connect_timeout',
                'reconnect',
                'reconnect_attempt',
                'reconnecting',
                'reconnect_error',
                'reconnect_failed'
            ];

            socket = io.connect(uri, opts);
            emitter(mySocket);
            mySocket._emit = mySocket.emit;

            bindFn = function(event){
                socket.on(event, function(){  //console.log([
                    //    event,
                    //    arguments
                    //]);

                    console.log(mySocket);
                    mySocket._emit(event, arguments);
                });
            };

            mySocket.emit = function(name, data){
                var nameSplit,namespace,type;
                nameSplit = name.split('.');
                if(nameSplit.length === 2){
                    namespace = nameSplit[0];
                    type = nameSplit[1];
                    socket.emit('onData', {type: namespace, code: type, data: data});
                }else{
                    socket.emit('onData', {code: name, data: data});
                }
            };

            for(var i = 0, len = events.length; i < len; i++){
                var eventName = events[i];
                bindFn(eventName);
            }

            socket.once('connect', function(){
                socket.on('onData', function(data){
                    var emitName;
                    if(data.type){
                        emitName = data.type + '.' + data.code;
                    }else{
                        emitName = data.code;
                    }
                    if(!data.success){
                        mySocket._emit('error', {
                            emit: emitName,
                            info: data.info
                        });
                        return;
                    }
                    console.log(emitName);
                    if(!data.result){
                        mySocket._emit(emitName);
                    }else{
                        mySocket._emit(emitName);
                    }
                });
            });

            return mySocket;
        }

        return Content;
    }
);