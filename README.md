# cloudflare-card-tab

## 使用cloudflare worker搭建导航站
### 1.登录cloudflare网站

![](https://img.hurl.us.kg/file/AgACAgUAAyEGAASPCjOZAAPLZuQS9cnk3iPXpkupwVHtHesEnAcAAji7MRt6mylXW9VESoQ8SowBAAMCAAN4AAM2BA.png)

### 2.新建worker

### 3.复制worker.js内的代码到worker中

地址：https://raw.githubusercontent.com/trumokl/cloudflare-card-tab/main/worker.js

### 4.点击部署按钮
### 5.设置网站管理员密码
添加环境变量名`ADMIN_PASSWORD`

### 6.设置KV存储

将workers的CARD_ORDER变量与新建的KV存储绑定，用于存储书签
