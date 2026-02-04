# GeoTrack API 文档 / API Documentation

[English](#english) | [中文](#chinese)

---

<a name="chinese"></a>
## 中文文档

### 概述

GeoTrack 提供三个 RESTful API 接口，用于 IP 地址地理位置查询和经纬度地址查询。所有接口返回 JSON 格式数据。

### 基础信息

- **Base URL**: `https://ipgeo.cfns.gq` (替换为你的实际域名)
- **Content-Type**: `application/json; charset=utf-8`

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
  "ip": "121.8.215.106",
  "location": {
    "country": "中国",
    "province": "广东省",
    "city": "广州市",
    "district": "",
    "detail": "中国 广东省 广州市",
    "lat": 23.1291,
    "lng": 113.2644,
    "baidu": "广东省广州市 电信"
  }
}
```

> **注意**: 
> - 所有响应的 Content-Type 均为 `application/json; charset=utf-8`，确保中文字符正确显示。
> - `baidu` 字段提供来自百度开放平台的额外位置信息（示例中显示了运营商信息），如果百度 API 不可用，该字段将为空字符串。

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
curl "https://ipgeo.cfns.gq/?ip=8.8.8.8"

# 使用 API 路径
curl "https://ipgeo.cfns.gq/api/query?ip=8.8.8.8"
```

**浏览器直接访问**:
```
https://ipgeo.cfns.gq/?ip=8.8.8.8
```

