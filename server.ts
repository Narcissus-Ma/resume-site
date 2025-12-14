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

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
