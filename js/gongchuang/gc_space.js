/**
 * Created by yuyangyang on 2017/8/28.
 */

var gcSpace={
    Version:'1.0.0',
    Ts:Date.parse(new Date())/1000,
    user:'',
    init:function () {
        //登录
        gcSpace.user = JSON.parse($.cookie('gcUser'));
        console.log(gcSpace.user);
        $("#gc_user_logined").css('display','inline-block');
        $("#gc_user_login").css('display','none');

        $("#dropdownMenu1 .gc_nick").text(gcSpace.user.Nick);

        $("#gc_logout").click(function () {
            gcSpace.logout();
        });

        $("#gc_notice").css("display","inline-block");
        gcSpace.notice();   //通知查询
    },
    //通知
    notice:function () {
        var obj={
            sid:gcSpace.user.SessionId,
            begidx:0,
            counts:10,
            flag:0,
            ver: gcSpace.Version,
            ts:gcSpace.Ts
        };

        var Sign=gcSpace.md(obj);

        var params={
            sid:gcSpace.user.SessionId,
            begidx:0,
            counts:10,
            flag:0,
            ver: gcSpace.Version,
            ts:gcSpace.Ts,
            sign:Sign
        };

        $.post(api_config.messageQuery,params,function (result) {
            console.log(result);
            if(result.Code ==3){
                var notice_num = result.Data.Total;
                $("#gc_notice .alert").text(notice_num);
                if(notice_num == 0){
                    $('#gc_notice .notice-info').addClass("text-center");
                    $('#gc_notice .notice-info').text("暂无任何消息通知");
                }else{
                    var notice_data = result.Data.Detail;

                    var notice_len = notice_data.length;
                    $('#gc_notice .notice-info').empty();
                    for(var i =0 ; i < notice_len;i++){
                        var notice_info = '<ul class="notice-item list-inline">'+
                            ' <li><img src="'+notice_data[i].imgurl+'" alt="" class="img-circle" /></li>'+
                            ' <li><h4>'+notice_data[i].title+'</h4></li>'+
                            '<li><h5>'+notice_data[i].content+'</h5></li>'+
                            ' </ul>';

                        $('#gc_notice .notice-info').append(notice_info);
                    }
                }
            }
        });
    },
    //退出
    logout:function () {
        var obj={
            sid:gcSpace.user.SessionId,
            ver: gcSpace.Version,
            ts:gcSpace.Ts
        };

        var Sign = gcSpace.md(obj);

        var params={
            sid:gcSpace.user.SessionId,
            ver: gcSpace.Version,
            ts:gcSpace.Ts,
            sign:Sign
        };

        $.post(api_config.logout,params,function (result) {
            if(result.Code ==3){
                $.cookie('gcUser', '', { expires: -1 }); // 删除 cookie
                window.location.href="index.html";
            }
            alert(result.Msg);
        });
    },
    dateStamp:function (tm){
        //获取一个事件戳
        var time = new Date(tm);
        //获取年份信息
        var y = time.getFullYear();
        //获取月份信息，月份是从0开始的
        var m = time.getMonth() + 1;
        //获取天数信息
        var d = time.getDate();

        var H = time.getHours();

        var M = time.getMinutes();

        var S = time.getSeconds();
        //返回拼接信息
        return Index.add(H) + '：' + Index.add(M);
    },
    add:function(m) {
        return m < 10 ? '0' + m : m
    },
    md:function (obj) {
        var _arr = new Array();

        var str = new String();

        for(var o in obj){
            _arr.push(o);
        }

        _arr = _arr.sort();

        for(var i in _arr){
            str +=_arr[i] + '='+obj[_arr[i]]+'&'
        }

        str = str + 'key=cmHsE0VMDXLcGBmaoepS&0b#WcVyH@c5';

        return md5(str);
    },
};


$(document).ready(function () {
    gcSpace.init();
});