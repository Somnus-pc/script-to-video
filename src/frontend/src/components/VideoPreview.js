import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Alert,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DownloadIcon from '@mui/icons-material/Download';
import ReactPlayer from 'react-player';
import axios from 'axios';

function VideoPreview({ storyboards, videos, setVideos, onBack }) {
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState('kling');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewVideo, setPreviewVideo] = useState('');
  const [mergeDialog, setMergeDialog] = useState(false);
  const [merging, setMerging] = useState(false);

  const handleGenerateVideo = async (index) => {
    const storyboard = storyboards[index];
    if (!storyboard.image) {
      setError('请先生成分镜图');
      return;
    }

    setLoading(prev => ({ ...prev, [index]: true }));
    setError(null);

    try {
      const response = await axios.post('/api/generate-video', {
        image_path: storyboard.image,
        prompt: storyboard.modifiedPrompt || storyboard.prompt,
        model: selectedModel
      });

      setVideos(prev => [...prev, {
        index,
        path: response.data.video_path,
        storyboard
      }]].sort((a, b) => a.index - b.index));
    } catch (err) {
      setError('生成视频失败: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleDeleteVideo = (index) => {
    setVideos(prev => prev.filter(v => v.index !== index));
  };

  const handlePreview = (videoPath) => {
    setPreviewVideo(`/api/videos/${videoPath.split('/').pop()}`);
    setPreviewOpen(true);
  };

  const handleMergeVideos = async () => {
    if (videos.length < 2) {
      setError('至少需要两个视频才能合并');
      return;
    }

    setMerging(true);
    setError(null);

    try {
      const videoPaths = videos.map(v => v.path);
      const response = await axios.post('/api/merge-videos', {
        video_paths: videoPaths
      });

      setMergeDialog(true);
    } catch (err) {
      setError('合并视频失败: ' + (err.response?.data?.detail || err.message));
    } finally {
      setMerging(false);
    }
  };

  const handleDownload = (videoPath) => {
    const link = document.createElement('a');
    link.href = `/api/videos/${videoPath.split('/').pop()}`;
    link.download = videoPath.split('/').pop();
    link.click();
  };

  const getVideoForStoryboard = (index) => {
    return videos.find(v => v.index === index);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        视频预览与导出
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>选择视频生成模型</InputLabel>
          <Select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            label="选择视频生成模型"
          >
            <MenuItem value="kling">可灵 (Kling)</MenuItem>
            <MenuItem value="runway">Runway Gen-2/Gen-3</MenuItem>
            <MenuItem value="luma">Luma Dream Machine</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {storyboards.map((storyboard, index) => {
          const video = getVideoForStoryboard(index);
          return (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">分镜 {index + 1}</Typography>
                    {video && (
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteVideo(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>

                  {storyboard.image && (
                    <CardMedia
                      component="img"
                      height="150"
                      image={`/api/images/${storyboard.image.split('/').pop()}`}
                      alt={`分镜 ${index + 1}`}
                      sx={{ mb: 2 }}
                    />
                  )}

                  {video ? (
                    <Box>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Button
                          variant="outlined"
                          startIcon={<PlayArrowIcon />}
                          onClick={() => handlePreview(video.path)}
                        >
                          预览
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownload(video.path)}
                        >
                          下载
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleGenerateVideo(index)}
                      disabled={loading[index] || !storyboard.image}
                      startIcon={loading[index] && <CircularProgress size={20} />}
                    >
                      {loading[index] ? '生成中...' : '生成视频'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {videos.length > 0 && (
        <Card sx={{ mt: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            已生成视频 ({videos.length}个)
          </Typography>
          <List>
            {videos.map((video, i) => (
              <ListItem key={i}>
                <ListItemText
                  primary={`分镜 ${video.index + 1}`}
                  secondary={video.storyboard.content.substring(0, 50) + '...'}
                />
                <Button
                  size="small"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => handlePreview(video.path)}
                >
                  预览
                </Button>
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleMergeVideos}
              disabled={merging || videos.length < 2}
              startIcon={merging && <CircularProgress size={20} />}
            >
              {merging ? '合并中...' : '一键合并所有视频'}
            </Button>
          </Box>
        </Card>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant="outlined" onClick={onBack}>
          返回
        </Button>
      </Box>

      {/* 视频预览对话框 */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>视频预览</DialogTitle>
        <DialogContent>
          <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
            <ReactPlayer
              url={previewVideo}
              controls
              playing
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>

      {/* 合并成功对话框 */}
      <Dialog open={mergeDialog} onClose={() => setMergeDialog(false)}>
        <DialogTitle>合并完成</DialogTitle>
        <DialogContent>
          <Typography>
            视频已成功合并！您可以在输出目录中找到合并后的视频文件。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMergeDialog(false)}>确定</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default VideoPreview;
