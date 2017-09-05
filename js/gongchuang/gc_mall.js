/**
 * Created by admin on 2017/8/28.
 */
var gcMall={
    Version:'1.0.0',
    Ts:Date.parse(new Date())/1000,
    init:function () {
        gcMall.carousel();   //商城轮播图
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
            //console.log(result);
            if(result.Code  == 3){
                var temp_mall_carousel = result.Data;
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
                                '<li><a href="#">了解更多</a></li>'+
                                '<li><a href="#">马上购买</a></li>'+
                            '</ol>'+
                        '</div>'+
                        '<a href="'+temp_mall_carousel[i].gotourl+'"><img src="'+temp_mall_carousel[i].imgurl+'" alt="" style="width:100%;"/></a>'+
                        '</div>';

                    $("#gc_mall_carousel").append(temp_carousel);

                    $("#gc_mall_carousel .item").eq(0).addClass('active');
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
};


$(document).ready(function () {
    gcMall.init();
});