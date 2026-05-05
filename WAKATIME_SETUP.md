# WakaTime 接入教程

## 1. 生成 Embeddable JSON 链接

1. 登录 [WakaTime](https://wakatime.com)
2. 进入 **Share** 页面：<https://wakatime.com/share>
3. 点击 **"+ Embed"** 新建一个嵌入
4. 配置你的图表：

   | 选项       | 推荐值                                    |
   | ---------- | ----------------------------------------- |
   | Format     | **JSON**（不是 SVG）                      |
   | Chart Type | Coding Activity / Languages / Projects 等 |
   | Date Range | Last 7 days                               |
   | 其他       | 按需调整                                  |

5. 点击 **Get Embeddable Code**
6. 复制生成的 JSON URL（格式如下）：

   ``` txt
   https://wakatime.com/share/@你的用户名/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.json
   ```

## 2. 配置

编辑 `config.ts`：

```ts
wakatime: {
  enabled: true,
  embedId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", // 上面复制的 UUID
  username: "你的WakaTime用户名",
},
```

## 3. API 响应格式

### Coding Activity（每日编码时长）

```json
[
  {
    "grand_total": {
      "hours": 10,
      "minutes": 58,
      "text": "10 hrs 58 mins",
      "total_seconds": 39519.073,
      "decimal": "10.97"
    },
    "range": {
      "date": "2026-05-03",
      "text": "Sun May 3rd 2026"
    }
  }
]
```

### Languages（编程语言占比）

```json
{
  "data": {
    "languages": [
      { "name": "TypeScript", "percent": 45.2, "hours": 5, "minutes": 30, "total_seconds": 19800 }
    ]
  }
}
```

## 4. 注意

- Embed JSON 接口 **支持 CORS**，前端可直接 fetch，无需代理
- 数据缓存 30 分钟（`localStorage`）
- 修改图表类型后 URL 会变，需要更新 `embedId`
