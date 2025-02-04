import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
// import { mockData } from '~/apis/mock-data'
import { useEffect, useState } from 'react'
import {
  fetchBoardDetailsAPI,
  createNewColumnAPI,
  createNewCardAPI,
  updateBoardDetailsAPI,
  updateColumnDetailsAPI,
  moveCardToDifferentColumnAPI
} from '~/apis'
import { generatePlaceholderCard } from '~/utils/formatters'
import { isEmpty } from 'lodash'
import { mapOrder } from '~/utils/sorts'
function Board() {
  const [board, setBoard] = useState(null)

  useEffect(() => {
    const boardId = '6791979d46e868f6b4af88ab'
    //call API
    fetchBoardDetailsAPI(boardId).then(board => {
      //Sắp xếp thứ tự các column luôn ở đây trước khi đưa dữ liệu xuống bên dưới các component con
      board.column = mapOrder(board.columns, board?.columnOrderIds, '_id')
      //Khi tạo column mới thì nó sẽ chưa có card , cần xử lý vấn đề kéo thả một column rỗng
      board.columns.forEach(column => {
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
        }
        else {
          // Sắp xếp thứ tự các cards luôn ở đây trước khi đưa dữ liệu xuống bên dưới component
          column.cards =mapOrder(column.cards, column.cardOrderIds, '_id')
        }
      })
      setBoard(board)
    })
  }, [])

  //Function có nhiệm vụ gọi API tạo mới column và làm mới State Board
  const createNewColumn = async(newColumnData) => {
    const createdColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId: board._id
    })

    createdColumn.cards =[generatePlaceholderCard(createdColumn)]
    createdColumn.cardOrderIds =[generatePlaceholderCard(createdColumn)._id]
    //Cập nhật State board
    //Phía FE chúng ta phải tự làm mới lại state data board (thay vì phải gọi lại API)
    //Lưu ý : cách làm này phụ thuộc vào tùy lựa chọn và đặc thù dự án , có nơi thì BE sẽ hổ trợ trả về luôn toàn bộ Board
    // dù đây có phải là API tạo column hay Card đi chăng nữa => Lúc này FE sẽ nhàn hơn
    const newBoard = { ...board }
    newBoard.columns.push(createdColumn)
    newBoard.columnOrderIds.push(createdColumn._id)
    setBoard(newBoard)
  }
  //Function có nhiệm vụ gọi API tạo mới Card và làm mới State Board
  const createNewCard = async(newCardData) => {
    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId: board._id
    })

    //Cập nhật State board
    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(column => column._id === createdCard.columnId)
    if (columnToUpdate) {
      //Nếu column rỗng : bản chất là đang chứa 1 placeholder card
      if (columnToUpdate.cards.some(card => card.FE_PlaceholderCard)) {
        columnToUpdate.cards =[createdCard]
        columnToUpdate.cardOrderIds =[createdCard._id]
      } else {
        //Ngược lại Column đã có data thì push vào cuối mảng
        columnToUpdate.cards.push(createdCard)
        columnToUpdate.cardOrderIds.push(createdCard._id)
      }
    }
    console.log('🚀 ~ createNewCard ~ columnToUpdate:', columnToUpdate)
    setBoard(newBoard)
  }
  /* Func có nv gọi API và xử lý khi đã kéo thả Column
  Chỉ cần gọi API để cập nhật mảng columnOrderIds của Board chứa nó (thay đổi vị trí trong mảng)
  */
  const moveColumns = (dndOrderedColumns) => {
    //Update lại chop chuẩn dữ liệu state board
    const dndOrderColumnsIds = dndOrderedColumns.map(c => c._id)

    const newBoard = { ...board }
    newBoard.columns =dndOrderedColumns
    newBoard.columnOrderIds = dndOrderColumnsIds
    setBoard(newBoard)
    //Gọi API Update board
    updateBoardDetailsAPI(newBoard._id, { columnOrderIds : dndOrderColumnsIds })
  }

  /* Khi di chuyển card trong cùng 1 column :
  Chỉ cần gọi API để cập nhật mảng cardOrderIds của Column chứa nó (thay đổi vị trí trong mảng)
  */
  const moveCardInTheSameColumn = (dndOrderedCards, dndOrderedCardIds, columnId) => {
    //Update lại chop chuẩn dữ liệu state board
    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(column => column._id === columnId)
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards
      columnToUpdate.cardOrderIds= dndOrderedCardIds
    }
    setBoard(newBoard)
    //Gọi API Update Column
    updateColumnDetailsAPI(columnId, { cardOrderIds: dndOrderedCardIds })
  }
  if (!board) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent:'center', gap:2, width:'100vw', height:'100vh' }}>
        <CircularProgress />
        <Typography>Loading Board...</Typography>
      </Box>
    )
  }

  // Khi di chuyển card sang Column khác:
  // B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (Hiểu bản chất là xóa cái _id của Card ra khỏi mảng)
  // B2: Cập nhật mảng cardOrderIds của Column tiếp theo (Hiểu bản chất là thêm _id của Card vào mảng)
  // B3: Cập nhật lại trường columnId mới của cái Card đã kéo
  // => Làm một API support riêng.
  const moveCardToDifferentColumn = (currentCardId, prevColumnId, nextColumnId, dndOrderedColumns) => {
    //Update lại chop chuẩn dữ liệu state board
    const dndOrderColumnsIds = dndOrderedColumns.map(c => c._id)
    const newBoard = { ...board }
    newBoard.columns =dndOrderedColumns
    newBoard.columnOrderIds = dndOrderColumnsIds
    setBoard(newBoard)

    //Gọi API xử lý phía BE
    let prevCardOrderIds = dndOrderedColumns.find(c => c._id === prevColumnId)?.cardOrderIds
    //Xử lý vấn đề khi kéo Card cuối cùng ra khỏi Column , Column rỗng sẽ có placeHolder Card , cần xóa nó đi trước khi gửi dữ liệu lên phía BE
    if (prevCardOrderIds[0].includes('-placeholder-card')) prevCardOrderIds =[]
    moveCardToDifferentColumnAPI({
      currentCardId,
      prevColumnId,
      prevCardOrderIds,
      nextColumnId,
      nextCardOrderIds: dndOrderedColumns.find(c => c._id === nextColumnId)?.cardOrderIds
    })
  }
  return (
    <Container disableGutters maxWidth={false} sx={{ height : '100vh', backgroundColor:'primary.main' }}>
      <AppBar/>
      <BoardBar board={board}/>
      <BoardContent
        board={board}
        createNewColumn={createNewColumn}
        createNewCard={createNewCard}
        moveColumns={moveColumns}
        moveCardInTheSameColumn ={moveCardInTheSameColumn}
        moveCardToDifferentColumn ={moveCardToDifferentColumn}
      />
    </Container>
  )
}

export default Board