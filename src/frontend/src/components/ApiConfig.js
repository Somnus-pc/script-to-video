import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Tabs,
  Tab,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

function ApiConfig({ open, onClose }) {
  const [activeTab, setActiveTab] = useState(0);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  
  // 文本分析模型配置
  const [textConfig, setTextConfig] = useState({
    moonshot: { api_key: '', enabled: true },
    zhipu: { api_key: '', enabled: false }
  });

  // 图像生成模型配置
  const [imageConfig, setImageConfig] = useState({
    pollinations: { enabled: true },
    openai: { api_key: '', enabled: false },
    aliyun_wanxiang: { api_key: '', enabled: false }
  });

  // 视频生成模型配置
  const [videoConfig, setVideoConfig] = useState({
    kling: { api_key: '', enabled: false },
    runway: { api_key: '', enabled: false },
    luma: { api_key: '', enabled: false }
  });

  useEffect(() => {
    // 加载已保存的配置
    loadConfig();
  }, [open]);

  const loadConfig = async () => {
    try {
      const response = await axios.get('/api/models');
      // 根据可用模型更新配置状态
    } catch (err) {
      // 忽略错误，使用默认配置
    }
  };

  const handleSave = async () => {
    try {
      // 构建配置文件内容
      const config = {
        text_models: {
          moonshot: {
            api_key: textConfig.moonshot.api_key,
            base_url: 'https://api.moonshot.cn/v1',
            model: 'moonshot-v1-128k'
          },
          zhipu: {
            api_key: textConfig.zhipu.api_key,
            base_url: 'https://open.bigmodel.cn/api/paas/v4',
            model: 'glm-4'
          }
        },
        image_models: {
          pollinations: { enabled: imageConfig.pollinations.enabled },
          openai: {
            api_key: imageConfig.openai.api_key,
            model: 'dall-e-3'
          },
          aliyun_wanxiang: {
            api_key: imageConfig.aliyun_wanxiang.api_key,
            base_url: 'https://dashscope.aliyuncs.com/api/v1'
          }
        },
        video_models: {
          kling: {
            api_key: videoConfig.kling.api_key,
            base_url: 'https://api.klingai.com'
          },
          runway: {
            api_key: videoConfig.runway.api_key,
            base_url: 'https://api.runwayml.com'
          },
          luma: {
            api_key: videoConfig.luma.api_key,
            base_url: 'https://api.lumalabs.ai'
          }
        },
        defaults: {
          text_model: 'moonshot',
          image_model: imageConfig.openai.api_key ? 'openai' : 'pollinations',
          video_model: videoConfig.kling.api_key ? 'kling' : 'runway'
        }
      };

      // 保存配置文件
      const response = await axios.post('/api/save-config', config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('保存配置失败: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>API 配置</DialogTitle>
      <DialogContent>
        {saved && (
          <Alert severity="success" sx={{ mb: 2 }}>
            配置已保存！
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          配置各 AI 模型的 API Key。免费模型无需配置 Key，付费模型需要填写对应的 API Key。
        </Typography>

        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
          <Tab label="文本分析" />
          <Tab label="图像生成" />
          <Tab label="视频生成" />
        </Tabs>

        {activeTab === 0 && (
          <Box>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Moonshot (Kimi) - 推荐</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  label="API Key"
                  type="password"
                  value={textConfig.moonshot.api_key}
                  onChange={(e) => setTextConfig(prev => ({
                    ...prev,
                    moonshot: { ...prev.moonshot, api_key: e.target.value }
                  }))}
                  placeholder="输入 Moonshot API Key"
                  helperText="获取地址: https://platform.moonshot.cn/"
                />
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>智谱 AI (GLM)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  label="API Key"
                  type="password"
                  value={textConfig.zhipu.api_key}
                  onChange={(e) => setTextConfig(prev => ({
                    ...prev,
                    zhipu: { ...prev.zhipu, api_key: e.target.value }
                  }))}
                  placeholder="输入智谱 API Key"
                  helperText="获取地址: https://open.bigmodel.cn/"
                />
              </AccordionDetails>
            </Accordion>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Pollinations.ai - 免费</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  完全免费的图像生成服务，无需配置 API Key
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>OpenAI (DALL-E 3)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  label="API Key"
                  type="password"
                  value={imageConfig.openai.api_key}
                  onChange={(e) => setImageConfig(prev => ({
                    ...prev,
                    openai: { ...prev.openai, api_key: e.target.value }
                  }))}
                  placeholder="输入 OpenAI API Key"
                  helperText="获取地址: https://platform.openai.com/"
                />
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>阿里云通义万相</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  label="API Key"
                  type="password"
                  value={imageConfig.aliyun_wanxiang.api_key}
                  onChange={(e) => setImageConfig(prev => ({
                    ...prev,
                    aliyun_wanxiang: { ...prev.aliyun_wanxiang, api_key: e.target.value }
                  }))}
                  placeholder="输入阿里云 DashScope API Key"
                  helperText="获取地址: https://dashscope.aliyun.com/"
                />
              </AccordionDetails>
            </Accordion>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>可灵 (Kling)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  label="API Key"
                  type="password"
                  value={videoConfig.kling.api_key}
                  onChange={(e) => setVideoConfig(prev => ({
                    ...prev,
                    kling: { ...prev.kling, api_key: e.target.value }
                  }))}
                  placeholder="输入可灵 API Key"
                  helperText="获取地址: https://klingai.com/"
                />
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Runway</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  label="API Key"
                  type="password"
                  value={videoConfig.runway.api_key}
                  onChange={(e) => setVideoConfig(prev => ({
                    ...prev,
                    runway: { ...prev.runway, api_key: e.target.value }
                  }))}
                  placeholder="输入 Runway API Key"
                  helperText="获取地址: https://runwayml.com/"
                />
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Luma Dream Machine</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  label="API Key"
                  type="password"
                  value={videoConfig.luma.api_key}
                  onChange={(e) => setVideoConfig(prev => ({
                    ...prev,
                    luma: { ...prev.luma, api_key: e.target.value }
                  }))}
                  placeholder="输入 Luma API Key"
                  helperText="获取地址: https://lumalabs.ai/"
                />
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button variant="contained" onClick={handleSave}>保存配置</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ApiConfig;
