/**
 * Created by yuyangyang on 2017/8/26.
 */
var Index={
    Version:'1.0.0',
    Ts:Date.parse(new Date())/1000,
    user:'',
    shoppingCarts:[],
    init:function () {
        Index.carousel();   //轮播图

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

            //查询购物车
            Index.queryShoppingCart();
        }

        //我的空间
        $("#gc_space").click(function () {
            if(Index.user){
                window.location.href="gc_space.html";
            }else{
                window.location.href="login.html";
            }
        });

        //我的资产
        $("#gc_asserts").click(function () {
            if(Index.user){
                window.location.href= "gc_asserts.html";
            }else{
                window.location.href = "login.html";
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
        
        //发表评论
        $("#comment").focus(function () {
            if(Index.user){
                window.location.href="gc_space.html";
            }else{
                window.location.href="login.html";
            }
        });

        var Participant =parseInt(Math.random()*(4000+1)+1000);

        var CastCity = parseInt(Math.random()*(10+1)+1);

        var SalesNum = parseInt(Math.random()*(4000+1)+1000);

        $("#participant").text(Participant);

        $("#castCity").text(CastCity);

        $("#salesNum").text(SalesNum);
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
              if(result.Data){
                  var index_products = result.Data.Detail;
                  var index_products_len = index_products.length;
                  for(var i = 0; i<index_products_len;i++){
                      Index.shoppingCarts.push(index_products[i]);
                      var indicator = ' <li data-target="#myCarousel_products" data-slide-to="'+i+'">'+
                          '<img src="'+index_products[i].coverurl+'" style="width:152px; height:152px;"/></li>';

                      $("#products_indicators").append(indicator);

                      $("#products_indicators>li").eq(0).addClass("active");
                      //倒计时
                      var timer_distance = parseInt(index_products[i].end_date)-Date.parse(new Date())/1000;
                      var timer,timer_arr,timer_count;
                      timer= Index.countDown(timer_distance*1000);
                      timer_arr= timer.split("：");
                      var products_item=$('<div class="item" data-timer-count="'+timer_distance+'">'+
                          '<div class="text-center inner-content">'+
                          '<h3>'+index_products[i].product_name+'</h3>'+
                          '</div>'+
                          '<div class="pull-left">'+
                          '<h4 style="position: relative;">' +
                              '<div style="width:130px; height:130px;">' +
                                    '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 100 100">'+
                                        '<path fill-opacity="0" stroke-width="2" stroke="#bbb"'+
                                            'd="M2 12a10 10 0 0 1 10 -10h30a10 10 0 0 1 10 10v30a10 10 0 0 1 -10 10h-30a10 10 0 0 1 -10 -10z"/>'+
                                        '<path id="container_'+i+'" fill-opacity="0" stroke-width="3" stroke="#c02d28"'+
                                            'd="M2 12a10 10 0 0 1 10 -10h30a10 10 0 0 1 10 10v30a10 10 0 0 1 -10 10h-30a10 10 0 0 1 -10 -10z"/>'+
                                  '</svg>' +
                              '</div>'+
                              '<div style="position: absolute; left:14px; top:16px; text-align: center">'+index_products[i].sale_total+'<div>已售</div></div>' +
                          '</h4>'+
                          '<h4>颜色：</h4>'+
                          '</div>'+
                          '<div class="pull-right">'+
                          '<h2>&yen;'+index_products[i].discount_price+'</h2>'+
                          '<a href="javascript:;" class="purchase" data-idx="'+i+'">立即购买</a>'+
                          '<a href="javascript:void(0)" class="add_to_cart" data-idx="'+i+'">'+
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
                          '</div>');
                      //颜色
                      var color_arr = index_products[i].style.split(";");

                      for(var j = 0; j<color_arr.length; j++){
                          var color = $("<h5></h5>");
                          color.text(color_arr[j]);
                          products_item.find(".pull-left").append(color);
                      }


                      //购买
                      products_item.find(".purchase").click(function () {
                          var idx = $(this).attr("data-idx");
                          $.cookie('mall_products',JSON.stringify(index_products[idx]));
                          window.location.href="gc_mall_detail.html";
                      });

                      products_item.find(".add_to_cart").click(function () {
                          var idx = $(this).attr("data-idx");
                          $.cookie('mall_products',JSON.stringify(index_products[idx]));
                          window.location.href="gc_mall_detail.html";
                      });

                      $("#myCarousel_products .carousel-inner").append(products_item);

                      $("#myCarousel_products .carousel-inner .item").eq(0).addClass('active');

                      Index.timerCount('timer_count'+i,i);
                  }

                  for(var k=0; k<index_products.length;k++){
                      var container = '#container_'+k;
                      var bar = new ProgressBar.Path(container, {
                          easing: 'easeInOut',
                          duration: 2000
                      });
                      bar.set(0);
                      bar.animate(parseFloat(index_products[k].sale_total)/parseFloat(index_products[k].presale_total));
                  }
              }else{
                  $("#myCarousel_products .carousel-inner").html("暂无商品!");
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
              if(result.Data){
                  $("#hd_inner").empty();
                  var temp_comment = result.Data.Detail;
                  var comment_len = temp_comment.length;
                  for(var i =0; i<comment_len;i++) {
                      var comment_data = temp_comment[i];
                      var headUrl= comment_data.headurl;
                      var hd_item = $('<div class="hd_item" data-Id="'+comment_data.id+'" data-index="'+i+'">'+
                          '<img class="img_title" src="'+headUrl+'" alt="头像" />'+
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
                          '</div>');

                      var hd_item_img=$('<div class="hd_item_img"></div>');
                      if(comment_data.imgurl){
                          var arr = comment_data.imgurl.split(";");
                          for(var j =0; j<arr.length-1;j++){
                              var comment_img = '<img src="'+arr[j]+'" />';
                              hd_item_img.append(comment_img);
                          }
                          hd_item.find(".hd_item_des").append(hd_item_img);
                      }
                      $("#hd_inner").append(hd_item);
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
              }else{
                  $("#hd_inner").html("暂无评论").css("min-height",'700px');
              }
          }
       })
    },
    //评论
    commentList:function(obj){
        if(Index.user){
            $.cookie("talkId",JSON.stringify(obj.id));
            window.location.href ='gc_comment_details.html';
        }else{
            window.location.href = "login.html";
        }
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
                   Index.comment();
                }
                alert(result.Msg);
            });

        }else{
            window.location.href="login.html";
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
    dateStamp:function (tm){
        //获取一个事件戳
        var time = new Date(tm);

        var H = time.getHours();

        var M = time.getMinutes();
        //返回拼接信息
        return Index.add(H) + '：' + Index.add(M);
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
    addShoppingCart:function (Idx) {
        if(Index.user){
            var product = Index.shoppingCarts[Idx];

            var Style = product.style.split(';');

            var obj={
                sid:Index.user.SessionId,
                pid:product.id,
                pt_id:product.pt_id,
                order_quantity:1,
                style:Style[0],
                hosted_mid:1,
                hosted_city:'上海',
                ver: Index.Version,
                ts:Index.Ts
            };

            var Sign=Index.md(obj);

            var params={
                sid:Index.user.SessionId,
                pid:product.id,
                pt_id:product.pt_id,
                order_quantity:1,
                style:Style[0],
                hosted_mid:1,
                hosted_city:'上海',
                ver: Index.Version,
                ts:Index.Ts,
                sign:Sign
            };

            $.post(api_config.shopCartAdd,params,function (res) {
                alert(res.Msg);
                if(res.Code ==3){
                    Index.queryShoppingCart();
                }
            });
        }else{
            window.location.href="login.html";
        }
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
            if(res.Code == 3){
                if(res.Data){
                    $("#shop_cart_num").text(res.Data.length);
                }
            }
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