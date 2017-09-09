/**
 * Created by yuyangyang on 2017/8/26.
 */
var Index={
    Version:'1.0.0',
    Ts:Date.parse(new Date())/1000,
    user:'',
    init:function () {
        Index.carousel();   //轮播图

        //加入购物车
        $("#add_to_cart").click(function () {
            Index.shoppingCart();
        });

        //产品查询
        Index.products();

        //查询说说
        Index.comment();

        if($.cookie('gcUser')){
            Index.user = JSON.parse($.cookie('gcUser'));
            //console.log(Index.user);
            $("#gc_user_logined").css('display','inline-block');
            $("#gc_user_login").css('display','none');

            $("#dropdownMenu1 .gc_nick").text(Index.user.Nick);

            $("#gc_logout").click(function () {
                Index.logout();
            });

            $("#gc_notice").css("display","inline-block");
            Index.notice();   //通知查询
        }

        //我的空间
        $("#gc_space").click(function () {
            if(Index.user){
                window.open("gc_space.html");
            }else{
                window.open("login.html");
            }
        });

        //我的资产
        $("#gc_asserts").click(function () {
            if(Index.user){
                window.open("gc_asserts.html");
            }else{
                window.open("login.html");
            }
        });

        //更多
        $("#add_more").click(function () {
            if(Index.user){
                window.open("gc_space.html");
            }else{
                window.location.href='login.html';
            }
        });
    },
    //通知
    notice:function () {
        var obj={
            sid:Index.user.SessionId,
            begidx:0,
            counts:10,
            flag:0,
            ver: Index.Version,
            ts:Index.Ts
        };

        var Sign=Index.md(obj);

        var params={
            sid:Index.user.SessionId,
            begidx:0,
            counts:10,
            flag:0,
            ver: Index.Version,
            ts:Index.Ts,
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
          counts:4,
          ver: Index.Version,
          ts:Index.Ts
      };

      var Sign = Index.md(obj);
      var params={
            recommend:1,
            status:1,
            begidx:0,
            counts:4,
            ver: Index.Version,
            ts:Index.Ts,
            sign:Sign
      };

      $.post(api_config.productsQuery,params,function (result) {
          if(result.Code == 3){
              var index_products = result.Data.Detail;
              var index_products_len = index_products.length;
              for(var i = 0; i<index_products_len;i++){
                  var indicator = ' <li data-target="#myCarousel_products" data-slide-to="'+i+'">'+
                      '<img src="'+index_products[i].coverurl+'" style="width:152px; height:152px;"/></li>';

                  $("#products_indicators").append(indicator);

                  $("#products_indicators>li").eq(0).addClass("active");
                  //倒计时
                  var timer_distance = parseInt(index_products[i].end_date)-Date.parse(new Date())/1000;
                  var timer,timer_arr,timer_count;
                  timer= Index.countDown(timer_distance*1000);
                  timer_arr= timer.split("：");
                  var products_item='<div class="item" data-timer-count="'+timer_distance+'">'+
                      '<div class="text-center inner-content">'+
                          '<h3>'+index_products[i].product_name+'</h3>'+
                      '</div>'+
                      '<div class="pull-left">'+
                          '<h4>已售：'+index_products[i].sale_total+'</h4>'+
                          '<h4>颜色：</h4>'+
                          '<h5>'+index_products[i].style+'</h5>'+
                      '</div>'+
                      '<div class="pull-right">'+
                          '<h2>&yen;'+index_products[i].presale_total+'</h2>'+
                          '<a href="gc_order.html">立即购买</a>'+
                          '<a href="javascript:void(0)" class="add_to_cart">'+
                            '<i class="iconfont icon icon-gouwuchekong"></i>加入购物车'+
                          '</a>'+
                      '</div>'+
                      '<div class="text-center index_deadline">'+
                        '<img src="'+index_products[i].coverurl+'"/>'+
                        '<ul class="list-inline">'+
                          '<li><h3>剩余</h3></li>'+
                          '<li class="timer"><h3 id="hour'+i+'">'+timer_arr[0]+'</h3></li>'+
                          '<li>:</li>'+
                          '<li class="timer"><h3 id="minute'+i+'">'+timer_arr[1]+'</h3></li>'+
                          '<li>:</li>'+
                          '<li class="timer"><h3 id="seconds'+i+'">'+timer_arr[2]+'</h3></li>'+
                        '</ul>'+
                      '</div>'+
                  '</div>';

                  $("#myCarousel_products .carousel-inner").append(products_item);

                  $("#myCarousel_products .carousel-inner .item").eq(0).addClass('active');

                  Index.timerCount('timer_count'+i,i);
              }
          }
      });
    },
    timerCount:function (counter,Idx) {
        var timer_count = $("#myCarousel_products .carousel-inner .item").eq(Idx).attr('data-timer-count');
        var timer= Index.countDown(timer_count*1000);
        var timer_arr= timer.split("：");
        counter=new Index.msTimeCount();
        counter.init([timer_arr[0],timer_arr[1],timer_arr[2]],["hour"+Idx,"minute"+Idx,"seconds"+Idx]);
    },
    msTimeCount:function(){
        this._hour=0;  //&ldquo;小时&rdquo;数
        this._minute=0;  //&ldquo;分&rdquo;数
        this._seconds=0; //&ldquo;秒&rdquo;数
        //
        this._hourHtmlObj={};//&ldquo;小时&rdquo;html对象
        this._minuteHtmlObj={};//&ldquo;分&rdquo;html对象
        this._secondsHtmlObj={};//&ldquo;秒&rdquo;html对象
        //
        this._totalSeconds=0;//总秒数
    },
    comment:function () {
       var obj={
           begidx:0,
           counts:10,
           ver: Index.Version,
           ts:Index.Ts
       };

       var Sign=Index.md(obj);

       var params={
           begidx:0,
           counts:10,
           sign:Sign,
           ver: Index.Version,
           ts:Index.Ts
       };

       $.post(api_config.talkQuery,params,function (result) {
          if(result.Code ==3){
              var temp_comment = result.Data.Detail;
              var comment_len = result.Data.Total;
              for(var i =0; i<comment_len;i++) {
                  var comment_data = temp_comment[i];
                  if(comment_data.headurl == 'undefined'){
                      console.log(comment_data);
                  }
                  var headUrl= comment_data.headurl;

                  var hd_item_img = $('<div class="hd_item_img"></div>');
                  var hd_item = '<div class="hd_item" data-index="'+i+'" data-index="'+i+'">'+
                          '<img class="img_title" src="'+headUrl+'" alt=""/>'+
                          '<div class="hd_item_h">'+
                              '<h4>'+comment_data.nick+'</h4>'+
                              '<h5>'+Index.dateStamp(comment_data.unix*1000)+'</h5>'+
                              '<div class="hd_item_des">'+
                                  '<h5>'+comment_data.text+ '</h5>'+
                                '</div>'+
                              '<ul class="list-inline hd_item_comment">'+
                                  '<li class="zan"><img src="imgs/index/dianzan.png" alt="" />'+
                                        '<span>'+comment_data.fans+'</span>'+
                                  '</li>'+
                                  '<li class="text-center comment"><img src="imgs/index/comment.png" alt="" />'+
                                      '<span>'+comment_data.review+'</span>'+
                                  '</li>'+
                                  '<li class="text-center share"><img src="imgs/index/share.png" alt="" />'+
                                      '<span>'+comment_data.viewers+'</span>'+
                                  '</li>'+
                              '</ul>'+
                          '</div>'+
                      '</div>';
                  $("#hd_inner").append(hd_item);

                  if(!comment_data.imgurl){
                      var arr = comment_data.imgurl.split(";");
                      for(var j =0; j<arr.length-1;j++){
                          var comment_img = '<img src="'+arr[j]+'" />';
                          hd_item_img.append(comment_img);
                      }
                      $("#hd_inner .hd_item").eq(i).find(".hd_item_des").append(hd_item_img);
                  }
              }

              $("#hd_inner .hd_item .hd_item_comment .zan").click(function () {
                   var fans= $(this).text();
                   var Id =$(this).parent().parent().parent(".hd_item").attr("data-id");
                   var idx= $(this).parent().parent().parent(".hd_item").attr("data-index");
                   Index.thumbUp(idx,Id,fans);
              });

              $("#hd_inner .hd_item .hd_item_comment .comment").click(function () {
                  var Idx =$(this).parent().parent().parent(".hd_item").attr("data-index");

                  Index.commentList(temp_comment[Idx]);
              });
          }
       })
    },
    //评论
    commentList:function(obj){
        if(Index.user){
            $.cookie("talk",JSON.stringify(obj));
            window.open('gc_comment_details.html');
        }else{
            window.open("login.html");
        }
    },
    dateStamp:function (tm){
        //获取一个事件戳
        var time = new Date(tm);
        //获取年份信息
        var y = time.getFullYear();
        //获取月份信息，月份是从0开始的
        var m = time.getMonth() + 1;
        //获取天数信息
        var d = time.getDate();

        var H = time.getHours();

        var M = time.getMinutes();

        var S = time.getSeconds();
        //返回拼接信息
        return Index.add(H) + '：' + Index.add(M);
    },
    //倒计时
    countDown:function (tm){
        //获取一个事件戳
        var time = new Date(tm);

        var H = time.getHours();

        var M = time.getMinutes();

        var S = time.getSeconds();
        //返回拼接信息
        return Index.add(H) + '：' + Index.add(M)+ '：' + Index.add(S);
    },
    //点赞
    thumbUp:function (idx,Id,num) {
        if(Index.user){
            var obj={
                sid:Index.user.SessionId,
                id:Id,
                ver: Index.Version,
                ts:Index.Ts
            };

            var Sign = Index.md(obj);

            var params={
                sid:Index.user.SessionId,
                id:Id,
                ver: Index.Version,
                ts:Index.Ts,
                sign:Sign
            };

            $.post(api_config.fans,params,function (result) {
                if(result.Code == 3){
                    $("#hd_inner .hd_item").eq(idx).find(".hd_item_comment .zan span").text(parseInt(num)+1);
                }
                alert(result.Msg);
            });

        }else{
            window.open("login.html");
        }
    },
    //退出
    logout:function () {
        var obj={
            sid:Index.user.SessionId,
            ver: Index.Version,
            ts:Index.Ts
        };

        var Sign = Index.md(obj);

        var params={
            sid:Index.user.SessionId,
            ver: Index.Version,
            ts:Index.Ts,
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
    add:function(m) {
        return m < 10 ? '0' + m : m
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
            sid:Index.user.SessionId,
            ver: Index.Version,
            ts:Index.Ts
        };

        var Sign = Index.md(obj);

        var params={
            sid:Index.user.SessionId,
            ver: Index.Version,
            ts:Index.Ts,
            sign:Sign
        };

        $.post(api_config.shopCartQuery,params,function (res) {
            console.log(res);
        })
    }
};

Index.msTimeCount.prototype={
    //1.获取对象
    $:function(ID){
        return document.getElementById(ID);
    },
    init:function(arrTime,arrHtmlObj){
        var _this=this;
        _this._hour=parseInt(arrTime[0]);
        _this._minute=parseInt(arrTime[1]);
        _this._seconds=parseInt(arrTime[2]);
        _this._hourHtmlObj=_this.$(arrHtmlObj[0]);
        _this._minuteHtmlObj=_this.$(arrHtmlObj[1]);
        _this._secondsHtmlObj=_this.$(arrHtmlObj[2]);
        _this._totalSeconds=parseInt(_this._hour*60*60+_this._minute*60+_this._seconds);
        //开始计时：
        _this.timeCount();
    },
    //3.计时器：
    timeCount:function(){
        var _this=this;
        var tmpTimeCount=setInterval(
            function(){
                _this._totalSeconds--;
                _this.refreshTime();
                if(_this._totalSeconds<1){
                    clearInterval(tmpTimeCount);
                    return;
                }
            }
            ,1000);
    },
    //4.刷新页面时间:
    refreshTime:function(){
        var _this=this;
        if(_this._totalSeconds>0){
            _this._hour=parseInt(_this._totalSeconds/3600);
            _this._minute=parseInt((_this._totalSeconds-_this._hour*3600)/60);
            _this._seconds=_this._totalSeconds-_this._hour*3600-_this._minute*60;
        }else{
            _this._hour=_this._minute=_this._seconds=0;
        }
        if(_this._hour<10){
            _this._hour = '0'+_this._hour;
        }
        _this._hourHtmlObj.innerHTML=_this._hour;
        if(_this._minute<10){
            _this._minute = '0'+_this._minute;
        }
        _this._minuteHtmlObj.innerHTML=_this._minute;
        if(_this._seconds<10){
            _this._seconds = '0'+_this._seconds;
        }
        _this._secondsHtmlObj.innerHTML=_this._seconds;
    }
};

$(document).ready(function () {
    Index.init();
});