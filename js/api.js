/**
 * Created by admin on 2017/9/4.
 */


// var endpoint='https://api.yddtv.cn:10032';

var endpoint = 'http://api.yddtv.cn:10031';

var api_config={
    login:endpoint+'/cowin/login',   //登录
    register:endpoint+'/cowin/register',    //注册
    getVcode:endpoint+'/cowin/vcode/get',   //获取验证码
    checkLogin:endpoint+'/cowin/check',    //检测登录
    resetPwd:endpoint+'/cowin/pwd/reset',    //重置密码
    logout:endpoint+'/cowin/logout',    //退出
    personSetting:endpoint+'/cowin/userinfo/update',  //个人设置
    authentication:endpoint+'/cowin/user/authen',  //身份验证
    checkAuthen:endpoint+'/cowin/user/authen/query',   //查询身份认证
    downloadProfile:endpoint+'/cowin/head/head',   //下载头像
    messageQuery:endpoint+'/cowin/msg/query',   //消息查询
    talkQuery:endpoint+'/cowin/talk/query',      //查询说说
    talkView:endpoint+'/cowin/talk/view',       //查看说说
    talkComment:endpoint+'/cowin/talk/review',   //评论说说
    fans:endpoint+'/cowin/talk/fans',   //点赞
    fansRecord:endpoint+'/cowin/talk/fans/query',   //点赞记录查询
    talkPublish:endpoint+'/cowin/talk/publish',          //评论发布
    talkDel:endpoint+'/cowin/talk/del',   //删除说说
    commentDel:endpoint+'/cowin/talk/review/del',   //删除评论
    secComment:endpoint+'/cowin/talk/secreview',    //发表二级评论
    reportSecComment:endpoint+'/cowin/talk/secreview/report',  //举报二级评论
    delSecComment:endpoint+'/cowin/talk/secreview/del',   //删除二级评论
    carouselQuery:endpoint+'/cowin/carousel/query',    //查询轮播图
    orderQuery:endpoint+'/cowin/mall/order/query',   //订单查询
    hostMethods:endpoint+'/cowin/mall/hostmethod/query',   //托管方式查询
    shopCartAdd:endpoint+'/cowin/shopcart/add',   //加入购物车
    shopCartDel:endpoint+'/cowin/shopcart/del',   //删除购物车
    shopCartQuery:endpoint+'/cowin/shopcart/query',  //查询购物车
    shopCartCleaning:endpoint+'/cowin/shopcart/settle',  //购物车结算
    productsBuy:endpoint+'/cowin/mall/product/buy',  //产品购买
    orderConfirm:endpoint+'/cowin/mall/order/pay',  //产品订单支付确认
    salesQuery:endpoint+'/cowin/product/buyrd/query',   //产品销量查询
    contractDownLoad:endpoint+'/cowin/product/agreement/down',  //产品合同下载
    soldQuery:endpoint+'/cowin/product/sold/query',  //产品已售查询
    productsQuery:endpoint+'/cowin/mall/product/query',  //产品查询
    productsCommentQuery:endpoint+'/cowin/product/review/query',  //产品评论查询
    productsCommentPublish:endpoint+'/cowin/product/review',   //发表产品评论
    couponqQuery:endpoint+'/cowin/coupon/query',  //优惠券查询
    exchangCoupon:endpoint+'/cowin/isscoup/query',  //兑换优惠券
    extractMoneyQuery:endpoint+'/cowin/extract/query',    //提取金额查询
    extractMoney:endpoint+'/cowin/extract',  //提取金额
    benefitCateStatic:endpoint+'/cowin/income/query',   //收益分类统计
    benefitDateStatic:endpoint+'/cowin/income/report',   //收益周期报表统计
    chargesCateStatic:endpoint+'/cowin/expend/query',   //支出分类统计
    chargesDateStatic:endpoint+'/cowin/expend/report',   //支出周期报表统计
    incomeDailyQuery:endpoint+'/cowin/income/brief',    //总收益、日收益查询
    incomeCateQuery:endpoint+'/cowin/income/total',    //总收益分类查询
    incomeBriefQuery:endpoint+'/cowin/income/detail',   //收益明细查询
    distanceQuery:endpoint+'/cowin/travel/query',       //产品里程数查询
    repairQuery:endpoint+'/cowin/product/repair',       //产品保修查询
    payConfirm:endpoint+'/cowin/product/use/pay',       //产品支付确认
    noticeQuery:endpoint+'/cowin/letter/recv',           //查询通知
    receivingAddressAdd:endpoint+'/cowin/shipaddr/add',       //添加收货地址
    receivingAddressQuery:endpoint+'/cowin/shipaddr/query',   //查询收货地址
    receivingAddressUpdate:endpoint+'/cowin/shipaddr/modify',   //修改收货地址
    receivingAddressDel:endpoint+'/cowin/shipaddr/del',   //删除收货地址
    defaultAddress:endpoint+'/cowin/shipaddr/default',   //设置默认收货地址
    powerBank:endpoint+'/cowin/userproduct/baseinfo',    //充电宝基本信息
    powerBankUsage:endpoint+'/cowin/userproduct/useinfo',  //充电宝使用信息
};