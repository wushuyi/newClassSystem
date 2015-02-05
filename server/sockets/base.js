/**
 * Created by Administrator on 2015/2/4.
 */
module.exports = function (io) {
    var board = io.of('/board');
    board.on('connection', function(socket){
       console.log(socket.id);
        socket.on('hello', function(data){
            console.log('Hello, ' + data);
        });
    });
};