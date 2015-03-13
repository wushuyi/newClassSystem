function(){
    return Q.Promise(function(resolve, reject, notify){
        transport.login()
            .then(transport.getUserId)
            .then(function(data){
                console.log(data);
                transport.getUserInfo(dataCache.myUserId)
                    .then(function(data){
                        //console.log(data);
                        transport.inRoom().then(function(data){
                            transport.classList()
                                .then(function(data){
                                    console.log(data);
                                    var testId = 1520;
                                    transport.getQuizInfoById(testId)
                                        .then(function(data){
                                            console.log(data);
                                        });
                                });
                        });
                        socket.on('mFC.resBoardDraw', function(data){
                            cache.Board.onReceiveBoardData(data.draw);
                        });
                        cache.Board.onSendBoardData = function(data){
                            socket.emit('mFC.reqBoardDraw', {
                                draw: data
                            });
                        };
                    });

            });
        resolve();
    });
}

var data = {"quizIdListResults":[{"knowledgeId":"92","knowledgeName":"短语类型判定","quizIds":[1512]},{"knowledgeId":"130","knowledgeName":"社科文标题的含义同步","quizIds":[9782,9783]},{"knowledgeId":"133","knowledgeName":"社科文词语含义提高","quizIds":[5449,5450]}]};