/**
 * Created by admin on 2017/8/26.
 */
var Index={
    Version:'1.0.0',
    Ts:Date.parse(new Date())/1000,
    init:function () {
        Index.carousel();   //轮播图
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