/**
 * Created by yuyangyang on 2017/9/3.
 */

var gcCommentDetai={
    Version:'1.0.0',
    Ts:Date.parse(new Date())/1000,
    user:'',
    Comment:'',
    init:function () {
        gcCommentDetai.user = JSON.parse($.cookie('gcUser'));
        //console.log(gcCommentDetai.user);
        $("#gc_user_logined").css('display','inline-block');
        $("#gc_user_login").css('display','none');

        $("#dropdownMenu1 .gc_nick").text(gcCommentDetai.user.Nick);

        $("#gc_logout").click(function () {
            gcCommentDetai.logout();
        });

        $("#gc_notice").css("display","inline-block");
        gcCommentDetai.notice();   //通知查询

        //说说内容
        var talkDetail=JSON.parse($.cookie("talk"));
        gcCommentDetai.Comment = talkDetail;
        gcCommentDetai.details(talkDetail);

        //评论
        $("#hd_item_comment .media-heading").text(gcCommentDetai.user.Nick);

        $("#hd_item_comment .media-object").attr("src",api_config.downloadProfile+gcCommentDetai.user.UserId);

        //发表评论
        $("#comment_publish").click(function () {
            var context = $("#hd_item_comment .hd_comment_context").text();
            if(context){
                gcCommentDetai.publish(talkDetail.id,context);
            }else{
                alert("评论内容为空.");
            }
        });
    },
    //通知
    notice:function () {
        var obj={
            sid:gcCommentDetai.user.SessionId,
            begidx:0,
            counts:10,
            flag:0,
            ver: gcCommentDetai.Version,
            ts:gcCommentDetai.Ts
        };

        var Sign=gcCommentDetai.md(obj);

        var params={
            sid:gcCommentDetai.user.SessionId,
            begidx:0,
            counts:10,
            flag:0,
            ver: gcCommentDetai.Version,
            ts:gcCommentDetai.Ts,
            sign:Sign
        };

        $.post(api_config.messageQuery,params,function (result) {
            //console.log(result);
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
            sid:gcCommentDetai.user.SessionId,
            ver: gcCommentDetai.Version,
            ts:gcCommentDetai.Ts
        };

        var Sign = gcCommentDetai.md(obj);

        var params={
            sid:gcCommentDetai.user.SessionId,
            ver: gcCommentDetai.Version,
            ts:gcCommentDetai.Ts,
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
        return gcCommentDetai.add(H) + '：' + gcCommentDetai.add(M);
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
    details:function (obj) {
        $("#nick").text(obj.nick);

        $("#gc_comment .title").text(obj.nick);

        $("#gc_comment .comment_timer").text(gcCommentDetai.dateStamp(obj.unix*1000));

        $("#gc_comment .hd_item_des>h5").text(obj.text);

        $("#img_title").attr("src",obj.headurl);

        var Imgs=obj.imgurl.split(";");

        for(var i =0; i<Imgs.length-1;i++){
            var img=$('<img src="" />');
            img.attr("src",Imgs[i]);
            $("#gc_comment .hd_item_img").append(img);
        }

        $("#gc_comment .zan").text(obj.fans);

        $("#gc_comment .comment").text(obj.review);

        if(parseInt(obj.review)>0){
            $("#hd_item_comment_inner").css("display",'block');

            gcCommentDetai.talkInner(obj.id,obj.review);
        }

        $("#gc_comment .share").text(obj.viewers);
    },
    talkInner:function (uid,Count) {
        var obj={
            sid:gcCommentDetai.user.SessionId,
            id:uid,
            begidx:0,
            counts:Count,
            ver: gcCommentDetai.Version,
            ts:gcCommentDetai.Ts
        };

        var Sign=gcCommentDetai.md(obj);

        var params={
            sid:gcCommentDetai.user.SessionId,
            id:uid,
            begidx:0,
            counts:Count,
            ver: gcCommentDetai.Version,
            ts:gcCommentDetai.Ts,
            sign:Sign
        };

        $.post(api_config.talkDetail,params,function (result) {
            //console.log(result);
            if(result.Code ==3){
                var temp_data = result.Data.Detail;

                var len=temp_data.length;
                $("#hd_item_comment_inner .content").empty();
                for(var i=0; i<len;i++){
                    var data = temp_data[i].Review;
                    var item=$('<div class="media">'+
                        '<a class="media-left" href="javascript:void(0)">'+
                            '<img class="media-object" src="'+data.headurl+'" alt=""/></a>'+
                        '<div class="media-body">'+
                            '<h4 class="media-heading">'+data.nick+'</h4>'+
                            '<h5>12:30</h5>'+
                            '<div class="hd_comment_content">'+data.content+
                                '</div>'+
                        '</div>'+
                    '</div>');

                    $("#hd_item_comment_inner .content").append(item);
                }
            }
        });
    },
    publish:function (cid,ctx) {
        var obj={
            sid:gcCommentDetai.user.SessionId,
            id:cid,
            content:ctx,
            ver: gcCommentDetai.Version,
            ts:gcCommentDetai.Ts
        };

        var Sign=gcCommentDetai.md(obj);

        var params={
            sid:gcCommentDetai.user.SessionId,
            id:cid,
            content:ctx,
            ver: gcCommentDetai.Version,
            ts:gcCommentDetai.Ts,
            sign:Sign
        };

        $.post(api_config.talkComment,params,function (result) {
            alert(result.Msg);
            if(result.Code ==3){
                $("#hd_item_comment_inner").css("display",'block');
                $("#hd_item_comment .hd_comment_context").text('说点什么。。。。');
                gcCommentDetai.talkInner(cid,parseInt(gcCommentDetai.Comment.review)+1);
            }
        });


    }
};

$(document).ready(function () {
    gcCommentDetai.init();
});