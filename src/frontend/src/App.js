import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Stepper,
  Step,
  StepLabel,
  Box,
  Paper,
  Button,
  Fade,
  Slide
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import MovieIcon from '@mui/icons-material/Movie';
import ScriptInput from './components/ScriptInput';
import ScriptAnalysis from './components/ScriptAnalysis';
import CharacterDesign from './components/CharacterDesign';
import StoryboardEditor from './components/StoryboardEditor';
import VideoPreview from './components/VideoPreview';
import ApiConfig from './components/ApiConfig';

const steps = ['剧本输入', '剧本分析', '人物/场景设计', '分镜编辑', '视频预览导出'];

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [scriptData, setScriptData] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [segments, setSegments] = useState([]);
  const [storyboards, setStoryboards] = useState([]);
  const [videos, setVideos] = useState([]);
  const [configOpen, setConfigOpen] = useState(false);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleScriptAnalyzed = (data) => {
    setScriptData(data);
    setCharacters(data.characters || []);
    setScenes(data.scenes || []);
    setSegments(data.segments || []);
    handleNext();
  };

  const handleCharacterDesignComplete = (designs) => {
    handleNext();
  };

  const handleStoryboardComplete = (boards) => {
    setStoryboards(boards);
    handleNext();
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Slide direction="right" in={true} timeout={500}>
            <Box>
              <ScriptInput onScriptAnalyzed={handleScriptAnalyzed} />
            </Box>
          </Slide>
        );
      case 1:
        return (
          <Fade in={true} timeout={500}>
            <Box>
              <ScriptAnalysis 
                scriptData={scriptData}
                characters={characters}
                scenes={scenes}
                segments={segments}
                onNext={handleNext}
                onBack={handleBack}
              />
            </Box>
          </Fade>
        );
      case 2:
        return (
          <Fade in={true} timeout={500}>
            <Box>
              <CharacterDesign
                characters={characters}
                scenes={scenes}
                onComplete={handleCharacterDesignComplete}
                onBack={handleBack}
              />
            </Box>
          </Fade>
        );
      case 3:
        return (
          <Fade in={true} timeout={500}>
            <Box>
              <StoryboardEditor
                segments={segments}
                characters={characters}
                scenes={scenes}
                onComplete={handleStoryboardComplete}
                onBack={handleBack}
              />
            </Box>
          </Fade>
        );
      case 4:
        return (
          <Fade in={true} timeout={500}>
            <Box>
              <VideoPreview
                storyboards={storyboards}
                videos={videos}
                setVideos={setVideos}
                onBack={handleBack}
              />
            </Box>
          </Fade>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ 
      flexGrow: 1, 
      minHeight: '100vh',
      background: 'transparent'
    }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <MovieIcon sx={{ mr: 2, color: '#00d4ff', fontSize: 32 }} />
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #00d4ff 0%, #ff6b9d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            剧本转视频系统
          </Typography>
          <Button 
            color="inherit" 
            onClick={() => setConfigOpen(true)}
            startIcon={<SettingsIcon />}
            sx={{
              borderRadius: '12px',
              px: 3,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.15)',
              }
            }}
          >
            API 配置
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ 
          p: 3, 
          mb: 3,
          background: 'rgba(255, 255, 255, 0.05)',
        }}>
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel
            sx={{
              '& .MuiStepLabel-label': {
                color: 'rgba(255, 255, 255, 0.5)',
                '&.Mui-active': {
                  color: '#00d4ff',
                  fontWeight: 600,
                },
                '&.Mui-completed': {
                  color: 'rgba(255, 255, 255, 0.7)',
                }
              },
              '& .MuiStepIcon-root': {
                color: 'rgba(255, 255, 255, 0.2)',
                '&.Mui-active': {
                  color: '#00d4ff',
                },
                '&.Mui-completed': {
                  color: '#00d4ff',
                }
              }
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        <Paper sx={{ 
          p: 4,
          minHeight: '60vh',
          background: 'rgba(255, 255, 255, 0.03)',
        }}>
          {renderStepContent(activeStep)}
        </Paper>
      </Container>

      <ApiConfig open={configOpen} onClose={() => setConfigOpen(false)} />
    </Box>
  );
}

export default App;
