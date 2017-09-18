/**
 * Created by yuyangyang on 2017/9/3.
 */

var gcCommentDetai={
    Version:'1.0.0',
    Ts:Date.parse(new Date())/1000,
    user:'',
    Comment:'',
    ImgArr:[],
    init:function () {
        gcCommentDetai.user = JSON.parse($.cookie('gcUser'));
        $("#gc_user_logined").css('display','inline-block');
        $("#gc_user_login").css('display','none');

        $("#dropdownMenu1 .gc_nick").text(gcCommentDetai.user.Nick);

        $("#gc_logout").click(function () {
            gcCommentDetai.logout();
        });

        $("#gc_notice").css("display","inline-block");
        gcCommentDetai.notice();   //通知查询

        //说说内容
        var talkid=JSON.parse($.cookie("talkId"));
        gcCommentDetai.Content(talkid);
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

        //上传图片
        $("#add_img").click(function () {
            if($("#img_inner").parent(".img-inner").hasClass("active")){
                $("#img_inner").parent(".img-inner").removeClass("active");
            }else{
                $("#img_inner").parent(".img-inner").addClass("active");
                gcCommentDetai.profileReview();
            }
        });

        //查询购物车
        gcCommentDetai.queryShoppingCart();

        //点赞
        $("#gc_comment .zan").click(function () {
            gcCommentDetai.thumbUp(talkDetail);
        });
    },
    Content:function (Id) {
        var obj={
            begidx:0,
            counts:10,
            ver: gcCommentDetai.Version,
            ts:gcCommentDetai.Ts
        };

        var Sign=gcCommentDetai.md(obj);

        var params={
            begidx:0,
            counts:10,
            sign:Sign,
            ver: gcCommentDetai.Version,
            ts:gcCommentDetai.Ts
        };

        $.post(api_config.talkQuery,params,function (result) {
            if(result.Code ==3){
                if(result.Data){
                    var temp_comment = result.Data.Detail;
                    var comment_len = temp_comment.length;
                    for(var i =0; i<comment_len;i++) {
                        var comment_data = temp_comment[i];
                        if(comment_data.id ==Id ){
                            gcCommentDetai.details(comment_data);
                        }
                    }
                }
            }
        })
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
                            '<h5>'+gcCommentDetai.dateStamp(data.unix*1000)+'</h5>'+
                            '<div class="hd_comment_content">'+data.content+
                                '</div>'+
                        '</div>'+
                    '</div>');

                    var hd_item_img=$('<div class="hd_item_img"></div>');
                    if(data.imgurl){
                        var arr = data.imgurl.split(";");
                        for(var j =0; j<arr.length-1;j++){
                            var comment_img = '<img src="'+arr[j]+'" />';
                            hd_item_img.append(comment_img);
                        }

                        item.find(".hd_comment_content").append(hd_item_img);
                    }

                    $("#hd_item_comment_inner .content").append(item);
                }
            }
        });
    },
    publish:function (cid,ctx) {
        var Imgs = gcCommentDetai.ImgArr.length;
        if(Imgs>0){
            var obj={
                sid:gcCommentDetai.user.SessionId,
                id:cid,
                content:ctx,
                imgs:Imgs,
                ver: gcCommentDetai.Version,
                ts:gcCommentDetai.Ts
            };

            var Sign=gcCommentDetai.md(obj);

            var param = new FormData();

            param.append('sid',gcCommentDetai.user.SessionId);

            param.append('content',ctx);

            param.append('id',cid);

            param.append('imgs',Imgs);

            param.append('ver',gcCommentDetai.Version);

            param.append('ts',gcCommentDetai.Ts);

            param.append('sign',Sign);

            for(var i =0 ; i<Imgs;i++){
                var num = i+1;
                var img = 'img'+num;
                param.append(img,gcCommentDetai.ImgArr[i]);
            }

            $.ajax({
                url:api_config.talkComment,
                type:"post",
                data:param,
                processData:false,
                contentType:false,
                success:function(res){
                    alert(res.Msg);
                    if(res.Code ==3){
                        var Count = parseInt(gcCommentDetai.Comment.review)+1;
                        gcCommentDetai.talkInner(cid,Count);

                        $("#gc_comment .comment").text(Count);

                        $("#hd_item_comment_inner").css("display",'block');

                        $("#hd_item_comment_inner .hd_comment_context").html("说点什么");

                        $("#img_inner").empty();
                    }
                }
            });

        }else{
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
                    var Count = parseInt(gcCommentDetai.Comment.review)+1;
                    $("#hd_item_comment_inner").css("display",'block');
                    $("#hd_item_comment .hd_comment_context").text('说点什么。。。。');
                    gcCommentDetai.talkInner(cid,Count);
                    $("#gc_comment .comment").text(Count);
                }
            });
        }
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

                    gcCommentDetai.ImgArr.push(this.files[i]);
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
    //查询购物车
    queryShoppingCart:function () {
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

        $.post(api_config.shopCartQuery,params,function (res) {
            if(res.Code == 3){
                $("#shop_cart_num").text(res.Data.length);
            }
        })
    },
    dateStamp:function (tm){
        //获取一个事件戳
        var time = new Date(tm);

        var H = time.getHours();

        var M = time.getMinutes();
        //返回拼接信息
        return gcCommentDetai.add(H) + '：' + gcCommentDetai.add(M);
    },
    add:function(m) {
        return m < 10 ? '0' + m : m
    },
    //点赞
    thumbUp:function (Obj) {
        var obj={
            sid:gcCommentDetai.user.SessionId,
            id:Obj.id,
            ver: gcCommentDetai.Version,
            ts:gcCommentDetai.Ts
        };

        var Sign = gcCommentDetai.md(obj);

        var params={
            sid:gcCommentDetai.user.SessionId,
            id:Obj.id,
            ver: gcCommentDetai.Version,
            ts:gcCommentDetai.Ts,
            sign:Sign
        };

        $.post(api_config.fans,params,function (result) {
            alert(result.Msg);
            window.location.href="index.html";
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
    gcCommentDetai.init();
});