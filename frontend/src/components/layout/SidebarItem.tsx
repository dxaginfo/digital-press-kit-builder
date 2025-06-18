import React from 'react';
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

export default function SidebarItem({ to, icon, label, onClick }: SidebarItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <ListItem disablePadding>
      <ListItemButton
        component={to === '#' ? 'button' : Link}
        to={to === '#' ? undefined : to}
        onClick={onClick}
        selected={isActive}
        sx={{
          borderRadius: 1,
          m: 0.5,
          '&.Mui-selected': {
            backgroundColor: 'primary.light',
            color: 'primary.contrastText',
            '& .MuiListItemIcon-root': {
              color: 'primary.contrastText',
            },
          },
        }}
      >
        <ListItemIcon sx={{ color: isActive ? 'primary.contrastText' : 'inherit' }}>
          {icon}
        </ListItemIcon>
        <ListItemText primary={label} />
      </ListItemButton>
    </ListItem>
  );
}