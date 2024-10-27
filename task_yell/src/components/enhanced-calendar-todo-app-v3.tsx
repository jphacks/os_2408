'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Menu, CalendarIcon, ChevronLeft, ChevronRight, X, ChevronUp, Search, Edit, Trash2, SunMoon, MapPinIcon, UserPlusIcon } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, isToday, isFuture, parseISO, getHours, startOfWeek, endOfWeek, addDays, addMinutes, isBefore, isAfter } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type Priority = 'low' | 'medium' | 'high'
type Category = 'work' | 'personal' | 'shopping' | 'health' | 'other'

type Todo = {
  id: number
  text: string
  completed: boolean
  date: Date
  priority: Priority
  category: Category
}

type Event = {
  id: number
  title: string
  description: string
  date: Date
  startTime: string
  endTime: string
  category: Category
  priority: Priority
  start: Date
  end: Date
  location: string
  invitees: string
  isTask: boolean
  isLocked: boolean
}

type StickyNote = {
  id: number
  title: string
}

const priorityColors: Record<Priority, string> = {
  low: 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100',
  medium: 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100',
  high: 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100'
}

const categoryIcons: Record<Category, JSX.Element> = {
  work: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /><path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" /></svg>,
  personal: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>,
  shopping: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>,
  health: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>,
  other: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>,
}