**JavaScript (简单 GET)**:
```javascript
fetch('https://ipgeo.cfns.gq/?ip=8.8.8.8')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

---

**POST 请求 (应用集成推荐)**:

**cURL**:
```bash
curl -X POST https://ipgeo.cfns.gq/api/query \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"ip":"8.8.8.8"}'
```

**JavaScript (Fetch API)**:
```javascript
fetch('https://ipgeo.cfns.gq/api/query', {
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

url = 'https://ipgeo.cfns.gq/api/query'
data = {'ip': '8.8.8.8'}
headers = {'Content-Type': 'application/json; charset=utf-8'}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```

**Node.js (axios)**:
```javascript
const axios = require('axios');

axios.post('https://ipgeo.cfns.gq/api/query', {
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
$url = 'https://ipgeo.cfns.gq/api/query';
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
            .uri(URI.create("https://ipgeo.cfns.gq/api/query"))
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

#### 2. 经纬度查询地址

根据经纬度坐标查询对应的详细地址信息。

**方法 1: GET 请求（推荐）**

**端点**: `GET /api/latlng`

**URL 参数（两种格式）**:

格式1 - 使用单个参数:
```
/api/latlng?latlng=39.9042,116.4074
```

格式2 - 使用分离参数:
```
/api/latlng?lat=39.9042&lng=116.4074
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| latlng | string | 否* | 经纬度坐标，格式：纬度,经度 |
| lat | number | 否* | 纬度（-90 到 90） |
| lng | number | 否* | 经度（-180 到 180） |

*注：latlng 或 (lat + lng) 二选一必填

**方法 2: POST 请求**

**端点**: `POST /api/latlng`

**请求头**:
```
Content-Type: application/json; charset=utf-8
```

**请求体**:
```json
{
  "lat": 39.9042,
  "lng": 116.4074
}
```

**请求参数说明**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| lat | number | 是 | 纬度（-90 到 90） |
| lng | number | 是 | 经度（-180 到 180） |

**成功响应** (200):
```json
{
  "lat": 39.9042,
  "lng": 116.4074,
  "address": {
    "detail": "中国 北京市 东城区",
    "country": "中国",
    "province": "北京市",
    "city": "北京市",
    "district": "东城区"
  }
}
```

**错误响应**:

- **400 Bad Request** - 无效的经纬度格式
```json
{
  "error": "无效的经纬度格式"
}
```

- **400 Bad Request** - 经纬度超出范围
```json
{
  "error": "经纬度超出有效范围（纬度: -90~90, 经度: -180~180）"
}
```

- **404 Not Found** - 无法获取地址信息
```json
{
  "error": "无法获取地址信息"
}
```

- **502 Bad Gateway** - 上游 API 请求失败
```json
{
  "error": "地址API请求失败: 502"
}
```

**使用示例**:

**GET 请求**:

**cURL (格式1)**:
```bash
curl "https://ipgeo.cfns.gq/api/latlng?latlng=39.9042,116.4074"
```

**cURL (格式2)**:
```bash
curl "https://ipgeo.cfns.gq/api/latlng?lat=39.9042&lng=116.4074"
```

**JavaScript (Fetch API)**:
```javascript
fetch('https://ipgeo.cfns.gq/api/latlng?lat=39.9042&lng=116.4074')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

**Python (requests)**:
```python
import requests

url = 'https://ipgeo.cfns.gq/api/latlng'
params = {'lat': 39.9042, 'lng': 116.4074}

response = requests.get(url, params=params)
print(response.json())
```

**POST 请求**:

**cURL**:
```bash
curl -X POST https://ipgeo.cfns.gq/api/latlng \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"lat":39.9042,"lng":116.4074}'
```

**JavaScript (Fetch API)**:
```javascript
fetch('https://ipgeo.cfns.gq/api/latlng', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  },
  body: JSON.stringify({ lat: 39.9042, lng: 116.4074 })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

**Python (requests)**:
```python
import requests

url = 'https://ipgeo.cfns.gq/api/latlng'
data = {'lat': 39.9042, 'lng': 116.4074}
headers = {'Content-Type': 'application/json; charset=utf-8'}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```

---

#### 3. 获取客户端 IP

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
curl https://ipgeo.cfns.gq/api/clientip
```

**JavaScript (Fetch API)**:
```javascript
fetch('https://ipgeo.cfns.gq/api/clientip')
  .then(response => response.json())
  .then(data => console.log('Your IP:', data.ip))
  .catch(error => console.error('Error:', error));
```

**Python (requests)**:
```python
import requests

response = requests.get('https://ipgeo.cfns.gq/api/clientip')
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

GeoTrack provides three RESTful API endpoints for IP address geolocation queries and coordinate-to-address lookup. All endpoints return JSON formatted data.

### Basic Information

- **Base URL**: `https://ipgeo.cfns.gq` (replace with your actual domain)
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
  "ip": "121.8.215.106",
  "location": {
    "country": "中国",
    "province": "广东省",
    "city": "广州市",
    "district": "",
    "detail": "中国 广东省 广州市",
    "lat": 23.1291,
    "lng": 113.2644,
    "baidu": "广东省广州市 电信"
  }
}
```

> **Note**: 
> - All responses have Content-Type `application/json; charset=utf-8` to ensure Chinese characters are displayed correctly.
> - The `baidu` field provides additional location information from Baidu Open Platform (including ISP information in the example). Baidu API returns data in Chinese. If the Baidu API is unavailable, this field will be an empty string.

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
curl "https://ipgeo.cfns.gq/?ip=8.8.8.8"

# Using API path
curl "https://ipgeo.cfns.gq/api/query?ip=8.8.8.8"
```

**Direct browser access**:
```
https://ipgeo.cfns.gq/?ip=8.8.8.8
```

**JavaScript (Simple GET)**:
```javascript
fetch('https://ipgeo.cfns.gq/?ip=8.8.8.8')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

---

**POST Request (Recommended for application integration)**:

**cURL**:
```bash
curl -X POST https://ipgeo.cfns.gq/api/query \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"ip":"8.8.8.8"}'
```

**JavaScript (Fetch API)**:
```javascript
fetch('https://ipgeo.cfns.gq/api/query', {
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

url = 'https://ipgeo.cfns.gq/api/query'
data = {'ip': '8.8.8.8'}
headers = {'Content-Type': 'application/json; charset=utf-8'}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```

**Node.js (axios)**:
```javascript
const axios = require('axios');

axios.post('https://ipgeo.cfns.gq/api/query', {
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
$url = 'https://ipgeo.cfns.gq/api/query';
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
            .uri(URI.create("https://ipgeo.cfns.gq/api/query"))
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

#### 2. Query Address by Coordinates

Query detailed address information based on latitude and longitude coordinates.

**Method 1: GET Request (Recommended)**

**Endpoint**: `GET /api/latlng`

**URL Parameters (Two formats supported)**:

Format 1 - Single parameter:
```
/api/latlng?latlng=39.9042,116.4074
```

Format 2 - Separate parameters:
```
/api/latlng?lat=39.9042&lng=116.4074
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| latlng | string | No* | Coordinates in format: latitude,longitude |
| lat | number | No* | Latitude (-90 to 90) |
| lng | number | No* | Longitude (-180 to 180) |

*Note: Either latlng OR (lat + lng) is required

**Method 2: POST Request**

**Endpoint**: `POST /api/latlng`

**Request Headers**:
```
Content-Type: application/json; charset=utf-8
```

**Request Body**:
```json
{
  "lat": 39.9042,
  "lng": 116.4074
}
```

**Request Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lat | number | Yes | Latitude (-90 to 90) |
| lng | number | Yes | Longitude (-180 to 180) |

**Success Response** (200):
```json
{
  "lat": 39.9042,
  "lng": 116.4074,
  "address": {
    "detail": "China Beijing Dongcheng District",
    "country": "China",
    "province": "Beijing",
    "city": "Beijing",
    "district": "Dongcheng District"
  }
}
```

**Error Responses**:

- **400 Bad Request** - Invalid coordinate format
```json
{
  "error": "无效的经纬度格式"
}
```
(Translation: "Invalid coordinate format")

- **400 Bad Request** - Coordinates out of range
```json
{
  "error": "经纬度超出有效范围（纬度: -90~90, 经度: -180~180）"
}
```
(Translation: "Coordinates out of valid range (latitude: -90~90, longitude: -180~180)")

- **404 Not Found** - Unable to get address information
```json
{
  "error": "无法获取地址信息"
}
```
(Translation: "Unable to get address information")

- **502 Bad Gateway** - Upstream API request failed
```json
{
  "error": "地址API请求失败: 502"
}
```
(Translation: "Address API request failed: 502")

**Usage Examples**:

**GET Request**:

**cURL (Format 1)**:
```bash
curl "https://ipgeo.cfns.gq/api/latlng?latlng=39.9042,116.4074"
```

**cURL (Format 2)**:
```bash
curl "https://ipgeo.cfns.gq/api/latlng?lat=39.9042&lng=116.4074"
```

**JavaScript (Fetch API)**:
```javascript
fetch('https://ipgeo.cfns.gq/api/latlng?lat=39.9042&lng=116.4074')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

**Python (requests)**:
```python
import requests

url = 'https://ipgeo.cfns.gq/api/latlng'
params = {'lat': 39.9042, 'lng': 116.4074}

response = requests.get(url, params=params)
print(response.json())
```

**POST Request**:

**cURL**:
```bash
curl -X POST https://ipgeo.cfns.gq/api/latlng \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"lat":39.9042,"lng":116.4074}'
```

**JavaScript (Fetch API)**:
```javascript
fetch('https://ipgeo.cfns.gq/api/latlng', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  },
  body: JSON.stringify({ lat: 39.9042, lng: 116.4074 })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

**Python (requests)**:
```python
import requests

url = 'https://ipgeo.cfns.gq/api/latlng'
data = {'lat': 39.9042, 'lng': 116.4074}
headers = {'Content-Type': 'application/json; charset=utf-8'}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```

---

#### 3. Get Client IP

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
curl https://ipgeo.cfns.gq/api/clientip
```

**JavaScript (Fetch API)**:
```javascript
fetch('https://ipgeo.cfns.gq/api/clientip')
  .then(response => response.json())
  .then(data => console.log('Your IP:', data.ip))
  .catch(error => console.error('Error:', error));
```

**Python (requests)**:
```python
import requests

response = requests.get('https://ipgeo.cfns.gq/api/clientip')
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
