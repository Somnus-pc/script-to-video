import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import axios from 'axios';

function CharacterDesign({ characters, scenes, onComplete, onBack }) {
  const [activeTab, setActiveTab] = useState(0);
  const [characterDesigns, setCharacterDesigns] = useState({});
  const [sceneDesigns, setSceneDesigns] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState('pollinations');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState('');
  const [currentItem, setCurrentItem] = useState(null);

  const handleGenerateCharacterViews = async (character) => {
    setLoading(true);
    setError(null);
    setCurrentItem(character);

    try {
      // 先生成提示词
      const promptResponse = await axios.post('/api/generate-character-prompt', character);
      const prompt = promptResponse.data.prompt;

      // 生成三视图
      const viewsResponse = await axios.post('/api/generate-character-views', {
        prompt: prompt,
        model: selectedModel
      });

      setCharacterDesigns(prev => ({
        ...prev,
        [character.name]: {
          prompt: prompt,
          views: viewsResponse.data.views
        }
      }));
    } catch (err) {
      setError('生成失败: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateScene = async (scene) => {
    setLoading(true);
    setError(null);
    setCurrentItem(scene);

    try {
      // 先生成提示词
      const promptResponse = await axios.post('/api/generate-scene-prompt', scene);
      const prompt = promptResponse.data.prompt;

      // 生成场景图
      const imageResponse = await axios.post('/api/generate-image', {
        prompt: prompt,
        model: selectedModel
      });

      setSceneDesigns(prev => ({
        ...prev,
        [scene.name]: {
          prompt: prompt,
          image: imageResponse.data.image_path
        }
      }));
    } catch (err) {
      setError('生成失败: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const showPrompt = (content) => {
    setDialogContent(content);
    setDialogOpen(true);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        人物/场景设计
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>选择生图模型</InputLabel>
          <Select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            label="选择生图模型"
          >
            <MenuItem value="pollinations">Pollinations.ai (免费)</MenuItem>
            <MenuItem value="openai">DALL-E 3 (付费)</MenuItem>
            <MenuItem value="aliyun_wanxiang">通义万相 (付费)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
        <Tab label={`人物设计 (${characters.length})`} />
        <Tab label={`场景设计 (${scenes.length})`} />
      </Tabs>

      {activeTab === 0 ? (
        <Grid container spacing={3}>
          {characters.map((character, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{character.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {character.description}
                  </Typography>
                  
                  {characterDesigns[character.name] ? (
                    <Box sx={{ mt: 2 }}>
                      <Grid container spacing={1}>
                        {Object.entries(characterDesigns[character.name].views).map(([view, path]) => (
                          <Grid item xs={4} key={view}>
                            <CardMedia
                              component="img"
                              height="100"
                              image={`/api/images/${path.split('/').pop()}`}
                              alt={view}
                              sx={{ objectFit: 'cover' }}
                            />
                            <Typography variant="caption" align="center" display="block">
                              {view === 'front' ? '正面' : view === 'side' ? '侧面' : '背面'}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                      <Button
                        size="small"
                        onClick={() => showPrompt(characterDesigns[character.name].prompt)}
                        sx={{ mt: 1 }}
                      >
                        查看提示词
                      </Button>
                    </Box>
                  ) : (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleGenerateCharacterViews(character)}
                      disabled={loading}
                      sx={{ mt: 2 }}
                    >
                      {loading && currentItem === character ? (
                        <CircularProgress size={20} />
                      ) : (
                        '生成三视图'
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {scenes.map((scene, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{scene.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {scene.description}
                  </Typography>
                  
                  {sceneDesigns[scene.name] ? (
                    <Box sx={{ mt: 2 }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={`/api/images/${sceneDesigns[scene.name].image.split('/').pop()}`}
                        alt={scene.name}
                        sx={{ objectFit: 'cover' }}
                      />
                      <Button
                        size="small"
                        onClick={() => showPrompt(sceneDesigns[scene.name].prompt)}
                        sx={{ mt: 1 }}
                      >
                        查看提示词
                      </Button>
                    </Box>
                  ) : (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleGenerateScene(scene)}
                      disabled={loading}
                      sx={{ mt: 2 }}
                    >
                      {loading && currentItem === scene ? (
                        <CircularProgress size={20} />
                      ) : (
                        '生成场景图'
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant="outlined" onClick={onBack}>
          返回
        </Button>
        <Button variant="contained" onClick={onComplete}>
          下一步：分镜编辑
        </Button>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>提示词</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={dialogContent}
            variant="outlined"
            InputProps={{ readOnly: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CharacterDesign;
