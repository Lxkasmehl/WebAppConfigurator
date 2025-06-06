import {
  Card,
  Typography,
  Stack,
  Button,
  Box,
  Dropdown,
  MenuButton,
  Menu,
  MenuItem,
  Input,
  Autocomplete,
} from '@mui/joy';
import { COMPONENT_CONFIGS } from '../common/constants';
import DraggableComponent from '../dragAndDrop/DraggableComponent';
import { useDispatch, useSelector } from 'react-redux';
import {
  setIsInCreateGroupMode,
  saveSelectedComponents,
  setWorkingSelectedComponents,
  setGroupToEdit,
  checkAndDeleteEmptyGroups,
} from '@/redux/uiBuilderSlice';
import { useState } from 'react';

export default function ComponentLibrary() {
  const dispatch = useDispatch();
  const isInCreateGroupMode = useSelector(
    (state) => state.uiBuilder.isInCreateGroupMode,
  );
  const componentGroups = useSelector(
    (state) => state.uiBuilder.componentGroups,
  );
  const workingSelectedComponents = useSelector(
    (state) => state.uiBuilder.workingSelectedComponents,
  );
  const groupToEdit = useSelector((state) => state.uiBuilder.groupToEdit);
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState('');
  const [showGroupSelector, setShowGroupSelector] = useState(false);

  const handleSaveNewGroup = () => {
    if (!groupName.trim()) return;

    if (componentGroups[groupName.trim()]) {
      setError('A group with this name already exists');
      return;
    }

    if (workingSelectedComponents.length === 0) {
      setError('Please select at least one component for the group');
      return;
    }

    setError('');
    dispatch(saveSelectedComponents({ groupName: groupName.trim() }));
    dispatch(setIsInCreateGroupMode(false));
    dispatch(setWorkingSelectedComponents([]));
    setGroupName('');
    dispatch(checkAndDeleteEmptyGroups());
  };

  const handleCancelCreateGroup = () => {
    dispatch(setIsInCreateGroupMode(false));
    dispatch(setWorkingSelectedComponents([]));
    setGroupName('');
    setError('');
    setShowGroupSelector(false);
    dispatch(checkAndDeleteEmptyGroups());
  };

  const handleSaveEditedGroup = () => {
    dispatch(saveSelectedComponents({ groupName: groupToEdit }));
    dispatch(setWorkingSelectedComponents([]));
    dispatch(setGroupToEdit(null));
    setShowGroupSelector(false);
    dispatch(checkAndDeleteEmptyGroups());
  };

  return (
    <Card
      sx={{
        width: 300,
        height: '100%',
        overflowY: 'auto',
        p: 2,
      }}
    >
      <Typography level='h4' mb={2}>
        Components
      </Typography>
      <Stack spacing={2}>
        {Object.entries(COMPONENT_CONFIGS).map(([type, config], index) => (
          <DraggableComponent
            key={type}
            type={type}
            config={config}
            index={index}
          />
        ))}
      </Stack>
      <Box sx={{ flexGrow: 1 }} />
      {isInCreateGroupMode ? (
        <Box sx={{ zIndex: '20 !important' }}>
          <Input
            required
            placeholder='Group Name'
            value={groupName}
            onChange={(e) => {
              setGroupName(e.target.value);
              setError('');
            }}
            error={!!error}
            sx={{ zIndex: '20 !important', mb: 1 }}
            data-testid='group-name-input'
          />
          {error && (
            <Typography color='danger' level='body-sm' sx={{ mb: 1 }}>
              {error}
            </Typography>
          )}
          <div className='flex flex-row gap-1'>
            <Button
              color='danger'
              onClick={handleCancelCreateGroup}
              sx={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              color='success'
              sx={{ flex: 1 }}
              onClick={handleSaveNewGroup}
              disabled={!groupName.trim()}
              data-testid='save-new-group-button'
            >
              Save
            </Button>
          </div>
        </Box>
      ) : groupToEdit ? (
        <div className='flex flex-row gap-1 z-20'>
          <Button
            color='danger'
            onClick={() => dispatch(setGroupToEdit(null))}
            sx={{ flex: 1 }}
          >
            Cancel
          </Button>
          <Button
            color='success'
            sx={{ flex: 1 }}
            onClick={handleSaveEditedGroup}
            data-testid='save-edited-group-button'
          >
            Save Changes
          </Button>
        </div>
      ) : (
        <Box>
          {showGroupSelector && (
            <Autocomplete
              options={Object.keys(componentGroups)}
              onChange={(e, value) => {
                if (value) {
                  dispatch(setGroupToEdit(value));
                }
              }}
              onBlur={() => setShowGroupSelector(false)}
              placeholder='Select Group'
              sx={{ marginBottom: 2 }}
              data-testid='group-selector'
            />
          )}
          <Dropdown>
            <MenuButton
              color='primary'
              variant='solid'
              sx={{ width: '100%' }}
              data-testid='create-edit-group-button'
            >
              Create / Edit Group
            </MenuButton>
            <Menu>
              <MenuItem
                onClick={() => dispatch(setIsInCreateGroupMode(true))}
                data-testid='create-new-group-button'
              >
                Create New Group
              </MenuItem>
              <MenuItem
                onClick={() => setShowGroupSelector(true)}
                data-testid='edit-existing-group-button'
              >
                Edit Existing Group
              </MenuItem>
            </Menu>
          </Dropdown>
        </Box>
      )}
    </Card>
  );
}
