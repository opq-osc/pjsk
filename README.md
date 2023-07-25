# pjsk

啤酒烧烤表情生成通用版。

## Preview

<img src="./preview/0.jpg" width="20%" /><img src="./preview/1.jpg" width="20%" /><img src="./preview/2.jpg" width="20%" />

<img src="./preview/3.jpg" width="20%" /><img src="./preview/4.jpg" width="20%" /><img src="./preview/5.jpg" width="20%" />

<details>
<summary>查看帮助一栏图</summary>
<img src="https://cdn.jsdelivr.net/gh/fz6m/Private-picgo@moe-2021/img/20230725011706.webp" width="70%" />
</details>

## Directory

```yaml
 - assets    # 图片、字体资源
 - compress  # 压缩字体脚本
 - mahiro    # mahiro 插件
 - node      # 核心逻辑
```

## Usage

### Install

```bash
  pnpm i
```

mahiro 直接导入插件使用：

```ts
import { PJSK } from './mahiro'

// ...

mahiro.use(PJSK())
```

注：如需精确定位和配置，请修改 [`node/src/info.ts#characterSpecifiedConfig`](./node/src/info.ts) 。

### Trigger

触发命令格式：

```bash
  pjsk {表情包ID} {文字}
  pjsk help
```

e.g.

```bash
  # 普通例子
  pjsk ena 不行，我在玩原神
  
  # 换行的例子
  pjsk nene11 我心脏弱
死给你看
```

## Troubleshooting

### `canvas` 依赖安装太慢

使用加速源：

```bash
# .npmrc
canvas_binary_host_mirror=https://registry.npmmirror.com/-/binary/canvas
```

### 字体加载失败 / 不高清

将字体安装到系统里再使用。

1. 移动 `assets/src/fonts/font.ttf` 与 `assets/src/fonts/y.otf` 两个字体文件到 `/usr/share/fonts/pjsk/*` 文件夹下。

2. 设定 CJK 兜底字体：

    ```bash
      sudo apt install fonts-noto-cjk fonts-noto-color-emoji
      sudo locale-gen zh_CN zh_CN.UTF-8
      sudo update-locale LC_ALL=zh_CN.UTF-8 LANG=zh_CN.UTF-8
    ```

3. 刷新字体缓存：

    ```bash
      fc-cache -fv
    ```

4. 修改 `node/src/draw.ts` 中的 `3` 处代码:

    ```diff
    -const fontNameForFallback = 'pjsk'
    -const fontNameForMain = 'yyy'
    -const fontFamily = `${fontNameForMain},${fontNameForFallback}`
    +const fontNameForFallback = 'SSFangTangTi'
    +const fontNameForMain = 'FOT-Yuruka Std'
    +const fontFamily = `"${fontNameForMain}","${fontNameForFallback}"`
    ```

    ```diff
    -registerFonts()
    ```

    ```diff
    -fontWeight: 800,
    ```

5. 重启 mahiro ，再次尝试。

## Thanks / Inspiration

 - [Sekai Stickers](https://st.ayaka.one/)
 - [Agnes4m/nonebot_plugin_pjsk](https://github.com/Agnes4m/nonebot_plugin_pjsk)
