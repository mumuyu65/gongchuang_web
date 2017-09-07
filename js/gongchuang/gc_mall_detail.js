/**
 * Created by admin on 2017/8/29.
 */
var gcMallDetail={
    Version:'1.0.0',
    Ts:Date.parse(new Date())/1000,
    user:'',
    ptId:'',
    init:function () {
        var product = JSON.parse($.cookie("mall_products"));

        gcMallDetail.ptId = product.pt_id;

        $("#products_title").text(product.name);

        $("#products_intro").text(product.product_name);

        $("#products_detail img").attr("src",product.coverurl);

        $("#products_desc .money").text(product.discount_price);

        $("#products_desc .color").text(product.style);

        $("#products_desc .total span").text(product.presale_total);

        $("#products_desc .sold_total span").text(product.sale_total);

        gcMallDetail.hostMethod();  //托管方式查询

        gcMallDetail.hostCity();  //托管城市查询

        gcMallDetail.productsDetail(product.imgurl);  //商品详情

        gcMallDetail.productsComment(); //商品评价查询

        //倒计时
        gcMallDetail.timerDistance(product.end_date);

        //加入购物车
        $("#add_to_cart").click(function () {
            gcMallDetail.shoppingCart();
        });

        //我的空间
        $("#gc_space").click(function () {
            if(gcMallDetail.user){
                window.open("gc_space.html");
            }else{
                window.open("login.html");
            }
        });

        //我的资产
        $("#gc_asserts").click(function () {
            if(gcMallDetail.user){
                window.open("gc_asserts.html");
            }else{
                window.open("login.html");
            }
        });

        //登录
        if($.cookie('gcUser')){
            gcMallDetail.user = JSON.parse($.cookie('gcUser'));
            console.log(gcMallDetail.user);
            $("#gc_user_logined").css('display','inline-block');
            $("#gc_user_login").css('display','none');

            $("#dropdownMenu1 .gc_nick").text(gcMallDetail.user.Nick);

            $("#gc_logout").click(function () {
                gcMallDetail.logout();
            });

            $("#gc_notice").css("display","inline-block");
            gcMallDetail.notice();   //通知查询
        }

    },
    //通知
    notice:function () {
        var obj={
            sid:gcMallDetail.user.SessionId,
            begidx:0,
            counts:10,
            flag:0,
            ver: gcMallDetail.Version,
            ts:gcMallDetail.Ts
        };

        var Sign=gcMallDetail.md(obj);

        var params={
            sid:gcMallDetail.user.SessionId,
            begidx:0,
            counts:10,
            flag:0,
            ver: gcMallDetail.Version,
            ts:gcMallDetail.Ts,
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
            sid:gcMallDetail.user.SessionId,
            ver: gcMallDetail.Version,
            ts:gcMallDetail.Ts
        };

        var Sign = gcMallDetail.md(obj);

        var params={
            sid:gcMallDetail.user.SessionId,
            ver: gcMallDetail.Version,
            ts:gcMallDetail.Ts,
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
    hostMethod:function () {
        var obj={
            ver: gcMallDetail.Version,
            ts:gcMallDetail.Ts
        };

        var Sign=gcMallDetail.md(obj);

        var params={
            ver: gcMallDetail.Version,
            ts:gcMallDetail.Ts,
            sign:Sign
        };

        $.post(api_config.hostMethods,params,function (result) {
            if(result.Code ==3){
                for(var i =0; i<result.Data.length;i++){
                    var item=$('<span data-id="'+result.Data[i].id+'"></span> ');
                    item.text(result.Data[i].text);
                    $("#products_desc .host_method").append(item);
                }
            }
        })
    },
    hostCity:function () {
        var obj={
            id:gcMallDetail.ptId,
            ver: gcMallDetail.Version,
            ts:gcMallDetail.Ts
        };

        var Sign=gcMallDetail.md(obj);

        var params={
            id:gcMallDetail.ptId,
            ver: gcMallDetail.Version,
            ts:gcMallDetail.Ts,
            sign:Sign
        };

        $.post(api_config.soldQuery,params,function (result) {
           //console.log(result);
           if(result.Code ==3){
               for(var i =0; i<result.Data.PreSale.length;i++) {
                   var item = $('<span data-city="' + result.Data.PreSale[i].city + '"></span> ');
                   item.text(result.Data.PreSale[i].city);
                   $("#products_desc .desc_ct").append(item);
               }
           }
        });
    },
    productsDetail:function (imgs) {
        var Nmgs=imgs.split(';');
        for(var i=0; i<Nmgs.length-1;i++){
            var img_temp =$('<img src=" " style="width:100%; margin:20px;"/>');
            img_temp.attr("src",Nmgs[i]);
            $("#home").append(img_temp);
        }
    },
    productsComment:function () {
        var obj={
            pid:gcMallDetail.ptId,
            begidx:0,
            counts:8,
            ver: gcMallDetail.Version,
            ts:gcMallDetail.Ts
        };

        var Sign=gcMallDetail.md(obj);

        var params={
            pid:gcMallDetail.ptId,
            begidx:0,
            counts:8,
            ver: gcMallDetail.Version,
            ts:gcMallDetail.Ts,
            sign:Sign
        };

        $.post(api_config.productsCommentQuery,params,function (result) {
           console.log(result);
           if(result.Code ==3){
               if(result.Data == 'no data'){
                   $('#ios').append('<img src="imgs/nodata.png" style="width:100%;"/>');
               }else{
                   //TODO
                   var item=$('<div class="comment_item">'+
                       '<ul class="list-inline">'+
                   '<li><img src="imgs/detail/detail_3.png" alt="" class="profile"/></li>'+
                   ' <li><h3>刘某某</h3></li>'+
                   ' <li>07-31  12:30</li>'+
                   '</ul>'+
                   '<div class="comment_desc">'+
                   '<p>最近发现家附近的车子又变多了，看来大家都支持骑车出行。</p>'+
                   '<img src="imgs/detail/detail_3.png" alt="">'+
                   '<img src="imgs/detail/detail_3.png" alt="">'+
                   '</div>'+
                   '<ol class="list-inline comment_ct">'+
                   '<li>红色</li>'+
                   '<li>个体托管</li>'+
                   '<li>广州</li>'+
                   '<li class="pull-right">'+
                   '<i class="iconfont icon icon-dianzan"></i>'+
                   '1258'+
                   ' </li>'+
                   '</ol>'+
                   ' </div>');
               }
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
    //倒计时
    countDown:function (tm){
        //获取一个事件戳
        var time = new Date(tm);

        var H = time.getHours();

        var M = time.getMinutes();

        var S = time.getSeconds();
        //返回拼接信息
        return gcMallDetail.add(H) + '：' + gcMallDetail.add(M)+ '：' + gcMallDetail.add(S);
    },
    add:function(m) {
        return m < 10 ? '0' + m : m
    },
    shoppingCart:function () {
        var cart = $('.shopping-cart');
        var imgtodrag = $('#products_detail>img');
        if (imgtodrag) {
            var imgclone = imgtodrag.clone().offset({
                top: imgtodrag.offset().top,
                left: imgtodrag.offset().left
            }).css({
                'opacity': '0.5',
                'position': 'absolute',
                'height': '150px',
                'width': '150px',
                'z-index': '100'
            })
                .appendTo($('body'))
                .animate({
                    'top': cart.offset().top + 10,
                    'left': cart.offset().left + 10,
                    'width': 75,
                    'height': 75
                }, 1000, 'easeInOutExpo');

            imgclone.animate({
                'width': 0,
                'height': 0
            }, function () {
                $(this).detach()
            });

            var num = parseInt($("#shop_cart_num").text());

            num = num +1;

            $("#shop_cart_num").text(num);
        }
    },
    timerDistance:function (distance) {
        var timer_distance = parseInt(distance)-Date.parse(new Date())/1000;
        var timer,timer_arr;
        timer= gcMallDetail.countDown(timer_distance*1000);
        timer_arr= timer.split("：");
        var timer_distance = setInterval(function () {
            timer_distance--;
            timer= gcMallDetail.countDown(timer_distance*1000);
            timer_arr= timer.split("：");

            $("#products_detail .timer").eq(0).find('h2').text(timer_arr[0]);

            $("#products_detail .timer").eq(1).find('h2').text(timer_arr[1]);

            $("#products_detail .timer").eq(2).find('h2').text(timer_arr[2]);
        },1000);

        if(timer_distance<1){
            clearInterval(timer_distance);
        }
    }
};

$(document).ready(function () {
    gcMallDetail.init();
});