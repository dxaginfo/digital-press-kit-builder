import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ContentCopy as DuplicateIcon,
  Search as SearchIcon
} from '@mui/icons-material';

// API service
import { getPressKits, deletePressKit, duplicatePressKit } from '../../services/pressKitService';

export default function PressKitList() {
  const [pressKits, setPressKits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedPressKit, setSelectedPressKit] = useState(null);
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchPressKits();
  }, []);

  const fetchPressKits = async () => {
    try {
      setLoading(true);
      const data = await getPressKits();
      setPressKits(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load press kits');
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, pressKit) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedPressKit(pressKit);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPressKit) return;
    
    try {
      await deletePressKit(selectedPressKit.id);
      fetchPressKits(); // Refresh the list
      setDeleteDialogOpen(false);
    } catch (err) {
      setError('Failed to delete press kit');
    }
  };

  const handleDuplicate = async () => {
    if (!selectedPressKit) return;
    
    try {
      await duplicatePressKit(selectedPressKit.id);
      fetchPressKits(); // Refresh the list
      handleMenuClose();
    } catch (err) {
      setError('Failed to duplicate press kit');
    }
  };

  const filteredPressKits = pressKits.filter(kit => 
    kit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kit.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Press Kits</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/press-kits/new"
        >
          Create New
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search press kits..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : filteredPressKits.length === 0 ? (
        <Typography sx={{ textAlign: 'center', mt: 4 }}>
          {searchTerm ? 'No press kits match your search.' : 'No press kits yet. Create your first one!'}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredPressKits.map((pressKit) => (
            <Grid item xs={12} sm={6} md={4} key={pressKit.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={pressKit.coverImage || 'https://via.placeholder.com/300x140?text=Press+Kit'}
                  alt={pressKit.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="div" gutterBottom>
                      {pressKit.title}
                    </Typography>
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, pressKit)}>
                      <MoreIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {pressKit.description.length > 100
                      ? `${pressKit.description.substring(0, 100)}...`
                      : pressKit.description}
                  </Typography>
                  <Chip
                    size="small"
                    label={pressKit.isPublic ? 'Public' : 'Private'}
                    color={pressKit.isPublic ? 'success' : 'default'}
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    size="small"
                    label={`Theme: ${pressKit.theme}`}
                    variant="outlined"
                  />
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    component={RouterLink}
                    to={`/press-kits/edit/${pressKit.id}`}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    startIcon={<ViewIcon />}
                    component={RouterLink}
                    to={`/press-kits/preview/${pressKit.id}`}
                  >
                    Preview
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          component={RouterLink}
          to={`/press-kits/edit/${selectedPressKit?.id}`}
          onClick={handleMenuClose}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem
          component={RouterLink}
          to={`/press-kits/preview/${selectedPressKit?.id}`}
          onClick={handleMenuClose}
        >
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          Preview
        </MenuItem>
        <MenuItem onClick={handleDuplicate}>
          <DuplicateIcon fontSize="small" sx={{ mr: 1 }} />
          Duplicate
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Press Kit</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{selectedPressKit?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}