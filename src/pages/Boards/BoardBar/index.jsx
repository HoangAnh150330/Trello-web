import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import DashboardIcon from '@mui/icons-material/Dashboard'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import BoltIcon from '@mui/icons-material/Bolt'
import FilterListIcon from '@mui/icons-material/FilterList'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import AvatarGroup from '@mui/material/AvatarGroup'
import Button from '@mui/material/Button'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
const MENU_STYLES={
  color:'white',
  bgcolor:'transparent',
  border:'none',
  paddingX:'5px',
  borderRadius:'4px',
  '.MuiSvgIcon-root':{
    color:'white'
  },
  '&:hover':{
    bgcolor:'primary.50'
  }
}
function BoardBar() {
  return (
    <Box sx={{
      width:'100%',
      height:(theme) => theme.trello.boardBarHeight,
      display:'flex',
      alignItems:'center',
      justifyContent:'space-between',
      gap:2,
      paddingX :2,
      overflowX: 'auto',
      borderBottom: '1px solid #00bfa5',
      bgcolor: ( theme ) => (theme.palette.mode==='dark' ? '#34495e' : '#1976d2')
    }}>
      <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
        <Chip
          sx={MENU_STYLES}
          icon={<DashboardIcon />} label="HoangAnh MERN Stack Board"
          clickable
        />
        <Chip
          sx={MENU_STYLES }
          icon={<VpnLockIcon />} label="Public/Private WorkSpace"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<AddToDriveIcon />} label="Add to Google Driver"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<BoltIcon />} label="Automation"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<FilterListIcon />} label="Filters"
          clickable
        />
      </Box>
      <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
        <Button
          variant="outlined"
          startIcon={<PersonAddIcon/>}
          sx={{
            color:'white',
            borderColor:'white',
            '&:hover':{ borderColor:'white' }
          }}
        >
          Invite
        </Button>
        <AvatarGroup
          sx={{
            gap:'10px',
            '& .MuiAvatar-root':{
              width:34,
              height:34,
              fontSize:16,
              border:'none'
            }
          }}
          max={7}>
          <Tooltip title="Hoanganh">
            <Avatar alt="HoangAnh"
              src="https://png.pngtree.com/png-clipart/20230817/original/pngtree-round-kid-avatar-boy-face-picture-image_8005285.png" />
          </Tooltip>
          <Tooltip title="Hoanganh">
            <Avatar alt="HoangAnh"
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8KS69zdBHkgNKduMYJhKU4apq-M4VBuYgKA&s" />
          </Tooltip>
          <Tooltip title="Hoanganh">
            <Avatar alt="HoangAnh"
              src="https://i.pinimg.com/236x/ab/61/02/ab61029f2d04444545454815a23ccbb3.jpg" />
          </Tooltip>
          <Tooltip title="Hoanganh">
            <Avatar alt="HoangAnh"
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBDoox0TEOMV9C39vT6I2hPOI6_s6qRrE-9w&s" />
          </Tooltip>
          <Tooltip title="Hoanganh">
            <Avatar alt="HoangAnh"
              src="https://png.pngtree.com/png-clipart/20190920/original/pngtree-user-flat-character-avatar-png-png-image_4650324.jpg" />
          </Tooltip>
          <Tooltip title="Hoanganh">
            <Avatar alt="HoangAnh"
              src="https://img.pikbest.com/png-images/20240509/spirited-mothers-day-holiday-wishes-222024-png-images-png_10557444.png!w700wp" />
          </Tooltip>
          <Tooltip title="Hoanganh">
            <Avatar alt="HoangAnh"
              src="https://png.pngtree.com/png-clipart/20230817/original/pngtree-round-kid-avatar-boy-face-picture-image_8005285.png" />
          </Tooltip>
          <Tooltip title="Hoanganh">
            <Avatar alt="HoangAnh"
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8KS69zdBHkgNKduMYJhKU4apq-M4VBuYgKA&s" />
          </Tooltip>
          <Tooltip title="Hoanganh">
            <Avatar alt="HoangAnh"
              src="https://i.pinimg.com/236x/ab/61/02/ab61029f2d04444545454815a23ccbb3.jpg" />
          </Tooltip>
          <Tooltip title="Hoanganh">
            <Avatar alt="HoangAnh"
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBDoox0TEOMV9C39vT6I2hPOI6_s6qRrE-9w&s" />
          </Tooltip>
          <Tooltip title="Hoanganh">
            <Avatar alt="HoangAnh"
              src="https://png.pngtree.com/png-clipart/20190920/original/pngtree-user-flat-character-avatar-png-png-image_4650324.jpg" />
          </Tooltip>
          <Tooltip title="Hoanganh">
            <Avatar alt="HoangAnh"
              src="https://img.pikbest.com/png-images/20240509/spirited-mothers-day-holiday-wishes-222024-png-images-png_10557444.png!w700wp" />
          </Tooltip>
        </AvatarGroup>
      </Box>
    </Box>
  )
}

export default BoardBar