/**
 * Created by yangyangyu on 2017/8/31.
 */

var Order={
    Version:'1.0.0',
    Ts:Date.parse(new Date())/1000,
    user:'',
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

        //查询待支付的订单
        Order.unpay();
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
        });
    }
};


$(document).ready(function () {
    Order.init();
});
