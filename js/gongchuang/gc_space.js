/**
 * Created by yuyangyang on 2017/8/28.
 */

var gcSpace={
    Version:'1.0.0',
    Ts:Date.parse(new Date())/1000,
    user:'',
    bidx:0,
    chatFaces:[],
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

        //初始化
        $("#hd_item_comment .media-heading").text(gcSpace.user.Nick);

        $("#hd_item_comment .media-object").attr("src",api_config.downloadProfile+gcSpace.user.UserId);

        //表情
        gcSpace.chatFace();

        //发布说说
        $("#comment_publish").click(function () {
            var context = $("#hd_item_comment .hd_comment_context").html();
            if(context){
                gcSpace.publish(context);
            }else{
                alert("说说内容为空。");
            }
        });

        //上传图片
        gcSpace.profileReview();
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
        return gcSpace.add(H) + '：' + gcSpace.add(M);
    },
    month:function (tm) {
        //获取一个事件戳
        var time = new Date(tm);
        //获取月份信息，月份是从0开始的
        var m = time.getMonth() + 1;
        //获取天数信息
        var d = time.getDate();
        //返回拼接信息
        return gcSpace.add(d) + '/' + gcSpace.add(m) ;
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
    chatFace:function () {
        $.ajax({
            type:"get",
            url:"https://api.weibo.com/2/emotions.json?source=1362404091",/*url写异域的请求地址*/
            dataType:"jsonp",
            jsonpCallback:"cb",
            success:function(res){
                if(res.code ==1){
                    var len=res.data.length;
                    var temp_data= res.data;
                    gcSpace.chatFaces=temp_data;
                    $("#chat_face .chat-face-content").empty();
                    for(var i=0; i<len;i++){
                        var data_icon = temp_data[i];
                        var img=$('<img src="" alt=""/>');
                        img.attr('src',data_icon.icon);
                        img.attr('alt',data_icon.phrase);
                        $("#chat_face .chat-face-content").append(img);
                    }

                    $("#chat_face .chat-face-content>img").click(function () {
                        $("#hd_item_comment .hd_comment_context").append($(this).attr("alt"));
                        $("#chat_face").removeClass("active");
                    });

                    $("#icon_xiaolian").click(function () {
                        if($("#chat_face").hasClass("active")){
                            $("#chat_face").removeClass("active")
                        }else{
                            $("#chat_face").addClass("active");
                        }
                    });

                    //查询说说
                    gcSpace.queryTalk();

                }else{
                    console.log("请求表情图标失败！");
                }
            }
        });
    },
    publish:function (ctx) {
        var obj={
            sid:gcSpace.user.SessionId,
            text:ctx,
            ver: gcSpace.Version,
            ts:gcSpace.Ts
        };

        var Sign= gcSpace.md(obj);

        var params={
            sid:gcSpace.user.SessionId,
            text:ctx,
            ver: gcSpace.Version,
            ts:gcSpace.Ts,
            sign:Sign
        };

        $.post(api_config.talkPublish,params,function (result) {
            alert(result.Msg);
            if(result.Code ==3){
                gcSpace.queryTalk();
            }
        });
    },
    queryTalk:function () {
        var obj={
            uid:gcSpace.user.UserId,
            begidx:0,
            counts:10,
            ver: gcSpace.Version,
            ts:gcSpace.Ts
        };
        
        var Sign=gcSpace.md(obj);
        
        var params={
            uid:gcSpace.user.UserId,
            begidx:0,
            counts:10,
            ver: gcSpace.Version,
            ts:gcSpace.Ts,
            sign:Sign
        };
        
        $.post(api_config.talkQuery,params,function (result) {
            if(result.Code ==3){
                var data = result.Data.Detail;
                $("#comment_inner").empty();
                for(var i=0; i<data.length;i++){
                    var temp = data[i];
                    var hd_item_img='<div class="hd_item_img"></div>';
                    if(temp.imgurl){
                        var arr = temp.imgurl.split(";");
                        for(var j =0; j<arr.length-1;j++){
                            var comment_img = '<img src="'+arr[j]+'" />';
                            $(hd_item_img).append(comment_img);
                        }
                    }
                    var comment_item=$('<div class="hd_item">'+
                            '<div class="timer">'+gcSpace.month(temp.unix*1000)+'</div>'+
                            '<img class="img_title" src="'+api_config.downloadProfile+gcSpace.user.UserId+'" alt=""/>'+
                            '<div class="hd_item_h">'+
                            '<h4>'+gcSpace.user.Nick+'<i class="pull-right iconfont icon icon-cha" data-index="'+i+'" data-cid="'+temp.id+'"></i></h4>'+
                            '<h5>'+gcSpace.dateStamp(temp.unix*1000)+'</h5>'+
                            '<div class="hd_item_des">'+
                            '<h5>'+gcSpace.analysis(temp.text)+'</h5>'+hd_item_img+
                        '</div>'+
                        '<ul class="list-inline hd_item_comment">'+
                            '<li>'+
                            '<img src="imgs/index/dianzan.png" alt="" />'+
                            '<span style="vertical-align: middle;">'+temp.fans+'</span>'+
                            '</li>'+
                            '<li class="text-center comment"  data-index="'+i+'" data-cid="'+temp.id+'">'+
                            '<img src="imgs/index/comment.png" alt="" />'+
                            '<span style="vertical-align: middle;">'+temp.review+'</span>'+
                            '</li>'+
                            '<li class="text-center">'+
                            '<img src="imgs/index/share.png" alt="" />'+
                            '<span style="vertical-align: middle;">'+temp.viewers+'</span>'+
                            '</li>'+
                        '</ul>'+
                        '</div>'+
                        '</div>');
                    var space_comment = '<div class="space_comment"></div>';
                    comment_item.append(space_comment);
                    $("#comment_inner").append(comment_item);
                }

                $("#comment_inner .comment").click(function () {
                    var comment_num= $(this).find("span").text();
                    var Idx=$(this).attr("data-index");

                    var cid= $(this).attr("data-cid");
                    if(parseInt(comment_num)>0){
                        if($("#comment_inner .hd_item").eq(Idx).find(".space_comment").hasClass("active")){
                            $("#comment_inner .hd_item").eq(Idx).find(".space_comment").removeClass("active")
                        }else{
                            $("#comment_inner .hd_item").eq(Idx).find(".space_comment").addClass("active");
                            //查看评论详情
                            gcSpace.commentList(cid,Idx,0,10);
                        }
                    }
                });

                //删除
                $("#comment_inner .icon-cha").click(function () {
                    var Idx=$(this).attr("data-index");

                    var cid= $(this).attr("data-cid");

                    gcSpace.delComment(cid,Idx);
                });
            }
        });
    },
    commentList:function(cid,Idx,Begidx,Count){
        var obj={
            sid:gcSpace.user.SessionId,
            id:cid,
            begidx:Begidx,
            counts:Count,
            ver: gcSpace.Version,
            ts:gcSpace.Ts
        };

        var Sign=gcSpace.md(obj);

        var params={
            sid:gcSpace.user.SessionId,
            id:cid,
            begidx:Begidx,
            counts:Count,
            ver: gcSpace.Version,
            ts:gcSpace.Ts,
            sign:Sign
        };

        $.post(api_config.talkDetail,params,function (result) {
            if(result.Code ==3){
                var temp=result.Data.Detail;

                var Total = result.Data.Total;

                $("#comment_inner .hd_item").eq(Idx).find(".space_comment").empty();
                for(var i=0; i<temp.length;i++){
                    var data = temp[i].Review;
                    var hd_item_comment_inner=$(
                        '<div class="hd_item_comment_inner" style="display: block;">'+
                        '<div class="hd_icon" >'+
                        '<i class="iconfont icon icon-xiangshang"></i>'+
                        '</div>'+
                        '<div class="hd_icon_inner">'+
                        '<i class="iconfont icon icon-xiangshang"></i>'+
                        '</div>'+
                        '<div class="media">'+
                        '<a class="media-left" href="javascript:void(0)">'+
                        '<img class="media-object" src="'+data.headurl+'" alt=""/>'+
                        '</a>'+
                        '<div class="media-body">'+
                        '<h4 class="media-heading">'+data.nick+'</h4>'+
                        '<h5>'+gcSpace.dateStamp(data.unix*1000)+'</h5>'+
                        '<div class="hd_comment_content">'+data.content+
                        '</div>'+
                        '</div>'+
                        '</div>'+
                        '</div>');

                    //查看更多
                    if(Total>10){
                        var more=$('<hr/>'+
                            '<div class="text-center hd_more">'+
                                '<a href="javascript:void(0)">'+
                                '查看更多 <i class="iconfont icon icon-xiangxia-copy"></i>'+
                                '</a>'+
                            '</div>');

                        hd_item_comment_inner.append(more);

                        more.click(function () {
                            gcSpace.bidx+=10;
                            gcSpace.commentList(cid,Idx,gcSpace.bidx,10);
                        });
                    }
                    $("#comment_inner .hd_item").eq(Idx).find(".space_comment").append(hd_item_comment_inner);
                }

            }
        })
    },
    delComment:function(cid,Idx){
        var obj={
            sid:gcSpace.user.SessionId,
            id:cid,
            ver: gcSpace.Version,
            ts:gcSpace.Ts
        };

        var Sign= gcSpace.md(obj);

        var params={
            sid:gcSpace.user.SessionId,
            id:cid,
            ver: gcSpace.Version,
            ts:gcSpace.Ts,
            sign:Sign
        };

        $.post(api_config.talkDel,params,function (result) {
            alert(result.Msg);
            if(result.Code ==3){
                $("#comment_inner .hd_item").eq(Idx).remove();
            }
        });
    },
    //分析输入的聊天内容
    /*进行解析*/
    analysis:function(value) {
        var arr = value.match(/\[.{1,5}\]/g);
        if (arr) {
            for (var i = 0; i < arr.length; i++) {
                for (var j in gcSpace.chatFaces) {
                    if (arr[i] == gcSpace.chatFaces[j].phrase) {
                        var ex = '<img src="' + gcSpace.chatFaces[j].url + '"/>';
                        value = value.replace(arr[i], ex);
                        break;
                    }

                }
            }
        }
        return value;
    },
    //上传图片
    profileReview:function () {
        var _upFile=document.getElementById("file");

        _upFile.addEventListener("change", function() {
            if (_upFile.files.length === 0) {
                alert("请选择图片");
                return;
            }
            var oFile = _upFile.files[0];

            if(!new RegExp("(jpg|jpeg|png)+","gi").test(oFile.type)){
                alert("照片上传：文件类型必须是JPG、JPEG、PNG");
                return;
            }

            var reader = new FileReader();
            reader.onload = function(e) {
                var base64Img= e.target.result;
                var _ir=ImageResizer({
                    resizeMode:"auto"
                    ,dataSource:base64Img
                    ,dataSourceType:"base64"
                    ,maxWidth:1200 //允许的最大宽度
                    ,maxHeight:600 //允许的最大高度。
                    ,success:function(resizeImgBase64,canvas){
                        $('#nextview').attr('src',resizeImgBase64);
                    }
                    ,debug:true
                });
            };
            reader.readAsDataURL(oFile);
        },false);
    },
};


$(document).ready(function () {
    gcSpace.init();
});