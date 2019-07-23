//获取地址栏url中的参数
function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg); //获取url中"?"符后的字符串并正则匹配
    var context = "";
    if (r != null)
        context = r[2];
    reg = null;
    r = null;
    return context == null || context == "" || context == "undefined" ? "" : context;
}

//检测是否为json对象
function isJson(obj){
    var isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
    return isjson;
}

//检测身份证号合法性(支持15位和18位身份证号)
function IdentityCodeValid(code) {
    var pass= true;

    if(!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)){
        tip = "身份证号格式错误！";
        pass = false;
    }else{
        //18位身份证需要验证最后一位校验位
        if(code.length == 18){
            code = code.split('');
            //∑(ai×Wi)(mod 11)
            //加权因子
            var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
            //校验位
            var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
            var sum = 0;
            var ai = 0;
            var wi = 0;
            for (var i = 0; i < 17; i++)
            {
                ai = code[i];
                wi = factor[i];
                sum += ai * wi;
            }
            var last = parity[sum % 11];
            if(parity[sum % 11] != code[17]){
                tip = "身份证号不正确！";
                pass =false;
            }
        }
    }
    if(!pass){
        alerts(tip);
    };
    return pass;
}

//检测手机号码
function checkPhone(phone){
    if(!phone){
        ajaxTip('手机号码不能为空');
        return false;
    }else if(!(/^1[34578]\d{9}$/.test(phone))){
        ajaxTip('手机号码有误，请重新输入');
        return false;
    }else{
        return true;
    }
}

//检测密码是否为数字，字母，字符串
function checkPass(Password,cPassword,type){
    if(type!=1){
        if(!Password){
            ajaxTip('登录密码不能为空');
            return false;
        }else if( Password.length<6 || Password.length>16){
            ajaxTip('登录密码有误，请重新输入');
            return false;
        }else{
            return true;
        }
    }else{
        if(!cPassword){
            ajaxTip('确认密码不能为空');
            return false;
        }else if(Password!==cPassword){
            ajaxTip('密码不一致，请重新输入');
            return false;
        }else{
            return true;
        }
    }

}

//检测验证码是否为数字
function checkCode(code){
    if(!code){
        ajaxTip('验证码不能为空');
        return false;
    }else if(!(/^[0-9]{6}$/.test(code))){
        ajaxTip('验证码有误，请重新输入');
        return false;
    }else{
        return true;
    }
}

//检测是否为数字
function isNumber(val){
    if(val === "" || val ==null){ // isNaN()函数 把空串 空格 以及NUll 按照0来处理 所以先去除
        return false;
    }
    if(!isNaN(val)){
        return true;
    }else{
        return false;
    }
}

//倒计时
function countdown(time) {
    if (time > 0) {
        $('.codebtn').attr('do-send','false').html(--time+'秒');
        setTimeout(function () {
            countdown(time);
        }, 1000);
    }else{
        $('.codebtn').attr('do-send', 'true').html('获取验证码');
    }
}
function ordercountdown(time){
    if (time > 0) {
        $('.codebtn').attr('do-send','false').html(--time+'秒后重新发送');
        setTimeout(function () {
            ordercountdown(time);
        }, 1000);
    }else{
        $('.codebtn').attr('do-send', 'true').html('获取短信验证码');
    }
}

//金钱取两位小数点
function fixMoney(i) {
    //  先转成字符串 返回Number类型
    i = ''+i
    if(i.indexOf('.') > 0) {
        return parseInt(Number(i) * 100)/100 < 0 ? 0 : parseInt(Number(i) * 100)/100
    } else {
        return Number(i)
    }
}
//保存两位小数
function toDecimal2(x) {
    var f = parseFloat(x);
    if (isNaN(f)) {
        return false;
    }
    var f = Math.round(x*100)/100;
    var s = f.toString();
    var rs = s.indexOf('.');
    if (rs < 0) {
        rs = s.length;
        s += '.';
    }
    while (s.length <= rs + 2) {
        s += '0';
    }
    return s;
}

//过滤年月日
function filterDate(i) {
    filterFarmat =function(n){
        return n < 10 ? '0'+n : n
    }
    var time = new Date(parseInt(i) * 1000);
    var day= filterFarmat(time.getDate());
    var month=filterFarmat(time.getMonth()+1);
    var year=filterFarmat(time.getFullYear());
    return year+'/'+month+'/'+day;
}

//过滤日期时分秒
function filterDateTime(i) {
    filterFarmat =function(n){
        return n < 10 ? '0'+n : n
    }
    var time = new Date(parseInt(i))
    var hours=filterFarmat(time.getHours());
    var minute=filterFarmat(time.getMinutes());
    var millin=filterFarmat(time.getSeconds());
    return filterDate(i)+'&nbsp;'+hours+':'+minute;
}

