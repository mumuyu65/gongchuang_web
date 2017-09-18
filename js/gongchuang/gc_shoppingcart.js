/**
 * Created by yuyangyang on 2017/8/30.
 */

var gcShoppingCart={
    Version:'1.0.0',
    Ts:Date.parse(new Date())/1000,
    user:'',
    host_method:[],  //托管方式
    totalMoney:[],
    InitMoney:0,
    init:function () {
        gcShoppingCart.user = JSON.parse($.cookie('gcUser'));

        $("#gc_user_logined").css('display','inline-block');
        $("#gc_user_login").css('display','none');

        $("#dropdownMenu1 .gc_nick").text(gcShoppingCart.user.Nick);

        $("#gc_logout").click(function () {
            gcShoppingCart.logout();
        });

        $("#gc_notice").css("display","inline-block");
        gcShoppingCart.notice();   //通知查询

        gcShoppingCart.hostMethod(); // 查询托管方式
        
        //购物车结算
        $("#gc_shoppingcart_bid .bid").click(function () {
            if(parseInt($("#gc_shoppingcart_bid .totalmoney").val()) == 0){
                alert("无商品可结算！");
            }else{
                window.location.href="gc_cleaning.html";
            }
        });
    },
    //通知
    notice:function () {
        var obj={
            sid:gcShoppingCart.user.SessionId,
            begidx:0,
            counts:10,
            flag:0,
            ver: gcShoppingCart.Version,
            ts:gcShoppingCart.Ts
        };

        var Sign=gcShoppingCart.md(obj);

        var params={
            sid:gcShoppingCart.user.SessionId,
            begidx:0,
            counts:10,
            flag:0,
            ver: gcShoppingCart.Version,
            ts:gcShoppingCart.Ts,
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
            sid:gcShoppingCart.user.SessionId,
            ver: gcShoppingCart.Version,
            ts:gcShoppingCart.Ts
        };

        var Sign = gcShoppingCart.md(obj);

        var params={
            sid:gcShoppingCart.user.SessionId,
            ver: gcShoppingCart.Version,
            ts:gcShoppingCart.Ts,
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
    hostMethod:function () {
        var obj={
            ver: gcShoppingCart.Version,
            ts:gcShoppingCart.Ts
        };

        var Sign=gcShoppingCart.md(obj);

        var params={
            ver: gcShoppingCart.Version,
            ts:gcShoppingCart.Ts,
            sign:Sign
        };

        $.post(api_config.hostMethods,params,function (result) {
            if(result.Code ==3){
                gcShoppingCart.host_method = result.Data;
                gcShoppingCart.queryShoppingCart();  //查询购物车
            }
        })
    },
    //查询购物车
    queryShoppingCart:function () {
        var obj={
            sid:gcShoppingCart.user.SessionId,
            ver: gcShoppingCart.Version,
            ts:gcShoppingCart.Ts
        };

        var Sign = gcShoppingCart.md(obj);

        var params={
            sid:gcShoppingCart.user.SessionId,
            ver: gcShoppingCart.Version,
            ts:gcShoppingCart.Ts,
            sign:Sign
        };

        $.post(api_config.shopCartQuery,params,function (res) {
            //console.log(res);
            if(res.Code == 3){
                if(res.Data){
                    $("#shop_cart_num").text(res.Data.length);
                    gcShoppingCart.details(res.Data);
                }else{
                    $("#gc_shoppingcart").css("display","none");
                    $("#gc_shoppingcart_bid").css("display","none");
                    $("#gc_shoppingcart_nodata").css("display","block");
                }
            }
        })
    },
    details:function (arr) {
        var len = arr.length;
        $("#gc_shoppingcart").empty();
        for(var i=0; i<len;i++){
            var sale;
            if(arr[i].presale == '1'){
                sale = '预售';
            }else{
                sale = '已售';
            }
            var hostMethod ;
            for(var j=0; j<gcShoppingCart.host_method.length;j++){
                if(arr[i].hosted_mid == gcShoppingCart.host_method[j].id){
                    hostMethod=gcShoppingCart.host_method[j].text;
                }
            }
            var shoppingCart_item = $('<div class="item" data-id="'+arr[i].id+'"  data-idx="'+i+'">'+
            '<ul class="list-inline">'+
                '<li><i class="iconfont icon icon-duigou select active"></i></li>'+
                ' <li><img src="'+arr[i].coverurl+'" alt="" style="width:277px; height:248px;" /> </li>'+
                ' <li>'+
                    '  <div class="cart_list_desc">'+
                        '<div class="pull-right">'+
                        ' <i class="iconfont icon icon-cha" data-index="'+i+'"></i>'+
                        '</div>'+
                        '<div class="desc_title">【'+sale+'】'+arr[i].product_name+'</div>'+
                        ' <ol class="list-inline comment_ct">'+
                            '<li>'+arr[i].style+'</li>'+
                            '<li>'+hostMethod+'</li>'+
                            '<li>'+arr[i].hosted_city+'</li>'+
                        ' </ol>'+
                        ' <hr/>'+
                        '<div class="desc_num">'+
                            ' <div class="pull-left">'+
                                ' <span class="plus" data-index="'+i+'">+</span>'+
                                '<input type="number" data-index="'+i+'" value="'+arr[i].order_quantity+'" class="num" />'+
                                '<span class="minus" data-index="'+i+'">-</span>'+
                            '</div>'+
                            ' <span class="pull-right">&yen; '+arr[i].discount_price+'</span>'+
                        '</div>'+
                    '</div>'+
                '</li>'+
            ' </ul>'+
            '</div>');
            gcShoppingCart.totalMoney.push({id:arr[i].id,num:arr[i].order_quantity,money:arr[i].discount_price});
            $("#gc_shoppingcart").append(shoppingCart_item);
            gcShoppingCart.InitMoney += parseInt(arr[i].order_quantity)*parseFloat(arr[i].discount_price);
        }

        //计算总钱数
        gcShoppingCart.countMoney(gcShoppingCart.totalMoney);

        $("#gc_shoppingcart .select.icon-duigou").click(function () {
            $(this).removeClass("active");
            var Idx = $(this).parent().parent().parent(".item").attr("data-idx");

            var Id = $(this).parent().parent().parent(".item").attr("data-id");

            for(var j =0 ; j<gcShoppingCart.totalMoney.length;j++){
                if(Id == gcShoppingCart.totalMoney[j].id){
                    gcShoppingCart.totalMoney.splice(j,1);
                }
            }
            if($("#gc_shoppingcart_bid .icon-duigou").hasClass("active")){
                $("#gc_shoppingcart_bid .icon-duigou").removeClass("active");
            }
            gcShoppingCart.countMoney(gcShoppingCart.totalMoney);
        });

        $("#gc_shoppingcart_bid .icon-duigou").click(function () {
            if($("#gc_shoppingcart_bid .icon-duigou").hasClass("active")){
                $("#gc_shoppingcart_bid .icon-duigou").removeClass("active");
                $("#gc_shoppingcart .select.icon-duigou").removeClass("active");
                gcShoppingCart.countMoney([]);
            }else{
                $("#gc_shoppingcart_bid .icon-duigou").addClass("active");
                $("#gc_shoppingcart .select.icon-duigou").addClass("active");
                $("#gc_shoppingcart_bid .totalmoney").text(gcShoppingCart.InitMoney);
            }
        });

        $("#gc_shoppingcart .icon-cha").click(function () {
            var Idx = $(this).attr("data-index");
            gcShoppingCart.delProducts(arr[Idx],Idx);
        });

        //增加
        $("#gc_shoppingcart .plus").click(function () {
            var Idx =parseInt($(this).attr("data-index"));
            var curNum =  $("#gc_shoppingcart .item").eq(Idx).find(".num").val();
            $("#gc_shoppingcart .item").eq(Idx).find(".num").val(parseInt(curNum)+1);
            gcShoppingCart.totalMoney[Idx].num =parseInt(gcShoppingCart.totalMoney[Idx].num)+1;

            gcShoppingCart.countMoney(gcShoppingCart.totalMoney);
        });

        //减少
        $("#gc_shoppingcart .minus").click(function () {
            var Idx =parseInt($(this).attr("data-index"));
            var curNum =  $("#gc_shoppingcart .item").eq(Idx).find(".num").val();
            if(curNum==1){
                    $(this).attr("disabled",true);
            }else{
                gcShoppingCart.totalMoney[Idx].num =parseInt(gcShoppingCart.totalMoney[Idx].num)-1;
                $("#gc_shoppingcart .item").eq(Idx).find(".num").val(parseInt(curNum)-1);
                gcShoppingCart.countMoney(gcShoppingCart.totalMoney);
            }
        });

        //手动输入
        $("#gc_shoppingcart .num").blur(function () {
            var Idx =parseInt($(this).attr("data-index"));
            var curNum =  $(this).val();
            if(curNum>=1){
                gcShoppingCart.totalMoney[Idx].num =curNum;
                gcShoppingCart.countMoney(gcShoppingCart.totalMoney);
            }else{
                $(this).val("1");
            }
        });
    },
    countMoney:function (arr) {
        var len = arr.length;
        var totalmoney = 0;
        for(var i = 0; i<len;i++){
            totalmoney+=parseInt(arr[i].num)*parseFloat(arr[i].money);
        }

        $("#gc_shoppingcart_bid .totalmoney").text(totalmoney);
    },
    delProducts:function (item,Idx) {
        var obj={
            sid:gcShoppingCart.user.SessionId,
            id:item.id,
            ver: gcShoppingCart.Version,
            ts:gcShoppingCart.Ts
        };

        var Sign = gcShoppingCart.md(obj);

        var params={
            sid:gcShoppingCart.user.SessionId,
            id:item.id,
            ver: gcShoppingCart.Version,
            ts:gcShoppingCart.Ts,
            sign:Sign
        };

        $.post(api_config.shopCartDel,params,function (res) {
            alert(res.Msg);
            if(res.Code ==3){
                $("#gc_shoppingcart .item").eq(Idx).remove();
                gcShoppingCart.totalMoney.splice(Idx,1);
                gcShoppingCart.countMoney(gcShoppingCart.totalMoney);
            }
        })
    }
};


$(document).ready(function () {
    gcShoppingCart.init();
});
