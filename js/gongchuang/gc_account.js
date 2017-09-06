/**
 * Created by yuyangyang on 2017/8/31.
 */

var gcAccount={
    Version:'1.0.0',
    Ts:Date.parse(new Date())/1000,
    user:'',
    init:function(){
        if($.cookie('gcUser')){
            gcAccount.user = JSON.parse($.cookie('gcUser'));
            console.log(gcAccount.user);
            $("#gc_user_logined").css('display','inline-block');
            $("#gc_user_login").css('display','none');

            $("#dropdownMenu1 .gc_nick").text(gcAccount.user.Nick);

            $("#gc_logout").click(function () {
                gcAccount.logout();
            });

            $("#gc_notice").css("display","inline-block");
            gcAccount.notice();   //通知查询
            
            gcAccount.userInfo();  //用户信息

            gcAccount.profileReview();  //上传头像

            $("#gc_account_save").click(function () {
                gcAccount.updatePersonal();  //更新个人信息
            });

            $("#gc_account_cancel").click(function () {
                gcAccount.userInfo();  //个人信息
            });

            //优惠券
            gcAccount.coupon();
        }

        //检测登录
        gcAccount.isLogin();

        //我的空间
        $("#gc_space").click(function () {
            if(Index.user){
                window.open("gc_space.html");
            }else{
                window.open("login.html");
            }
        });

        //我的资产
        $("#gc_asserts").click(function () {
            if(Index.user){
                window.open("gc_asserts.html");
            }else{
                window.open("login.html");
            }
        });
    },
    //通知
    notice:function () {
        var obj={
            sid:gcAccount.user.SessionId,
            begidx:0,
            counts:10,
            flag:0,
            ver: gcAccount.Version,
            ts:gcAccount.Ts
        };

        var Sign=gcAccount.md(obj);

        var params={
            sid:gcAccount.user.SessionId,
            begidx:0,
            counts:10,
            flag:0,
            ver: gcAccount.Version,
            ts:gcAccount.Ts,
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
            sid:gcAccount.user.SessionId,
            ver: gcAccount.Version,
            ts:gcAccount.Ts
        };

        var Sign = gcAccount.md(obj);

        var params={
            sid:gcAccount.user.SessionId,
            ver: gcAccount.Version,
            ts:gcAccount.Ts,
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
    //检测登录
    isLogin:function () {
        var obj={
            sid:gcAccount.user.SessionId,
            ver: gcAccount.Version,
            ts:gcAccount.Ts
        };

        var Sign = gcAccount.md(obj);

        var params={
            sid:gcAccount.user.SessionId,
            ver: gcAccount.Version,
            ts:gcAccount.Ts,
            sign:Sign
        };

        $.post(api_config.checkLogin,params,function (result){
            //console.log(result);
            if(result.Code ==3){
                window.location.href="index.html";
            }
            alert(result.Msg);
        })
    },
    //用户信息查询
    userInfo:function () {
        $("#gc_account_nick").val(gcAccount.user.Nick);
        $("#gc_account_intro").text(gcAccount.user.Intro);
        $("#gc_account_address").val(gcAccount.user.City);
        /*
        var url=api_config.downloadProfile+''+gcAccount.user.UserId;
        $('#nextview').attr('src',url);

        $('#gc_account_profile').attr('src',url);
         */
    },
    //上传头像
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
    //更新个人信息
    updatePersonal:function () {
        var Nick=$("#gc_account_nick").val(),
            Intro=$("#gc_account_intro").text(),
            City=$("#gc_account_address").val(),
            proFile=$("#nextview").attr("src");
        if(Nick && Intro && City && proFile){
            var obj={
                sid:gcAccount.user.SessionId,
                nick:Nick,
                intro:Intro,
                city:City,
                file:proFile,
                ver: gcAccount.Version,
                ts:gcAccount.Ts
            };

            var Sign=gcAccount.md(obj);

            var params={
                sid:gcAccount.user.SessionId,
                nick:Nick,
                intro:Intro,
                city:City,
                file:proFile,
                ver: gcAccount.Version,
                ts:gcAccount.Ts,
                sign:Sign
            };

            $.post(api_config.personSetting,params,function (result) {
                //console.log(result);
                alert(result.Msg);
            });
        }else{
            alert("存在未填信息，请检查！");
        }

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
    //优惠券
    coupon:function () {
        var obj={
            sid:gcAccount.user.SessionId,
            status:0,
            begidx:0,
            counts:10,
            ver: gcAccount.Version,
            ts:gcAccount.Ts
        };

        var Sign = gcAccount.md(obj);

        var params={
            sid:gcAccount.user.SessionId,
            status:0,
            begidx:0,
            counts:10,
            ver: gcAccount.Version,
            ts:gcAccount.Ts,
            sign:Sign
        };

        $.post(api_config.exchangCoupon,params,function (result) {
           console.log(result);
        });
    }
};

$(document).ready(function () {
    gcAccount.init();
});
