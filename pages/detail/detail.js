var util = require('../../utils/util.js');
var Api = require('../../utils/api.js');
const Zan = require('../../zanui-app/index');
var WxParse = require('../../wxParse/wxParse.js');
Page(Object.assign({}, Zan.TopTips, Zan.Toast, {
  data: {
    title: '话题详情',
    detail: {},
    wemark: {},
    wemark2: {},
    replies: [],
    content_hidden: false,
    reply_hidden: true,
    flag_position: '0%',
    offset: 0,
    topicid: -1,
    topicMeta: {
      favorited: false,
      liked: false,
    },
    replyVisible: false,
    floatReplyVisible: true,
    replyContent: '',
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    });

    this.fetchData(options.id);
    this.fetchReplyData(options.id);
  },

  fetchData: function (id) {
    var self = this;
    self.setData({
      topicid: id,
    });

    wx.request({
      url: Api.getTopicByID(id, { access_token: wx.getStorageSync('token') }),
      success: function (res) {
        if (!res.data.error) {
          res.data.topic.body = res.data.topic.body.replace(/\n{3,}/g, '\n\n').replace(/\(\/uploads/g, '(https://testerhome.com/uploads').replace(/large =.*x/g, 'large').replace(/\.jpg =.*x/g, '.jpg').replace(/\n\s+```/g, '\n```');
          res.data.topic.created_at = util.getDateDiff(new Date(res.data.topic.created_at));
          if (res.data.topic.user.avatar_url.indexOf('testerhome') === -1) {
            res.data.topic.user.avatar_url = 'https://testerhome.com/' + res.data.topic.user.avatar_url;
          }


        } else {
          res.data.topic = {}
          res.data.topic.body = res.data.message;
        }
        WxParse.wxParse('topicBody', 'md', res.data.topic.body, self, 5);
        self.setData({
          detail: res.data.topic,
          topicMeta: res.data.meta
        }, () => {
          wx.hideLoading();
        });

      }
    });


  },

  fetchReplyData: function (id, data) {
    var self = this;
    if (!data) data = {};
    if (!data.offset) {
      data.offset = 0;
      self.setData({
        offset: 0
      });
    }

    if (data.offset === 0) {
      self.setData({
        replies: []
      });
    }
    wx.request({
      url: Api.getTopicReplies(id, data),
      success: function (res) {
        if (res.data.replies.length > 0) {
          var mReplies = self.data.replies.concat(res.data.replies.map(item => {
            item.created_at = util.getDateDiff(new Date(item.created_at));
            if (item.user.avatar_url.indexOf('testerhome') === -1) {
              item.user.avatar_url = 'https://testerhome.com/' + item.user.avatar_url;
            }
            if (item.action === "excellent") {
              item.body = item.user.login + '将本帖设为了精华贴';
            } else if (item.action === 'mention') {

              item.body = item.user.login + '在 <' + (typeof (item.mention_topic) === 'undefined' ? '此话题已被删除' : item.mention_topic.title) + '> 中提及此帖';
            } else if (item.action === 'close') {
              item.body = item.user.login + '关闭了讨论';
            } else {
              // item.body_html = item.body_html.replace(/<[^>]+>/g, '').replace(/\n{3,}/g, '\n\n');
            }
            item.body = item.body.replace(/\(\/uploads/g, '(https://testerhome.com/uploads').replace(/large =.*x/g, 'large').replace(/\.jpg =.*x/g, '.jpg').replace(/\n\s+```/g, '\n```');;
            // 此处有个麻烦的处理就是emoji表情的替换
            // 这里先从item.body_html中提取出emoji的变量
            var re = /\<img title=\"(.*?)\"\salt=.*? class=\"twemoji\"\>/g;
            var arr = []
            var emojiArr = [];
            while(arr !== null) {
              arr = re.exec(item.body_html);
              // 由于这里的表情有可能是重复的 所以替换的时候需要剔除， 因为我们的替换用的是全局替换。
              if (arr !== null && emojiArr.indexOf(arr[1]) === -1) {
                item.body = item.body.replace(new RegExp(arr[1], 'g'), arr[0]);
                emojiArr.push(arr[1]);
              }
            }
            
            return item;
          }))
          for (let i = 0; i < mReplies.length; i++) {
            WxParse.wxParse('reply' + i, 'md', mReplies[i].body, self);
            if (i === mReplies.length - 1) {
              WxParse.wxParseTemArray("repliesTemp", 'reply', mReplies.length, self)
            }
          }

          self.setData({
            replies: mReplies
          }, () => {
            // 这里需要判断是否为刚进入帖子详情页面
            if (data.offset !== 0) {
              wx.hideLoading();
            }

          });
        } else {
          if (data.offset !== 0) {
            wx.hideLoading();
          }
        }

      }
    });

  },

  onTapTag: function (e) {
    var self = this;
    var id = e.currentTarget.id;
    if (id === 'topic') {
      self.setData({
        content_hidden: false,
        reply_hidden: true,
        flag_position: '0%'
      });
    } else {
      self.setData({
        content_hidden: true,
        reply_hidden: false,
        flag_position: '50%'
      });
    }
  },

  lower: function (e) {
    var self = this;
    if (self.data.replies.length >= 20 && self.data.replies.length % 10 === 0) {
      self.setData({
        offset: self.data.offset + 20
      });
      wx.showLoading({
        title: '加载中',
      })
      self.fetchReplyData(self.data.topicid, { offset: self.data.offset });
    }

  },

  /**
   * 这里滑动时 隐藏显示float
   */
  scrolls: function (e) {
    if (e.detail.deltaY < 0 && this.data.floatReplyVisible) {
      this.setData({
        floatReplyVisible: false
      })
    } else if (e.detail.deltaY > 0 && !this.data.floatReplyVisible) {
      this.setData({
        floatReplyVisible: true
      })
    }
  },



  /**
   * 点击浮动的按钮时
   */
  showReply: function (e) {
    this.setData({
      replyVisible: true,
      floatReplyVisible: false
    })
  },


  /**
   * 处理点赞事件
   */
  handleLike: function (e) {
    const self = this;
    wx.showLoading({
      title: '处理中',
    })
    if (util.isUserLogin(self)) {
      wx.request({
        url: Api.getTopicLikeUrl(this.data.topicid),
        method: this.data.topicMeta.liked ? 'DELETE' : 'POST',
        data: {
          obj_type: 'topic',
          obj_id: this.data.topicid,
          access_token: wx.getStorageSync('token'),
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        },
        success: function (res) {
          wx.hideLoading();
          if (res.statusCode === 200) {
            const topicMeta = self.data.topicMeta;
            topicMeta.liked = !topicMeta.liked
            self.setData({
              topicMeta: topicMeta
            })
          } else if (res.statusCode === 401) {
            util.userAuth(wx.getStorageSync('refreshToken'), (err, result) => {
              if (err === null) {
                self.handleCollect(e);
              }
            })
          }
        }
      });
    }else {
      wx.hideLoading();
    }
  },

  /**
   * 处理收藏事件
   */
  handleCollect: function (e) {
    const self = this;
    wx.showLoading({
      title: '处理中',
    })
    if (util.isUserLogin(self)) {
      wx.request({
        url: Api.getTopicFavoriteUrl(this.data.topicid, this.data.topicMeta.favorited),
        method: 'POST',
        data: {
          // obj_type: 'topic',
          // obj_id: this.data.topicid,
          access_token: wx.getStorageSync('token'),
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        },
        success: function (res) {
          wx.hideLoading();
          if (res.statusCode === 200) {
            const topicMeta = self.data.topicMeta;
            topicMeta.favorited = !topicMeta.favorited
            self.setData({
              topicMeta: topicMeta
            })
          } else if (res.statusCode === 401) {
            util.userAuth(wx.getStorageSync('refreshToken'), (err, result) => {
              if (err === null) {
                self.handleCollect(e);
              }
            })
          }
        }
      });

    }else {
      wx.hideLoading();
    }

  },

  bindInput(e){
    this.setData({
      replyContent: e.detail.value,
    })
  },

  sendReply() {
    const self = this;
    if (util.isUserLogin(self)) {
      var content = "<p>" + self.data.replyContent + "</p>";
      content = content + "\n\n" + "<p>—— 来自TesterHome<a href=\"https://raw.githubusercontent.com/testerhome/weixin_Testerhome/master/screenshots/code.png\" target=\"_blank\">微信小程序</a></p>";

      wx.request({
        url: Api.getReplyTopicUrl(this.data.topicid),
        method: 'POST',
        data: {
          body: content,
          access_token: wx.getStorageSync('token'),
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        },
        success: function (res) {
          if (res.statusCode === 200) {
            // 如果回复成功就需要拉取最新的数据 这里需要做相应的判断
            self.setData({
              replyVisible: false,
              replyContent: '',
            })
            self.showZanToast('回复成功');
            if(self.data.replies / 20  === 0) {
              self.fetchReplyData(self.data.topicid);
            }else {
              var replies = self.data.replies;
              replies.slice(0, self.data.replies / 20 * 20)
              self.setData({
                replies: replies,
              })
              self.fetchReplyData(self.data.topicid, { offset: self.data.offset });
            }
            
          } else if (res.statusCode === 401) {
            util.userAuth(wx.getStorageSync('refreshToken'), (err, result) => {
              if (err === null) {
                self.sendReply();
              }
            })
          }else {
            self.showZanTopTips(res.data.message);
          }
        }
      });


    }

  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.detail.title,
      path: '/pages/detail/detail?id=' + this.data.topicid,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  wxParseTagATap: function (e) {
    console.log(e);
  }
}))