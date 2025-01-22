import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'
import {
  DndContext,
  //PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  // closestCenter,
  pointerWithin,
  // rectIntersection,
  getFirstCollision
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useState, useCallback, useRef } from 'react'
import { cloneDeep, isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formatters'
import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'
const ACTIVE_DRAG_ITEM_TYPE ={
  COLUMN:'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD:'ACTIVE_DRAG_ITEM_TYPE_CARD'
}
function BoardContent({ board }) {
  //Nếu dùng Pointer Sensor mặc định thì phải kết hợp 1 thuộc tính là CSS touch-action:none ở những phần tử kéo thả  nhưng còn BUG
  //const pointerSensor =useSensor(PointerSensor, { activationConstraint:{ distance:10 } })
  //Yêu cầu chuột di chuyển 10px thì mới kích hoạt event , fix trường hợp click bị gọi event
  const mouseSensor =useSensor(MouseSensor, { activationConstraint:{ distance:10 } })
  //Nhấn giữ 250ms và dung sai của cảm ứng 500 px thì mới kích hoạt event
  const touchSensor =useSensor(TouchSensor, { activationConstraint:{ delay:250, tolerance:500 } })
  // const sensors =useSensors(pointerSensor)
  const sensors =useSensors(mouseSensor, touchSensor )
  const [orderedColumns, setOrderedColumns] =useState([])
  //Cùng 1 thời điểm chỉ có 1 item được kéo
  const [activeDragItemId, setActiveDragItemId] =useState(null)
  const [activeDragItemType, setActiveDragItemType] =useState(null)
  const [activeDragItemData, setActiveDragItemData] =useState(null)
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] =useState(null)

  //điểm va chạm cuối cùng trước đó (xử lý thuật toán phát hiện va chạm )
  const lastOverId = useRef(null)

  useEffect(() => {
    setOrderedColumns( mapOrder(board?.columns, board?.columnOrderIds, '_id'))
  }, [board])
  //Tìm columns theo cardId
  const findColumnByCardId = (cardId) => {
    //Đoạn này nên dùng , c.cards thay vì c.cardOderIds bởi vì ở bước handleDragOver chúng t sẽ làm dữ liệu cho cards
    //hoàn chỉnh trước rồi moiwss tạo ra cardOrderIds mới
    return orderedColumns.find(column => column?.cards?.map(card => card._id)?.includes(cardId))
  }
  //Trigger khi bắt đầu kéo 1 phần tử
  const handleDragStart= (event) => {
    // console.log('HandleDragStart: ', event )
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)

    //Nếu là kéo card thì mới thực hiện hành động set giá trị oldColumn
    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
  }
  //Trigger trong quá trình kéo một phần tử
  const handleDragOver = (event) => {
    //không làm j thêm nếu đang kéo Column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return
    // console.log('handleDragOver :', event)
    const { active, over } =event

    //Kiểm tra không tồn tại over hoặc active
    if (!active || !over) return

    //activeDraggingCard : là card chungs ta đang kéo
    const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } =active
    //Over card là cái card đang tương tác trên hoặc dưới so với cái card được kéo ở trên
    const { id: overCardId } =over

    //Tìm 2 cái Column theo cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    //Nếu kh tồn tại 1 trong 2 Column thì k làm gì hết tránh crash trang web
    if (!activeColumn || !overColumn) return

    //xử lý logic ở đây chỉ khi kéo card qua 2 column khác nhau , còn nếu kéo card trong chính column ban đầu
    // của nó thì không làm gì cả
    // Vì đây đang là đoạn xử lý kéo (handleDragOver) , còn xử lý lúc kéo xong xuôi thì nó lại là vấn đề khác ở (handleDragEnd)
    if (activeColumn._id !== overColumn._id) {
      setOrderedColumns(prevColumns => {
        //tìm vị trí của OverCard trong column đích (nơi mà active card sắp được thả)
        const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId )
        //Logic tính toán 'cardIndex mới' (trên hoặc dưới của OverCard ) lây chuẩn ra từ code của thư viện
        let newCardIndex
        const isBelowOverItem = active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height
        const modifier = isBelowOverItem ? 1 : 0
        newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1
        //Clone mảng OrderedColumns cũ ra một cái mới để xử lý data rồi return - Cập nhật lại OrderedColumnsState mới
        const nextColumns = cloneDeep(prevColumns)
        const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
        const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)

        //Column cũ
        if (nextActiveColumn) {
          // xoa card ở cái column active từ column cũ sang mới
          nextActiveColumn.cards =nextActiveColumn.cards.filter( card => card._id !== activeDraggingCardId)

          //Thêm Placeholder Card nêu Column rỗng : Bị kéo hêt card đi , kh còn cái nào nữa
          if (isEmpty(nextActiveColumn.cards)) {
            // console.log('Card cuối cùng bị kéo đi ')
            nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)]
          }

          //Cập nhật lại mảng CardOrderIds cho chuẩn dữ liệu
          nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
        }
        //Column mới
        if (nextOverColumn) {
          //Kiểm tra xem card đang keo có đang tồn tại ở Column hay chưa , nếu có thì xóa trước
          nextOverColumn.cards =nextOverColumn.cards.filter( card => card._id !== activeDraggingCardId)

          //Tiếp theo là thêm cái card đang kéo vào column theo vị trí index mới
          nextOverColumn.cards =nextOverColumn.cards.toSpliced(newCardIndex, 0, activeDraggingCardData)

          //Xóa cái Placeholder Card đi nếu no đang tồn tại
          nextOverColumn.cards = nextOverColumn.cards.filter (card => !card.FE_PlaceholderCard)


          //Cập nhật lại mảng CardOrderIds cho chuẩn dữ liệu
          nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
        }
        return nextColumns
      })
    }

  }
  //Trigger khi kết thúc hành động kéo 1 phần tử
  const handleDragEnd =(event) => {
    // console.log('handleDragEnd:', event)
    const { active, over } =event
    //Xử lý kéo thả card
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      //activeDraggingCard : là card chungs ta đang kéo
      const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } =active
      //Over card là cái card đang tương tác trên hoặc dưới so với cái card được kéo ở trên
      const { id: overCardId } =over

      //Tìm 2 cái Column theo cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      //Nếu kh tồn tại 1 trong 2 Column thì k làm gì hết tránh crash trang web
      if (!activeColumn || !overColumn) return

      // hành động kéo thả card giữa 2 column khác nhau
      //Phải dùng tới activeDragItemId.columnId hoặc oldColumnWhenDraggingCard._id (set từ handleDragStart) chứ k phải
      //active Data trong scope handleDragEnd này vì sau khi đi qua onDragOver tới đây là state của card đã bị cập nhật 1 lần rồi
      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
      // if (activeDragItemId.columnId !== overColumn._id) {
        // console.log('hành động kéo thả card giữa 2 column khác nhau')
      } else {
        //'Hành động kéo thả card trong cùng 1 column'

        //Lấy vị trí cũ từ oldColumnWhenDraggingCard
        const oldCardIndex =oldColumnWhenDraggingCard?.cards?.findIndex( c => c._id === activeDragItemId)
        //Lấy vị trí nới từ overColumn
        const newCardIndex =overColumn?.cards?.findIndex( c => c._id === overCardId )

        // Dùng ArrayMove vì kéo card trong 1 cái column thì tương tự với logic kéo column trong 1 cái board content
        const dndOrderedCards =arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex )
        // console.log('dndOrderedCards:', dndOrderedCards)

        setOrderedColumns(prevColumns => {
          //Clone mảng OrderedColumns cũ ra một cái mới để xử lý data rồi return - Cập nhật lại OrderedColumnsState mới
          const nextColumns = cloneDeep(prevColumns)

          //tìm tới column mà chúng ta đang thả\
          const targetColumn = nextColumns.find( column => column._id === overColumn._id)

          //Cập nhật lại 2 giá trị mới là card và cardOrderId trong cái targetColumn
          targetColumn.cards =dndOrderedCards
          targetColumn.cardOrderIds = dndOrderedCards.map( card => card._id)

          //trả về giá trị state mới (chuẩn vị trí )
          return nextColumns
        })
      }
    }
    //Xử lý kéo thả Column trong  1 boardContent
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      //Nếu vị trí sau khi kéo thả khác với vị trí ban đầu
      if (active.id !== over.id) {
        //Lấy vị trí cũ từ Active
        const oldColumnIndex =orderedColumns.findIndex( c => c._id === active.id)
        //Lấy vị trí nới từ over
        const newColumnIndex =orderedColumns.findIndex( c => c._id === over.id)

        //Dùng arrayMove của Dnd kit để sắp xếp lại mảng Columns ban đầu
        const dndOrderedColumns =arrayMove(orderedColumns, oldColumnIndex, newColumnIndex )
        // Xu ly goi API
        // const dndOrderColumnsIds = dndOrderedColumns.map(c => c._id)
        // // console.log('dndOrderedColumns:', dndOrderedColumns)
        // // console.log('dndOrderColumnsIds:',dndOrderColumnsIds)

        //Cập nhật lại state Columns ban đầu sau khi đã kéo thả
        setOrderedColumns(dndOrderedColumns)
      }
    }
    //Những dữ liệu sau khi kéo thả luôn phải đưa về giá trị null mặc định ban đầu
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
  }
  //Animation khi thả Drop phần tử -test bằng cách kéo thả xog thả trực tiếp nhìn phần giữ chổ Overlay
  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5'
        }
      }
    })
  }
  //Chúng ta custom lại chiến lược / thuật toán phát hiện va chạm tối ưu cho việc kéo thả card giữa nhiều columns
  //args = arguments các đối số , các tham số
  const collisionDetectionStrategy = useCallback((args) => {
    // console.log(collisionDetectionStrategy)
    //Trường hợp kéo column thì dùng thuật toán closestCorners là chuẩn
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return closestCorners({ ...args })
    }
    //Tìm các điểm giao nhau, trả về mảng các va chạm  - các điểm va chạm
    const pointerIntersections =pointerWithin(args)

    //Nêu pointerIntersections là mảng rỗng , return luôn không làm gì hết
    //Fix triệt để bug flickering của thư viện dnd-kit trong trường hợp sau :
    //Kéo 1 cái card co image cover lơn và kéo lên phía trên cùng ra khỏi khu vực keo thả
    if (!pointerIntersections?.length) return
    //Thuật toán phát hiện va chạm sẽ trả về 1 mảng va chạm
    // const intersections = !!pointerIntersections?.length
    //   ? pointerIntersections
    //   : rectIntersection(args)

    //Tìm overId đầu tiên trong đám pointerIntersections ở trên
    let overId = getFirstCollision(pointerIntersections, 'id')
    // console.log('OverId :', overId)
    if (overId) {
      //Nếu cái over nó là cái column thì sẽ tìm tới các cardId gần nhất bên trong khu vực va chạm đó dựa vào thuật toán
      //phát hiện va chạm closestCenter hoặc closestCorners đều được . Tuy nhiên ở đây dùng closestCenter sẽ mượt hơn
      const checkColumn =orderedColumns.find(column => column._id === overId)
      if (checkColumn) {
        // console.log("OverId before:",overId)
        overId = closestCorners( {
          ...args,
          droppableContainers: args.droppableContainers.filter(container => {
            return (container.id !== overId) && (checkColumn?.cardOrderIds?.includes(container.id)) })
        })[0]?.id
        // console.log("OverId after:",overId)
      }
      lastOverId.current =overId
      return [{ id : overId }]
    }

    //Nếu overId là null thì trả về mảng rỗng - tránh crash trang
    return lastOverId.current ? [{ id:lastOverId.current }] :[]
  }, [activeDragItemType] )
  return (
    <DndContext
      // cảm biến
      sensors={sensors}
      //Thuật toán phát hiện va chạm (nếu không có thì card với cover lớn sẽ không kéo qua column được vì lúc này
      //nó đang bị conflict giữa card và column ) , chúng ta sẽ dùng closestCorners thay vì closestCenter
      // Update nếu chỉ dùng closestCorners sẽ có bug flickering + sai lệch dữ liệu
      // collisionDetection={closestCorners}

      //Tự custom nâng cao thuật toán phát hiện va chạm
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd} >
      <Box sx={{
        bgcolor: ( theme ) => (theme.palette.mode==='dark' ? '#34495e' : '#1976d2'),
        width:'100%',
        height:(theme) => theme.trello.boardContentHeight,
        p: '10px 0'
      }}>
        <ListColumns columns={orderedColumns}/>
        <DragOverlay dropAnimation={customDropAnimation}>
          {(!activeDragItemType ) && null}
          {( activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Column column={activeDragItemData}/>}
          {( activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData}/>}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent