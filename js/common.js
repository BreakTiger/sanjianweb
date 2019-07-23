/* common.js文件，创建于2019/04/28 author:wen*/
var ajaxUrl = 'http://sanjiang.heifeng.xin/';//请求域名
var imgUrl = 'http://sanjiang.heifeng.xin/';//图片链接
/*封装通用ajax请求*/
var userToken = localData('get', 'userLoginInfo').token || '';
function ajax_get(surl, param, call) {
    $.ajax({
        headers: { 'token': userToken },
        url: ajaxUrl + (surl.substring(0, 1) == '/' ? surl.substring(1) : surl),
        data: param || {},
        type: 'get',
        dataType: 'json',
        timeout: 15000,
        success: call,
    })
}
function ajax_post(surl, param, call) {
    $.ajax({
        headers: { 'token': userToken },
        url: ajaxUrl + (surl.substring(0, 1) == '/' ? surl.substring(1) : surl),
        data: param || {},
        type: 'post',
        dataType: 'json',
        timeout: 15000,
        success: call,
    })
}
function callBack(r, j) {
    j = j || {};
    if (r.status == 100) { //重新登录
        if (window.location.pathname.indexOf('/login.html') > 0 || window.location.pathname.indexOf('/register.html') > 0) {
            return false;
        }
        alert('请先登录！', function () {
            window.location.href = 'login.html';
        });
    } else if (r.status == 200) { // 操作成功
        j.success && j.success(r.data);
    } else if (r.status == 201) { // 操作失败
        if (j.fail) {
            j.fail(r.msg);
        }else {
            return;
        }
    } else if (r.status == 202) { // 操作成功，需要跳转页面
    } else if (r.status == 203) { // 操作失败，需要跳转页面
    } else { }
}

//本地数据操作,(存于localStorge中)
function localData(t, key, data) {
    if (t == 'set') { // 保存
        localStorage.setItem(key, JSON.stringify(data));
    } else if (t == 'get') { // 读取
        var data = localStorage.getItem(key) || '{}';
        return JSON.parse(data == 'undefined' ? '{}' : data);
    } else if (t == 'remove') { // 删除某个值
        localStorage.removeItem(key);
    } else if (t == 'clear') {
        localStorage.clear();
    }
}
//设置cookies
function setCookie(name, value) { //设置cookie
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 30);
    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}
//获取cookies
function getCookie(name) {  //获取Cookie
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}


/*获取用户信息*/
$(function (){
    $('#header').load('header.html');
    $('#footer').load('footer.html');
    //根据token获取信息
    var usertoken = localData('get', 'userLoginInfo').token;
    if (usertoken) {
        ajax_post('/api/user/info', { token: usertoken }, function (r) {
                callBack(r, {
                    success: function (res) {
                        var userhtml = '', showhtml = '';
                        userhtml = '<span>您好，</span>'+'<span class="clamp1" data-uid="'+res.user_id+'">'+(res.nickname==null?'游客':res.nickname)+'</span>';
                        showhtml = '<div class="userimg"><a href="personal.html">'+
                        '<img src="'+(res.head_pic==null ?'images/userimg.png':res.head_pic)+'" alt="">'+'</a></div>'+
                         '<div class="username">'+(res.nickname==null?'游客':res.nickname)+'</div>'+
                         '<div class="usermoney">'+
                             '<div>'+
                                 '<p><span>余额：</span><span class="uprice">1809.00</span><span class="uprice">元</span></p>'+
                                 '<p><span>订单：</span><span class="uprice">3</span><span class="uprice">笔</span></p>'+
                             '</div>'+
                             '<div>'+
                                 '<p><span>动态：</span><span class="uprice">120</span><span class="uprice">条</span></p>'+
                                 '<p><span>消息：</span><span class="uprice">3</span><span class="uprice">条</span></p>'+
                             '</div>'+
                         '</div>'+
                         '<div class="userlist">'+
                             '<ul>'+
                                 '<li><span>【旅游】三江旅游文化节</span><span class="hot-icon"></span></li>'+
                                 '<li><span>【汽车】皇鼎名车城开业大酬宾</span><span class="hot-icon"></span></li>'+
                                 '<li><span>【旅游】三江美食节</span><span class="hot-icon"></span></li>'+
                             '</ul>'+
                         '</div>';
                         $('#header-top .nav ul li').eq(3).html(userhtml);
                         $('.banner-box .m-box3 .exitbtn').before(showhtml);
                         $('.m-box2').hide().next('.m-box3').show();
                         localData('set','userinfo',{
                             user_id:res.user_id,
                             user_name:res.nickname,
                         });
                    },
                    fail:function(res){
                        localData('remove','userLoginInfo');
                    }
                })
        })
    } else {
        $('.m-box3').hide().prev('.m-box2').show();
    }
});

/*封装获取轮播图接口函数 参数sc_id 首页是100，模块首页是1-6，其他7-n见商家类型说明 参数city_id 表示城市*/
function getBanner(params) {
    ajax_post('/api/ad/carouselList', params, function (r) {
        var bannerhtml = '';
        callBack(r, {
            success: function (data) {
                data.forEach(function(item,index){
                    bannerhtml += '<div class="swiper-slide" data-id="'+item.id+'">'+
                                    '<a href="'+item.link+'">'+
                                        '<img src="'+item.img+'" alt="'+item.name+'">'+
                                    '</a>'+
                                  '</div>';
                })
                $('.swiperbanner .swiper-container .swiper-wrapper').append(bannerhtml);
                /*广告轮播图*/
                var mySwiper = new Swiper('.swiperbanner .swiper-container', {
                    autoplay: {
                        delay: 2500,
                        stopOnLastSlide: false,
                        disableOnInteraction: true,
                        observer: true,
                    }
                })
            }
        })

    })
}

/*封装获取城市接口函数* pid为0时获取以及城市，不为0时获取二级地区/*/
function getCity(pid){
    var params={pid:pid};
    if (pid==0){
        ajax_post('/api/category/area', params, function (r) {
            var cityhtml = '';
            callBack(r, {
                success: function (res) {
                    res.forEach(function(item, index){
                        cityhtml += '<li data-val="'+item.id+'" data-text="'+item.name+'">'+item.name+'</li>';
                    })
                }
            })
            $('.address-menu ul').append(cityhtml);
        })
        /*选择城市*/
        $('.address-info').on('click', function () {
            $(this).parent().next().slideToggle();
        });
        $('.address-menu').on('click', 'li', function () {
            var cityname = $(this).attr('data-text');
            var cityid = $(this).attr('data-val');
            $(this).parents('.address-menu').hide();
            localData('set', 'cityinfo', {
                city_id: cityid,
                cityname: cityname
            });
            window.location.reload();
        })
    } else {
        ajax_post('/api/category/area', params, function (r) {
            var areahtml = '';
            callBack(r, {
                success: function (res) {
                    res.forEach(function(item, index){
                        areahtml += '<li data-id="'+item.id+'">'+item.name+'</li>';
                    })
                }
            })
            var allhtml='<li class="c-active" data-id="'+pid+'">全部</li>'+areahtml;
            $('.nav-one ul').append(allhtml);
            $('.nav-one ul').attr('data-val',pid);
        })
    }

}

/*封装获取门店接口函数，参数sc_id 酒店：7， 景区：8，吃在三江：9 ，路线:10 */
function getStore(params){
    ajax_post('/api/category/storeAttrList',params,function(r){
        var storehtml='';
        callBack(r,{
            success:function(data){
                data.forEach(function(item,index){
                    storehtml+='<li data-id="'+item.id+'">'+item.name+'</li>';
                })
            }
        })
        var allhtml='<li class="c-active" data-id="0">全部</li>'+storehtml;
        $('.nav-two ul').append(allhtml);
    })

}

/*封装获取酒店，景区，吃在三江，旅游路线 keyword:关键字，area_id:区域id，attr_id:门店id，店铺id：sc_id,row:条数，page：页*/
function getShowList(params) {
    var sc_id=params.sc_id;
    ajax_post('/api/store/commonList', params, function (r) {
        callBack(r, {
            success: function (res) {
                $('.left-main ul').html('');
                var Array = res.data;
                if(Array.length>0){
                    $('.other').hide();
                    var hotelhtml = ''
                    Array.forEach(function(item, index){
                        let is_recommend = item.store_recommend;
                        let html = '';
                        function dorecommended(is_recommend) {
                            if (is_recommend == 1) {
                                html += '<span class="recommended-icon"></span>';
                            }
                        }
                        dorecommended(is_recommend);
                        let thtml='';
                        switch(true){
                            case sc_id==7:
                                thtml='住过';
                                break;
                            case sc_id==8:
                                thtml='去过';
                                break;
                            case sc_id==9:
                                thtml='吃过';
                                break;
                            case sc_id==10:
                                thtml='收藏';
                                break;
                            default:
                                break;
                        }
                        hotelhtml+='<li class="left-card card" data-storeid="'+item.store_id+'" data-id="'+item.sc_id+'">'+
                                      '<div class="c-card">'+
                                        '<div class="c-img">'+
                                            '<img src="'+item.store_cover+'" alt="">'+
                                            html+
                                        '</div>'+
                                        '<div class="c-box fw-m fz-18">'+
                                            '<div class="description f-w5">'+
                                                '<div class="row1">'+
                                                    '<span class="nav-icon"><span>'+item.area_name+'</span></span>'+
                                                    '<span class="fz-26 c-16">'+item.store_name+'</span>'+
                                                '</div>'+
                                                '<div class="fz-20 c-hover">'+item.score+'.0分</div>'+
                                            '</div>'+
                                            '<div class="dtext">'+
                                                '<div class="fw-r f-w4 fz-18 c-6b">'+item.attr_name+'</div>'+
                                                '<div class="row2 fw-r">'+
                                                    '<a href="javascript:;">'+item.sales_count+'人'+thtml+'</a>'+
                                                    '<a href="javascript:;">'+item.comment_count+'条评价</a>'+
                                                '</div>'+
                                            '</div>'+
                                            '<div class="dprice">'+
                                                '<span class="price">¥</span>'+
                                                '<span class="price fz-20">'+item.min_consume+'</span>'+
                                                '<span class="c-6b fw-r">&nbsp;/起</span>'+
                                            '</div>'+
                                            '<div class="dtelphone f-w4 clamp1">'+
                                                '<span class="c-6b">联系电话：</span><span class="c-333">'+item.store_phone+'</span>'+
                                            '</div>'+
                                            '<div class="daddress f-w4 c-6b clamp1">地址：'+item.store_address+'</div>'+
                                        '</div>'+
                                       '</div>'+
                                     '</li>';
                    })
                    $('.left-main ul').append(hotelhtml);
                    //分页器
                    var totalPages = Math.ceil(res.total / res.per_page);//计算总页数
                    $("#pagelist1").paging({
                        pageNum: res.current_page, // 当前页面
                        totalNum:totalPages, // 总页码
                        totalList: res.total, // 记录总数量
                        callback: function (num) { //回调函数
                            var city_id=localData('get','cityinfo').city_id;
                            var param4={keyword:'',area_id:city_id,attr_id:'',sc_id:sc_id, page:num,row:6};
                            getShowList(param4);
                        }
                    });
                    $('.left-main,.page_div').show();
                }else{
                    $('.left-main,.page_div').hide();
                    $('.other').show();
                }
            }
        })
    })
}

/*封装获取侧边列表数据接口*/
function getShopList(sc_id,city_id){
    ajax_post('/api/store/sideList',{sc_id:sc_id,city_id:city_id,row:5},function(r){
        callBack(r,{
            success:function(data){
                var sidelisthtml='';
                if(data.length>0){
                    data.forEach(function(item,index){
                        sidelisthtml+='<div class="right-card">'+
                            '<div class="rcard-box">'+
                                '<div class="rcard1">'+
                                    '<div>'+
                                        '<span class="hotelicon1">'+
                                          '<img src="'+item.store_logo+'" alt="">'+
                                        '</span>'+
                                        '<span class="fz-24 f-w5 c-16">'+item.store_name+'</span>'+
                                    '</div>'+
                                    '<div>'+
                                        '<a href="hotel_show.html?store_id='+item.store_id+'" class="c-fff">进入店铺</a>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="rcard2">'+
                                    '<a href="javascript:;">'+
                                        '<img src="'+item.store_cover+'" alt="">'+
                                    '</a>'+
                                '</div>'+
                            '</div>'+
                        '</div>'
                    });
                    $('.right-content').append(sidelisthtml);
                }else{
                    return;
                }
            }
        })
    })
}

/*获取详情页店铺列表页*/
function getDetailShopList(sc_id,store_id,city_id){
    ajax_post('/api/store/randList',{sc_id:sc_id,store_id:store_id,city_id:city_id,row:3},function(r){
        callBack(r,{
            success:function(data){
                var shoplisthtml='';
                if(data.length>0){
                    data.forEach(function(item,index){
                        shoplisthtml+='<div class="right-card">'+
                            '<div class="rcard-box">'+
                                '<div class="rcard1">'+
                                    '<div>'+
                                        '<span class="hotelicon1">'+
                                          '<img src="'+item.store_logo+'" alt="">'+
                                        '</span>'+
                                        '<span class="fz-24 f-w5 c-16">'+item.store_name+'</span>'+
                                    '</div>'+
                                    '<div>'+
                                        '<a href="hotel_show.html?store_id='+item.store_id+'" class="c-fff">进入店铺</a>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="rcard2">'+
                                    '<a href="javascript:;">'+
                                        '<img src="'+item.store_cover+'" alt="">'+
                                    '</a>'+
                                '</div>'+
                            '</div>'+
                        '</div>';
                    })
                    $('.storebox').append(shoplisthtml);
                }else{
                    return;
                }
            }
        })
    })
}


/*封装评论列表函数，参数store_id*/
function gethotelComents(commentparams,type){
    var store_id=commentparams.store_id;
    var level=commentparams.level;
    $('.comments .clist').html('');
    ajax_post('/api/comment/ListByStore',commentparams,function(r){
        callBack(r,{
            success:function(res){
                //评论列表接口数据渲染
                var Array=res.list.data;
                var commenthtml='';
                //等级数量（好评，中评，差评）
                if(type==1){
                    var levelhtml='<li class="li c-active" data-level="">'+
                                        '<p class="lineBottom"><span>全部</span></p>'+
                                        '<p>&#40;<span>'+res.list.total+'条评价</span>&#41;</p>'+
                                    '</li>'+
                                    '<li class="li" data-level="1">'+
                                        '<p><span>好评</span></p>'+
                                        '<p>&#40;<span>'+res.statistics.level_1+'条评价</span>&#41;</p>'+
                                    '</li>'+
                                    '<li class="li" data-level="2">'+
                                        '<p><span>中评</span></p>'+
                                        '<p>&#40;<span>'+res.statistics.level_2+'条评价</span>&#41;</p>'+
                                    '</li>'+
                                    '<li class="li" data-level="3">'+
                                        '<p><span>差评</span></p>'+
                                        '<p>&#40;<span>'+res.statistics.level_3+'条评价</span>&#41;</p>'+
                                    '</li>';
                    $('.comment .list ul').html(levelhtml);
                }
                if(Array.length>0){
                    $("#page2").show();
                    Array.forEach(function(item,index){
                        var rank=item.rank;
                        var html = '';
                        //评论等级（星星）
                        function dorank(rank){
                            for (let i=0;i<rank;i++){
                                html+='<span class="l-icon1"></span>';
                            }
                            if (rank!=5) {
                                for (let i=0;i<5-rank;i++) {
                                    html+='<span class="l-icon3"></span>';
                                }
                            }
                        }
                        dorank(rank);
                        //评论中展示图片
                        var imgarr=item.images;
                        var imghtml='';
                        function doimg(imgarr){
                            for(var j=0;j<imgarr.length;j++){
                                imghtml+='<li><img src="'+imgarr[j]+'"></li>';
                            }
                        }
                        doimg(imgarr);

                        //渲染评论列表数据
                        commenthtml+='<div class="commentlist" data-cid="'+item.comment_id+'">'+
                                        '<div class="c-info">'+
                                            '<div class="user" data-uid="'+item.user_id+'">'+
                                                '<div class="usericon">'+
                                                     '<img src="'+item.user.head_pic+'">'+
                                                '</div>'+
                                                '<div class="username">'+
                                                    '<p class="fz-18 c-333">'+item.user.nickname+'</p>'+
                                                    '<p class="fz-14 c-90" data-name="'+item.goods_id+'">'+item.goods_name+'</p>'+
                                                '</div>'+
                                            '</div>'+
                                            '<div class="level">'+
                                                '<p class="fz-14 c-70">'+filterDateTime(item.create_time)+'</p>'+
                                                '<p class="rank">'+html+'</p>'+
                                            '</div>'+
                                        '</div>'+
                                        '<div class="c-text clamp2">'+item.content+'</div>'+
                                        '<div class="c-more">'+
                                            '<span class="c-active '+(imgarr.length==0?'hide':'on')+'">'+(imgarr.length==0?'':'展开')+'</span>'+
                                            '<span class="bule-down-icon '+(imgarr.length==0?'hide':'on')+'"></span>'+
                                        '</div>'+
                                        '<div class="c-img">'+
                                            '<ul>'+imghtml+'</ul>'+
                                        '</div>'+
                                  '</div>';

                    })
                    $('.comments .clist').append(commenthtml);
                    //分页功能
                    var totalPages = Math.ceil(res.list.total / res.list.per_page);//计算总页数);
                    $("#page2").paging({
                        pageNum:res.list.current_page, // 当前页面
                        totalNum:totalPages, // 总页码
                        totalList: res.list.total, // 记录总数量
                        callback: function (page) { //回调函数
                            if(level==''){
                                var param4={store_id:store_id,page:page,row:4}
                            }else{
                                var param4={store_id:store_id,level:level,page:page,row:4};
                            }
                            gethotelComents(param4);
                        }
                    });
                    //图片是否展开功能
                    $('.comments .clist').on('click','.c-more',function(){
                        $(this).siblings('.c-img').toggle();
                        var display= $(this).siblings('.c-img').css('display');
                        if(display=='block'){
                            $(this).find('span:last').addClass('bule-down-icon').removeClass('bule-top-icon');
                        }else{
                            $(this).find('span:last').addClass('bule-top-icon').removeClass('bule-down-icon');
                        }
                    })
                }else{
                    $("#page2").hide();
                }
            }
        })

    });
}


/*封装商家相册,商家展示,商家介绍的共用方法,参数为:store_id type=1表示显示设施*/
function album(store_id,hastype){
    var param = {store_id:store_id};
    ajax_post('/api/store/detail', param, function (r) {
        var ahtml='',tophtml='';
        callBack(r, {
            success: function (data) {
                //商家展示
                tophtml='<div class="detail-one flex" data-store="'+data.store_id+'">'+
                                '<div class="d-icon"><img src="'+data.store_logo+'" alt=""></div>'+
                                '<div class="d-text">'+
                                    '<p class="d-text-p1 flex fl-align fw-m">'+
                                        '<span class="right-icon c-fff fz-18"><span>'+data.area_name+'</span></span>'+
                                        '<span class="fz-26 c-16">'+data.store_name+'</span>'+
                                    '</p>'+
                                    '<p class="d-text-p2">'+
                                        '<span class="fw-r fz-18 c-6b">联系电话：</span>'+
                                        '<span class="fz-20 c-333 fw-m">'+data.store_phone+'</span>'+
                                    '</p>'+
                                    '<p class="d-text-p3 fw-r fz-18 c-6b">地址：'+data.store_address+'</p>'+
                                '</div>'+
                                '<div class="d-button">'+
                                    '<a href="javascript:;">'+data.sales_count+'人去过</a>'+
                                    '<a href="javascript:;">'+data.comment_count+'条评价</a>'+
                                    '<a href="javascript:;" class="dbtn">'+
                                        '<span class="'+(data.is_collect==0?"uncollect-icon":"collect-icon")+'"></span>'+
                                        '<span class="'+(data.is_collect==0?"collect-item":"collect-item1")+'">'+((data.is_collect==0?"收藏店铺":"已收藏"))+'</span>'+
                                    '</a>'+
                                '</div>'+
                            '</div>'+
                          '<div class="detail-two">'+
                                '<a href="javascript:;">'+
                                    '<img src="'+data.store_banner+'" alt="">'+
                                '</a>'+
                          '</div>';
                $('.detail-box').append(tophtml);
                $('.dbtn').click(function(){
                    var that=$(this);
                    ajax_post('/api/store/collect',{store_id:data.store_id},function(r){
                        callBack(r,{
                            success:function(data){
                                if(data==1){
                                    that.find('span').eq(0).addClass('collect-icon').removeClass('uncollect-icon');
                                    that.find('span').eq(1).text('已收藏').addClass('collect-item1').removeClass('collect-item');
                                }else if(data==0){
                                    that.find('span').eq(0).addClass('uncollect-icon').removeClass('collect-icon');
                                    that.find('span').eq(1).text('收藏店铺').addClass('collect-item').removeClass('collect-item1');
                                }

                            }
                        })
                    })

                });

                //商家相册
                var list = data.store_slide;
                list.forEach(function(item,index){
                    ahtml+='<div class="swiper-slide">' +
                                '<a href="javascript:;">'+
                                    '<img src="'+item+'" alt="">'+
                                    '<div class="cover"><span class="coverIcon"></span></div>'+
                                '</a>'+
                            '</div>';
                });
                $('.pics .swiper-container .swiper-wrapper').append(ahtml);
                var  swiper = new Swiper('.pics .swiper-container', {
                    slidesPerView:3,
                    slidesPerColumn:1,
                    spaceBetween:8,
                });
                //点击预览相册
                $('body').append('<div id="mask"></div>')
                $('.btn-img').on('click',function(){
                    document.getElementsByTagName('body')[0].style.overflow="hidden";
                    $('#mask,#showModel').show();
                    getPic();
                });
                function getPic(){
                    $('.model-img .swiper-container .swiper-wrapper').append(ahtml);
                    var galleryTop =new Swiper(".model-img .swiper-container", {
                        slidesPerView:1,
                        navigation: {
                            nextEl: ".right-btn",
                            prevEl: ".left-btn"
                        },
                    })
                }
                //关闭相册
                $('.close-btn').click(function(){
                    document.getElementsByTagName('body')[0].style.overflow="auto";
                    $('#mask,#showModel').hide();

                });
                $('.pics .swiper-container .swiper-wrapper').on('click','.swiper-slide',function(){
                    document.getElementsByTagName('body')[0].style.overflow="hidden";
                    var src1=$(this).find('a').find('img').attr('src');
                    $('#mask,#showModel').show();
                    getPic();
                })

                //商家介绍和设施
                var facilitylist=data.facility;
                var html1='',html2='',html3='';
                function dofacility(obj){
                    for(key in obj){
                        obj[key].forEach(function(item,index){
                            if(item.type==1){
                                html1+='<li data-id="'+item.id+'"><a href="javascript:;">'+item.name+'</a></li>';
                            }else if(item.type==2){
                                html2+='<li data-id="'+item.id+'"><a href="javascript:;">'+item.name+'</a></li>';
                            }else{
                                html3+='<li data-id="'+item.id+'"><a href="javascript:;">'+item.name+'</a></li>';
                            }
                        })
                    }
                }
                dofacility(facilitylist);
                var wreahrml='<div class="fac-two">'+
                                    '<h3>酒店设施</h3>'+
                                    '<div class="faclist">'+
                                        '<p>'+(html1==''?'':'硬件设施')+'</p>'+
                                        '<ul>'+html1+'</ul>'+
                                    '</div>'+
                                    '<div class="faclist">'+
                                        '<p>'+(html2==''?'':'软件设施')+'</p>'+
                                        '<ul>'+html2+'</ul>'+
                                    '</div>'+
                                    '<div class="faclist">'+
                                        '<p>'+(html3==''?'':'服务设施')+'</p>'+
                                        '<ul>'+html3+'</ul>'+
                                    '</div>'+
                                '</div>';
                var facilitiehtml='<div class="fac-one">'+
                                    '<h3>'+(data.sc_id==7?'酒店介绍':'商家介绍')+'</h3>'+
                                    '<div class="fac-one-text">'+data.store_content+'</div>'+
                                   '</div>'+(hastype==1?wreahrml:'');
                $('.facilibox').append(facilitiehtml);
                if(data.sc_id==8){
                    var attractionhtml=data.store_content;
                    $('.attractions .introduce').html(attractionhtml);
                }

            }
        })
    })
}

// 封装入驻商家logo的方法
function blogrollList(params) {
    ajax_post('/api/ad/blogrollList',params, function (r) {
        var logohtml='';
        callBack(r, {
            success: function (data){
                if(data.length>0){
                    data.forEach(function(item,index){
                        logohtml+='	<div class="swiper-slide">'+
                            '<a href="javascript:;">'+ '<img src="'+item.store_logo+'">'+'</a>'+
                            '</div>';
                    });
                }

            }
        })
        $('.section-inner .swiper-container .swiper-wrapper').append(logohtml);
   
        new Swiper(".section-inner .swiper-container", {
            slidesPerView:5,
            freeMode: true,
            navigation: {
                nextEl: ".button-next",
                prevEl: ".button-prev"
            }
        })

    })
}

/*封装通用下单表单提交
 参数：goods_id(商品id)，num（商品数量），sc_id(商家类型)，link_name（联系人），mobile（手机号），sex（性别）
 use_date（使用日期），start_time（开始时间），end_time（结束时间），spec_id（规格id）
 * */
function confirmOrder(params){
    ajax_post('/api/order/order',params,function(r){
        callBack(r,{
            success:function(res){
                window.location.href='payorder.html?sn='+res.order_sn;
                setCookie('total_amount',res.total_amount);
            },
            fail:function(res){
                alert(res);
                return;
            }
        })
    })
}

/*封装支付方式函数* 参数：订单号：order_sn,支付方式：type：1表示余额支付，2表示微信支付，3表示支付支付*/
function payWay(sn,type,total_amount){
    var params={order_sn:sn};
    if(type==1){//余额支付
        ajax_post('/api/order/balancePay',params,function(r){
            callBack(r,{
                success:function(res){

                },
                fail:function(res){
                    alert(res);
                    return;
                }
            })
        })
    }else if(type==2){//微信支付
        $('body').append('<div id="mask"></div>');
        ajax_post('/api/order/wxPayQrCode',params,function(r){
            callBack(r,{
                success:function(res){
                    /*微信支付弹窗*/
                    var whtml='<p class="p1 fw-m">微信支付&nbsp;¥'+toDecimal2(total_amount)+'</p>'+
                    '<div class="wcode">'+
                        '<img src="'+res.code_url+'" alt="">'+
                    '</div>'+
                    '<p class="p2 fw-m">使用微信扫描二维码进行支付</p>'+
                    '<p class="p3"><span class="resset-icon"></span><span>重新选择支付方式</span></p>';
                    $('.wechatmodel').html(whtml);
                    $('.wechatBox,#mask').show();
                    document.getElementsByTagName('body')[0].style.overflow="hidden";//弹窗显示禁止滚动
                    var repeat = 200;
                    var timer=setInterval(function(){
                        if(repeat==0){
                            clearInterval(timer);
                        }else{
                            ajax_post('/api/order/payStatus',params,function(r){
                                callBack(r,{
                                    success:function(data){
                                        if(data==true){
                                            clearInterval(timer);
                                            window.location.href='orderdetail.html';
                                        }
                                    }
                                })
                            })
                            repeat--;
                        }
                    },3000);
                },
                fail:function(res){
                    alert(res);
                    return;
                }
            })
        })
    }else if(type==3){//支付宝支付
          window.location.href=ajaxUrl+'/api/order/alipay?order_sn='+sn;
    }else{
        alert('请选择支付方式');
        return;
    }
    setCookie('order_sn',sn);
}

