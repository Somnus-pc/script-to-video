import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Fade,
  Chip
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import axios from 'axios';

function ScriptInput({ onScriptAnalyzed }) {
  const [scriptText, setScriptText] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setScriptText(response.data.content);
      setUploadedFile(response.data.filename);
      setActiveTab(0);
    } catch (err) {
      setError('文件上传失败: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  const handleAnalyze = async () => {
    if (!scriptText.trim()) {
      setError('请输入或上传剧本内容');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/analyze-script', {
        script_text: scriptText
      });

      onScriptAnalyzed(response.data);
    } catch (err) {
      setError('剧本分析失败: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography 
        variant="h4" 
        gutterBottom
        sx={{
          fontWeight: 700,
          background: 'linear-gradient(135deg, #00d4ff 0%, #ff6b9d 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 3
        }}
      >
        剧本输入
      </Typography>

      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
        输入您的剧本内容，AI 将自动分析人物、场景并生成分镜
      </Typography>

      {error && (
        <Fade in={true}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              background: 'rgba(211, 47, 47, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(211, 47, 47, 0.3)',
              color: '#ffcdd2'
            }}
          >
            {error}
          </Alert>
        </Fade>
      )}

      <Paper
        sx={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          mb: 3
        }}
      >
        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)}
          sx={{
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            '& .MuiTabs-flexContainer': {
              px: 2,
              pt: 1
            }
          }}
        >
          <Tab 
            label="文本输入" 
            sx={{ 
              textTransform: 'none',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.6)',
              '&.Mui-selected': {
                color: '#00d4ff',
              }
            }}
          />
          <Tab 
            label="文件上传"
            sx={{ 
              textTransform: 'none',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.6)',
              '&.Mui-selected': {
                color: '#00d4ff',
              }
            }}
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 ? (
            <TextField
              fullWidth
              multiline
              rows={12}
              variant="outlined"
              placeholder="在此输入剧本内容...&#10;&#10;例如：&#10;《雨夜相遇》&#10;&#10;场景：城市街道 - 夜晚 - 雨夜&#10;&#10;林小雨独自撑着伞走在雨夜街头..."
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(0, 0, 0, 0.2)',
                  fontFamily: '"Inter", monospace',
                  fontSize: '15px',
                  lineHeight: 1.8,
                }
              }}
            />
          ) : (
            <Paper
              {...getRootProps()}
              sx={{
                p: 6,
                textAlign: 'center',
                cursor: 'pointer',
                background: isDragActive 
                  ? 'rgba(0, 212, 255, 0.1)' 
                  : 'rgba(255, 255, 255, 0.03)',
                border: isDragActive 
                  ? '2px dashed #00d4ff' 
                  : '2px dashed rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(0, 212, 255, 0.05)',
                  border: '2px dashed rgba(0, 212, 255, 0.5)',
                }
              }}
            >
              <input {...getInputProps()} />
              <CloudUploadIcon 
                sx={{ 
                  fontSize: 64, 
                  color: isDragActive ? '#00d4ff' : 'rgba(255,255,255,0.5)',
                  mb: 2
                }} 
              />
              {uploadedFile ? (
                <Box>
                  <Typography variant="h6" sx={{ color: '#00d4ff', mb: 1 }}>
                    已上传
                  </Typography>
                  <Chip 
                    label={uploadedFile} 
                    sx={{ 
                      background: 'rgba(0, 212, 255, 0.2)',
                      color: '#00d4ff',
                      border: '1px solid rgba(0, 212, 255, 0.3)'
                    }}
                  />
                </Box>
              ) : (
                <>
                  <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                    {isDragActive ? '释放文件以上传' : '拖放文件到这里'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    支持 .txt 或 .docx 格式
                  </Typography>
                </>
              )}
            </Paper>
          )}
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleAnalyze}
          disabled={loading || !scriptText.trim()}
          startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <AutoFixHighIcon />}
          sx={{
            px: 6,
            py: 1.5,
            fontSize: '16px',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #00d4ff 0%, #0095b3 100%)',
            boxShadow: '0 4px 20px rgba(0, 212, 255, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #00e5ff 0%, #00a8c9 100%)',
              boxShadow: '0 6px 30px rgba(0, 212, 255, 0.5)',
              transform: 'translateY(-2px)',
            },
            '&:disabled': {
              background: 'rgba(255, 255, 255, 0.1)',
              boxShadow: 'none',
            }
          }}
        >
          {loading ? 'AI 分析中...' : '开始分析'}
        </Button>
      </Box>
    </Box>
  );
}

export default ScriptInput;
