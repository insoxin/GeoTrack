(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

  // worker.js
  addEventListener("fetch", (event) => {
    event.respondWith(handleRequest(event.request));
  });
  async function handleRequest(request) {
    const url = new URL(request.url);
    const method = request.method;
    
    // 定义 CORS 头部
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", // 允许任何来源访问
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // 允许的方法
      "Access-Control-Allow-Headers": "Content-Type, Authorization", // 允许的请求头
    };

    // 处理 OPTIONS 预检请求
    if (method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders,
        status: 204 // No Content
      });
    }
    
    // 支持 GET 请求查询 IP (通过 URL 参数)
    if ((url.pathname === "/" || url.pathname === "/api/query") && method === "GET" && url.searchParams.has("ip")) {
      try {
        const ip = url.searchParams.get("ip");
        return await queryIPLocation(ip, corsHeaders);
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
          status: 500
        });
      }
    }
    
    // 支持 GET 请求查询经纬度对应的地址
    if (url.pathname === "/api/latlng" && method === "GET" && (url.searchParams.has("lat") || url.searchParams.has("latlng"))) {
      try {
        let lat, lng;
        if (url.searchParams.has("latlng")) {
          // 支持格式: ?latlng=39.9042,116.4074
          const latlngParam = url.searchParams.get("latlng");
          if (!latlngParam || !latlngParam.includes(",")) {
            return new Response(JSON.stringify({ error: "latlng参数格式错误，应为：纬度,经度（例如：39.9042,116.4074）" }), {
              headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
              status: 400
            });
          }
          const parts = latlngParam.split(",");
          if (parts.length !== 2) {
            return new Response(JSON.stringify({ error: "latlng参数格式错误，应为：纬度,经度（例如：39.9042,116.4074）" }), {
              headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
              status: 400
            });
          }
          lat = parseFloat(parts[0]);
          lng = parseFloat(parts[1]);
        } else {
          // 支持格式: ?lat=39.9042&lng=116.4074
          lat = parseFloat(url.searchParams.get("lat"));
          lng = parseFloat(url.searchParams.get("lng"));
        }
        
        // 验证解析后的数值
        if (isNaN(lat) || isNaN(lng)) {
          return new Response(JSON.stringify({ error: "无效的经纬度格式" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
            status: 400
          });
        }
        
        return await queryAddress(lat, lng, corsHeaders);
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
          status: 500
        });
      }
    }
    
    if (url.pathname === "/api/query" && method === "POST") {
      try {
        const requestData = await request.json();
        const ip = requestData.ip;
        return await queryIPLocation(ip, corsHeaders);
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
          status: 500
        });
      }
    }
    
    // 支持 POST 请求查询经纬度对应的地址
    if (url.pathname === "/api/latlng" && method === "POST") {
      try {
        const requestData = await request.json();
        const lat = parseFloat(requestData.lat);
        const lng = parseFloat(requestData.lng);
        return await queryAddress(lat, lng, corsHeaders);
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
          status: 500
        });
      }
    }
    
    if (url.pathname === "/api/clientip") {
      const clientIP = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "\u672A\u77E5IP";
      return new Response(JSON.stringify({ ip: clientIP }), {
        headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
      });
    }
    return new Response(getHtmlContent(), {
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" }
    });
  }
  __name(handleRequest, "handleRequest");
  
  function isReservedIP(ip) {
    // 将 IP 地址分割为四个部分
    const octets = ip.split('.').map(Number);
    
    // 内网地址检查
    // 10.0.0.0/8
    if (octets[0] === 10) return true;
    
    // 172.16.0.0/12
    if (octets[0] === 172 && (octets[1] >= 16 && octets[1] <= 31)) return true;
    
    // 192.168.0.0/16
    if (octets[0] === 192 && octets[1] === 168) return true;
    
    // 169.254.0.0/16 (APIPA)
    if (octets[0] === 169 && octets[1] === 254) return true;
    
    // 其他保留地址
    // 127.0.0.0/8 (环回地址)
    if (octets[0] === 127) return true;
    
    // 0.0.0.0/8
    if (octets[0] === 0) return true;
    
    // 100.64.0.0/10 (运营商NAT)
    if (octets[0] === 100 && (octets[1] >= 64 && octets[1] <= 127)) return true;
    
    // 192.0.0.0/24
    if (octets[0] === 192 && octets[1] === 0 && octets[2] === 0) return true;
    
    // 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 (文档和示例)
    if (
      (octets[0] === 192 && octets[1] === 0 && octets[2] === 2) ||
      (octets[0] === 198 && octets[1] === 51 && octets[2] === 100) ||
      (octets[0] === 203 && octets[1] === 0 && octets[2] === 113)
    ) return true;
    
    // 224.0.0.0/4 (多播地址)
    if (octets[0] >= 224 && octets[0] <= 239) return true;
    
    // 240.0.0.0/4 (保留用于将来使用和研究)
    if (octets[0] >= 240) return true;
    
    // 255.255.255.255 (广播地址)
    if (octets[0] === 255 && octets[1] === 255 && octets[2] === 255 && octets[3] === 255) return true;
    
    return false;
  }
  __name(isReservedIP, "isReservedIP");
  
  // Baidu IP Location API constants
  const BAIDU_API_BASE_URL = "https://opendata.baidu.com/api.php";
  const BAIDU_API_RESOURCE_ID = "6006";
  const BAIDU_SUCCESS_STATUS = "0";
  
  async function queryBaiduIPLocation(ip) {
    try {
      const baiduResponse = await fetch(`${BAIDU_API_BASE_URL}?co=&resource_id=${BAIDU_API_RESOURCE_ID}&oe=utf8&query=${encodeURIComponent(ip)}`);
      if (!baiduResponse.ok) {
        return null;
      }
      const baiduData = await baiduResponse.json();
      // Baidu API returns status "0" for successful responses
      if (baiduData.status === BAIDU_SUCCESS_STATUS && baiduData.data && baiduData.data.length > 0) {
        return baiduData.data[0].location || null;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
  __name(queryBaiduIPLocation, "queryBaiduIPLocation");
  
  async function queryIPLocation(ip, corsHeaders = {}) {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) {
      return new Response(JSON.stringify({ error: "\u65E0\u6548\u7684IP\u5730\u5740\u683C\u5F0F" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
        status: 400
      });
    }
    if (isReservedIP(ip)) {
      return new Response(JSON.stringify({ error: "\u4E0D\u652F\u6301\u67E5\u8BE2\u5185\u7F51IP\u6216\u4FDD\u7559\u5730\u5740" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
        status: 400
      });
    }
    const ipLocResponse = await fetch(`https://apimobile.meituan.com/locate/v2/ip/loc?rgeo=true&ip=${ip}`);
    if (!ipLocResponse.ok) {
      return new Response(JSON.stringify({ error: `\u5730\u7406\u4F4D\u7F6EAPI\u8BF7\u6C42\u5931\u8D25: ${ipLocResponse.status}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
        status: 502
      });
    }
    const ipLocData = await ipLocResponse.json();
    if (!ipLocData.data) {
      return new Response(JSON.stringify({ error: "\u65E0\u6CD5\u83B7\u53D6IP\u5730\u7406\u4F4D\u7F6E\u4FE1\u606F" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
      });
    }
    const lng = ipLocData.data?.lng;
    const lat = ipLocData.data?.lat;
    if (!lng || !lat) {
      return new Response(JSON.stringify({ error: "\u65E0\u6CD5\u83B7\u53D6\u7ECF\u7EAC\u5EA6\u4FE1\u606F" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
      });
    }
    const detailResponse = await fetch(`https://apimobile.meituan.com/group/v1/city/latlng/${lat},${lng}?tag=0`);
    if (!detailResponse.ok) {
      return new Response(JSON.stringify({ error: `\u8BE6\u7EC6\u5730\u5740API\u8BF7\u6C42\u5931\u8D25: ${detailResponse.status}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
        status: 502
      });
    }
    const detailData = await detailResponse.json();
    
    // Query Baidu API for additional location information
    const baiduLocation = await queryBaiduIPLocation(ip);
    
    const result = {
      ip,
      location: {
        country: ipLocData.data?.rgeo?.country || "",
        province: ipLocData.data?.rgeo?.province || "",
        city: ipLocData.data?.rgeo?.city || "",
        district: ipLocData.data?.rgeo?.district || "",
        detail: detailData.data?.detail || "",
        lat,
        lng,
        baidu: baiduLocation || ""
      }
    };
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
    });
  }
  __name(queryIPLocation, "queryIPLocation");
  
  async function queryAddress(lat, lng, corsHeaders = {}) {
    // 验证经纬度格式
    if (isNaN(lat) || isNaN(lng)) {
      return new Response(JSON.stringify({ error: "无效的经纬度格式" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
        status: 400
      });
    }
    
    // 验证经纬度范围
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return new Response(JSON.stringify({ error: "经纬度超出有效范围（纬度: -90~90, 经度: -180~180）" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
        status: 400
      });
    }
    
    try {
      const detailResponse = await fetch(`https://apimobile.meituan.com/group/v1/city/latlng/${lat},${lng}?tag=0`);
      if (!detailResponse.ok) {
        return new Response(JSON.stringify({ error: `地址API请求失败: ${detailResponse.status}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
          status: 502
        });
      }
      
      const detailData = await detailResponse.json();
      if (!detailData.data) {
        return new Response(JSON.stringify({ error: "无法获取地址信息" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
          status: 404
        });
      }
      
      const result = {
        lat,
        lng,
        address: {
          detail: detailData.data?.detail || "",
          country: detailData.data?.country || "",
          province: detailData.data?.province || "",
          city: detailData.data?.city || "",
          district: detailData.data?.district || ""
        }
      };
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
        status: 500
      });
    }
  }
  __name(queryAddress, "queryAddress");
  
  
  function getHtmlContent() {
    return `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GeoTrack - IP 溯源系统</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>
      :root {
        --primary-color: #6366f1;
        --secondary-color: #8b5cf6;
        --accent-color: #ec4899;
        --success-color: #10b981;
        --error-color: #ef4444;
        --bg-gradient: linear-gradient(135deg, rgba(99, 102, 241, 0.8) 0%, rgba(139, 92, 246, 0.8) 50%, rgba(236, 72, 153, 0.8) 100%);
        --card-bg: rgba(255, 255, 255, 0.1);
        --text-primary: #f8fafc;
        --text-secondary: rgba(248, 250, 252, 0.7);
        --border-radius: 16px;
        --transition-fast: 0.3s;
        --transition-slow: 0.6s;
        --box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        --box-shadow-hover: 0 15px 35px rgba(0, 0, 0, 0.25);
        --backdrop-blur: blur(20px);
        --glow-effect: 0 0 20px rgba(99, 102, 241, 0.5);
      }
  
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
  
      body {
        font-family: 'Montserrat', 'Noto Sans SC', sans-serif;
        background-color: #0f172a;
        background-image: 
          radial-gradient(circle at 20% 35%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 75% 60%, rgba(236, 72, 153, 0.15) 0%, transparent 50%);
        background-attachment: fixed;
        min-height: 100vh;
        color: var(--text-primary);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
        position: relative;
        overflow-x: hidden;
      }
  
      body::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="none"/><rect width="1" height="1" fill="rgba(255,255,255,0.03)" x="20" y="20"/><rect width="1" height="1" fill="rgba(255,255,255,0.03)" x="40" y="40"/><rect width="1" height="1" fill="rgba(255,255,255,0.03)" x="60" y="60"/><rect width="1" height="1" fill="rgba(255,255,255,0.03)" x="80" y="80"/></svg>');
        opacity: 0.5;
        z-index: -1;
      }
  
      .container {
        width: 100%;
        max-width: 900px;
        background: var(--card-bg);
        backdrop-filter: var(--backdrop-blur);
        -webkit-backdrop-filter: var(--backdrop-blur);
        border-radius: var(--border-radius);
        padding: 40px;
        box-shadow: var(--box-shadow);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        position: relative;
        overflow: hidden;
        z-index: 1;
      }
  
      .container::before {
        content: '';
        position: absolute;
        top: -10px;
        left: -10px;
        right: -10px;
        bottom: -10px;
        background: var(--bg-gradient);
        z-index: -1;
        filter: blur(40px);
        opacity: 0.15;
        pointer-events: none;
        animation: pulseGlow 8s ease-in-out infinite;
      }
  
      .container:hover {
        transform: translateY(-5px);
        box-shadow: var(--box-shadow-hover);
      }
  
      h1 {
        font-weight: 600;
        font-size: 2.4rem;
        background: linear-gradient(to right, var(--primary-color), var(--accent-color));
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        text-align: center;
        margin-bottom: 30px;
        letter-spacing: 1px;
        position: relative;
        display: inline-block;
        width: 100%;
      }
  
      h1::after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 80px;
        height: 3px;
        background: linear-gradient(to right, var(--primary-color), var(--accent-color));
        border-radius: 3px;
      }
  
      .pro-badge {
        position: absolute;
        top: 15px;
        right: 15px;
        background: linear-gradient(to right, var(--primary-color), var(--accent-color));
        color: white;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        letter-spacing: 1px;
        box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
        text-transform: uppercase;
      }
  
      .input-wrapper {
        position: relative;
        margin-bottom: 30px;
      }
  
      .input-group {
        display: flex;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
        transition: transform var(--transition-fast);
      }
  
      .input-group:focus-within {
        transform: scale(1.02);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
      }
  
      input {
        flex: 1;
        padding: 18px 20px;
        border: none;
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
        font-size: 1.1rem;
        font-weight: 500;
        outline: none;
        transition: background var(--transition-fast);
        font-family: inherit;
        backdrop-filter: blur(5px);
      }
  
      input::placeholder {
        color: var(--text-secondary);
        opacity: 0.8;
      }
  
      input:focus {
        background: rgba(255, 255, 255, 0.15);
      }
  
      button {
        padding: 0 30px;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        border: none;
        color: white;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--transition-fast);
        letter-spacing: 0.5px;
        position: relative;
        overflow: hidden;
        font-family: inherit;
      }
  
      button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.7s;
      }
  
      button:hover {
        box-shadow: 0 5px 15px rgba(99, 102, 241, 0.4);
      }
  
      button:hover::before {
        left: 100%;
      }
  
      button:active {
        transform: scale(0.98);
      }
  
      .loading {
        text-align: center;
        margin: 30px 0;
        display: none;
      }
  
      .spinner {
        display: inline-block;
        position: relative;
        width: 70px;
        height: 70px;
      }
  
      .spinner div {
        position: absolute;
        border: 4px solid var(--primary-color);
        opacity: 1;
        border-radius: 50%;
        animation: ripple 1.5s cubic-bezier(0, 0.2, 0.8, 1) infinite;
      }
  
      .spinner div:nth-child(2) {
        animation-delay: -0.5s;
      }
  
      @keyframes ripple {
        0% {
          top: 32px;
          left: 32px;
          width: 0;
          height: 0;
          opacity: 1;
        }
        100% {
          top: 0px;
          left: 0px;
          width: 64px;
          height: 64px;
          opacity: 0;
        }
      }
  
      .loading-text {
        margin-top: 15px;
        color: var(--text-secondary);
        font-size: 1rem;
        font-weight: 500;
        letter-spacing: 0.5px;
        animation: pulse 1.5s infinite;
      }
  
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
  
      .error {
        background-color: rgba(239, 68, 68, 0.1);
        color: var(--error-color);
        padding: 15px 20px;
        border-radius: 12px;
        margin: 20px 0;
        display: none;
        border-left: 4px solid var(--error-color);
        animation: slideInUp 0.4s ease-out;
        box-shadow: 0 4px 15px rgba(239, 68, 68, 0.2);
      }
  
      .error i {
        margin-right: 10px;
      }
  
      .result {
        margin-top: 30px;
        display: none;
        animation: fadeIn 0.8s;
      }
  
      .result-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
  
      .result-header h2 {
        font-weight: 600;
        font-size: 1.6rem;
        background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
  
      .copy-btn {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: var(--text-primary);
        padding: 8px 12px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all var(--transition-fast);
        backdrop-filter: blur(5px);
      }
  
      .copy-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
      }
  
      .result-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 25px;
      }
  
      .result-item {
        background: rgba(255, 255, 255, 0.05);
        padding: 20px;
        border-radius: 12px;
        transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.05);
        display: flex;
        flex-direction: column;
        position: relative;
        overflow: hidden;
      }
  
      .result-item:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        background: rgba(255, 255, 255, 0.08);
      }
  
      .result-item::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
        transform: scaleX(0);
        transform-origin: left;
        transition: transform var(--transition-fast);
      }
  
      .result-item:hover::after {
        transform: scaleX(1);
      }
  
      .result-label {
        color: var(--text-secondary);
        font-size: 0.9rem;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
      }
  
      .result-label i {
        margin-right: 8px;
        color: var(--primary-color);
        font-size: 1rem;
      }
  
      .result-value {
        font-size: 1.2rem;
        font-weight: 500;
        word-break: break-word;
      }
  
      .result-value.highlight {
        background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        font-weight: 600;
      }
  
      .divider {
        margin: 15px 0;
        height: 1px;
        background: rgba(255, 255, 255, 0.1);
        width: 100%;
      }
  
      .map-container {
        height: 300px;
        width: 100%;
        border-radius: 12px;
        overflow: hidden;
        margin-top: 25px;
        position: relative;
        box-shadow: var(--box-shadow);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
  
      .address-box {
        background: rgba(16, 185, 129, 0.1);
        border-radius: 12px;
        padding: 20px;
        margin-top: 25px;
        border-left: 4px solid var(--success-color);
        animation: fadeIn 0.8s;
        position: relative;
        overflow: hidden;
      }
  
      .address-box::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent, rgba(16, 185, 129, 0.05), transparent);
        animation: shimmer 2s infinite;
      }
  
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
  
      .address-title {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--success-color);
      }
  
      .address-title i {
        margin-right: 10px;
      }
  
      .address-content {
        font-size: 1.1rem;
        line-height: 1.6;
        position: relative;
        z-index: 1;
      }
  
      .footer {
        text-align: center;
        margin-top: 40px;
        color: var(--text-secondary);
        font-size: 0.9rem;
        opacity: 0.8;
        line-height: 1.6;
      }
  
      .footer p:first-child {
        margin-bottom: 8px;
        font-weight: 500;
      }
  
      .footer a {
        color: var(--primary-color);
        text-decoration: none;
        transition: color var(--transition-fast);
      }
  
      .footer a:hover {
        color: var(--accent-color);
        text-decoration: underline;
      }
  
      .tooltip {
        position: relative;
        display: inline-block;
      }
  
      .tooltip:hover::after {
        content: attr(data-tooltip);
        position: absolute;
        bottom: 125%;
        left: 50%;
        transform: translateX(-50%);
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        border-radius: 6px;
        font-size: 0.85rem;
        white-space: nowrap;
        z-index: 10;
      }
  
      .tooltip:hover::before {
        content: '';
        position: absolute;
        bottom: 114%;
        left: 50%;
        transform: translateX(-50%);
        border-width: 6px;
        border-style: solid;
        border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
        z-index: 10;
      }
  
      /* 添加抖动动画效果 */
      .shake {
        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        transform: translate3d(0, 0, 0);
      }
  
      @keyframes shake {
        10%, 90% { transform: translate3d(-1px, 0, 0); }
        20%, 80% { transform: translate3d(2px, 0, 0); }
        30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
        40%, 60% { transform: translate3d(3px, 0, 0); }
      }
  
      /* Animations */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
  
      @keyframes slideInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
  
      @keyframes pulseGlow {
        0%, 100% { opacity: 0.15; }
        50% { opacity: 0.3; }
      }
  
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
  
      .particle {
        position: absolute;
        border-radius: 50%;
        background: linear-gradient(to right, var(--primary-color), var(--accent-color));
        pointer-events: none;
        z-index: 0;
        opacity: 0.4;
        animation: float 6s infinite;
      }
  
      /* Responsive styles */
      @media (max-width: 768px) {
        .container {
          padding: 30px 20px;
        }
  
        h1 {
          font-size: 1.8rem;
        }
  
        .result-grid {
          grid-template-columns: 1fr;
        }
  
        .map-container {
          height: 250px;
        }
  
        .input-group {
          flex-direction: column;
          border-radius: 12px;
          overflow: hidden;
        }
  
        input {
          border-radius: 12px 12px 0 0;
          padding: 15px;
        }
  
        button {
          width: 100%;
          padding: 15px;
          border-radius: 0 0 12px 12px;
        }
      }
  
      /* Success Animation */
      .success-animation {
        display: flex;
        justify-content: center;
        margin: 30px 0;
      }
  
      .checkmark {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: block;
        stroke-width: 2;
        stroke: var(--success-color);
        stroke-miterlimit: 10;
        box-shadow: 0 0 20px var(--success-color);
        animation: fill 0.4s ease-in-out 0.4s forwards, scale 0.3s ease-in-out 0.9s both;
      }
  
      .checkmark__circle {
        stroke-dasharray: 166;
        stroke-dashoffset: 166;
        stroke-width: 2;
        stroke-miterlimit: 10;
        stroke: var(--success-color);
        fill: none;
        animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
      }
  
      .checkmark__check {
        transform-origin: 50% 50%;
        stroke-dasharray: 48;
        stroke-dashoffset: 48;
        animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
      }
  
      @keyframes stroke {
        100% {
          stroke-dashoffset: 0;
        }
      }
  
      @keyframes scale {
        0%, 100% {
          transform: none;
        }
        50% {
          transform: scale3d(1.1, 1.1, 1);
        }
      }
  
      @keyframes fill {
        100% {
          box-shadow: 0 0 15px var(--success-color);
          background: var(--success-color);
        }
      }
  
      /* Copy Success Animation */
      @keyframes copied {
        0% { opacity: 0; transform: translateY(10px); }
        10% { opacity: 1; transform: translateY(0); }
        90% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-10px); }
      }
  
      .copy-alert {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(16, 185, 129, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3);
        z-index: 1000;
        animation: copied 2s ease-in-out forwards;
        backdrop-filter: blur(5px);
      }
  
      .copy-alert i {
        font-size: 1.2rem;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="pro-badge">Pro</div>
      <h1>GeoTrack Pro</h1>
      
      <div class="input-wrapper">
        <div class="input-group">
          <input type="text" id="ipInput" placeholder="输入IP地址  例如: 123.123.123.123">
          <button id="queryBtn"><i class="fas fa-search"></i>&nbsp; 精准定位</button>
        </div>
      </div>
      
      <div class="loading" id="loading">
        <div class="spinner">
          <div></div>
          <div></div>
        </div>
        <div class="loading-text">正在查询 IP 地理位置信息...</div>
      </div>
      
      <div class="error" id="error">
        <i class="fas fa-exclamation-circle"></i>
        <span id="errorText">错误信息</span>
      </div>
      
      <div class="success-animation" id="successAnimation" style="display:none;">
        <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
          <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
          <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
      </div>
      
      <div class="result" id="result">
        <div class="result-header">
          <h2>查询结果</h2>
          <button class="copy-btn" id="copyResultBtn">
            <i class="fas fa-copy"></i>
            <span>复制结果</span>
          </button>
        </div>
        
        <div class="result-grid">
          <div class="result-item">
            <div class="result-label">
              <i class="fas fa-network-wired"></i>
              <span>IP 地址</span>
            </div>
            <div class="result-value highlight" id="resultIP">255.255.255.255</div>
          </div>
          
          <div class="result-item">
            <div class="result-label">
              <i class="fas fa-globe-asia"></i>
              <span>国家</span>
            </div>
            <div class="result-value" id="resultCountry">中国</div>
          </div>
          
          <div class="result-item">
            <div class="result-label">
              <i class="fas fa-map"></i>
              <span>省份</span>
            </div>
            <div class="result-value" id="resultProvince">北京市</div>
          </div>
          
          <div class="result-item">
            <div class="result-label">
              <i class="fas fa-city"></i>
              <span>城市</span>
            </div>
            <div class="result-value" id="resultCity">北京市</div>
          </div>
          
          <div class="result-item">
            <div class="result-label">
              <i class="fas fa-building"></i>
              <span>区县</span>
            </div>
            <div class="result-value" id="resultDistrict">海淀区</div>
          </div>
          
          <div class="result-item">
            <div class="result-label">
              <i class="fas fa-map-marker-alt"></i>
              <span>经纬度</span>
            </div>
            <div class="result-value" id="resultCoords">39.9042, 116.4074</div>
          </div>
        </div>
        
        <div class="address-box">
          <div class="address-title">
            <i class="fas fa-map-marked-alt"></i>
            <span>详细地址</span>
          </div>
          <div class="address-content" id="resultDetail">
            中国 北京市 海淀区 中关村
          </div>
        </div>
        
        <div class="map-container" id="mapContainer">
          <iframe id="mapFrame" width="100%" height="100%" frameborder="0" style="border:0" allowfullscreen></iframe>
        </div>
      </div>
      
      <div class="footer">
        <p>© 2025 GeoTrack | <span class="tooltip" data-tooltip="使用美团开放API提供地理位置信息">IP 溯源系统</span></p>
        <p>请勿将本服务用于侵犯他人隐私、网络攻击、商业爬取等非法用途</p>
        <p>违规使用所导致的一切后果由使用者自行承担</p>
      </div>
    </div>
    
    <script>
      document.addEventListener('DOMContentLoaded', () => {
        // 添加背景粒子效果
        createParticles();
        
        const ipInput = document.getElementById('ipInput');
        const queryBtn = document.getElementById('queryBtn');
        const loading = document.getElementById('loading');
        const error = document.getElementById('error');
        const errorText = document.getElementById('errorText');
        const result = document.getElementById('result');
        const successAnimation = document.getElementById('successAnimation');
        const copyResultBtn = document.getElementById('copyResultBtn');
        
        // 添加IP验证正则表达式
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        
        // 检查 IP 是否为内网地址或保留地址
        function isReservedIP(ip) {
          // 将 IP 地址分割为四个部分
          const octets = ip.split('.').map(Number);
          
          // 内网地址检查
          // 10.0.0.0/8
          if (octets[0] === 10) return true;
          
          // 172.16.0.0/12
          if (octets[0] === 172 && (octets[1] >= 16 && octets[1] <= 31)) return true;
          
          // 192.168.0.0/16
          if (octets[0] === 192 && octets[1] === 168) return true;
          
          // 169.254.0.0/16 (APIPA)
          if (octets[0] === 169 && octets[1] === 254) return true;
          
          // 其他保留地址
          // 127.0.0.0/8 (环回地址)
          if (octets[0] === 127) return true;
          
          // 0.0.0.0/8
          if (octets[0] === 0) return true;
          
          // 100.64.0.0/10 (运营商NAT)
          if (octets[0] === 100 && (octets[1] >= 64 && octets[1] <= 127)) return true;
          
          // 192.0.0.0/24
          if (octets[0] === 192 && octets[1] === 0 && octets[2] === 0) return true;
          
          // 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 (文档和示例)
          if (
            (octets[0] === 192 && octets[1] === 0 && octets[2] === 2) ||
            (octets[0] === 198 && octets[1] === 51 && octets[2] === 100) ||
            (octets[0] === 203 && octets[1] === 0 && octets[2] === 113)
          ) return true;
          
          // 224.0.0.0/4 (多播地址)
          if (octets[0] >= 224 && octets[0] <= 239) return true;
          
          // 240.0.0.0/4 (保留用于将来使用和研究)
          if (octets[0] >= 240) return true;
          
          // 255.255.255.255 (广播地址)
          if (octets[0] === 255 && octets[1] === 255 && octets[2] === 255 && octets[3] === 255) return true;
          
          return false;
        }
        
        // 自动获取用户当前IP
        setTimeout(async () => {
          try {
            showLoading('正在获取您的IP地址...');
            
            const response = await fetch('/api/clientip');
            const data = await response.json();
            
            if (data.ip && data.ip !== '未知IP') {
              ipInput.value = data.ip;
              // 自动查询当前IP
              queryIP(data.ip);
            } else {
              hideLoading();
            }
          } catch (err) {
            console.error('获取客户端IP失败:', err);
            hideLoading();
          }
        }, 500);
        
        // 输入框添加回车事件处理
        ipInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            handleQuery();
          }
        });
        
        // 查询按钮点击事件
        queryBtn.addEventListener('click', handleQuery);
        
        // 复制结果按钮点击事件
        copyResultBtn.addEventListener('click', copyResults);
        
        function handleQuery() {
          const ip = ipInput.value.trim();
          if (!ip) {
            showError('请输入有效的IP地址');
            return;
          }
          
          // 前端验证IP格式
          if (!ipRegex.test(ip)) {
            showError('无效的IP地址格式，请输入如 123.123.123.123 的IP地址');
            return;
          }
          
          // 前端检查内网IP和保留地址
          if (isReservedIP(ip)) {
            showError('不支持查询内网IP或保留地址');
            return;
          }
          
          queryIP(ip);
        }
        
        async function queryIP(ip) {
          // 显示加载状态
          showLoading('正在查询 IP 地理位置信息...');
          hideError();
          hideResult();
          
          try {
            const response = await fetch('/api/query', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json; charset=utf-8'
              },
              body: JSON.stringify({ ip })
            });
            
            const data = await response.json();
            
            if (data.error) {
              showError(data.error);
              return;
            }
            
            // 显示成功动画
            showSuccessAnimation().then(() => {
              // 填充结果
              document.getElementById('resultIP').textContent = data.ip;
              document.getElementById('resultCountry').textContent = data.location.country || '未知';
              document.getElementById('resultProvince').textContent = data.location.province || '未知';
              document.getElementById('resultCity').textContent = data.location.city || '未知';
              document.getElementById('resultDistrict').textContent = data.location.district || '未知';
              document.getElementById('resultCoords').textContent = \`\${data.location.lat}, \${data.location.lng}\`;
              
              // 组合详细地址
              let detailAddress = \`\${data.location.country || ''} \${data.location.province || ''} \${data.location.city || ''} \${data.location.district || ''}\`.trim();
              if (data.location.detail) {
                detailAddress += \` \${data.location.detail}\`;
              }
              document.getElementById('resultDetail').textContent = detailAddress || '无详细地址信息';
              
              // 更新地图
              updateMap(data.location.lat, data.location.lng);
              
              // 显示结果
              showResult();
            });
            
          } catch (err) {
            showError('查询失败，请稍后重试');
            console.error('查询失败:', err);
          }
        }
        
        function showLoading(message = '正在查询 IP 地理位置信息...') {
          document.querySelector('.loading-text').textContent = message;
          loading.style.display = 'block';
          // 禁用按钮和输入框
          queryBtn.disabled = true;
          ipInput.disabled = true;
          // 添加加载状态样式
          queryBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>&nbsp; 查询中...';
        }
        
        function hideLoading() {
          loading.style.display = 'none';
          // 启用按钮和输入框
          queryBtn.disabled = false;
          ipInput.disabled = false;
          // 恢复按钮文本
          queryBtn.innerHTML = '<i class="fas fa-search"></i>&nbsp; 精准定位';
        }
        
        function showError(message) {
          errorText.textContent = message;
          error.style.display = 'block';
          hideLoading();
          
          // 添加抖动效果
          ipInput.classList.add('shake');
          setTimeout(() => ipInput.classList.remove('shake'), 500);
        }
        
        function hideError() {
          error.style.display = 'none';
        }
        
        function showResult() {
          result.style.display = 'block';
          
          // 为每个结果项添加渐入动画
          const items = document.querySelectorAll('.result-item');
          items.forEach((item, index) => {
            item.style.animation = \`fadeIn 0.5s ease \${index * 0.1}s both\`;
          });
        }
        
        function hideResult() {
          result.style.display = 'none';
        }
        
        function showSuccessAnimation() {
          return new Promise(resolve => {
            successAnimation.style.display = 'flex';
            hideLoading();
            
            // 1.5秒后隐藏成功动画并显示结果
            setTimeout(() => {
              successAnimation.style.display = 'none';
              resolve();
            }, 1500);
          });
        }
        
        // WGS-84 转 GCJ-02（用于百度地图，处理坐标偏移）
        function wgs84ToGcj02(lng, lat) {
          const a = 6378245.0;
          const ee = 0.00669342162296594323;
          
          if (outOfChina(lng, lat)) {
            return { lng: lng, lat: lat };
          }
          
          let dLat = transformLat(lng - 105.0, lat - 35.0);
          let dLng = transformLng(lng - 105.0, lat - 35.0);
          
          const radLat = lat / 180.0 * Math.PI;
          let magic = Math.sin(radLat);
          magic = 1 - ee * magic * magic;
          
          const sqrtMagic = Math.sqrt(magic);
          dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
          dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI);
          
          return {
            lat: lat + dLat,
            lng: lng + dLng
          };
        }
        
        function outOfChina(lng, lat) {
          if (lng < 72.004 || lng > 137.8347) {
            return true;
          }
          if (lat < 0.8293 || lat > 55.8271) {
            return true;
          }
          return false;
        }
        
        function transformLat(x, y) {
          let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
          ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
          ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0;
          ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0;
          return ret;
        }
        
        function transformLng(x, y) {
          let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
          ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
          ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0;
          ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0;
          return ret;
        }
        
        function updateMap(lat, lng) {
          const mapFrame = document.getElementById('mapFrame');
          
          // 转换坐标系（WGS-84 转 GCJ-02）
          const { lat: gcjLat, lng: gcjLng } = wgs84ToGcj02(parseFloat(lng), parseFloat(lat));
          
          // 使用百度地图API
          const ak = 'nSxiPohfziUaCuONe4ViUP2N'; // 百度地图API密钥，请替换为您自己的密钥
          mapFrame.src = \`https://api.map.baidu.com/marker?location=\${gcjLat},\${gcjLng}&title=IP位置&content=IP位置&output=html&coord_type=gcj02&zoom=13&ak=\${ak}\`;
        }
        
        function copyResults() {
          // 构建要复制的文本
          const ip = document.getElementById('resultIP').textContent;
          const country = document.getElementById('resultCountry').textContent;
          const province = document.getElementById('resultProvince').textContent;
          const city = document.getElementById('resultCity').textContent;
          const district = document.getElementById('resultDistrict').textContent;
          const coords = document.getElementById('resultCoords').textContent;
          const detail = document.getElementById('resultDetail').textContent;
          
          const copyText = \`
          IP地址: \${ip}
  国家: \${country}
  省份: \${province}
  城市: \${city}
  区县: \${district}
  经纬度: \${coords}
  详细地址: \${detail}
         \`.trim();
          
          // 复制到剪贴板
          navigator.clipboard.writeText(copyText).then(() => {
            // 显示复制成功提示
            const alert = document.createElement('div');
            alert.className = 'copy-alert';
            alert.innerHTML = '<i class="fas fa-check-circle"></i><span>复制成功</span>';
            document.body.appendChild(alert);
            
            // 2秒后自动移除提示
            setTimeout(() => {
              if (alert && alert.parentElement) {
                document.body.removeChild(alert);
              }
            }, 2000);
            
            // 更新按钮文本
            copyResultBtn.innerHTML = '<i class="fas fa-check"></i><span>已复制</span>';
            
            // 1.5秒后恢复按钮文本
            setTimeout(() => {
              copyResultBtn.innerHTML = '<i class="fas fa-copy"></i><span>复制结果</span>';
            }, 1500);
          }).catch(err => {
            console.error('复制失败:', err);
          });
        }
        
        // 创建背景粒子效果
        function createParticles() {
          const count = 10;
          const container = document.body;
          
          for (let i = 0; i < count; i++) {
            const size = Math.random() * 150 + 50;
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // 随机位置
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            
            // 随机大小
            particle.style.width = \`\${size}px\`;
            particle.style.height = \`\${size}px\`;
            
            // 位置和z-index
            particle.style.left = \`\${x}%\`;
            particle.style.top = \`\${y}%\`;
            
            // 随机动画延迟
            particle.style.animationDelay = \`\${Math.random() * 5}s\`;
            
            // 透明度
            particle.style.opacity = (Math.random() * 0.3).toFixed(2);
            
            container.appendChild(particle);
          }
        }
        
        // 添加输入动画
        ipInput.addEventListener('focus', () => {
          ipInput.classList.add('input-active');
        });
        
        ipInput.addEventListener('blur', () => {
          ipInput.classList.remove('input-active');
        });
        
        // 添加自动检测暗黑模式
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        if (prefersDarkScheme.matches) {
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.setAttribute('data-theme', 'light');
        }
      });
    </script>
  </body>
  </html>
    `;
  }
  __name(getHtmlContent, "getHtmlContent");
})();
//# sourceMappingURL=worker.js.map
