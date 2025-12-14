import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 3001;

// 允许跨域请求
app.use(cors());

// 解析JSON请求体
app.use(express.json());

// 简历数据文件路径
const resumeDataPath = path.join(
  process.cwd(),
  "src",
  "data",
  "resumeData.json"
);

// 主页数据文件路径
const homeDataPath = path.join(process.cwd(), "src", "data", "homeData.json");

// 获取简历数据
app.get("/api/resume", (req, res) => {
  try {
    const data = fs.readFileSync(resumeDataPath, "utf8");
    const resumeData = JSON.parse(data);
    res.json(resumeData);
  } catch (error) {
    console.error("读取简历数据失败:", error);
    res.status(500).json({ error: "读取简历数据失败" });
  }
});

// 保存简历数据
app.post("/api/resume", (req, res) => {
  try {
    const resumeData = req.body;
    // 直接写入JSON文件
    fs.writeFileSync(
      resumeDataPath,
      JSON.stringify(resumeData, null, 2),
      "utf8"
    );
    res.json({ success: true, message: "简历数据保存成功" });
  } catch (error) {
    console.error("保存简历数据失败:", error);
    res.status(500).json({ error: "保存简历数据失败" });
  }
});

// 获取主页数据
app.get("/api/home", (req, res) => {
  try {
    const data = fs.readFileSync(homeDataPath, "utf8");
    const homeData = JSON.parse(data);
    res.json(homeData);
  } catch (error) {
    console.error("读取主页数据失败:", error);
    res.status(500).json({ error: "读取主页数据失败" });
  }
});

// 保存主页数据
app.post("/api/home", (req, res) => {
  try {
    const homeData = req.body;
    // 直接写入JSON文件
    fs.writeFileSync(homeDataPath, JSON.stringify(homeData, null, 2), "utf8");
    res.json({ success: true, message: "主页数据保存成功" });
  } catch (error) {
    console.error("保存主页数据失败:", error);
    res.status(500).json({ error: "保存主页数据失败" });
  }
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
