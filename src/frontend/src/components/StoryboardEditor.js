import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import axios from 'axios';

function StoryboardEditor({ segments, characters, scenes, onComplete, onBack }) {
  const [storyboards, setStoryboards] = useState(
    segments.map(seg => ({
      ...seg,
      prompt: '',
      image: null,
      modifiedPrompt: ''
    }))
  );
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);
  const [editDialog, setEditDialog] = useState({ open: false, index: -1, prompt: '' });
  const [modifyDialog, setModifyDialog] = useState({ open: false, index: -1, modification: '' });

  const handleGeneratePrompt = async (index) => {
    const segment = segments[index];
    setLoading(prev => ({ ...prev, [index]: 'prompt' }));
    setError(null);

    try {
      const response = await axios.post('/api/generate-storyboard-prompt', {
        segment_content: segment.content,
        characters: characters.filter(c => segment.characters.includes(c.name)),
        scene: scenes.find(s => s.name === segment.scene) || {},
        emotion: segment.emotion
      });

      setStoryboards(prev => prev.map((sb, i) => 
        i === index ? { ...sb, prompt: response.data.prompt } : sb
      ));
    } catch (err) {
      setError('生成提示词失败: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(prev => ({ ...prev, [index]: null }));
    }
  };

  const handleModifyPrompt = async () => {
    const { index, modification } = modifyDialog;
    const storyboard = storyboards[index];
    
    if (!storyboard.prompt) {
      setError('请先生成分镜提示词');
      return;
    }

    setLoading(prev => ({ ...prev, [index]: 'modifying' }));
    setError(null);

    try {
      const response = await axios.post('/api/modify-storyboard-prompt', {
        original_prompt: storyboard.prompt,
        modification: modification
      });

      setStoryboards(prev => prev.map((sb, i) => 
        i === index ? { ...sb, modifiedPrompt: response.data.prompt } : sb
      ));
      setModifyDialog({ open: false, index: -1, modification: '' });
    } catch (err) {
      setError('修改提示词失败: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(prev => ({ ...prev, [index]: null }));
    }
  };

  const handleGenerateImage = async (index) => {
    const storyboard = storyboards[index];
    const promptToUse = storyboard.modifiedPrompt || storyboard.prompt;
    
    if (!promptToUse) {
      setError('请先生成分镜提示词');
      return;
    }

    setLoading(prev => ({ ...prev, [index]: 'image' }));
    setError(null);

    try {
      const response = await axios.post('/api/generate-image', {
        prompt: promptToUse,
        model: 'pollinations'
      });

      setStoryboards(prev => prev.map((sb, i) => 
        i === index ? { ...sb, image: response.data.image_path } : sb
      ));
    } catch (err) {
      setError('生成分镜图失败: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(prev => ({ ...prev, [index]: null }));
    }
  };

  const openEditDialog = (index) => {
    setEditDialog({
      open: true,
      index,
      prompt: storyboards[index].prompt
    });
  };

  const openModifyDialog = (index) => {
    setModifyDialog({
      open: true,
      index,
      modification: ''
    });
  };

  const handleSaveEdit = () => {
    const { index, prompt } = editDialog;
    setStoryboards(prev => prev.map((sb, i) => 
      i === index ? { ...sb, prompt } : sb
    ));
    setEditDialog({ open: false, index: -1, prompt: '' });
  };

  const getLoadingStatus = (index) => loading[index];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        分镜编辑器
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {storyboards.map((storyboard, index) => (
        <Accordion key={index} defaultExpanded={index < 3}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                分镜 {index + 1}
              </Typography>
              <Chip 
                label={storyboard.scene} 
                size="small" 
                color="primary" 
                sx={{ mr: 1 }}
              />
              {storyboard.prompt && (
                <Chip 
                  icon={<ImageIcon />} 
                  label="已生成" 
                  size="small" 
                  color="success" 
                  sx={{ mr: 1 }}
                />
              )}
              {storyboard.image && (
                <Chip 
                  label="有图" 
                  size="small" 
                  color="info" 
                />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      剧本内容
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {storyboard.content}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {storyboard.characters.map((char, i) => (
                        <Chip key={i} label={char} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </Box>
                  </CardContent>
                </Card>

                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {!storyboard.prompt ? (
                    <Button
                      variant="contained"
                      onClick={() => handleGeneratePrompt(index)}
                      disabled={loading[index] === 'prompt'}
                      startIcon={loading[index] === 'prompt' && <CircularProgress size={20} />}
                    >
                      生成分镜提示词
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => openEditDialog(index)}
                      >
                        编辑
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => openModifyDialog(index)}
                      >
                        AI 修改
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<ImageIcon />}
                        onClick={() => handleGenerateImage(index)}
                        disabled={loading[index] === 'image'}
                      >
                        {loading[index] === 'image' ? (
                          <CircularProgress size={20} />
                        ) : storyboard.image ? (
                          '重新生成'
                        ) : (
                          '生成分镜图'
                        )}
                      </Button>
                    </>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                {storyboard.image ? (
                  <CardMedia
                    component="img"
                    image={`/api/images/${storyboard.image.split('/').pop()}`}
                    alt={`分镜 ${index + 1}`}
                    sx={{ borderRadius: 1 }}
                  />
                ) : (
                  <Card variant="outlined" sx={{ 
                    height: 200, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5'
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      点击"生成分镜图"生成
                    </Typography>
                  </Card>
                )}
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant="outlined" onClick={onBack}>
          返回
        </Button>
        <Button 
          variant="contained" 
          onClick={() => onComplete(storyboards)}
          disabled={storyboards.every(sb => !sb.image)}
        >
          下一步：视频预览
        </Button>
      </Box>

      {/* 编辑提示词对话框 */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, index: -1, prompt: '' })} maxWidth="md" fullWidth>
        <DialogTitle>编辑分镜提示词</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={editDialog.prompt}
            onChange={(e) => setEditDialog(prev => ({ ...prev, prompt: e.target.value }))}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, index: -1, prompt: '' })}>取消</Button>
          <Button variant="contained" onClick={handleSaveEdit}>保存</Button>
        </DialogActions>
      </Dialog>

      {/* AI 修改对话框 */}
      <Dialog open={modifyDialog.open} onClose={() => setModifyDialog({ open: false, index: -1, modification: '' })} maxWidth="md" fullWidth>
        <DialogTitle>AI 修改分镜提示词</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            请描述您希望如何修改提示词，例如："让镜头更远一些"、"增加更多动作"、"改成夜景"等
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={modifyDialog.modification}
            onChange={(e) => setModifyDialog(prev => ({ ...prev, modification: e.target.value }))}
            variant="outlined"
            placeholder="输入修改要求..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModifyDialog({ open: false, index: -1, modification: '' })}>取消</Button>
          <Button 
            variant="contained" 
            onClick={handleModifyPrompt}
            disabled={!modifyDialog.modification.trim() || loading[index] === 'modifying'}
          >
            {loading[modifyDialog.index] === 'modifying' ? <CircularProgress size={20} /> : '提交修改'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default StoryboardEditor;
