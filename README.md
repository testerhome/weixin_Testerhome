![预览图1](https://github.com/testerhome/weixin_Testerhome/blob/master/screenshots/1.png?raw=true)

扫描如下二维码即可查看小程序

![预览图2](https://github.com/testerhome/weixin_Testerhome/blob/master/screenshots/code.png?raw=true)

### 关于refreshToken的获取, 这里主要是介绍如何通过postman来获取到Testerhome的token：

1. 在postman中的Authorization中选择type为 OAuth2.0
2. 点击 Get New AccessToken按钮 在弹出框中分别输入如下内容：
   - tokenName -- 这个随意填写
   - Auth URL  -- https://testerhome.com/oauth/authorize
   - AccessToken URL -- https://testerhome.com/oauth/token
   - Client ID -- 402e7adf
   - Client Secret -- 030f48af465703f4df13fec7757d2c46aacf54f6d69c544549d7acc14ee45844

   ![预览图2](https://github.com/testerhome/weixin_Testerhome/blob/master/screenshots/postman_1.png?raw=true)
   

3. 输入完内容后点击Request Token 这里可能还需要一个网页的登陆，登陆成功 再返回到postman界面再点击Request TOKEN 一次，右侧就会出现下图的内容了
   
    ![预览图2](https://github.com/testerhome/weixin_Testerhome/blob/master/screenshots/postman_2.png?raw=true)


### PS
如上的oauth2的认证最近出现一定的问题 因为回调地址的问题 需要翻墙导致的，所以大家建议下载windows或者mac版本的app形式的postman 里面可以进行修改callback, 统一将callback的地址修改为 http://www.oauth.net/2/  即可