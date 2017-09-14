/**
 * Created by yangyangyu on 2017/8/30.
 * 结算页面
 */

var gcCleaning={
    Version:'1.0.0',
    Ts:Date.parse(new Date())/1000,
    user:'',
    addressArr:[],
    products:[],
    init:function () {
        gcCleaning.user = JSON.parse($.cookie('gcUser'));
        $("#gc_user_logined").css('display','inline-block');
        $("#gc_user_login").css('display','none');

        $("#dropdownMenu1 .gc_nick").text(gcCleaning.user.Nick);

        //退出
        $("#gc_logout").click(function () {
            gcCleaning.logout();
        });

        $("#gc_notice").css("display","inline-block");

        gcCleaning.notice();   //通知查询

        gcCleaning.queryAddress();  //查询地址

        gcCleaning.queryShoppingCart();  //查询购物车

        //添加新地址
        $("#gc_address_new").click(function () {
            if($("#gc_address_new_content").hasClass("active")){
                $("#gc_address_new_content").removeClass('active');
            }else{
                $("#gc_address_new_content").addClass('active');
            }
        });

        $("#gc_address_new_save").click(function () {
            gcCleaning.receAddress();
        });

        $("#gc_address_new_cancel").click(function () {
            $("#gc_address_new_content").removeClass('active');
        });
        
        //订购
        $("#gc_cleaning_pay").click(function () {
            var Tax = $("#gc_cleaning_tax").val(),
                Name = $("#gc_cleaning_name").val();

            if(gcCleaning.addressArr && Tax && Name){
                gcCleaning.settleMent(Tax,Name);
            }else{
                alert("必填选项为空！");
            }
        });
    },
    //通知
    notice:function () {
        var obj={
            sid:gcCleaning.user.SessionId,
            begidx:0,
            counts:10,
            flag:0,
            ver: gcCleaning.Version,
            ts:gcCleaning.Ts
        };

        var Sign=gcCleaning.md(obj);

        var params={
            sid:gcCleaning.user.SessionId,
            begidx:0,
            counts:10,
            flag:0,
            ver: gcCleaning.Version,
            ts:gcCleaning.Ts,
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
            sid:gcCleaning.user.SessionId,
            ver: gcCleaning.Version,
            ts:gcCleaning.Ts
        };

        var Sign = gcCleaning.md(obj);

        var params={
            sid:gcCleaning.user.SessionId,
            ver: gcCleaning.Version,
            ts:gcCleaning.Ts,
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
    //查询地址
    queryAddress:function () {
        var obj={
            sid:gcCleaning.user.SessionId,
            ver: gcCleaning.Version,
            ts:gcCleaning.Ts
        };

        var Sign=gcCleaning.md(obj);

        var params={
            sid:gcCleaning.user.SessionId,
            ver: gcCleaning.Version,
            ts:gcCleaning.Ts,
            sign:Sign
        };

        $.post(api_config.receivingAddressQuery,params,function (res) {
            if(res.Code ==3){
                if(res.Msg !=='no data'){
                    var temp_addr = res.Data;
                    gcCleaning.addressArr=temp_addr;
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
                        gcCleaning.defaultAddress(aid);
                    });

                    //编辑地址
                    $("#gc_address_inner .editor").click(function () {
                        var idx= $(this).parent(".item_opera").attr("data-idx");
                        gcCleaning.editAddress(idx);
                    });

                    //删除地址
                    $("#gc_address_inner .del").click(function () {
                        var idx= $(this).parent(".item_opera").attr("data-idx");
                        gcCleaning.delAddress(idx);
                    });
                }
            }
        })
    },
    //查询购物车
    queryShoppingCart:function () {
        var obj={
            sid:gcCleaning.user.SessionId,
            ver: gcCleaning.Version,
            ts:gcCleaning.Ts
        };

        var Sign = gcCleaning.md(obj);

        var params={
            sid:gcCleaning.user.SessionId,
            ver: gcCleaning.Version,
            ts:gcCleaning.Ts,
            sign:Sign
        };

        $.post(api_config.shopCartQuery,params,function (res) {
            if(res.Code == 3){
                $("#shop_cart_num").text(res.Data.length);
                gcCleaning.products = res.Data;
                gcCleaning.details(res.Data);
            }
        })
    },
    details:function (arr) {
        var len = arr.length;
        $("#gc_cleaning_products").empty();
        for(var i=0; i<len;i++){
            var totalMoney=parseInt(arr[i].order_quantity)*parseFloat(arr[i].discount_price);
            var item=$('<div class="media">'+
            '<a class="media-left" href="javacript:void(0)">'+
                '<img class="media-object" src="'+arr[i].coverurl+'"  alt="" style="width:277px; height:248px;"/>'+
            '</a>'+
            '<div class="media-body">'+
                '<h3 class="media-heading">'+arr[i].product_name+'</h3>'+
                '<ul class="list-inline">'+
                    '<li>颜色：'+arr[i].style+'</li>'+
                    '<li>支配方式：'+arr[i].hosted_mid+'</li>'+
                    '<li>托管城市:'+arr[i].hosted_city+'</li>'+
                '</ul>'+
                '<ol class="list-unstyled">'+
                    '<li style="font-size:20px">数量：'+arr[i].order_quantity+'</li>'+
                    '<li style="font-size:20px; color:#C02D28;">&yen; '+totalMoney+'</li>'+
                '</ol>'+
                '</div>'+
            '</div>');

            $("#gc_cleaning_products").append(item);
        }
    },
    //收货地址
    receAddress:function () {
        var Recver=$("#gc_account_recUser").val(),
            Address=$("#gc_account_detailAddress").val(),
            Phone=$("#gc_account_phone").val();

        if(Recver && Address && Phone && $("#gc_account_detailAddress").val()){
            var obj={
                sid:gcCleaning.user.SessionId,
                recver:Recver,
                address:Address,
                phone:Phone,
                default:0,
                ver: gcCleaning.Version,
                ts:gcCleaning.Ts
            };

            var Sign = gcCleaning.md(obj);

            var params={
                sid:gcCleaning.user.SessionId,
                recver:Recver,
                address:Address,
                phone:Phone,
                default:0,
                ver: gcCleaning.Version,
                ts:gcCleaning.Ts,
                sign:Sign
            };

            $.post(api_config.receivingAddressAdd,params,function (result) {
                alert(result.Msg);
                if(result.Code==3){
                    $("#gc_account_recUser").val('');
                    $("#gc_account_detailAddress").val('');
                    $("#gc_account_phone").val('');
                    gcCleaning.queryAddress();
                }
            })
        }
    },
    defaultAddress:function (Aid) {
        var obj={
            sid:gcCleaning.user.SessionId,
            id:Aid,
            ver: gcCleaning.Version,
            ts:gcCleaning.Ts
        };

        var Sign=gcCleaning.md(obj);

        var params={
            sid:gcCleaning.user.SessionId,
            id:Aid,
            ver: gcCleaning.Version,
            ts:gcCleaning.Ts,
            sign:Sign
        };

        $.post(api_config.defaultAddress,params,function (res) {
            if(res.Code ==3){
                gcCleaning.queryAddress();
            }
            alert(res.Msg);
        });
    },
    editAddress:function (Idx) {
        $("#gc_address_new_content").addClass('active');
        $("#gc_account_address_modifysave").css("display",'inline-block');
        $("#gc_address_new_save").remove();
        var editor=gcCleaning.addressArr[Idx];
        $("#gc_account_recUser").val(editor.recver);
        $("#gc_account_detailAddress").val(editor.address);
        $("#gc_account_phone").val(editor.phone);

        $("#gc_account_address_modifysave").click(function () {
            var obj={
                sid:gcCleaning.user.SessionId,
                id:editor.id,
                ver: gcCleaning.Version,
                ts:gcCleaning.Ts
            };

            var Sign=gcCleaning.md(obj);

            var params={
                sid:gcCleaning.user.SessionId,
                id:editor.id,
                ver: gcCleaning.Version,
                ts:gcCleaning.Ts,
                sign:Sign
            };

            $.post(api_config.receivingAddressUpdate,params,function (res) {
                alert(res.Msg);
                if(res.Code ==3){
                    $("#gc_account_recUser").val('');
                    $("#gc_account_detailAddress").val('');
                    $("#gc_account_phone").val('');
                    $("#gc_address_new_content").removeClass('active');
                    gcCleaning.queryAddress();
                }
            })
        });
    },
    delAddress:function (Idx) {
        var editor=gcCleaning.addressArr[Idx];
        var obj={
            sid:gcCleaning.user.SessionId,
            id:editor.id,
            ver: gcCleaning.Version,
            ts:gcCleaning.Ts
        };

        var Sign=gcCleaning.md(obj);

        var params={
            sid:gcCleaning.user.SessionId,
            id:editor.id,
            ver: gcCleaning.Version,
            ts:gcCleaning.Ts,
            sign:Sign
        };

        $.post(api_config.receivingAddressDel,params,function (res) {
            alert(res.Msg);
            if(res.Code ==3){
                $("#gc_address_inner .item").eq(Idx).remove();
            }
        })
    },
    //订购
    settleMent:function (Tax,Name) {
        var Addr,Ids;
        for(var i = 0; i<gcCleaning.addressArr.length;i++){
            if(gcCleaning.addressArr[i].default == 1){
                Addr = gcCleaning.addressArr[i];
            }
        }

        for(var j = 0; j<gcCleaning.products.length;j++){
            Ids = gcCleaning.products[j].id+';';
        }
        Ids =Ids.substring(0,Ids.length-1);
        var obj ={
            sid:gcCleaning.user.SessionId,
            id:Ids,
            invoice_type:1,
            invoice_head:Name,
            taxNum:Tax,
            recver:Addr.recver,
            address:Addr.address,
            phone:Addr.phone,
            order_quantity:1,
            ver: gcCleaning.Version,
            ts:gcCleaning.Ts
        };

        var Sign = gcCleaning.md(obj);

        var params = {
            sid:gcCleaning.user.SessionId,
            id:Ids,
            invoice_type:1,
            invoice_head:Name,
            taxNum:Tax,
            recver:Addr.recver,
            address:Addr.address,
            phone:Addr.phone,
            order_quantity:1,
            ver: gcCleaning.Version,
            ts:gcCleaning.Ts,
            sign:Sign
        };

        $.post(api_config.shopCartCleaning,params,function (res) {
            alert(res.Msg);
            if(res.Code ==3){
                gcCleaning.payMent();
            }
        });
    },
    //支付
    payMent:function () {
        $("#payModal").modal("show");

        var Ids;

        for(var j = 0; j<gcCleaning.products.length;j++){
            Ids = gcCleaning.products[j].id+';';
        }
        Ids =Ids.substring(0,Ids.length-1);

        $("#gc_cleaning_confirm").click(function () {
            var obj={
                sid:gcCleaning.user.SessionId,
                idstr:Ids,
                pay_method:0,
                ver: gcCleaning.Version,
                ts:gcCleaning.Ts
            };

            var Sign = gcCleaning.md(obj);

            var params = {
                sid:gcCleaning.user.SessionId,
                idstr:Ids,
                pay_method:0,
                ver: gcCleaning.Version,
                ts:gcCleaning.Ts,
                sign:Sign
            };

            $.post(api_config.payOrder,params,function (res) {
                alert(res.Msg);
                if(res.Code ==3){
                    var Confirm = confirm('是否已进行实名认证？');
                    if(Confirm == true){
                        window.location.href = 'gc_contract_sign.html';
                    }else{
                        window.location.href= 'gc_authen.html';
                    }
                }
            });
        });
    }
};

$(document).ready(function () {
    gcCleaning.init();
});
