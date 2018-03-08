var Api = require('./api.js')
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function getDateDiff(dateTimeStamp){
	var minute = 1000 * 60;
	var hour = minute * 60;
	var day = hour * 24;
	var halfamonth = day * 15;
	var month = day * 30;
	var now = new Date().getTime();
	var diffValue = now - dateTimeStamp;
	if(diffValue < 0){return;}
	var monthC =diffValue/month;
	var weekC =diffValue/(7*day);
	var dayC =diffValue/day;
	var hourC =diffValue/hour;
	var minC =diffValue/minute;
  var result = '';
	if(monthC>=1){
		result="" + parseInt(monthC) + "月前";
	}
	else if(weekC>=1){
		result="" + parseInt(weekC) + "周前";
	}
	else if(dayC>=1){
		result=""+ parseInt(dayC) +"天前";
	}
	else if(hourC>=1){
		result=""+ parseInt(hourC) +"小时前";
	}
	else if(minC>=1){
		result=""+ parseInt(minC) +"分钟前";
	}else
	result="刚刚";
	return result;
}

function getDateTimeStamp(dateStr){
  return  Date.parse(new Date(dateStr));
}

/**
 * 用户认证
 */
function userAuth(refreshToken, cb) {
  wx.request({
    url: Api.getTokenByRefreshToken(),
    method: 'POST',
    data: {
      client_id: '402e7adf',
      grant_type: 'refresh_token',
      client_secret: '030f48af465703f4df13fec7757d2c46aacf54f6d69c544549d7acc14ee45844',
      refresh_token: refreshToken
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded' // 默认值
    },
    success: function (res) {
      if (typeof(res.data.access_token) !== 'undefined') {
        wx.setStorageSync('token', res.data.access_token);
        wx.setStorageSync('refreshToken', res.data.refresh_token);
        cb(null, res);
      }else {
        cb('refreshToken不可用', null)
      }
    }
  });
}

// function retryIfNotAuth(method, url, cb) {
//   const self = this;
//   wx.request({
//     url: url,
//     header: method === 'POST' ? {
//       'content-type': 'application/json'} : {
//       'content-type': 'application/x-www-form-urlencoded' // 默认值
//     },
//     success: function (result) {
//       if (result.statusCode === 200) {
//         cb(null, result);
//       }else {
//         self.userAuth(wx.getStorageSync('refreshToken'), (err, result) => {
//           if (typeof (res.data.access_token) !== 'undefined') {
//             retryIfNotAuth(method, url, cb);
//           } else {
//             cb('refreshToken不可用', null)
//           }
//         })
//       }
      
//     }
//   })
// }

function isUserLogin(self) {
  if (wx.getStorageSync('token') !== '') {
    return true;
  }else {
    self.showZanTopTips('账号未登录，请登陆后操作');
    return false;
  }
}

/**
 * 获取用户信息
 */
function getUserInfo(token, cb) {
  wx.request({
    url: Api.getUserInfo({ 'access_token': token }),
    success: function (result) {
      cb(null, result);
    }
  })
}

module.exports = {
  isUserLogin: isUserLogin,
  getUserInfo: getUserInfo,
  userAuth: userAuth,
  formatTime: formatTime,
  getDateDiff: getDateDiff,
  getDateTimeStamp: getDateTimeStamp
}
