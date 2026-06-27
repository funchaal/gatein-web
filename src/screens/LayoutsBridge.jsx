import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import AppointmentLayouts from './AppointmentLayouts/AppointmentLayouts';
import TripLayouts from './TripLayouts/TripLayouts';

export default function LayoutsBridge() {
  const { isTerminal } = usePermissions();

  if (isTerminal) {
    return <AppointmentLayouts />;
  }

  return <TripLayouts />;
}