// EventCreator コンポーネント
// 新しいイベントを作成するためのフォームを提供します。
// props:
// - onSave: 新しいイベントを保存する関数
// - onCancel: フォームをキャンセルする関数
// - initialTitle: 初期タイトル（オプション）
// - selectedDate: 選択された日付
// - events: 既存のイベントリスト
function EventCreator({ onSave, onCancel, initialTitle = '', selectedDate, events }: { onSave: (event: Event) => void, onCancel: () => void, initialTitle?: string, selectedDate: Date, events: Event[] }) {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState('')
  const [date, setDate] = useState<Date | undefined>(selectedDate)
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('11:00')
  const [location, setLocation] = useState('')
  const [invitees, setInvitees] = useState('')
  const [category, setCategory] = useState<Category>('other')
  const [priority, setPriority] = useState<Priority>('medium')
  const [isTask, setIsTask] = useState(false)
  const [isLocked, setIsLocked] = useState(false)

  const timeOptions = Array.from({ length: 96 }, (_, i) => {
    const hours = Math.floor(i / 4).toString().padStart(2, '0')
    const minutes = (i % 4 * 15).toString().padStart(2, '0')
    return `${hours}:${minutes}`
  })

  const handleTimeChange = (time: string, isStart: boolean) => {
    if (isStart) {
      setStartTime(time)
      // 終了時間を自動的に1時間後に設定
      const [hours, minutes] = time.split(':').map(Number)
      const endDate = new Date(2000, 0, 1, hours + 1, minutes)
      setEndTime(format(endDate, 'HH:mm'))
    } else {
      setEndTime(time)
    }
  }

  const handleSave = () => {
    if (date) {
      const newEvent: Event = {
        id: Date.now(),
        title,
        description,
        date,
        startTime,
        endTime,
        category,
        priority,
        start: new Date(`${format(date, 'yyyy-MM-dd')}T${startTime}`),
        end: new Date(`${format(date, 'yyyy-MM-dd')}T${endTime}`),
        location,
        invitees,
        isTask,
        isLocked
      }
      onSave(newEvent)
    }
  }

  // 選択された日のスケジュールを描画する関数
  const renderDaySchedule = () => {
    // 選択された日のイベントをフィルタリング
    const dayEvents = events.filter(event => isSameDay(event.start, selectedDate))
    const hours = Array.from({ length: 24 }, (_, i) => i)

    const sortedEvents = dayEvents.sort((a, b) => a.start.getTime() - b.start.getTime())

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4">{format(selectedDate, 'yyyy年MM月dd日 (E)', { locale: ja })}のスケジュール</h3>
        <div className="relative" style={{ height: '600px', overflowY: 'auto' }}>
          {hours.map(hour => (
            <div key={hour} className="flex items-center h-12 border-t border-gray-200 dark:border-gray-700">
              <span className="w-12 text-xs text-gray-500">{`${hour.toString().padStart(2, '0')}:00`}</span>
              <div className="flex-1 relative">
                {sortedEvents
                  .filter(event => getHours(event.start) === hour)
                  .map((event, index) => {
                    const startMinutes = event.start.getMinutes()
                    const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60)
                    const height = `${duration}px`
                    const top = `${startMinutes}px`
                    const width = index === 0 ? '200%' : '150%'
                    const left = index === 0 ? '0%' : `${50 * Math.min(index, 3)}%`
                    const zIndex = index + 1

                    return (
                      <div
                        key={event.id}
                        className={`absolute p-1 text-xs rounded-sm ${priorityColors[event.priority]} overflow-hidden border border-gray-300 dark:border-gray-600`}
                        style={{ top, height, minHeight: '20px', width, left, zIndex }}
                      >
                        <div className="font-semibold truncate">{event.title}</div>
                        <div className="truncate">{`${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')}`}</div>
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex space-x-4">
      <div className="w-2/5">
        {renderDaySchedule()}
      </div>
      <div className="w-3/5 space-y-3">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="is-task"
          checked={isTask}
          onCheckedChange={(checked) => setIsTask(checked as boolean)}
        />
        <Label htmlFor="is-task">タスクにする</Label>
      </div>

      <Input
        placeholder="タイトルを追加"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {!isTask && (
        <>
          <div className="flex items-center space-x-2">
            <CalendarIcon className="text-gray-500" />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  {date ? format(date, 'yyyy年MM月dd日 (E)', { locale: ja }) : '日付を選択'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center space-x-2">
            <Select value={startTime} onValueChange={(value) => handleTimeChange(value, true)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="開始時間" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>-</span>
            <Select value={endTime} onValueChange={(value) => handleTimeChange(value, false)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="終了時間" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Textarea
            placeholder="説明を追加"
            
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex items-center space-x-2">
            <UserPlusIcon className="text-gray-500" />
            <Input
              placeholder="招待"
              value={invitees}
              onChange={(e) => setInvitees(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <MapPinIcon className="text-gray-500" />
            <Input
              placeholder="場所または会議URLを追加"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <Select value={category} onValueChange={(value: Category) => setCategory(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="カテゴリを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="work">仕事</SelectItem>
              <SelectItem value="personal">個人</SelectItem>
              <SelectItem value="shopping">買い物</SelectItem>
              <SelectItem value="health">健康</SelectItem>
              <SelectItem value="other">その他</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="重要度を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">低</SelectItem>
              <SelectItem value="medium">中</SelectItem>
              <SelectItem value="high">高</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-locked"
              checked={isLocked}
              onCheckedChange={(checked) =>   setIsLocked(checked as boolean)}
            />
            <Label  htmlFor="is-locked">ロックする</Label>
          </div>
        </>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>キャンセル</Button>
        <Button onClick={handleSave}>保存</Button>
      </div>
      </div>
    </div>
  )
}

// EnhancedCalendarTodoApp コンポーネント
// カレンダー、ToDoリスト、イベント管理機能を統合したメインアプリケーション
export function EnhancedCalendarTodoAppV3() {
  // ステート変数の定義
  const [todos, setTodos] = useState<Todo[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([])
  const [newStickyNote, setNewStickyNote] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalState, setModalState] = useState<'minimized' | 'partial' | 'full'>('partial')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingStickyNote, setEditingStickyNote] = useState<StickyNote | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [draggedStickyNote, setDraggedStickyNote] = useState<StickyNote | null>(null)
  const [removedStickyNote, setRemovedStickyNote] = useState<StickyNote | null>(null)
  const dragControls = useDragControls()
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const addStickyNote = () => {
    if (newStickyNote.trim()) {
      const newNote: StickyNote = { id: Date.now(), title: newStickyNote }
      setStickyNotes([...stickyNotes, newNote])
      setNewStickyNote('')
    }
  }

  const editStickyNote = (note: StickyNote) => {
    setEditingStickyNote(note)
  }

  const updateStickyNote = (updatedNote: StickyNote) => {
    const updatedNotes = stickyNotes.map(note =>
      note.id === updatedNote.id ? updatedNote : note
    )
    setStickyNotes(updatedNotes)
    setEditingStickyNote(null)
  }

  const deleteStickyNote = (id: number) => {
    const noteToRemove = stickyNotes.find(note => note.id === id)
    if (noteToRemove) {
      setRemovedStickyNote(noteToRemove)
      setStickyNotes(stickyNotes.filter(note => note.id !== id))
    }
    if (draggedStickyNote && draggedStickyNote.id === id) {
      setDraggedStickyNote(null)
    }
  }

  const addEvent = (newEvent: Event) => {
    setEvents([...events, newEvent])
    setIsEventModalOpen(false)
    setRemovedStickyNote(null)
  }

  const getDaysInMonth = (date: Date) => {
    const start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }

  const getTodoCountForDay = (day: Date) => {
    return todos.filter(todo => isSameDay(todo.date, day)).length
  }

  const getEventCountForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.start, day)).length
  }

  const getTaskIndicatorStyle = (todoCount: number, eventCount: number) => {
    const count = todoCount + eventCount
    if (count === 0) return ''
    const baseColor = isDarkMode ? 'bg-red-' : 'bg-red-'
    const intensity = Math.min(count * 100, 900)
    const colorClass = `${baseColor}${intensity}`
    return `${colorClass} ${count >= 3 ? 'animate-pulse' : ''}`
  }

  // カレンダーを描画する関数
  const renderCalendar = () => {
    const days = getDaysInMonth(currentMonth)
    const weeks = Math.ceil(days.length / 7)

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="grid grid-cols-7 gap-1">
          {['日', '月', '火', '水', '木', '金', '土'].map(day => (
            <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-300 p-2">{day}</div>
          ))}
        </div>
        {Array.from({ length: weeks }).map((_, weekIndex) => {
          const weekDays = days.slice(weekIndex * 7, (weekIndex + 1) * 7)
          const maxEventsInWeek = Math.max(...weekDays.map(day => 
            getTodoCountForDay(day) + getEventCountForDay(day)
          ))
          const weekHeight = maxEventsInWeek > 2 ? Math.min(maxEventsInWeek * 20, 100) : 'auto'

          return (
            <div key={weekIndex} className="grid grid-cols-7 gap-1" style={{ minHeight: '100px', height: weekHeight }}>
              {weekDays.map((day, dayIndex) => {
                const todoCount = getTodoCountForDay(day)
                const eventCount = getEventCountForDay(day)
                const isSelected = isSameDay(day, selectedDate)
                const isCurrentMonth = isSameMonth(day, currentMonth)
                const dayItems = [...todos.filter(todo => isSameDay(todo.date, day)), ...events.filter(event => isSameDay(event.start, day))]

                return (
                  <motion.div
                    key={day.toISOString()}
                    className={`p-1 border rounded-md cursor-pointer transition-all duration-300 overflow-hidden ${
                      isSelected ? 'border-blue-300 dark:border-blue-600' : ''
                    } ${
                      !isCurrentMonth ? 'text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-700' : ''
                    } ${getTaskIndicatorStyle(todoCount, eventCount)} hover:bg-gray-100 dark:hover:bg-gray-700`}
                    onClick={() => handleDateSelect(day)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.add('bg-blue-100', 'dark:bg-blue-800')
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('bg-blue-100', 'dark:bg-blue-800')
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.remove('bg-blue-100', 'dark:bg-blue-800')
                      if (draggedStickyNote) {
                        handleDateSelect(day)
                        setIsEventModalOpen(true)
                        deleteStickyNote(draggedStickyNote.id)
                      }
                    }}
                  >
                    <div className="text-right text-sm">{format(day, 'd')}</div>
                    {(todoCount > 0 || eventCount > 0) && (
                      <div className="mt-1 space-y-1">
                        {dayItems.slice(0, 2).map((item, index) => (
                          <div
                            key={index}
                            className={`text-xs p-1 rounded ${
                              'text' in item ? priorityColors[item.priority] : priorityColors[item.priority]
                            }`}
                          >
                            {'text' in item ? item.text : item.title}
                          </div>
                        ))}
                        {dayItems.length > 2 && (
                          <div className="text-xs text-center font-bold">+{dayItems.length - 2} more</div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )
        })}
      </div>
    )
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setIsEventModalOpen(true)
  }

  // StickyNoteItem コンポーネント
  // 個々の付箋を表示し、編集・削除機能を提供
  const StickyNoteItem = ({ note }: { note: StickyNote }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-yellow-200 dark:bg-yellow-700 p-4 rounded shadow-md"
      draggable
      onDragStart={(e) => {
        setDraggedStickyNote(note)
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move'
          e.dataTransfer.setData('text/plain', note.id.toString())
        }
        e.currentTarget.style.opacity = '0.5'
      }}
      onDragEnd={(e) => {
        setDraggedStickyNote(null)
        e.currentTarget.style.opacity = '1'
      }}
    >
      <h3 className="font-semibold mb-2">{note.title}</h3>
      <div className="flex justify-end space-x-2">
        <Button variant="ghost" size="icon" onClick={() => editStickyNote(note)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => deleteStickyNote(note.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )

  const filteredStickyNotes = useMemo(() => {
    return stickyNotes.filter(note =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [stickyNotes, searchTerm])

  const handleStatusBarClick = () => {
    setModalState(prevState => {
      if (prevState === 'minimized') return 'partial'
      if (prevState === 'partial') return 'full'
      return 'partial'
    })
  }


  const renderDaySchedule = () => {
    const dayEvents = events.filter(event => isSameDay(event.start, selectedDate))
    const hours = Array.from({ length: 24 }, (_, i) => i)

    const sortedEvents = dayEvents.sort((a, b) => a.start.getTime() - b.start.getTime())

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mt-4">
        <h3 className="text-lg font-semibold mb-4">{format(selectedDate, 'yyyy年MM月dd日 (E)', { locale: ja })}のスケジュール</h3>
        <div className="relative">
          {hours.map(hour => (
            <div key={hour} className="flex items-center h-12 border-t border-gray-200 dark:border-gray-700">
              <span className="w-12 text-xs text-gray-500">{`${hour.toString().padStart(2, '0')}:00`}</span>
              <div className="flex-1 relative">
                {sortedEvents
                  .filter(event => getHours(event.start) === hour)
                  .map((event, index) => {
                    const startMinutes = event.start.getMinutes()
                    const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60)
                    const height = `${duration}px`
                    const top = `${startMinutes}px`
                    const width = index === 0 ? '200%' : '150%'
                    const left = index === 0 ? '0%' : `${50 * Math.min(index, 3)}%`
                    const zIndex = index + 1

                    return (
                      <div
                        key={event.id}
                        className={`absolute p-1 text-xs rounded-sm ${priorityColors[event.priority]} overflow-hidden border border-gray-300 dark:border-gray-600`}
                        style={{ top, height, minHeight: '20px', width, left, zIndex }}
                      >
                        <div className="font-semibold truncate">{event.title}</div>
                        <div className="truncate">{`${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')}`}</div>
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">メニューを開く</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>設定</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="dark-mode"
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
              />
              <Label htmlFor="dark-mode">ダークモード</Label>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex flex-col lg:flex-row h-full pt-20 px-4">
        <div className="w-full lg:w-1/2 pr-2 overflow-auto">
          <div className="mb-4 flex justify-between items-center">
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl lg:text-2xl font-bold dark:text-white">{format(currentMonth, 'yyyy年MM月', { locale: ja })}</h2>
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {renderCalendar()}
        </div>

        <div className="w-full lg:w-1/2 pl-2 bg-white dark:bg-gray-800 overflow-auto lg:block hidden">
          <h2 className="text-xl lg:text-2xl font-bold mb-4 dark:text-white">付箋</h2>
          <div className="flex flex-col lg:flex-row mb-4 space-y-2 lg:space-y-0 lg:space-x-2">
            <Input
              type="text"
              value={newStickyNote}
              onChange={(e) => setNewStickyNote(e.target.value)}
              placeholder="タイトルを入力"
              className="flex-grow"
            />
            <Button onClick={addStickyNote} className="w-full lg:w-auto">追加</Button>
          </div>
          <div className="mb-4">
            <Input
              type="text"
              placeholder="付箋を検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredStickyNotes.map(note => (
                                                <StickyNoteItem key={note.id} note={note} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: modalState === 'minimized' ? 0 : 1 
            }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black flex items-end justify-center z-50 lg:hidden"
            style={{
              backgroundColor: modalState === 'minimized' ? 'transparent' : 'rgba(0, 0, 0, 0.5)',
              pointerEvents: modalState === 'minimized' ? 'none' : 'auto'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget && modalState !== 'minimized') {
                setIsModalOpen(false)
              }
            }}
          >
            <motion.div
              ref={modalRef}
              initial={{ y: "100%" }}
              animate={{
                y: modalState === 'minimized'
                  ? "calc(100% - 40px)"
                  : modalState === 'partial'
                    ? "calc(100% - 400px)"
                    : "0%",
                height: modalState === 'full' ? '100%' : modalState === 'partial' ? '400px' : '40px',
                transition: {
                  type: "spring",
                  damping: 30,
                  stiffness: 300
                }
              }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              drag="y"
              dragControls={dragControls}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 200) {
                  setIsModalOpen(false)
                } else if (info.offset.y < -20) {
                  setModalState('full')
                } else if (info.offset.y > 20 && info.offset.y <= 100) {
                  setModalState('partial')
                } else if (info.offset.y > 100) {
                  setModalState('minimized')
                }
              }}
              className="bg-white dark:bg-gray-800 w-full sm:w-96 md:w-[512px] rounded-t-xl shadow-lg overflow-hidden"
              style={{
                maxWidth: 'calc(100% - 2rem)',
                margin: '0 1rem',
                height: modalState === 'full' ? 'calc(100% - 2rem)' : 'auto',
                maxHeight: 'calc(100% - 2rem)',
                zIndex: 60
              }}
            >
              <div
                className="h-10 flex items-center justify-start cursor-pointer overflow-x-auto whitespace-nowrap px-4"
                onClick={handleStatusBarClick}
                onPointerDown={(e) => dragControls.start(e)}
              >
                <ChevronUp className="h-6 w-6 text-gray-400 flex-shrink-0" />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                  {format(selectedDate, 'yyyy年MM月dd日', { locale: ja })}の付箋
                </span>
                {filteredStickyNotes.length > 0 && (
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                    （{filteredStickyNotes.length}件）
                  </span>
                )}
              </div>
              <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100% - 40px)' }}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold dark:text-white">
                    {format(selectedDate, 'yyyy年MM月dd日', { locale: ja })}の付箋
                  </h3>
                  <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <Input
                    type="text"
                    value={newStickyNote}
                    onChange={(e) => setNewStickyNote(e.target.value)}
                    placeholder="新しい付箋のタイトルを入力"
                    className="w-full"
                  />
                  <Button onClick={addStickyNote} className="w-full">追加</Button>
                  {filteredStickyNotes.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredStickyNotes.map(note => (
                        <StickyNoteItem key={note.id} note={note} />
                      ))}
                    </div>
                  ) : (
                    <p className="dark:text-gray-300">この日の付箋はありません。</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={!!editingStickyNote} onOpenChange={() => setEditingStickyNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>付箋を編集</DialogTitle>
          </DialogHeader>
          {editingStickyNote && (
            <div className="space-y-4">
              <Input
                type="text"
                value={editingStickyNote.title}
                onChange={(e) => setEditingStickyNote({ ...editingStickyNote, title: e.target.value })}
                placeholder="タイトルを入力"
              />
              <Button onClick={() => editingStickyNote && updateStickyNote(editingStickyNote)}>更新</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{format(selectedDate, 'yyyy年MM月dd日', { locale: ja })}の予定</DialogTitle>
          </DialogHeader>
          <EventCreator 
            onSave={addEvent} 
            onCancel={() => { 
              if (removedStickyNote) {
                setStickyNotes([...stickyNotes, removedStickyNote])
                setRemovedStickyNote(null)
              }
              setIsEventModalOpen(false)
            }} 
            initialTitle={draggedStickyNote ? draggedStickyNote.title : ''}
            selectedDate={selectedDate}
            events={events}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}