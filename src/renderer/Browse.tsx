import * as React from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useDemoData } from '@mui/x-data-grid-generator';

import { ipcRenderer } from 'electron';

function watchFile(activities: any) {
  try {
    window.fs.watchFile(
      window.path.join(process.cwd(), 'data', 'activities.json'),
      (curr, prev) => {
        // If the file has changed, read the file
        if (curr.mtime !== prev.mtime) {
          // Read the file synchronously
          var data: any = window.fs.readFileSync(
            window.path.join(process.cwd(), 'data', 'activities.json')
          );
          // Log
          var activitiesJSON = JSON.parse(data);
          activitiesJSON = activitiesJSON['activities'];
          activities(activitiesJSON);
        }
      }
    );
  } catch (err) {
    watchFile(activities);
  }
}

export default function BasicExampleDataGrid() {
  // Check if python is installed
  const [activities, setActivities] = React.useState<any>([]);
  const [rows, setRows] = React.useState<any>([]);
  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      hidden: true,
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 130,
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      width: 130,
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      width: 130,
    },
  ];

  // Wait until the renderer process is ready

  watchFile(setActivities);

  React.useEffect(() => {
    // Listen for the response from the main process
    var parsedActivities: any = [];
    console.log(activities);
    activities.forEach((activity: any, index: number) => {
      parsedActivities.push({
        id: index,
        name: activity.name,
      });
    });
    setRows(parsedActivities);
  }, [activities]);

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        columns={columns}
        rows={rows}
        components={{ Toolbar: GridToolbar }}
      />
    </div>
  );
}
