//var cache = {};
//
//var shoRunTime = function(time){
//    cache.strictTime = new Date('2000-01-01T00:00:00.000');
//    cache.startTime = time ? new Date(time) : new Date();
//    cache.timeDiff = cache.startTime - cache.strictTime;
//    cache.loopShowTime = setInterval(function(){
//        cache.nowTime = new Date();
//        cache.allTime = cache.nowTime - cache.strictTime;
//        cache.showTime = cache.allTime - cache.timeDiff;
//        cache.newTime = new Date(cache.strictTime.getTime() + cache.showTime);
//        console.log(cache.newTime.toISOString());
//    }, 1000);
//};

function RunTime(time){
    this._startDate = time ? new Date(time) : new Date();
}

RunTime.prototype._addNum = function(num, n){
    var len = num.toString().length;
    while(len < n) {
        num = "0" + num;
        len++;
    }
    if(typeof num === "number"){
        num.toString()
    }
    return num;
};

RunTime.prototype.getStartDate = function(){
    return this._startDate;
};

RunTime.prototype.getRunTime = function(){
    return new Date() - this._startDate;
};

RunTime.prototype.getRunTimeISO = function(){
    return new Date(this.getRunTime()).toISOString();
};

RunTime.prototype.getRunTimeJson = function(type){
    var time,jsonData ={}, split1, split2, split3, split4, split1end, split2end, split3end;
    time = this.getRunTimeISO();
    split1 =  time.split('-');
    jsonData.year = split1[0] - 1970;
    jsonData.mouth = split1[1] - 1;
    split1end = split1[2];
    split2 = split1end.split('T');
    jsonData.day = split2[0] - 1;
    split2end = split2[1];
    split3 = split2end.split(':');
    jsonData.hour = +split3[0];
    jsonData.minute = +split3[1];
    split3end = split3[2];
    split4 = split3end.split('.');
    jsonData.second = +split4[0];
    if(type === 'string'){
        jsonData.year = this._addNum(jsonData.year, 4);
        jsonData.mouth = this._addNum(jsonData.mouth, 2);
        jsonData.day = this._addNum(jsonData.day, 2);
        jsonData.hour = this._addNum(jsonData.day, 2);
        jsonData.minute = this._addNum(jsonData.minute, 2);
        jsonData.second = this._addNum(jsonData.second, 2);
    }
    return jsonData;
};

var time = new RunTime();
setTimeout(function(){
    console.log(time.getRunTimeJson());
    console.log(time.getRunTimeJson('string'));
}, 3000);