/**
 * Created by yuyangyang on 2017/8/28.
 */

var gcSpace={
    Version:'1.0.0',
    Ts:Date.parse(new Date())/1000,
    user:'',
    bidx:0,
    chatFaces:[],
    ImgArr:[],
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
            var context = $("#hd_item_comment .hd_comment_context").text();
            if(context){
                gcSpace.publish(context);
            }else{
                alert("说说内容为空。");
            }
        });

        //上传图片
        $("#add_img").click(function () {
            if($("#img_inner").parent(".img-inner").hasClass("active")){
                $("#img_inner").parent(".img-inner").removeClass("active");
            }else{
                $("#img_inner").parent(".img-inner").addClass("active");
                gcSpace.profileReview();
            }
        });
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
        var Imgs = gcSpace.ImgArr.length;

        if(Imgs>0){
            var obj={
                sid:gcSpace.user.SessionId,
                text:ctx,
                imgs:Imgs,
                ver: gcSpace.Version,
                ts:gcSpace.Ts
            };

            var Sign= gcSpace.md(obj);

            var param = new FormData();

            param.append('sid', gcSpace.user.SessionId);

            param.append('text',ctx);

            param.append('imgs',Imgs);

            param.append('ver',gcSpace.Version);

            param.append('ts',gcSpace.Ts);

            param.append('sign',Sign);

            for(var i =0 ; i<Imgs;i++){
                var num = i+1;
                var img = 'img'+num;
                param.append(img,gcSpace.ImgArr[i]);
            }
            $.ajax({
                url:api_config.talkPublish,
                type:"post",
                data:param,
                processData:false,
                contentType:false,
                success:function(res){
                    alert(res.Msg);
                    if(res.Code ==3){
                        gcSpace.queryTalk();
                    }
                }
            });
        }else{
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
        }
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
                    var comment_item=$('<div class="hd_item">'+
                            '<div class="timer">'+gcSpace.month(temp.unix*1000)+'</div>'+
                            '<img class="img_title" src="'+api_config.downloadProfile+gcSpace.user.UserId+'" alt=""/>'+
                            '<div class="hd_item_h">'+
                            '<h4>'+gcSpace.user.Nick+'<i class="pull-right iconfont icon icon-cha" data-index="'+i+'" data-cid="'+temp.id+'"></i></h4>'+
                            '<h5>'+gcSpace.dateStamp(temp.unix*1000)+'</h5>'+
                            '<div class="hd_item_des">'+
                            '<h5>'+gcSpace.analysis(temp.text)+'</h5>'+
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
                    var hd_item_img=$('<div class="hd_item_img"></div>');
                    if(temp.imgurl){
                        var arr = temp.imgurl.split(";");
                        for(var j =0; j<arr.length-1;j++){
                            var comment_img = '<img src="'+arr[j]+'" />';
                            hd_item_img.append(comment_img);
                        }

                        comment_item.find(".hd_item_des").append(hd_item_img);
                    }

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

                    var Icon ='<div class="hd_icon" >'+
                        '<i class="iconfont icon icon-xiangshang"></i>'+
                        '</div>'+
                        '<div class="hd_icon_inner">'+
                        '<i class="iconfont icon icon-xiangshang"></i>'+
                        '</div>';
                    $("#comment_inner .hd_item").eq(Idx).find(".space_comment").
                    find('.hd_item_comment_inner').eq(0).append(Icon);
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
        var objUrl;
        var img_html;

        $("#myFile").change(function() {
            var img_div = $("#img_inner");
            var filepath = $("input[name='myFile']").val();
            for(var i = 0; i < this.files.length; i++) {
                objUrl = getObjectURL(this.files[i]);
                console.log(objUrl);
                var extStart = filepath.lastIndexOf(".");
                var ext = filepath.substring(extStart, filepath.length).toUpperCase();
                /*
                 描述：鉴定每个图片上传尾椎限制
                 * */
                if(ext != ".BMP" && ext != ".PNG" && ext != ".GIF" && ext != ".JPG" && ext != ".JPEG") {
                    $(".shade").fadeIn(500);
                    $(".text_span").text("图片限于bmp,png,gif,jpeg,jpg格式");
                    this.value = "";
                    $("#img_inner").html("");
                    return false;
                } else {
                    /*
                     若规则全部通过则在此提交url到后台数据库
                     * */
                    img_html = "<div class='isImg'>" +
                        "<img src='" + objUrl + "' onclick='javascript:lookBigImg(this)' style='height: 100%; width: 100%;' />" +
                        "<button class='removeBtn' onclick='javascript:removeImg(this)'>x</button></div>";
                    img_div.append(img_html);

                    gcSpace.ImgArr.push(this.files[i]);
                }
            }
            /*
             描述：鉴定每个图片大小总和
             * */
            var file_size = 0;
            var all_size = 0;
            for(j = 0; j < this.files.length; j++) {
                file_size = this.files[j].size;
                all_size = all_size + this.files[j].size;
                var size = all_size / 1024;
                if(size > 500) {
                    $(".shade").fadeIn(500);
                    $(".text_span").text("上传的图片大小不能超过100k！");
                    this.value = "";
                    $(".img_div").html("");
                    return false;
                }
            }
            return true;
        });
    },
};


/*
 描述：鉴定每个浏览器上传图片url 目前没有合并到Ie
 * */
function getObjectURL(file) {
    var url = null;
    if(window.createObjectURL != undefined) { // basic
        url = window.createObjectURL(file);
    } else if(window.URL != undefined) { // mozilla(firefox)
        url = window.URL.createObjectURL(file);
    } else if(window.webkitURL != undefined) { // webkit or chrome
        url = window.webkitURL.createObjectURL(file);
    }
    return url;
}

/*
 描述：上传图片附带删除 再次地方可以加上一个ajax进行提交到后台进行删除
 * */
function removeImg(r){
    $(r).parent().remove();
}

/*
 描述：上传图片附带放大查看处理
 * */
function lookBigImg(b){
    $(".shadeImg").fadeIn(500);
    $(".showImg").attr("src",$(b).attr("src"))
}

/*
 描述：关闭弹出层
 * */
function closeShade(){
    $(".shade").fadeOut(500);
}

/*
 描述：关闭弹出层
 * */
function closeShadeImg(){
    $(".shadeImg").fadeOut(500);
}


$(document).ready(function () {
    gcSpace.init();
});