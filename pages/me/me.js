const Zan = require('../../zanui-app/index');
const config = require('./config');
var util = require('../../utils/util.js')
var Api = require('../../utils/api.js')
Page(Object.assign({}, Zan.Field, Zan.Toast, Zan.Tab, Zan.TopTips, {
  data: {
    isLogin: false,
    config,
    userinfo: {},
    datas: [],
    offset: 0,
    tab1: {
      list: [{
        id: 'collect',
        title: '我收藏'
      }, {
        id: 'public',
        title: '我发表'
      }],
      selectedId: 'collect'
    },
  },

  onLoad: function (options) {
    this.showZanLoading('加载中');
    var token = wx.getStorageSync('token');
    this.authLogin(token, true);
  },

  /**
   * 认证登陆，flag token失败是否继续验证refreshToken
   */
  authLogin(token, flag) {
    const self = this;
    if (token !== '') {
      util.getUserInfo(token, (err, result) => {
        self.clearZanToast();
        if (result.statusCode === 200) {
          self.setData({
            isLogin: true,
            userinfo: result.data.user
          })
          self.getUserFavoriteTopics(result.data.user.login, token);
        } else {
          // 这里还需要做refresh的操作
          if (flag) {
            util.userAuth(wx.getStorageSync('refreshToken'), (err, result) => {
              if (err === null) {
                self.authLogin(result.data.access_token, false);
              }
            })
          } else {
            self.setData({
              isLogin: false
            })
          }
        }

      })
    } else {
      this.setData({
        isLogin: false
      })
    }
  },

  handleZanFieldChange(e) {
    const { componentId, detail } = e;

    console.log('[zan:field:change]', componentId, detail);
  },

  handleZanFieldFocus(e) {
    const { componentId, detail } = e;

    console.log('[zan:field:focus]', componentId, detail);
  },

  handleZanFieldBlur(e) {
    const { componentId, detail } = e;

    console.log('[zan:field:blur]', componentId, detail);
  },


  didSelectCell: function (e) {
    var id = e.currentTarget.id,
      url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  },


  formSubmit(event) {
    const self = this;

    console.log('[zan:field:submit]', event.detail.value);
    if (event.detail.value['form:login:refreshToken'] === '') {
      this.showZanTopTips('输入内容不能为空');
    } else {
      this.showZanLoading('加载中');
      util.userAuth(event.detail.value['form:login:refreshToken'], (err, result) => {
        self.clearZanToast();
        if (err === null) {
          wx.setStorageSync('token', result.data.access_token);
          wx.setStorageSync('refreshToken', result.data.refresh_token);
          util.getUserInfo(result.data.access_token, (err, result) => {
            self.setData({
              isLogin: true,
              userinfo: result.data.user
            })
            const uid = result.data.user.login;
            wx.setStorage({
              key: 'uid',
              data: uid,
            })
            self.getUserFavoriteTopics(uid, wx.getStorageSync('token'))
            self.showZanToast('登陆成功');
          })
        } else {
          self.showZanToast({
            title: err,
            icon: 'fail'
          });
        }

      })
    }

  },

  getUserTopics(uid, token, offset = 0) {
    const self = this;
    wx.request({
      url: Api.getUserTopics(uid, { 'access_token': token, 'offset': offset}),
      success: function (res) {
        var topics = offset !== 0 ? self.data.datas : [];
        topics = topics.concat(self.operateTopics(res.data.topics))
        self.setData({
          datas: topics,
        })
        self.clearZanToast();
      }
    });
  },


  /**
   * 获取用户喜欢的帖子列表
   */
  getUserFavoriteTopics(uid, token, offset=0) {
    const self = this;
    wx.request({
      url: Api.getUserFavoriteTopics(uid, { 'access_token': token, 'offset': offset }),
      success: function (res) {
        var topics = offset !== 0 ? self.data.datas : [];
        topics = topics.concat(self.operateTopics(res.data.topics));
        self.setData({
          datas: topics,
        })
        self.clearZanToast();
      }
    });
  },

  /**
   * 处理帖子的信息
   */
  operateTopics(topics) {
    var topices = topics.map(function (item) {
      item.replies_count = parseInt(item.replies_count)
      item.created_at = util.getDateDiff(new Date(item.created_at));
      if (item.user.avatar_url.indexOf('https://testerhome') !== -1) {
      } else if (item.user.avatar_url.indexOf('testerhome') !== -1) {
        item.user.avatar_url = 'https:' + item.user.avatar_url;
      } else {
        item.user.avatar_url = 'https://testerhome.com/' + item.user.avatar_url;
      }
      return item;
    });
    return topics
  },

  /**
   * tab被点击时
   */
  handleZanTabChange({ componentId, selectedId }) {
    // componentId 即为在模板中传入的 componentId
    // 用于在一个页面上使用多个 tab 时，进行区分
    // selectId 表示被选中 tab 项的 id
    const token = wx.getStorageSync('token');
    const uid = wx.getStorageSync('uid')
    this.showZanLoading('加载中');
    if (selectedId === 'public') {
      this.getUserTopics(uid, token);
    } else if (selectedId === 'collect') {
      this.getUserFavoriteTopics(uid, token);
    }
    var tab = this.data.tab1;
    tab.selectedId = selectedId
    this.setData({
      tab1: tab,
      offset: 0,
    })
  },

  /**
   * 加载更多
   */
  lower: function (e) {
    console.log('加载更多')
    var self = this;
    this.showZanLoading('加载中');
    if (this.data.tab1.selectedId === 'collect') {
      this.getUserFavoriteTopics(wx.getStorageSync('uid'), wx.getStorageSync('token'), this.data.offset + 20);
    }else {
      this.getUserTopics(wx.getStorageSync('uid'), wx.getStorageSync('token'), this.data.offset + 20)
    }
    
    self.setData({
      offset: self.data.offset + 20
    });
  },

}));