/*封装获取订单详情信息* 参数 order_sn:订单号*/
function getPayOrder(order_sn){
       ajax_post('/api/order/payShow',{order_sn:order_sn},function(r){
           var orderhtml='';
           var title;
           callBack(r,{
               success:function(res){
                   var showhtml='';
                   if(res.sc_id==7){ //酒店
                      title='酒店住宿';
                       showhtml='<div class="limain">'+
                                    '<p>'+res.orderGoods.name+'</p>'+
                                    '<p>￥<span>'+res.orderGoods.goods_price+'</span>/间 x<span>'+res.orderGoods.days+'</span>晚 x<span>'+res.orderGoods.goods_num+'</span>间——合计￥<span>'+Number(res.orderGoods.goods_price*res.orderGoods.goods_num*res.orderGoods.days)+'</span></p>'+
                                  '</div>';
                       $('.gobtn').click(function(){
                           window.location.href='hotel_show.html?store_id='+res.store_id;

                       });
                   }else if(res.sc_id==8){ //景区
                       var speclist=res.orderGoods.spec;
                       title='景点门票';
                       var secenichtml='';
                       for(var i=0;i<speclist.length;i++){
                           secenichtml+='<span>'+speclist[i]+'</span>';
                       }
                       showhtml='<div class="limain">'+
                                    '<p>'+res.orderGoods.name+'</p>'+
                                    '<p>￥<span>'+res.orderGoods.goods_price+'</span>/人 x <span>'+res.orderGoods.goods_num+'</span>人——合计￥<span>'+Number(res.orderGoods.goods_price*res.orderGoods.goods_num)+'</span>'+
                                     '</p>'+
                                     '<p class="spec c-6b">'+secenichtml+'<span>'+res.orderGoods.use_date+'</span></p>'+
                                 '</div>';
                       $('.gobtn').click(function(){
                           localData('remove','order_sn');
                           window.location.href='scenic_show.html?store_id='+res.store_id;
                       });
                   }else if(res.sc_id==9){ //美食
                       title='吃在三江';
                       var listhtml='';
                       var menu1=res.orderGoods.menu_name;
                       var menu2=res.orderGoods.menu_price;
                       function dofood(arr1,arr2){
                            for(var i=0,j=0;i<arr1.length,j<arr2.length;i++,j++){
                                listhtml+='<p class="flex c-6b">'+
                                                '<span class="menuname">'+arr1[i]+'</span>'+
                                                '<span>￥'+arr2[j]+'</span>'+
                                            '</p>';
                           }
                       }
                       dofood(menu1, menu2);
                       showhtml='<div class="limain">'+
                                    '<p>'+res.orderGoods.name+'</p>'+
                                    '<p>￥<span>'+res.orderGoods.goods_price+'</span>/份 x <span>'+res.orderGoods.goods_num+'</span>份——合计￥<span>'+Number(res.orderGoods.goods_price*res.orderGoods.goods_num)+'</span>'+
                                     '</p>'+
                                     '<div class="list c-6b fw-r">'+
                                     '<p class="c-6b">套餐包含：</p>'+listhtml+
                                    '</div>'+
                                '</div>';
                       $('.gobtn').click(function(){
                           window.location.href='food_show.html?store_id='+res.store_id;
                       });
                   }else if(res.sc_id==10){ //路线
                       title='旅游路线/导游预约';
                       showhtml='<div class="limain">'+
                                    '<p>'+res.orderGoods.name+'</p>'+
                                    '<p>￥<span>'+res.orderGoods.goods_price+'</span>/人 x <span>'+res.orderGoods.goods_num+'</span>人——合计￥<span>'+Number(res.orderGoods.goods_price*res.orderGoods.goods_num)+'</span>'+
                                    '</p>'+
                                    '<p class="c-6b fw-r" style="line-height:0.22rem">'+res.orderGoods.brief+'</p>'+
                                    '<p class="c-6b fw-r">出发时间：'+res.orderGoods.use_date+'</p>'+
                                 '</div>';
                       $('.gobtn').click(function(){
                           window.location.href='guide_show.html?store_id='+res.store_id;
                       });
                   }
                   //具体详情展示
                   orderhtml='<div class="h-bg">'+
                                    '<h3 class="c-333 fz-26">三江侗网 . '+title+'</h3>'+
                                '</div>'+
                                '<ul>'+
                                    '<li>'+
                                        '<p class="litop">商品信息</p>'+showhtml+
                                    '</li>'+
                                    '<li>'+
                                        '<p class="litop">商家</p>'+
                                        '<div class="limain">'+
                                            '<p>'+res.store.store_name+'</p>'+
                                            '<p>'+res.store.store_phone+'</p>'+
                                            '<p>'+res.store.store_address+'</p>'+
                                        '</div>'+
                                    '</li>'+
                                    '<li>'+
                                        '<p class="litop">订单信息</p>'+
                                        '<div class="limain">'+
                                            '<p>下单时间：'+res.create_time+'</p>'+
                                            '<p>订单号：'+res.order_sn+'</p>'+
                                            '<p>联系人：'+res.link_name+'</p>'+
                                            '<p>电话：'+res.mobile+'</p>'+
                                        '</div>'+
                                    '</li>'+
                                    '<li>'+
                                        '<p class="litop">合计金额</p>'+
                                        '<div class="limain">'+
                                            '<p class="price">'+
                                                '<span class="fz-12">￥</span><span>'+res.total_amount+'</span>'+
                                            '</p>'+
                                        '</div>'+
                                    '</li>'+
                                '</ul>';
                   $('.createleft').append(orderhtml);

               }
           })

       })
}


