//获取日期时间方法
function getDateStr(dayCount){
    if(null == dayCount){
        dayCount = 0;
    }
    var dd = new Date();
    dd.setDate(dd.getDate()+dayCount);//设置日期
    var y = dd.getFullYear();
    var m = dd.getMonth()+1;//获取当前月份的日期
    if(m<10){
        m='0'+m;
    }
    var d = dd.getDate();
    if(d<10){

        d='0'+d;
    }
    return y+"-"+m+"-"+d;
}

//日期时间差：d1为结束日期，d2为开始日期
function DateDiff(d1,d2){
    var day = 24 * 60 * 60 *1000;
    try{
        var dateArr = d1.split("-");
        var checkDate = new Date();
        checkDate.setFullYear(dateArr[0], dateArr[1]-1, dateArr[2]);
        var checkTime = checkDate.getTime();
        var dateArr2 = d2.split("-");
        var checkDate2 = new Date();
        checkDate2.setFullYear(dateArr2[0], dateArr2[1]-1, dateArr2[2]);
        var checkTime2 = checkDate2.getTime();
        var cha = (checkTime - checkTime2)/day;
        return cha;
    }catch(e){
        return false;
    }
}
// 过滤数组中的null undefined "" 空格
function bouncer(arr) {
    return arr.filter(function(val){
        return !(!val || val === "");
    });
}


//封装通用提示信息
function ajaxTip(callText) {
    var thisBody = document.getElementsByTagName("body")[0],
        Div = document.createElement('div'),
        text = "<p class='ajaxtiptext'>" + callText + "</p>"
    Div.setAttribute('class', 'ajaxtiplayer');
    Div.innerHTML = text;
    Div.style.display = 'block';
    thisBody.appendChild(Div);
    setTimeout(function () {
        thisBody.removeChild(Div);
    }, 2000);
}

//封装通用alert弹框(自定义弹框提示)
var alertsState = false;
var alertsClickCall = null;
var alertsClickCall2 = null;
var alertsQueue = [];
function alerts(j) {
    document.getElementsByTagName('body')[0].style.overflow="hidden";
    if(!isJson(j)){
        j = { txt: j };
    }

    if(alertsState){
        alertsQueue.push(j);
    }else{
        alertsState = true;
        var json = $.extend({
            type: 'default', // 弹框类型 [default 普通] [success 成功] [fail 失败] [info 警告]
            title: '', // 弹框标题
            txt: '', // 弹框内容
            autoHide: 2, // 自动隐藏时间 btn存在时该项不生效
            call: null, // 生成成功回调函数
            btn: '关闭', // 按钮 空为不显示，会自动隐藏
            click: null, // 按钮点击回调函数
            btn2: '', // 按钮 空为不显示，会自动隐藏
            click2: null, // 按钮点击回调函数
        },j);

        var hasBtn = false, hasBtn2 = false;
        if(json.btn){
            hasBtn = true;
        }
        if(json.btn2){
            hasBtn2 = true;
        }
        if(['success','fail','info'].indexOf(json.type)==-1){
            json.type = 'default';
        }
        alertsClickCall = json.click;
        alertsClickCall2 = json.click2;

        var html = '<div class="alertBox df hao wao" type="'+json.type+'">'+
            '<div class="net">'+
            (json.title?'<div class="top df hao wao">'+json.title+'</div>':'')+
            '<div class="txt df cf hao wao">'+json.txt+'</div>'+
            (hasBtn||hasBtn2?
                '<div class="foot df hao wao">'+
                (hasBtn?'<div class="btn" onclick="closeAlerts(1)">'+json.btn+'</div>':'')+
                (hasBtn2?'<div class="btn" onclick="closeAlerts(2)">'+json.btn2+'</div>':'')+
                '</div>'
                :'')+
            '</div>'+
            '</div>';
        $('body').append(html);
        if(!hasBtn&&!hasBtn2){
            console.log(111);
            setTimeout(closeAlerts,(json.autoHide||2)*1000)

        }
    }
}
function closeAlerts(t){
    document.getElementsByTagName('body')[0].style.overflow="auto";
    $('.alertBox').addClass('closeAlert');
    setTimeout(function(){
        $('.alertBox').remove();

        if(alertsClickCall&&t==1){
            alertsClickCall();

        }
        if(alertsClickCall2&&t==2){
            alertsClickCall2();
        }

        // 延迟执行弹框队列
        alertsState = false;
        if(alertsQueue.length>0){
            alerts(alertsQueue[0]);
            alertsQueue.splice(0,1);
        }
    },250)
}
window.alert = function(txt,call) {
    alerts({
        txt: txt||'',
        click: call,
    })
};
window.confirm = function(txt,btn,btn2,call,call2) {
    alerts({
        txt: txt||'',
        btn: btn||'取消',
        btn2: btn2||'确定',
        click: call,
        click2: call2,
    })
};
















