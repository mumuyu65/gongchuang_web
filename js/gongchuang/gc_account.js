/**
 * Created by yuyangyang on 2017/8/31.
 */

var gcAccount={
    Version:'1.0.0',
    Ts:Date.parse(new Date())/1000,
    user:'',
    addressArr:[],
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
        }else{
            window.location.href="index.html";
        }
        //检测登录 gcAccount.isLogin();

        //收货地址
        gcAccount.queryAddress();
        $("#gc_account_address_save").click(function () {
            gcAccount.receAddress();
        });

        $("#gc_account_address_cancel").click(function () {

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
    /*检测登录
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
     */
    //用户信息查询
    userInfo:function () {
        $("#gc_account_nick").val(gcAccount.user.Nick);
        $("#gc_account_intro").text(gcAccount.user.Intro);
        $("#gc_account_address").val(gcAccount.user.City);
        var url=api_config.downloadProfile+''+gcAccount.user.UserId;
        $('#nextview').attr('src',url);
        $('#gc_account_profile').attr('src',url);
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
        if(Nick && Intro && City && proFile) {
            var obj = {
                sid: gcAccount.user.SessionId,
                nick: Nick,
                intro: Intro,
                city: City,
                ver: gcAccount.Version,
                ts: gcAccount.Ts
            };

            var Sign = gcAccount.md(obj);

            // 传给后台
            var url=api_config.personSetting+'?sid='+gcAccount.user.SessionId+'&ver='+gcAccount.Version+
            '&ts='+gcAccount.Ts+'&sign='+Sign;
            $("#home").ajaxSubmit({
                url: url,
                success: function(result) {
                    if(result.Code ==3){
                        $.cookie("gcUser",JSON.stringify(result.Data));
                        window.location.reload();
                    }
                }
            });
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
    //收货地址
    receAddress:function () {
        var Recver=$("#gc_account_recUser").val(),
            Address=$("#gc_account_detailAddress").val(),
            Phone=$("#gc_account_phone").val();

        if(Recver && Address && Phone && $("#gc_account_detailAddress").val()){
            var obj={
                sid:gcAccount.user.SessionId,
                recver:Recver,
                address:Address,
                phone:Phone,
                default:0,
                ver: gcAccount.Version,
                ts:gcAccount.Ts
            };

            var Sign = gcAccount.md(obj);

            var params={
                sid:gcAccount.user.SessionId,
                recver:Recver,
                address:Address,
                phone:Phone,
                default:0,
                ver: gcAccount.Version,
                ts:gcAccount.Ts,
                sign:Sign
            };

            $.post(api_config.receivingAddressAdd,params,function (result) {
                alert(result.Msg);
                if(result.Code==3){
                    $("#gc_account_recUser").val('');
                    $("#gc_account_detailAddress").val('');
                    $("#gc_account_phone").val('');
                    gcAccount.queryAddress();
                }
            })
        }

    },
    queryAddress:function () {
        var obj={
            sid:gcAccount.user.SessionId,
            ver: gcAccount.Version,
            ts:gcAccount.Ts
        };

        var Sign=gcAccount.md(obj);

        var params={
            sid:gcAccount.user.SessionId,
            ver: gcAccount.Version,
            ts:gcAccount.Ts,
            sign:Sign
        };

        $.post(api_config.receivingAddressQuery,params,function (res) {
            if(res.Code ==3){
                if(res.Msg !=='no data'){
                    var temp_addr = res.Data;
                    gcAccount.addressArr=temp_addr;
                    var len= temp_addr.length;
                    $("#gc_address_inner").empty();
                    for(var i = 0; i<len; i++){
                        var item =$('<div class="item">'+
                            '<div class="item_header">收货地址</div>'+
                            '<div class="item_detail">'+
                                '<h4>收件人:'+temp_addr[i].recver+'</h4>'+
                                ' <h4>地址:'+temp_addr[i].address+'</h4>'+
                                ' <h4>电话:'+temp_addr[i].phone+'</h4>'+
                            '</div>'+
                            '<div class="pull-right text-center item_opera" data-idx="'+i+'" data-id="'+temp_addr[i].id+'">'+
                                '<h5 class="editor">编辑</h5>'+
                                '<h5 class="default">设为默认收货地址</h5>'+
                                '<h5 class="del"><i class="iconfont icon icon-trash"></i>删除</h5>'+
                            '</div>'+
                        '</div>');

                        if(temp_addr[i].default == 1){
                            item.find(".item_header").text("默认地址").addClass("active");

                            item.find(".default").remove();
                        }

                        $("#gc_address_inner").append(item);
                    }

                    //设置默认收货地址
                    $("#gc_address_inner .default").click(function () {
                        var aid= $(this).parent(".item_opera").attr("data-id");
                        gcAccount.defaultAddress(aid);
                    });

                    //编辑地址
                    $("#gc_address_inner .editor").click(function () {
                        var idx= $(this).parent(".item_opera").attr("data-idx");
                        gcAccount.editAddress(idx);
                    });

                    //删除地址
                    $("#gc_address_inner .del").click(function () {
                        var idx= $(this).parent(".item_opera").attr("data-idx");
                        gcAccount.delAddress(idx);
                    });
                }
            }
        })
    },
    defaultAddress:function (Aid) {
        var obj={
            sid:gcAccount.user.SessionId,
            id:Aid,
            ver: gcAccount.Version,
            ts:gcAccount.Ts
        };

        var Sign=gcAccount.md(obj);

        var params={
            sid:gcAccount.user.SessionId,
            id:Aid,
            ver: gcAccount.Version,
            ts:gcAccount.Ts,
            sign:Sign
        };

        $.post(api_config.defaultAddress,params,function (res) {
            if(res.Code ==3){
                gcAccount.queryAddress();
            }
            alert(res.Msg);
        });
    },
    editAddress:function (Idx) {
        $("#modify").css("display",'block');
        $("#add").css("display",'none');
        var editor=gcAccount.addressArr[Idx];
        $("#gc_account_recUser").val(editor.recver);
        $("#gc_account_detailAddress").val(editor.address);
        $("#gc_account_phone").val(editor.phone);

        $("#gc_account_address_modifycancel").click(function () {
            gcAccount.queryAddress();
        });

        $("#gc_account_address_modifysave").click(function () {
            var obj={
                sid:gcAccount.user.SessionId,
                id:editor.id,
                ver: gcAccount.Version,
                ts:gcAccount.Ts
            };

            var Sign=gcAccount.md(obj);

            var params={
                sid:gcAccount.user.SessionId,
                id:editor.id,
                ver: gcAccount.Version,
                ts:gcAccount.Ts,
                sign:Sign
            };

            $.post(api_config.receivingAddressUpdate,params,function (res) {
                alert(res.Msg);
                if(res.Code ==3){
                    $("#gc_account_recUser").val('');
                    $("#gc_account_detailAddress").val('');
                    $("#gc_account_phone").val('');
                    gcAccount.queryAddress();
                }
            })
        });
    },
    delAddress:function (Idx) {
        var editor=gcAccount.addressArr[Idx];
        var obj={
            sid:gcAccount.user.SessionId,
            id:editor.id,
            ver: gcAccount.Version,
            ts:gcAccount.Ts
        };

        var Sign=gcAccount.md(obj);

        var params={
            sid:gcAccount.user.SessionId,
            id:editor.id,
            ver: gcAccount.Version,
            ts:gcAccount.Ts,
            sign:Sign
        };

        $.post(api_config.receivingAddressDel,params,function (res) {
            alert(res.Msg);
            if(res.Code ==3){
                $("#gc_address_inner .item").eq(Idx).remove();
            }
        })
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
            //console.log(result);
        });

        //TODO
        $("#home_1 .tab-content-inner").empty();

        $("#ejb .tab-content-inner").empty();

        $("#home_1 .tab-content-inner").html('<img src="imgs/noquan.png" />');
        $("#ejb .tab-content-inner").html('<img src="imgs/noquan.png" />');
    },
};

$(document).ready(function () {
    gcAccount.init();
});
