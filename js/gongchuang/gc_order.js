/**
 * Created by yangyangyu on 2017/8/31.
 */

var Order={
    Version:'1.0.0',
    Ts:Date.parse(new Date())/1000,
    user:'',
    hostmethod:[],
    init:function () {
        Order.user = JSON.parse($.cookie('gcUser'));
        $("#gc_user_logined").css('display','inline-block');
        $("#gc_user_login").css('display','none');

        $("#dropdownMenu1 .gc_nick").text(Order.user.Nick);

        //退出
        $("#gc_logout").click(function () {
            Order.logout();
        });

        $("#gc_notice").css("display","inline-block");

        Order.notice();   //通知查询

        Order.queryShoppingCart();  //查询购物车

        Order.hostMethod();  //查询托管方式

        //进行中的订单
        Order.shipping();

        //已完成的订单
        Order.shipped();
    },
    //通知
    notice:function () {
        var obj={
            sid:Order.user.SessionId,
            begidx:0,
            counts:10,
            flag:0,
            ver: Order.Version,
            ts:Order.Ts
        };

        var Sign=Order.md(obj);

        var params={
            sid:Order.user.SessionId,
            begidx:0,
            counts:10,
            flag:0,
            ver: Order.Version,
            ts:Order.Ts,
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
            sid:Order.user.SessionId,
            ver: Order.Version,
            ts:Order.Ts
        };

        var Sign = Order.md(obj);

        var params={
            sid:Order.user.SessionId,
            ver: Order.Version,
            ts:Order.Ts,
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
            sid:Order.user.SessionId,
            ver: Order.Version,
            ts:Order.Ts
        };

        var Sign = Order.md(obj);

        var params={
            sid:Order.user.SessionId,
            ver: Order.Version,
            ts:Order.Ts,
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
    //托管方式查询
    hostMethod:function () {
        var obj={
            ver: Order.Version,
            ts:Order.Ts
        };

        var Sign=Order.md(obj);

        var params={
            ver: Order.Version,
            ts:Order.Ts,
            sign:Sign
        };

        $.post(api_config.hostMethods,params,function (result) {
            if (result.Code == 3) {
                Order.hostmethod = result.Data;
                //查询待支付的订单
                Order.unpay();
            }
        });
    },
    //查询待支付订单
    unpay:function () {
        var obj={
            sid:Order.user.SessionId,
            pay_status:0,
            status:1,
            begidx:0,
            counts:10,
            ver: Order.Version,
            ts:Order.Ts
        };

        var Sign = Order.md(obj);

        var params={
            sid:Order.user.SessionId,
            pay_status:0,
            status:1,
            begidx:0,
            counts:10,
            ver: Order.Version,
            ts:Order.Ts,
            sign:Sign
        };

        $.post(api_config.orderQuery,params,function (res) {
            console.log(res);
            if(res.Code ==3){
                if(res.Data.Detail){
                    $("#order_unshipped").empty();
                    var order_temp = res.Data.Detail;
                    var len= order_temp.length;
                    for(var i=0; i<len;i++){
                        var hostmethod;
                        for(var j = 0; j<Order.hostmethod.length;j++){
                            if(order_temp[i].hosted_mid == Order.hostmethod[j].id){
                                hostmethod = Order.hostmethod[j].text;
                            }
                        }
                        var order =$('<div class="item">'+
                        '<div class="item-h" style="position: relative">订单号:'+order_temp[i].order_no+
                            '<span style="position: absolute; right:10px; top:0; color:#FFB547;">30分钟后订单自动取消</span></div>'+
                            '<div class="media">'+
                            '<a class="media-left" href="javascript:void(0)">'+
                                '<img class="media-object" src="'+order_temp[i].imgurl+'" alt=""  />'+
                            '</a>'+
                            '<div class="media-body">'+
                                '<h3 class="media-heading">'+order_temp[i].web_intro+'</h3>'+
                            '<div class="order_desc">'+
                                ' <h4>颜色：'+order_temp[i].style+', 投放城市:'+order_temp[i].hosted_city+',投放数量：'+order_temp[i].order_quantity+'</h4>'+
                                ' <h4>资产归属：'+hostmethod+'</h4>'+
                                '<h4><span class="pull-right">&yen;'+parseFloat(order_temp[i].order_quantity)*parseFloat(order_temp[i].discount_price)+'</span></h4>'+
                            '</div>'+
                            '<ul class="list-inline">'+
                                '<li><h4>发票:'+order_temp[i].invoice_head+'</h4></li>'+
                                '<li class="pull-right" data-idx="'+i+'">'+
                                    '<button class="btn btn-default cancel" >取消订单</button>'+
                                    '<button class="btn btn-danger payment">去支付</button>'+
                                '</li>'+
                            '</ul>'+
                            '</div>'+
                        '</div>'+
                    '</div>');

                        $("#order_unshipped").append(order);

                        order.find(".cancel").click(function () {
                            var Idx = $(this).parent().attr("data-idx");
                            Order.cancel(order_temp[Idx]);
                        });

                        order.find(".payment").click(function () {
                            var Idx = $(this).parent().attr("data-idx");
                            $("#payModal").modal("show");

                            $("#gc_cleaning_confirm").click(function () {
                                Order.payment(order_temp[Idx]);
                            });
                        });
                    }
                }else{
                    $("#order_unshipped").html('<img src="imgs/noorder.png" style="width:100%;"/>');
                }
            }
        });
    },
    //取消订单
    cancel:function (item) {
        var obj={
            sid:Order.user.SessionId,
            id:item.id,
            ver: Order.Version,
            ts:Order.Ts
        };

        var Sign = Order.md(obj);

        var params = {
            sid:Order.user.SessionId,
            id:item.id,
            ver: Order.Version,
            ts:Order.Ts,
            sign:Sign
        };

        $.post(api_config.orderCancel,params,function (res) {
            console.log(res);
            alert(res.Msg);
            if(res.Code ==3){
                Order.unpay();
            }
        })
    },
    //支付
    payment:function (item) {
        var obj={
            sid:Order.user.SessionId,
            idstr:item.pid,
            pay_method:0,
            ver: Order.Version,
            ts:Order.Ts
        };

        var Sign = Order.md(obj);

        var params = {
            sid:Order.user.SessionId,
            idstr:item.pid,
            pay_method:0,
            ver: Order.Version,
            ts:Order.Ts,
            sign:Sign
        };

        $.post(api_config.payOrder,params,function (res) {
            $("#payModal").modal("hide");
            alert(res.Msg);
            if(res.Code ==3){
                var Confirm = confirm('是否已进行实名认证？');
                if(Confirm == true){
                    window.location.href = 'gc_contract_sign.html';
                }else{
                    window.location.href= 'gc_authen.html';
                }
            }else if(res.Code == 5){
                window.location.href= 'gc_wallet.html';
            }
        });
    },
    //进行中的订单
    shipping:function () {
        var obj={
            sid:Order.user.SessionId,
            pay_status:1,
            status:1,
            begidx:0,
            counts:10,
            ver: Order.Version,
            ts:Order.Ts
        };

        var Sign = Order.md(obj);

        var params={
            sid:Order.user.SessionId,
            pay_status:1,
            status:1,
            begidx:0,
            counts:10,
            ver: Order.Version,
            ts:Order.Ts,
            sign:Sign
        };

        $.post(api_config.orderQuery,params,function (res) {
            console.log(res);
            if(res.Code ==3){
                if(res.Data.Detail){
                    $("#order_shipping").empty();
                    var order_temp = res.Data.Detail;
                    var len= order_temp.length;
                    for(var i=0; i<len;i++){
                        var hostmethod;
                        for(var j = 0; j<Order.hostmethod.length;j++){
                            if(order_temp[i].hosted_mid == Order.hostmethod[j].id){
                                hostmethod = Order.hostmethod[j].text;
                            }
                        }
                        var order =$('<div class="item">'+
                            '<div class="item-h">订单号:'+order_temp[i].order_no+'</div>'+
                            '<div class="media">'+
                            '<a class="media-left" href="javascript:void(0)">'+
                            '<img class="media-object" src="'+order_temp[i].imgurl+'" alt=""  />'+
                            '</a>'+
                            '<div class="media-body">'+
                            '<h3 class="media-heading">'+order_temp[i].web_intro+'</h3>'+
                            '<div class="order_desc">'+
                            ' <h4>颜色：'+order_temp[i].style+', 投放城市:'+order_temp[i].hosted_city+',投放数量：'+order_temp[i].order_quantity+'</h4>'+
                            ' <h4>资产归属：'+hostmethod+'</h4>'+
                            '<h4><span class="pull-right">&yen;'+parseFloat(order_temp[i].order_quantity)*parseFloat(order_temp[i].discount_price)+'</span></h4>'+
                            '</div>'+
                            '<ul class="list-inline">'+
                            '<li><h4>发票:'+order_temp[i].invoice_head+'</h4></li>'+
                            '<li class="pull-right" data-idx="'+i+'">'+
                            '<button class="btn btn-default cancel" >查看物流</button>'+
                            '</li>'+
                            '</ul>'+
                            '</div>'+
                            '</div>'+
                            '</div>');

                        $("#order_shipping").append(order);

                        order.find(".cancel").click(function () {
                            var Idx = $(this).parent().attr("data-idx");
                            //物流信息查看
                            Order.portInfo(order_temp[Idx]);
                        });
                    }
                }else{
                    $("#order_shipping").html('<img src="imgs/noorder.png" style="width:100%;"/>');
                }
            }
        });
    },
    //物流信息查看
    portInfo:function (item) {
        console.log(item);
       alert("开发中....");
    },
    //已完成订单
    shipped:function () {
        var obj={
            sid:Order.user.SessionId,
            pay_status:1,
            status:2,
            begidx:0,
            counts:10,
            ver: Order.Version,
            ts:Order.Ts
        };

        var Sign = Order.md(obj);

        var params={
            sid:Order.user.SessionId,
            pay_status:1,
            status:2,
            begidx:0,
            counts:10,
            ver: Order.Version,
            ts:Order.Ts,
            sign:Sign
        };

        $.post(api_config.orderQuery,params,function (res) {
            console.log(res);
            if(res.Code ==3){
                if(res.Data.Detail){
                    $("#order_shipped").empty();
                    var order_temp = res.Data.Detail;
                    var len= order_temp.length;
                    for(var i=0; i<len;i++){
                        var hostmethod;
                        for(var j = 0; j<Order.hostmethod.length;j++){
                            if(order_temp[i].hosted_mid == Order.hostmethod[j].id){
                                hostmethod = Order.hostmethod[j].text;
                            }
                        }
                        var order =$('<div class="item">'+
                            '<div class="item-h">订单号:'+order_temp[i].order_no+'</div>'+
                            '<div class="media">'+
                            '<a class="media-left" href="javascript:void(0)">'+
                            '<img class="media-object" src="'+order_temp[i].imgurl+'" alt=""  />'+
                            '</a>'+
                            '<div class="media-body">'+
                            '<h3 class="media-heading">'+order_temp[i].web_intro+'</h3>'+
                            '<div class="order_desc">'+
                            ' <h4>颜色：'+order_temp[i].style+', 投放城市:'+order_temp[i].hosted_city+',投放数量：'+order_temp[i].order_quantity+'</h4>'+
                            ' <h4>资产归属：'+hostmethod+'</h4>'+
                            '<h4><span class="pull-right">&yen;'+parseFloat(order_temp[i].order_quantity)*parseFloat(order_temp[i].discount_price)+'</span></h4>'+
                            '</div>'+
                            '<ul class="list-inline">'+
                            '<li><h4>发票:'+order_temp[i].invoice_head+'</h4></li>'+
                            '<li class="pull-right" data-idx="'+i+'">'+
                            '<button class="btn btn-default comment" >评论</button>'+
                            '<button class="btn btn-danger del">删除订单</button>'+
                            '</li>'+
                            '</ul>'+
                            '</div>'+
                            '</div>'+
                            '</div>');

                        $("#order_unshipped").append(order);

                        order.find(".comment").click(function () {
                            var Idx = $(this).parent().attr("data-idx");
                            Order.cancel(order_temp[Idx]);
                        });

                        order.find(".del").click(function () {
                            var Idx = $(this).parent().attr("data-idx");
                            alert("开发中.....");
                        });
                    }
                }else{
                    $("#order_shipped").html('<img src="imgs/noorder.png" style="width:100%;"/>');
                }
            }
        });
    }
};


$(document).ready(function () {
    Order.init();
});
