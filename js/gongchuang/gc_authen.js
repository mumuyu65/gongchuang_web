/**
 * Created by admin on 2017/9/12.
 */

var gcAuthen={
    Version:'1.0.0',
    Ts:Date.parse(new Date())/1000,
    user:'',
    Pimg:'',
    Nimg:'',
    init:function () {
        gcAuthen.user = JSON.parse($.cookie('gcUser'));
        $("#gc_user_logined").css('display','inline-block');
        $("#gc_user_login").css('display','none');

        $("#dropdownMenu1 .gc_nick").text(gcAuthen.user.Nick);

        $("#gc_logout").click(function () {
            gcAuthen.logout();
        });

        $("#gc_notice").css("display","inline-block");
        gcAuthen.notice();   //通知查询

        //查询购物车
        gcAuthen.queryShoppingCart();
        
        //身份验证
        $("#gc_authen_save").click(function () {
            gcAuthen.save();
        });

        //上传身份证
        gcAuthen.profileReview_p();

        gcAuthen.profileReview_n();
    },
    //通知
    notice:function () {
        var obj={
            sid:gcAuthen.user.SessionId,
            begidx:0,
            counts:10,
            flag:0,
            ver: gcAuthen.Version,
            ts:gcAuthen.Ts
        };

        var Sign=gcAuthen.md(obj);

        var params={
            sid:gcAuthen.user.SessionId,
            begidx:0,
            counts:10,
            flag:0,
            ver: gcAuthen.Version,
            ts:gcAuthen.Ts,
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
            sid:gcAuthen.user.SessionId,
            ver: gcAuthen.Version,
            ts:gcAuthen.Ts
        };

        var Sign = gcAuthen.md(obj);

        var params={
            sid:gcAuthen.user.SessionId,
            ver: gcAuthen.Version,
            ts:gcAuthen.Ts,
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
    //查询购物车
    queryShoppingCart:function () {
        var obj={
            sid:gcAuthen.user.SessionId,
            ver: gcAuthen.Version,
            ts:gcAuthen.Ts
        };

        var Sign = gcAuthen.md(obj);

        var params={
            sid:gcAuthen.user.SessionId,
            ver: gcAuthen.Version,
            ts:gcAuthen.Ts,
            sign:Sign
        };

        $.post(api_config.shopCartQuery,params,function (res) {
            if(res.Code == 3){
                if(res.Data){
                    $("#shop_cart_num").text(res.Data.length);
                }
            }
        })
    },
    save:function () {
        var Realname = $("#realname").val(),
            Pimg=$("#pimg img").attr("src"),
            Nimg=$("#nimg img").attr("src"),
            Idnumber = $("#idnumber").val();

        if(Realname && Idnumber && Pimg && Nimg){
            var obj={
                sid:gcAuthen.user.SessionId,
                realname:Realname,
                idnumber:Idnumber,
                ver: gcAuthen.Version,
                ts: gcAuthen.Ts
            };

            var Sign = gcAuthen.md(obj);

            var params = new FormData();

            params.append('sid',gcAuthen.user.SessionId);

            params.append('realname',Realname);

            params.append('idnumber',Idnumber);

            params.append('ver',gcAuthen.Version);

            params.append('ts',gcAuthen.Ts);

            params.append('pimg',gcAuthen.Pimg);

            params.append('nimg',gcAuthen.Nimg);

            params.append('sign',Sign);

            $.ajax({
                url:api_config.authentication,
                method:'post',
                data:params,
                processData:false,
                contentType:false,
                success:function(res){
                    alert(res.Msg);
                    if(res.Code ==3){
                        window.location.href = 'gc_contract_sign.html';
                    }
                },
                error:function (err) {
                    console.log(err);
                }
            });
        }else{
            alert("存在空值！");
        }
    },
    //上传头像
    profileReview_p:function () {
        var _upFile=document.getElementById('file_p');

        _upFile.addEventListener("change", function() {
            var filepath = $("input[name='pimg']").val();
            for(var i = 0; i < this.files.length; i++) {
                var objUrl = getObjectURL(this.files[i]);
                var extStart = filepath.lastIndexOf(".");
                var ext = filepath.substring(extStart, filepath.length).toUpperCase();
                /*
                 描述：鉴定每个图片上传限制
                 * */
                if(ext != ".BMP" && ext != ".PNG" && ext != ".GIF" && ext != ".JPG" && ext != ".JPEG") {
                    return false;
                } else {
                    $("#pimg img").attr("src",objUrl);
                    gcAuthen.Pimg=this.files[i];
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
                    alert("上传的图片大小不能超过100k！");
                    return false;
                }
            }
            return true;
        });
    },
    profileReview_n:function () {
        var _upFile=document.getElementById('file_n');

        _upFile.addEventListener("change", function() {
            var filepath = $("input[name='nimg']").val();
            for(var i = 0; i < this.files.length; i++) {
                var objUrl = getObjectURL(this.files[i]);
                var extStart = filepath.lastIndexOf(".");
                var ext = filepath.substring(extStart, filepath.length).toUpperCase();
                /*
                 描述：鉴定每个图片上传限制
                 * */
                if(ext != ".BMP" && ext != ".PNG" && ext != ".GIF" && ext != ".JPG" && ext != ".JPEG") {
                    return false;
                } else {
                    $("#nimg img").attr("src",objUrl);
                    gcAuthen.Nimg=this.files[i];
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
                    alert("上传的图片大小不能超过100k！");
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

$(document).ready(function () {
    gcAuthen.init();
});