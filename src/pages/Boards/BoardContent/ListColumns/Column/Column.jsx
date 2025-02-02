import { useState } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ContentCut from '@mui/icons-material/ContentCut'
import ContentCopy from '@mui/icons-material/ContentCopy'
import ContentPaste from '@mui/icons-material/ContentPaste'
import Cloud from '@mui/icons-material/Cloud'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import AddCardIcon from '@mui/icons-material/AddCard'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import ListCards from './ListCards/ListCards'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'
import { toast } from 'react-toastify'

function Columns({ column, createNewCard }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column._id,
    data:{ ...column }
  })
  const dndKitColumnStyles = {
    touchAction:'none',
    //TouchAction :'none',//Dành cho senor default dạng PointerSenor
    //Nếu sử dụng CSS.Transform như doc sẽ lỗi kiểu stretch
    transform: CSS.Translate.toString(transform),
    transition,
    //chiều cao phải luôn max 100% vì nếu không sẽ lỗi lúc kéo column ngắn qua một cái colum dài thì phải kéo
    //ở khu vực giữa rất khó chịu . Lưu ý phải kết hợp với {...listeners} nằm ở Box chứ k phải ở div ngoài cùng
    //để tránh trường hợp kéo vào vùng xanh
    height:'100%',
    opacity: isDragging ? 0.5 :undefined
  }
  const [anchorEl, setAnchorEl] =useState(null)
  const open =Boolean(anchorEl)
  const handleClick =(event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  //Card đã được sort ở component cha cao nhất
  const orderedCards =column.cards
  const [openNewCardForm, setOpenNewCardForm] =useState(false)
  const toggleOpenNewCardForm =() => setOpenNewCardForm(!openNewCardForm)

  const [newCardTitle, setNewCardTitle]=useState('')
  const addNewCard = () => {
    if (!newCardTitle) {
      toast.error('Please enter Card Title', { position: 'bottom-right' })
      return
    }
    //Tạo dữ liệu card để gọi API
    const newCardData ={
      title: newCardTitle,
      columnId: column._id
    }

    createNewCard(newCardData)

    //Đóng lại trạng thái thêm Card mới & Clear Input
    toggleOpenNewCardForm()
    setNewCardTitle(' ')
  }
  return (
    <div ref={setNodeRef} style={dndKitColumnStyles} {...attributes}>
      <Box
        {...listeners}
        sx={{
          minWidth: '300px',
          maxWidth: '300px',
          bgcolor:( theme ) => (theme.palette.mode==='dark' ? '#333643' : '#ebecf0'),
          ml:2,
          borderRadius:'6px',
          height: 'fit-content',
          maxHeight:(theme) => `calc(${theme.trello.boardContentHeight} - ${theme.spacing(5)})`

        }}>
        {/* Box Column Header */}
        <Box sx={{
          height:(theme) => theme.trello.columnHeaderHeight,
          p:2,
          display:'flex',
          alignItems:'center',
          justifyContent:'space-between'
        }}
        >
          <Typography variant="h6" sx={{
            fontSize:'1rem',
            fontWeight:'bold',
            cursor:'pointer'

          }}
          >
            {column?.title}
          </Typography>
          <Box>
            <Tooltip title="More options">
              <ExpandMoreIcon
                sx={{ color:'text.primary', cursor:'pointer' }}
                id="basic-column-dropdown"
                aria-controls={open ? 'basic-menu-column-dropdown' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
              />
            </Tooltip>
            <Menu
              id="basic-menu-column-dropdown"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-column-dropdown'
              }}
            >
              <MenuItem>
                <ListItemIcon><AddCardIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Add new card </ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon><ContentCut fontSize="small" /></ListItemIcon>
                <ListItemText>Cut</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon><ContentCopy fontSize="small" /></ListItemIcon>
                <ListItemText>Copy</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon><ContentPaste fontSize="small" /></ListItemIcon>
                <ListItemText>Paste</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem>
                <ListItemIcon><DeleteForeverIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Remove this column</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon><Cloud fontSize="small" /></ListItemIcon>
                <ListItemText>Archive this column</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        {/* Box List Card */}
        <ListCards cards={orderedCards}/>
        {/* Box Footer */}
        <Box sx={{
          height:(theme) => theme.trello.columnsFooterHeight,
          p:2
        }}
        >
          {!openNewCardForm
            ?<Box sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Button startIcon={<AddCardIcon/>} onClick={ toggleOpenNewCardForm}>Add new card</Button>
              <Tooltip title="Drag to move">
                <DragHandleIcon sx={{ cursor:'pointer' }}/>
              </Tooltip>
            </Box>
            :<Box sx={{
              height:'100%',
              display:'flex',
              alignItems:'center',
              gap:1
            }}>
              <TextField
                label="Enter card title..."
                type="text"
                size="small"
                variant="outlined"
                autoFocus
                data-no-dnd ="true"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                sx={{
                  '& label':{ color:'text.primary' },
                  '& input':{
                    color: (theme) => theme.palette.primary.main,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#333643' : 'white')
                  },
                  '& label.Mui-focused':{ color: (theme) => theme.palette.primary.main },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset':{ borderColor : (theme) => theme.palette.primary.main },
                    '&:hover fieldset':{ borderColor : (theme) => theme.palette.primary.main },
                    '&.Mui-focused fieldset': { borderColor: (theme) => theme.palette.primary.main }
                  },
                  '& .MuiOutlinedInput-input':{
                    borderRadius:1
                  }
                }}/>
              <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                <Button
                  onClick={addNewCard}
                  variant="contained"
                  color="success"
                  size="small"
                  sx={{
                    boxShadow: 'none',
                    border:'0.5px solid',
                    borderColor:(theme) => theme.palette.success.main,
                    '&:hover:': { bgcolor:(theme) => theme.palette.success.main }
                  }}
                >Add</Button>
                <CloseIcon
                  fontSize='small'
                  sx={{
                    color: (theme) => theme.palette.warning.light,
                    cursor:'pointer'
                  }}
                  onClick={toggleOpenNewCardForm}
                />
              </Box>
            </Box>
          }
        </Box>
      </Box>
    </div>
  )
}

export default Columns