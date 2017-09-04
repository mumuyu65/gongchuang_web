/**
 * Created by admin on 2017/9/1.
 */
var Login={
    Version:'1.0.0',
    Ts:Date.parse(new Date())/1000,
    init:function () {
       $("#gc_login").click(function () {
           Login.doLogin();
       });
    },
    doLogin:function () {
        var Account = $("#gc_phone").val().trim(),
            Pwd =$("#gc_pwd").val().trim();

        if(Account && Pwd){
            var obj={
                account:Account,
                pwd:Pwd,
                platform:'4',
                ver: Login.Version,
                ts:Login.Ts
            };

            var Sign = Login.md(obj);

            var params={
                account:Account,
                pwd:Pwd,
                platform:'4',
                ver: Login.Version,
                ts:Login.Ts,
                sign:Sign
            };
            
            $.post(api_config.login,params,function (result) {
                //console.log(result);
                if(result.Code ==3){
                    $.cookie('gcUser',JSON.stringify(result.Data));
                    window.location.href='index.html';
                }else{
                    alert(result.Msg);
                }
            })
        }else{
            alert("存在空值，请重新输入！");
        }
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
    Login.init();
});