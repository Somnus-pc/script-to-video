import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Chip,
  Paper
} from '@mui/material';

function ScriptAnalysis({ scriptData, characters, scenes, segments, onNext, onBack }) {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        剧本分析结果
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          人物角色 ({characters.length}个)
        </Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <List>
            {characters.map((char, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={char.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {char.description}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip size="small" label={`性格: ${char.personality}`} sx={{ mr: 1 }} />
                          {char.age && <Chip size="small" label={`年龄: ${char.age}`} sx={{ mr: 1 }} />}
                          {char.gender && <Chip size="small" label={char.gender} />}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < characters.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          场景 ({scenes.length}个)
        </Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <List>
            {scenes.map((scene, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={scene.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {scene.description}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip size="small" label={scene.location} sx={{ mr: 1 }} />
                          <Chip size="small" label={scene.time} sx={{ mr: 1 }} />
                          <Chip size="small" label={scene.atmosphere} />
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < scenes.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          剧本分段 ({segments.length}段)
        </Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <List>
            {segments.slice(0, 5).map((segment, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={`分段 ${segment.index + 1}`}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {segment.content.substring(0, 100)}...
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {segment.characters.map((char, i) => (
                            <Chip key={i} size="small" label={char} sx={{ mr: 1 }} />
                          ))}
                          <Chip size="small" label={segment.scene} color="primary" />
                          <Chip size="small" label={segment.emotion} color="secondary" sx={{ ml: 1 }} />
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < Math.min(segments.length, 5) - 1 && <Divider />}
              </React.Fragment>
            ))}
            {segments.length > 5 && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 1 }}>
                ...还有 {segments.length - 5} 个分段
              </Typography>
            )}
          </List>
        </Paper>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant="outlined" onClick={onBack}>
          返回
        </Button>
        <Button variant="contained" onClick={onNext}>
          下一步：人物/场景设计
        </Button>
      </Box>
    </Box>
  );
}

export default ScriptAnalysis;
