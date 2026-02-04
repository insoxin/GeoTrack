# GeoTrack API 文档 / API Documentation

[English](#english) | [中文](#chinese)

---

<a name="chinese"></a>
## 中文文档

### 概述

GeoTrack 提供两个 RESTful API 接口，用于 IP 地址的地理位置查询。所有接口返回 JSON 格式数据。

### 基础信息

- **Base URL**: `https://your-domain.workers.dev` (替换为你的实际域名)
- **Content-Type**: `application/json`

---

### API 接口

#### 1. 查询 IP 地理位置

查询指定 IP 地址的详细地理位置信息。

**方法 1: POST 请求 (推荐用于应用集成)**

**端点**: `POST /api/query`

**请求头**:
```
Content-Type: application/json; charset=utf-8
```

**请求体**:
```json
{
  "ip": "8.8.8.8"
}
```

**方法 2: GET 请求 (简单快捷，支持浏览器直接访问)**

**端点**: 
- `GET /?ip=8.8.8.8`
- `GET /api/query?ip=8.8.8.8`

**URL 参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ip | string | 是 | 要查询的 IPv4 地址 |

---

**请求参数说明**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ip | string | 是 | 要查询的 IPv4 地址 |

**成功响应** (200):
```json
{
  "ip": "8.8.8.8",
  "location": {
    "country": "美国",
    "province": "加利福尼亚州",
    "city": "山景城",
    "district": "",
    "detail": "美国 加利福尼亚州 山景城",
    "lat": 37.4056,
    "lng": -122.0775
  }
}
```

> **注意**: 所有响应的 Content-Type 均为 `application/json; charset=utf-8`，确保中文字符正确显示。

**错误响应**:

- **400 Bad Request** - 无效的 IP 地址格式
```json
{
  "error": "无效的IP地址格式"
}
```

- **400 Bad Request** - 内网或保留 IP 地址
```json
{
  "error": "不支持查询内网IP或保留地址"
}
```

- **502 Bad Gateway** - 上游 API 请求失败
```json
{
  "error": "地理位置API请求失败: 502"
}
```

- **500 Internal Server Error** - 服务器错误
```json
{
  "error": "错误信息"
}
```

**使用示例**:

**GET 请求 (浏览器/简单场景)**:

**cURL**:
```bash
# 使用根路径
curl "https://your-domain.workers.dev/?ip=8.8.8.8"

# 使用 API 路径
curl "https://your-domain.workers.dev/api/query?ip=8.8.8.8"
```

**浏览器直接访问**:
```
https://your-domain.workers.dev/?ip=8.8.8.8
```

**JavaScript (简单 GET)**:
```javascript
fetch('https://your-domain.workers.dev/?ip=8.8.8.8')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

---

**POST 请求 (应用集成推荐)**:

**cURL**:
```bash
curl -X POST https://your-domain.workers.dev/api/query \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"ip":"8.8.8.8"}'
```

**JavaScript (Fetch API)**:
```javascript
fetch('https://your-domain.workers.dev/api/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ ip: '8.8.8.8' })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

**Python (requests)**:
```python
import requests

url = 'https://your-domain.workers.dev/api/query'
data = {'ip': '8.8.8.8'}
headers = {'Content-Type': 'application/json; charset=utf-8'}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```

**Node.js (axios)**:
```javascript
const axios = require('axios');

axios.post('https://your-domain.workers.dev/api/query', {
  ip: '8.8.8.8'
}, {
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
})
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));
```

**PHP**:
```php
<?php
$url = 'https://your-domain.workers.dev/api/query';
$data = array('ip' => '8.8.8.8');

$options = array(
    'http' => array(
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data)
    )
);

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);
$response = json_decode($result, true);

print_r($response);
?>
```

**Java**:
```java
import java.net.http.*;
import java.net.URI;

public class GeoTrackClient {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        String json = "{\"ip\":\"8.8.8.8\"}";
        
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://your-domain.workers.dev/api/query"))
            .header("Content-Type", "application/json; charset=utf-8")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();
        
        HttpResponse<String> response = client.send(request, 
            HttpResponse.BodyHandlers.ofString());
        
        System.out.println(response.body());
    }
}
```

---

#### 2. 获取客户端 IP

获取请求客户端的真实 IP 地址。

**端点**: `GET /api/clientip`

**请求头**: 无特殊要求

**成功响应** (200):
```json
{
  "ip": "123.45.67.89"
}
```

**使用示例**:

**cURL**:
```bash
curl https://your-domain.workers.dev/api/clientip
```

**JavaScript (Fetch API)**:
```javascript
fetch('https://your-domain.workers.dev/api/clientip')
  .then(response => response.json())
  .then(data => console.log('Your IP:', data.ip))
  .catch(error => console.error('Error:', error));
```

**Python (requests)**:
```python
import requests

response = requests.get('https://your-domain.workers.dev/api/clientip')
print(response.json())
```

---

### 限制说明

1. **不支持的 IP 地址**:
   - 私有网络地址 (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
   - 本地回环地址 (127.0.0.0/8)
   - 链路本地地址 (169.254.0.0/16)
   - 其他保留地址

2. **IP 格式**: 仅支持 IPv4 地址格式

3. **速率限制**: 根据 Cloudflare Workers 的限制而定

---

### 错误处理

建议在客户端实现以下错误处理逻辑：

1. **网络错误**: 捕获请求超时和网络异常
2. **HTTP 错误**: 检查响应状态码
3. **数据验证**: 验证返回的 JSON 数据结构
4. **重试机制**: 对于临时性错误（如 502），实现指数退避重试

---

<a name="english"></a>
## English Documentation

### Overview

GeoTrack provides two RESTful API endpoints for IP address geolocation queries. All endpoints return JSON formatted data.

### Basic Information

- **Base URL**: `https://your-domain.workers.dev` (replace with your actual domain)
- **Content-Type**: `application/json; charset=utf-8`

---

### API Endpoints

#### 1. Query IP Geolocation

Query detailed geographic location information for a specified IP address.

**Method 1: POST Request (Recommended for application integration)**

**Endpoint**: `POST /api/query`

**Request Headers**:
```
Content-Type: application/json; charset=utf-8
```

**Request Body**:
```json
{
  "ip": "8.8.8.8"
}
```

**Method 2: GET Request (Simple and quick, supports direct browser access)**

**Endpoint**: 
- `GET /?ip=8.8.8.8`
- `GET /api/query?ip=8.8.8.8`

**URL Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ip | string | Yes | IPv4 address to query |

---

**Request Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ip | string | Yes | IPv4 address to query |

**Success Response** (200):
```json
{
  "ip": "8.8.8.8",
  "location": {
    "country": "United States",
    "province": "California",
    "city": "Mountain View",
    "district": "",
    "detail": "United States California Mountain View",
    "lat": 37.4056,
    "lng": -122.0775
  }
}
```

> **Note**: All responses have Content-Type `application/json; charset=utf-8` to ensure Chinese characters are displayed correctly.

**Error Responses**:

> **Note**: Error messages are returned in Chinese as this is how the API is currently implemented. When parsing error responses in your application, ensure your client can handle UTF-8 encoded Chinese characters. Translations are provided below for reference.

- **400 Bad Request** - Invalid IP address format
```json
{
  "error": "无效的IP地址格式"
}
```
(Translation: "Invalid IP address format")

- **400 Bad Request** - Private or reserved IP address
```json
{
  "error": "不支持查询内网IP或保留地址"
}
```
(Translation: "Private or reserved IP addresses are not supported")

- **502 Bad Gateway** - Upstream API request failed
```json
{
  "error": "地理位置API请求失败: 502"
}
```
(Translation: "Geolocation API request failed: 502")

- **500 Internal Server Error** - Server error
```json
{
  "error": "error message"
}
```

**Usage Examples**:

**GET Request (Browser/Simple scenarios)**:

**cURL**:
```bash
# Using root path
curl "https://your-domain.workers.dev/?ip=8.8.8.8"

# Using API path
curl "https://your-domain.workers.dev/api/query?ip=8.8.8.8"
```

**Direct browser access**:
```
https://your-domain.workers.dev/?ip=8.8.8.8
```

**JavaScript (Simple GET)**:
```javascript
fetch('https://your-domain.workers.dev/?ip=8.8.8.8')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

---

**POST Request (Recommended for application integration)**:

**cURL**:
```bash
curl -X POST https://your-domain.workers.dev/api/query \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"ip":"8.8.8.8"}'
```

**JavaScript (Fetch API)**:
```javascript
fetch('https://your-domain.workers.dev/api/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ ip: '8.8.8.8' })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

**Python (requests)**:
```python
import requests

url = 'https://your-domain.workers.dev/api/query'
data = {'ip': '8.8.8.8'}
headers = {'Content-Type': 'application/json; charset=utf-8'}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```

**Node.js (axios)**:
```javascript
const axios = require('axios');

axios.post('https://your-domain.workers.dev/api/query', {
  ip: '8.8.8.8'
}, {
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
})
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));
```

**PHP**:
```php
<?php
$url = 'https://your-domain.workers.dev/api/query';
$data = array('ip' => '8.8.8.8');

$options = array(
    'http' => array(
        'header'  => "Content-type: application/json; charset=utf-8\r\n",
        'method'  => 'POST',
        'content' => json_encode($data)
    )
);

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);
$response = json_decode($result, true);

print_r($response);
?>
```

**Java**:
```java
import java.net.http.*;
import java.net.URI;

public class GeoTrackClient {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        String json = "{\"ip\":\"8.8.8.8\"}";
        
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://your-domain.workers.dev/api/query"))
            .header("Content-Type", "application/json; charset=utf-8")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();
        
        HttpResponse<String> response = client.send(request, 
            HttpResponse.BodyHandlers.ofString());
        
        System.out.println(response.body());
    }
}
```

---

#### 2. Get Client IP

Get the real IP address of the requesting client.

**Endpoint**: `GET /api/clientip`

**Request Headers**: No special requirements

**Success Response** (200):
```json
{
  "ip": "123.45.67.89"
}
```

**Usage Examples**:

**cURL**:
```bash
curl https://your-domain.workers.dev/api/clientip
```

**JavaScript (Fetch API)**:
```javascript
fetch('https://your-domain.workers.dev/api/clientip')
  .then(response => response.json())
  .then(data => console.log('Your IP:', data.ip))
  .catch(error => console.error('Error:', error));
```

**Python (requests)**:
```python
import requests

response = requests.get('https://your-domain.workers.dev/api/clientip')
print(response.json())
```

---

### Limitations

1. **Unsupported IP Addresses**:
   - Private network addresses (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
   - Loopback addresses (127.0.0.0/8)
   - Link-local addresses (169.254.0.0/16)
   - Other reserved addresses

2. **IP Format**: Only IPv4 address format is supported

3. **Rate Limiting**: Subject to Cloudflare Workers limitations

---

### Error Handling

It's recommended to implement the following error handling logic in your client:

1. **Network Errors**: Catch request timeouts and network exceptions
2. **HTTP Errors**: Check response status codes
3. **Data Validation**: Validate the returned JSON data structure
4. **Retry Mechanism**: Implement exponential backoff retry for temporary errors (e.g., 502)

---

## License

See [LICENSE](LICENSE) file for details.
