/**
 * Created by admin on 2017/8/26.
 */
var Index={
    Version:'1.0.0',
    Ts:Date.parse(new Date())/1000,
    init:function () {
        Index.carousel();   //轮播图

        //加入购物车
        $("#add_to_cart").click(function () {
            Index.shoppingCart();
        });

        //产品查询
        Index.products();
    },
    carousel:function () {
        var obj={
            scene:3,
            ver: Index.Version,
            ts:Index.Ts
        };

        var Sign = Index.md(obj);

        var params = {
            scene:3,
            ver: Index.Version,
            ts:Index.Ts,
            sign:Sign,
        };

        $.post(api_config.carouselQuery,params,function (result) {
            //console.log(result);
            if(result.Code == 3){
                var templateObj = result.Data;

                var carousel_len = templateObj.length;

                for(var i =0 ;i<carousel_len;i++){
                    var carousel_item = '<div class="item">'+
                        '<a href="'+templateObj[i].gotourl+'"><img src="'+templateObj[i].imgurl+'" /></a>'+
                        '</div>';

                    $("#carousel_inner").append(carousel_item);
                }

                $("#carousel_inner .item").eq(0).addClass('active');
                $('#myCarousel').carousel({ interval: 2000 });
            }else{
                alert(result.Msg);
            }
        })
    },
    shoppingCart:function () {
        var cart = $('.shopping-cart');
        var imgtodrag = $('#index_deadline>img');
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
    products:function () {
      var obj={
          recommend:1,
          status:1,
          begidx:0,
          counts:1,
          ver: Index.Version,
          ts:Index.Ts
      };

      var Sign = Index.md(obj);
      var params={
            recommend:1,
            status:1,
            begidx:0,
            counts:1,
            ver: Index.Version,
            ts:Index.Ts,
            sign:Sign
      };

      $.post(api_config.productsQuery,params,function (result) {
          console.log(result);
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
    }
};

$(document).ready(function () {
    Index.init();
});