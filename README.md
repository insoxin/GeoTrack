# GeoTrack
### 基于美团接口的IP定位系统，使用CFWorker部署
![image](https://github.com/user-attachments/assets/a5418f61-acf1-4e65-a2f1-5f69c8fbffba)

## 📖 API 文档 / API Documentation

查看完整的 API 使用文档，了解如何在第三方应用中调用接口：

**[👉 查看 API 文档 / View API Documentation](API.md)**

### 快速开始 / Quick Start

#### 查询 IP 位置 / Query IP Location

```bash
curl -X POST https://your-domain.workers.dev/api/query \
  -H "Content-Type: application/json" \
  -d '{"ip":"8.8.8.8"}'
```

#### 获取客户端 IP / Get Client IP

```bash
curl https://your-domain.workers.dev/api/clientip
```

## 💡 功能特性 / Features

- ✅ IP 地址地理位置查询
- ✅ 获取客户端真实 IP
- ✅ 支持国家、省份、城市、区县信息
- ✅ 提供经纬度坐标
- ✅ 基于 Cloudflare Workers，全球加速
- ✅ RESTful API，易于集成

## 🔧 实现原理（接口来源于美团）
### IP查经纬度
https://apimobile.meituan.com/locate/v2/ip/loc?rgeo=true&ip=123.123.123.123

### 经纬度查地址
https://apimobile.meituan.com/group/v1/city/latlng/39.9042,116.4074?tag=0

## 📝 部署说明 / Deployment

1. 克隆仓库
2. 安装 Wrangler CLI：`npm install -g wrangler`
3. 登录 Cloudflare：`wrangler login`
4. 发布到 Workers：`wrangler publish`

## 🤝 第三方调用示例 / Third-party Integration Examples

详细的调用示例请参考 [API.md](API.md)，包括：

- JavaScript/Node.js
- Python
- PHP
- Java
- cURL

等多种语言的示例代码。
