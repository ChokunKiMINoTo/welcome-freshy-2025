'use client';
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  Stack,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Info as InfoIcon,
  Star as StarIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { loadScoreboardData, ScoreboardItem } from '../utils/csvLoader';
import { useRefresh } from '../contexts/RefreshContext';

const Scoreboard: React.FC = () => {
  const [teams, setTeams] = useState<ScoreboardItem[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<ScoreboardItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { refreshTrigger } = useRefresh();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await loadScoreboardData();
        // Sort by rank to ensure proper ordering
        const sortedData = data.sort((a, b) => a.rank - b.rank);
        setTeams(sortedData);
      } catch (error) {
        console.error('Failed to load scoreboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [refreshTrigger]);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#ffd700'; // Gold
      case 2: return '#c0c0c0'; // Silver
      case 3: return '#cd7f32'; // Bronze
      default: return '#e3f2fd'; // Light blue
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <TrophyIcon sx={{ color: getRankColor(rank) }} />;
    }
    return null;
  };

  const getScorePercentage = (score: number, maxScore: number = 100) => {
    return Math.min((score / maxScore) * 100, 100);
  };

  const handleTeamClick = (team: ScoreboardItem) => {
    setSelectedTeam(team);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          🏆 Live Scoreboard
        </Typography>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography>Loading scoreboard...</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const topThreeTeams = teams.slice(0, 3);
  const allTeams = teams;

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        🏆 Live Scoreboard
      </Typography>

      {/* Top 3 Podium */}
      <Card sx={{ mb: 3, border: '2px solid', borderColor: 'primary.main', backgroundColor: 'background.paper' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600, color: 'primary.main', textAlign: 'center' }}>
            🎖️ Championship Podium
          </Typography>
          
          <Grid container spacing={2} justifyContent="center">
            {/* 2nd Place */}
            {topThreeTeams[1] && (
              <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Card
                  sx={{
                    width: '100%',
                    maxWidth: 200,
                    backgroundColor: '#c0c0c0',
                    cursor: 'pointer',
                    '&:hover': { transform: 'scale(1.05)' },
                    transition: 'transform 0.2s',
                  }}
                  onClick={() => handleTeamClick(topThreeTeams[1])}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: 'white', mb: 1 }}>
                      🥈
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {topThreeTeams[1].teamName}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2' }}>
                      {topThreeTeams[1].totalScore}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      2nd Place
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* 1st Place */}
            {topThreeTeams[0] && (
              <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Card
                  sx={{
                    width: '100%',
                    maxWidth: 200,
                    backgroundColor: '#ffd700',
                    cursor: 'pointer',
                    '&:hover': { transform: 'scale(1.05)' },
                    transition: 'transform 0.2s',
                    mt: { xs: 0, sm: -2 }, // Elevated on larger screens
                  }}
                  onClick={() => handleTeamClick(topThreeTeams[0])}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ color: 'white', mb: 1 }}>
                      👑
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {topThreeTeams[0].teamName}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
                      {topThreeTeams[0].totalScore}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Champion
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* 3rd Place */}
            {topThreeTeams[2] && (
              <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Card
                  sx={{
                    width: '100%',
                    maxWidth: 200,
                    backgroundColor: '#cd7f32',
                    cursor: 'pointer',
                    '&:hover': { transform: 'scale(1.05)' },
                    transition: 'transform 0.2s',
                  }}
                  onClick={() => handleTeamClick(topThreeTeams[2])}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: 'white', mb: 1 }}>
                      🥉
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {topThreeTeams[2].teamName}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2' }}>
                      {topThreeTeams[2].totalScore}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      3rd Place
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Detailed Scoreboard Table */}
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              📊 Complete Rankings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last updated: {allTeams[0]?.lastUpdated || 'N/A'}
            </Typography>
          </Stack>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Rank</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Team</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Total</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Game I</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Game II</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Game III</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Game VI</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allTeams.map((team) => (
                  <TableRow
                    key={team.id}
                    sx={{
                      backgroundColor: team.rank <= 3 ? `${getRankColor(team.rank)}20` : 'inherit',
                      '&:hover': { backgroundColor: 'action.hover' },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {getRankIcon(team.rank)}
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          #{team.rank}
                        </Typography>
                      </Stack>
                    </TableCell>
                    
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ backgroundColor: 'primary.main', width: 32, height: 32 }}>
                          {team.teamName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {team.teamName}
                          </Typography>
                          {team.achievements && (
                            <Stack direction="row" spacing={0.5}>
                              {team.achievements.split(',').slice(0, 2).map((achievement, index) => (
                                <Chip
                                  key={index}
                                  label={achievement.trim()}
                                  size="small"
                                  icon={<StarIcon />}
                                  sx={{ fontSize: '0.65rem', height: 20 }}
                                />
                              ))}
                            </Stack>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {team.totalScore}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {team.gameI}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={getScorePercentage(team.gameI)}
                          sx={{ width: 60, mt: 0.5 }}
                        />
                      </Box>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {team.gameII}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={getScorePercentage(team.gameII)}
                          sx={{ width: 60, mt: 0.5 }}
                          color="secondary"
                        />
                      </Box>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {team.gameIII}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={getScorePercentage(team.gameIII)}
                          sx={{ width: 60, mt: 0.5 }}
                          color="success"
                        />
                      </Box>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {team.gameVI}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={getScorePercentage(team.gameVI)}
                          sx={{ width: 60, mt: 0.5 }}
                          color="error"
                        />
                      </Box>
                    </TableCell>
                    
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleTeamClick(team)}
                        color="primary"
                      >
                        <InfoIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Team Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedTeam && (
          <>
            <DialogTitle>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ backgroundColor: 'primary.main', width: 56, height: 56 }}>
                  {selectedTeam.teamName.charAt(0)}
                </Avatar>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {getRankIcon(selectedTeam.rank)}
                    <Typography variant="h6">
                      {selectedTeam.teamName}
                    </Typography>
                    <Chip
                      label={`Rank #${selectedTeam.rank}`}
                      color={selectedTeam.rank <= 3 ? 'primary' : 'default'}
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Total Score: {selectedTeam.totalScore} points
                  </Typography>
                </Box>
                
                <IconButton onClick={() => setDialogOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Score Breakdown
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="body2">Game I</Typography>
                        <Typography variant="h6" color="primary">
                          {selectedTeam.gameI}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={getScorePercentage(selectedTeam.gameI)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="body2">Game II</Typography>
                        <Typography variant="h6" color="secondary">
                          {selectedTeam.gameII}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={getScorePercentage(selectedTeam.gameII)}
                        sx={{ height: 8, borderRadius: 4 }}
                        color="secondary"
                      />
                    </Box>
                    
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="body2">Game III</Typography>
                        <Typography variant="h6" sx={{ color: '#4caf50' }}>
                          {selectedTeam.gameIII}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={getScorePercentage(selectedTeam.gameIII)}
                        sx={{ height: 8, borderRadius: 4 }}
                        color="success"
                      />
                    </Box>
                    
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="body2">Game VI</Typography>
                        <Typography variant="h6" sx={{ color: '#f44336' }}>
                          {selectedTeam.gameVI}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={getScorePercentage(selectedTeam.gameVI)}
                        sx={{ height: 8, borderRadius: 4 }}
                        color="error"
                      />
                    </Box>
                  </Stack>
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Team Information
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Current Rank</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {getRankIcon(selectedTeam.rank)}
                        <Typography variant="h6">#{selectedTeam.rank}</Typography>
                      </Stack>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                      <Typography variant="body1">{selectedTeam.lastUpdated}</Typography>
                    </Box>
                    
                    {selectedTeam.achievements && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Achievements
                        </Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {selectedTeam.achievements.split(',').map((achievement, index) => (
                            <Chip
                              key={index}
                              label={achievement.trim()}
                              size="small"
                              icon={<StarIcon />}
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Scoreboard; 