# Yummy Food Restaurant 🍽️

一個可在電腦、手機及平板瀏覽器直接遊玩的 3D 教育遊戲。

玩家走進卡通餐廳後，可自由選擇健康或不健康食物，並即時觀察角色身體的變化：

- 🥦 健康食物：增加健康與力量、降低體脂
- 🍔 高糖高脂食物：增加體脂、降低健康
- 💪 力量增加時，角色手臂會逐漸變強壯
- 🍩 體脂增加時，角色身體和肚子會逐漸變胖

## 遊戲功能

- Pixar-style 3D 卡通／寫實卡通餐廳場景
- 8 種可互動食物
- 健康、力量、體脂及分數系統
- 即時角色體型變化
- 第三身跟隨鏡頭及近距離鏡頭
- 電腦鍵盤操作
- iPhone、Android、iPad 觸控搖桿操作
- 不需要安裝或編譯

## 操作方法

### 電腦

- `WASD` 或方向鍵：移動
- `E` 或空白鍵：吃食物
- 右下角 🎥：切換鏡頭

### 手機／平板

- 左下角搖桿：移動
- 右下角「食」按鈕：吃食物
- 建議橫向遊玩

## 遊戲目標

把力量提升至 80，同時把體脂保持在 40 以下。

## 開啟遊戲

遊戲使用 Three.js ES Module。可直接透過 GitHub Pages 發布：

1. 開啟 Repository 的 `Settings`
2. 進入 `Pages`
3. 在 `Build and deployment` 選擇 `Deploy from a branch`
4. Branch 選擇 `main`，資料夾選擇 `/ (root)`
5. 儲存後等待 GitHub Pages 產生網址

也可在本機資料夾執行：

```bash
python -m http.server 8000
```

然後瀏覽 `http://localhost:8000`。
