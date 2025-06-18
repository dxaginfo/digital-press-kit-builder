import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';

// API and hooks
import { getPressKit, createPressKit, updatePressKit } from '../../services/pressKitService';
import { useAuth } from '../../contexts/AuthContext';

// Components for each section
import BasicInfoForm from '../../components/pressKit/BasicInfoForm';
import MediaUploader from '../../components/pressKit/MediaUploader';
import SocialLinksForm from '../../components/pressKit/SocialLinksForm';
import EventsForm from '../../components/pressKit/EventsForm';
import ContactsForm from '../../components/pressKit/ContactsForm';

const steps = ['Basic Information', 'Media', 'Social Links', 'Events', 'Contacts'];

export default function PressKitEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isEditing = !!id;

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    theme: 'default',
    isPublic: false,
    media: [],
    socialLinks: [],
    events: [],
    contacts: []
  });

  useEffect(() => {
    if (isEditing) {
      fetchPressKit();
    }
  }, [id]);

  const fetchPressKit = async () => {
    try {
      setLoading(true);
      const data = await getPressKit(id);
      setFormData(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load press kit data');
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      if (isEditing) {
        await updatePressKit(id, formData);
      } else {
        const newPressKit = await createPressKit(formData);
        // Redirect to edit page with the new ID
        navigate(`/press-kits/edit/${newPressKit.id}`);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setLoading(false);
    } catch (err) {
      setError('Failed to save press kit');
      setLoading(false);
    }
  };

  const handleFormChange = (sectionData, section) => {
    setFormData(prev => ({
      ...prev,
      [section]: sectionData
    }));
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <BasicInfoForm 
            data={formData} 
            onChange={(data) => setFormData({...formData, ...data})} 
          />
        );
      case 1:
        return (
          <MediaUploader 
            media={formData.media} 
            onChange={(media) => handleFormChange(media, 'media')} 
          />
        );
      case 2:
        return (
          <SocialLinksForm 
            links={formData.socialLinks} 
            onChange={(links) => handleFormChange(links, 'socialLinks')} 
          />
        );
      case 3:
        return (
          <EventsForm 
            events={formData.events} 
            onChange={(events) => handleFormChange(events, 'events')} 
          />
        );
      case 4:
        return (
          <ContactsForm 
            contacts={formData.contacts} 
            onChange={(contacts) => handleFormChange(contacts, 'contacts')} 
          />
        );
      default:
        return 'Unknown step';
    }
  };

  if (loading && isEditing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isEditing ? 'Edit Press Kit' : 'Create New Press Kit'}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>Press kit saved successfully!</Alert>}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 2, mb: 4 }}>
          {getStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              sx={{ mr: 1 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save'}
            </Button>
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? () => navigate(`/press-kits/preview/${id || 'new'}`) : handleNext}
              disabled={loading}
            >
              {activeStep === steps.length - 1 ? 'Preview' : 'Next'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}