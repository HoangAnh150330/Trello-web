import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
import { mockData } from '~/apis/mock-data'
import { useEffect, useState } from 'react'
import { fetchBoardDetailsAPI, createNewColumnAPI, createNewCardAPI } from '~/apis'
import { generatePlaceholderCard } from '~/utils/formatters'
import { isEmpty } from 'lodash'
function Board() {
  const [board, setBoard] = useState(null)

  useEffect(() => {
    const boardId = '6791979d46e868f6b4af88ab'
    //call API
    fetchBoardDetailsAPI(boardId).then(board => {
      //Khi tạo column mới thì nó sẽ chưa có card , cần xử lý vấn đề kéo thả một column rỗng
      board.columns.forEach(column => {
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
        }
      })
      console.log(board)
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
      columnToUpdate.cards.push(createdCard)
      columnToUpdate.cardOrderIds.push(createdCard._id)
    }
    setBoard(newBoard)
  }
  return (
    <Container disableGutters maxWidth={false} sx={{ height : '100vh', backgroundColor:'primary.main' }}>
      <AppBar/>
      <BoardBar board={board}/>
      <BoardContent
        board={board}
        createNewColumn={createNewColumn}
        createNewCard={createNewCard}/>
    </Container>
  )
}

export default Board