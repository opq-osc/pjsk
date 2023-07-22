# pjsk

啤酒烧烤表情生成通用版。

### Preview

<img src="https://cdn.jsdelivr.net/gh/opq-osc/pjsk@main/preview/0.jpg" width="15%" />
<img src="https://cdn.jsdelivr.net/gh/opq-osc/pjsk@main/preview/1.jpg" width="15%" />
<img src="https://cdn.jsdelivr.net/gh/opq-osc/pjsk@main/preview/2.jpg" width="15%" />
<img src="https://cdn.jsdelivr.net/gh/opq-osc/pjsk@main/preview/3.jpg" width="15%" />
<img src="https://cdn.jsdelivr.net/gh/opq-osc/pjsk@main/preview/4.jpg" width="15%" />
<img src="https://cdn.jsdelivr.net/gh/opq-osc/pjsk@main/preview/5.jpg" width="15%" />

<!-- <img src="./preview/0.jpg" width="15%" />
<img src="./preview/1.jpg" width="15%" />
<img src="./preview/2.jpg" width="15%" />
<img src="./preview/3.jpg" width="15%" />
<img src="./preview/4.jpg" width="15%" />
<img src="./preview/5.jpg" width="15%" /> -->

### Directory

```yaml
 - assets    # 图片、字体资源
 - compress  # 压缩字体脚本
 - mahiro    # mahiro 插件
 - node      # 核心逻辑
```

### Usage

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

### Thanks/Inspiration

 - [Sekai Stickers](https://st.ayaka.one/)
 - [Agnes4m/nonebot_plugin_pjsk](https://github.com/Agnes4m/nonebot_plugin_pjsk)