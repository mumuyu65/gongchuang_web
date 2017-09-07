/**
 * Created by admin on 2017/8/28.
 */
var gcMall={
    Version:'1.0.0',
    Ts:Date.parse(new Date())/1000,
    user:'',
    init:function () {
        gcMall.carousel();   //商城轮播图

        //推荐产品查询
        gcMall.recommandProducts();


        //全部产品查询
        gcMall.wholeProducts();

        //登录
        if($.cookie('gcUser')){
            gcMall.user = JSON.parse($.cookie('gcUser'));
            console.log(gcMall.user);
            $("#gc_user_logined").css('display','inline-block');
            $("#gc_user_login").css('display','none');

            $("#dropdownMenu1 .gc_nick").text(gcMall.user.Nick);

            $("#gc_logout").click(function () {
                gcMall.logout();
            });

            $("#gc_notice").css("display","inline-block");
            gcMall.notice();   //通知查询
        }
    },
    //通知
    notice:function () {
        var obj={
            sid:gcMall.user.SessionId,
            begidx:0,
            counts:10,
            flag:0,
            ver: gcMall.Version,
            ts:gcMall.Ts
        };

        var Sign=gcMall.md(obj);

        var params={
            sid:gcMall.user.SessionId,
            begidx:0,
            counts:10,
            flag:0,
            ver: gcMall.Version,
            ts:gcMall.Ts,
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
            sid:gcMall.user.SessionId,
            ver: gcMall.Version,
            ts:gcMall.Ts
        };

        var Sign = gcMall.md(obj);

        var params={
            sid:gcMall.user.SessionId,
            ver: gcMall.Version,
            ts:gcMall.Ts,
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
    carousel:function () {
        var obj={
            scene:1,
            ver: gcMall.Version,
            ts:gcMall.Ts
        };

        var Sign = gcMall.md(obj);

        var params = {
            scene:1,
            ver: gcMall.Version,
            ts:gcMall.Ts,
            sign:Sign,
        };

        $.post(api_config.carouselQuery,params,function (result) {
            if(result.Code  == 3){
                var temp_mall_carousel = result.Data;
                //console.log(result.Data);
                $("#gc_mall_carousel").empty();
                for(var i =0; i<temp_mall_carousel.length;i++){
                    var temp_carousel='<div class="item">'+
                        '<div class="item_inner">'+
                            '<h1>轻客 Tsinova</h1>'+
                            '<h1>人生赢家的出行美学</h1>'+
                            '<ul class="list-inline item_desc">'+
                                '<li class="text-center">'+
                                    '<img src="imgs/mall/num-1.png" alt="">'+
                                    '<h4>x芯片</h4>'+
                                '</li>'+
                                '<li class="text-center">'+
                                    '<img src="imgs/mall/num-2.png" alt="">'+
                                    '<h4>超长续航</h4>'+
                                '</li>'+
                                '<li class="text-center">'+
                                    '<img src="imgs/mall/num-3.png" alt="">'+
                                    '<h4>车重</h4>'+
                                '</li>'+
                            '</ul>'+

                            '<ol class="list-inline item_icon">'+
                                '<li><a href="'+temp_mall_carousel[i].gotourl+'">了解更多</a></li>'+
                                '<li><a href="#">马上购买</a></li>'+
                            '</ol>'+
                        '</div>'+
                        '<a href="'+temp_mall_carousel[i].gotourl+'"><img src="'+temp_mall_carousel[i].imgurl+'" alt="" style="width:100%;"/></a>'+
                        '</div>';

                    $("#gc_mall_carousel").append(temp_carousel);
                }
                $("#gc_mall_carousel .item").eq(0).addClass('active');
                //$('#gc_mall_myCarousel').carousel({ interval: 5000 });
            }
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
    recommandProducts:function () {
        var obj={
            recommend:1,
            status:1,
            begidx:0,
            counts:3,
            ver: gcMall.Version,
            ts:gcMall.Ts
        };

        var Sign = gcMall.md(obj);

        var params={
            recommend:1,
            status:1,
            begidx:0,
            counts:3,
            ver: gcMall.Version,
            ts:gcMall.Ts,
            sign:Sign
        };

        $.post(api_config.productsQuery,params,function(result){
            //console.log(result);
            if(result.Code ==3){
                var mall_recommand_tmp=result.Data.Detail;
                var tmp_len = mall_recommand_tmp.length;
                $("#today_deadline .carousel-indicators").empty();
                $("#mall_recommand").empty();
                for(var i= 0; i<tmp_len;i++){
                    var recommand_icon = '<li></li>';
                    $("#today_deadline .carousel-indicators").append(recommand_icon);
                    var Idx = i+1;
                    var mall_recommand = '<div class="media media-'+Idx+'">'+
                        '<div class="media-body">'+
                            '<h4 class="media-heading">'+
                                '<img src="imgs/mall/square-2.png">'+
                                ' <div class="mall-media-icon">'+
                                    '  <span class="icon-c"></span>'+
                                    ' <span class="icon-t">'+mall_recommand_tmp[i].name+'</span>'+
                                '   </div>'+
                            '  </h4>'+
                        '  <h3>'+mall_recommand_tmp[i].web_intro+'</h3>'+
                    '  <div class="media-inner">'+
                    ' <img src="imgs/mall/mall_money.png"/>'+
                    ' <div class="mall-media-icon">'+
                    '  <span class="icon-t">'+mall_recommand_tmp[i].discount_price+'</span>'+
                    '   <span class="icon-y">元</span>'+
                    '   </div>'+
                    '   </div>'+
                    '   </div>'+
                    '  <a class="media-right" href="#">'+
                    '    <img class="media-object" src="'+mall_recommand_tmp[i].coverurl+'" >'+
                    '    </a>'+
                    '    <div class="text-center mall_deadline">'+
                    '    <ul class="list-inline">'+
                    '    <li><h3>剩余</h3></li>'+
                    '    <li class="timer"><h3>18</h3></li>'+
                    '   <li>:</li>'+
                    '<li class="timer"><h3>12</h3></li>'+
                    '    <li>:</li>'+
                    '<li class="timer"><h3>13</h3></li>'+
                    '    </ul>'+
                    '    </div>'+
                    '    </div>';

                    $("#mall_recommand").append(mall_recommand);
                }

                $("#today_deadline .carousel-indicators li").eq(1).addClass("active");

                $("#today_deadline li").click(function () {
                    $(this).siblings().removeClass('active');
                    $(this).addClass("active");
                    var Index = $(this).index();
                    if(Index==0){
                        $("#today_deadline .media").eq(Index+2).animate(
                            { left: '1460px'}, 2000);
                        $("#today_deadline .media").eq(Index).animate(
                            { left: '+300px' }, 2000);
                        $("#today_deadline .media").eq(Index+1).animate(
                            { left: '+880px' }, 2000);
                    }
                    if(Index==1){
                        $("#today_deadline .media").eq(Index-1).animate(
                            { left: '-280px' }, 2000);
                        $("#today_deadline .media").eq(Index).animate(
                            { left: '300px' }, 2000);
                        $("#today_deadline .media").eq(Index+1).animate(
                            { left: '880px' }, 2000);
                    }
                    if(Index==2){
                        $("#today_deadline .media").eq(Index-2).animate(
                            { left: '-880px' }, 2000);
                        $("#today_deadline .media").eq(Index).animate(
                            { left: '300px' }, 2000);
                        $("#today_deadline .media").eq(Index-1).animate(
                            { left: '-280px' }, 2000);
                    }
                });
            }
        });
    },
    wholeProducts:function () {
        var obj={
            recommend:-1,
            status:1,
            begidx:0,
            counts:9,
            ver: gcMall.Version,
            ts:gcMall.Ts
        };

        var Sign = gcMall.md(obj);

        var params={
            recommend:-1,
            status:1,
            begidx:0,
            counts:9,
            ver: gcMall.Version,
            ts:gcMall.Ts,
            sign:Sign
        };

        $.post(api_config.productsQuery,params,function(result){
            //console.log(result);
            if(result.Code ==3){
                var mall_products = result.Data.Detail;

                var products_len = mall_products.length;

                $("#mall_goods").empty();
                for(var i=0; i<products_len;i++){
                    var status;
                    if(mall_products[i].status ==1){
                        status = '预售';
                    }else{
                        status = '已售';
                    }
                    var mall_products_item = '<div class="goods_item text-center">'+
                    '<img src="'+mall_products[i].coverurl+'" style="width:277px; height:248px;"  />'+
                        '<div class="item-desc">'+
                            '<p>'+
                            '【<span style="color:#E61F1C">'+status+'</span>】'+mall_products[i].product_name+
                            '</p>'+
                            '<img src="imgs/mall/square-3.png" alt="">'+
                                '<h4>预售:'+mall_products[i].presale_total+'</h4>'+
                            '<hr/>'+
                            '<ul class="list-inline">'+
                                '<li><a href="javascript:void(0)" class="products_add_more" data-index="'+i+'">了解更多</a></li>'+
                               ' <li><a href="javascript:void(0)"><i class="iconfont icon icon-gouwuchekong add-shop-cart"></i></a></li>'+
                            '</ul>'+
                        '</div>'+
                    '</div>';
                    $("#mall_goods").append(mall_products_item);
                }

                $("#mall_goods .products_add_more").click(function () {
                    var Idx = $(this).attr("data-index");
                    $.cookie('mall_products',JSON.stringify(mall_products[parseInt(Idx)]));
                    window.open('gc_mall_detail.html');
                });
            }
        });
    }
};

$(document).ready(function () {
    gcMall.init();
});