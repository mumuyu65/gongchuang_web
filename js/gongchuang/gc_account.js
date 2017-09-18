/**
 * Created by yuyangyang on 2017/8/31.
 */

var gcAccount={
    Version:'1.0.0',
    Ts:Date.parse(new Date())/1000,
    user:'',
    addressArr:[],
    ImgArr:[],
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
            
            gcAccount.userInfo(gcAccount.user);  //用户信息

            gcAccount.profileReview();  //上传头像

            $("#gc_account_save").click(function () {
                gcAccount.updatePersonal();  //更新个人信息
            });

            $("#gc_account_cancel").click(function () {
                gcAccount.userInfo();  //个人信息
            });

            //优惠券
            gcAccount.coupon();

            gcAccount.queryShoppingCart();  //查询购物车
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
    userInfo:function (obj) {
        $("#gc_account_nick").val(obj.Nick);
        $("#gc_account_intro").text(obj.Intro);
        $("#gc_account_address").val(obj.City);
        var url=api_config.downloadProfile+''+obj.UserId;
        $('#nextview').attr('src',url);
        $('#gc_account_profile').attr('src',url);
    },
    //上传头像
    profileReview:function () {
        var _upFile=document.getElementById("file");

        var objUrl;
        var img_html;

        _upFile.addEventListener("change", function() {
            var filepath = $("input[name='file']").val();
            for(var i = 0; i < this.files.length; i++) {
                objUrl = getObjectURL(this.files[i]);
                var extStart = filepath.lastIndexOf(".");
                var ext = filepath.substring(extStart, filepath.length).toUpperCase();
                /*
                 描述：鉴定每个图片上传限制
                 * */
                if(ext != ".BMP" && ext != ".PNG" && ext != ".GIF" && ext != ".JPG" && ext != ".JPEG") {
                    return false;
                } else {
                    $("#nextview").attr("src",objUrl);
                    gcAccount.ImgArr.push(this.files[i]);
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

            var param = new FormData();

            param.append('sid',gcAccount.user.SessionId);

            param.append('nick',Nick);

            param.append('intro',Intro);

            param.append('city',City);

            param.append('ver',gcAccount.Version);

            param.append('ts',gcAccount.Ts);

            param.append('file',gcAccount.ImgArr[0]);

            param.append('sign',Sign);

            // 传给后台
            $.ajax({
                url:api_config.personSetting,
                type:"post",
                data:param,
                processData:false,
                contentType:false,
                success:function(res){
                    alert(res.Msg);
                    if(res.Code ==3){
                        $.cookie("gcUser",JSON.stringify(res.Data));
                        window.location.reload();
                    }
                }
            });

        }

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
                if(res.Data){
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
    //查询购物车
    queryShoppingCart:function () {
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

        $.post(api_config.shopCartQuery,params,function (res) {
            if(res.Code == 3){
                if(res.Data){
                    $("#shop_cart_num").text(res.Data.length);
                }
            }
        })
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
    gcAccount.init();
});
