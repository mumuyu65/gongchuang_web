/**
 * Created by admin on 2017/9/1.
 */
var Register={
    timer:'',
    seconds:120,
    Version:'1.0.0',
    Ts:Date.parse(new Date())/1000,
    init:function () {
        $("#gc_register").click(function(){
            Register.doRegister();
        });

        $("#gc_get_vcode").click(function(){
            if($("#gc_phone").val().trim()){
                Register.getVcode();
            }else{
                alert("手机号为空！");
            }

        });
    },
    getVcode:function () {
        Register.timer = setInterval(function(){
            $("#gc_get_vcode").text('请'+Register.seconds+'s后重新发送');
            Register.seconds--;
            if(Register.seconds<=0){
                clearInterval(Register.timer);
                $("#gc_get_vcode").text('获取验证码');
            }
        },1000);

        var obj={
            phone:$("#gc_phone").val().trim(),
            ver: Register.Version,
            ts:Register.Ts
        };

        var Sign=Register.md(obj);

        var params={
            phone:$("#gc_phone").val().trim(),
            ver: Register.Version,
            ts:Register.Ts,
            sign:Sign
        };
        $.post(api_config.getVcode,params,function (result) {
            alert(result.Msg);
        });
    },
    doRegister:function () {
        var Account=$("#gc_phone").val().trim(),
            Pwd=$("#gc_pwd").val().trim(),
            Vcode=$("#gc_vcode").val().trim(),
            Nick =$("#gc_account").val().trim();
        if(Account && Pwd && Vcode && Nick ){
            var obj={
                account:Account,
                pwd:Pwd,
                vcode:Vcode,
                nick:Nick,
                ver:Register.Version,
                ts:Register.Ts
            };

            var Sign = Register.md(obj);

            var params={
                account:Account,
                pwd:Pwd,
                vcode:Vcode,
                nick:Nick,
                ver:Register.Version,
                ts:Register.Ts,
                sign:Sign,
            };
            $.post(api_config.register,params,function (result) {
                //console.log(result);
                alert(result.Msg);
                if(result.Code == 3){
                    window.location.href = 'login.html';
                }
            });
        }else{
            alert("存在空值，请重新输入!");
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
   Register.init();
});