var HOST_URI = 'https://testerhome.com/api/v3/';

var GET_TOPICS = 'topics.json';
var GET_TOPIC_BY_ID = 'topics/';
var GET_TOPIC_ADS = 'ads.json';
var GET_TOPIC_REPLIES = '/replies.json'
var GET_USER_INFO = 'hello.json'
var TOKEN = 'https://testerhome.com/oauth/token'

function obj2uri (obj) {
    return Object.keys(obj).map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]);
    }).join('&');
}

module.exports = {
    // 获取列表数据
    getTopics: function (obj) {
        return HOST_URI + GET_TOPICS + '?' + obj2uri(obj);
    },
    getUserInfo: function (obj) {
        return HOST_URI + GET_USER_INFO + '?' + obj2uri(obj);
    },
    // 获取内容页数据
    getTopicByID: function (id) {
        console.log(HOST_URI + GET_TOPIC_BY_ID + id + '.json');
        return HOST_URI + GET_TOPIC_BY_ID + id + '.json';
    },
    getTopicAds: function() {
        return HOST_URI + GET_TOPIC_ADS; 
    },

    getUserFavoriteTopics: function(uid, obj) {
      return HOST_URI + 'users/' + uid + '/favorites.json?' + obj2uri(obj);
    },

    getUserTopics: function (uid, obj) {
      return HOST_URI + 'users/' + uid + '/topics.json?' + obj2uri(obj);
    },

    getTopicReplies: function(id, obj) {
        console.log(HOST_URI + GET_TOPIC_BY_ID + id + GET_TOPIC_REPLIES + '?' + obj2uri(obj));
        return HOST_URI + GET_TOPIC_BY_ID + id + GET_TOPIC_REPLIES + '?' + obj2uri(obj);
    },
    
    getTokenByRefreshToken: function() {
      return TOKEN
    }
};