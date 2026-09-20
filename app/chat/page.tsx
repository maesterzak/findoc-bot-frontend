'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowUp, Loader2, Menu, Plus, Search, Sparkles, UserRound, Trash2, Pencil, Check, X } from 'lucide-react'
import { questions } from '../../data/findoc'
import { chat } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import ReactMarkdown from 'react-markdown'

interface Message {
  id: number
  sender: 'user' | 'assistant'
  content: string
  created_at: string
}

interface Conversation {
  id: number
  title: string
  time: string
  messages?: Message[]
}

function ChatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuestion = searchParams.get('question')

  const { user, logout, loading: authLoading } = useAuth()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeChat, setActiveChat] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [sending, setSending] = useState(false)
  const [deletingChatId, setDeletingChatId] = useState<number | null>(null)
  const [editingChatId, setEditingChatId] = useState<number | null>(null)
  const [editTitleInput, setEditTitleInput] = useState('')
  const [renaming, setRenaming] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const isBusy = sending || deletingChatId !== null || renaming

  // Load conversations list
  useEffect(() => {
    if (authLoading) return

    chat.getAll()
      .then((data: any) => {
        setConversations(data)
        // If initial question provided, process it
        if (initialQuestion && initialQuestion.trim()) {
          startNewChatWithPrompt(initialQuestion.trim())
        }
      })
      .catch((err) => {
        console.error('Failed to load conversations:', err)
      })
      .finally(() => setLoadingHistory(false))
  }, [authLoading])

  const startNewChatWithPrompt = async (promptText: string) => {
    if (isBusy) return
    try {
      setSending(true)
      const newConv: any = await chat.create()
      setActiveChat(newConv)
      setConversations((prev) => [newConv, ...prev])
      
      // Optimistically append user message
      const tempMsg: Message = {
        id: Date.now(),
        sender: 'user',
        content: promptText,
        created_at: new Date().toISOString()
      }
      setMessages([tempMsg])

      // Send prompt to backend
      const res: any = await chat.sendMessage(newConv.id, promptText)
      if (res.conversation) {
        setActiveChat(res.conversation)
        setMessages(res.conversation.messages || [])
        setConversations((prev) =>
          prev.map((c) => (c.id === res.conversation.id ? res.conversation : c))
        )
      }
    } catch (err) {
      console.error('Failed to send initial question:', err)
    } finally {
      setSending(false)
    }
  }

  const loadChatDetail = async (id: number) => {
    if (isBusy || editingChatId === id) return
    try {
      const data: any = await chat.get(id)
      setActiveChat(data)
      setMessages(data.messages || [])
      setOpen(false)
    } catch (err) {
      console.error('Failed to load chat details:', err)
    }
  }

  const handleSend = async (val = input) => {
    const text = val.trim()
    if (!text || isBusy) return

    setInput('')
    setOpen(false)
    setSending(true)

    try {
      let currentChat = activeChat

      // Create conversation if none active
      if (!currentChat) {
        const created: any = await chat.create()
        currentChat = created
        setActiveChat(created)
        setConversations((prev) => [created, ...prev])
      }

      // Optimistically append user message
      const tempUserMsg: Message = {
        id: Date.now(),
        sender: 'user',
        content: text,
        created_at: new Date().toISOString()
      }
      setMessages((prev) => [...prev, tempUserMsg])

      if (!currentChat) return

      // Send to backend
      const res: any = await chat.sendMessage(currentChat.id, text)
      if (res.conversation) {
        setActiveChat(res.conversation)
        setMessages(res.conversation.messages || [])
        // Update list
        setConversations((prev) =>
          prev.map((c) => (c.id === res.conversation.id ? res.conversation : c))
        )
      }
    } catch (err) {
      console.error('Failed to send message:', err)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please check your backend connection.',
          created_at: new Date().toISOString()
        }
      ])
    } finally {
      setSending(false)
    }
  }

  const handleRenameChat = async (id: number, newTitle: string) => {
    const trimmed = newTitle.trim()
    if (!trimmed || isBusy) {
      setEditingChatId(null)
      return
    }

    try {
      setRenaming(true)
      const res: any = await chat.rename(id, trimmed)
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: res.title || trimmed } : c))
      )
      if (activeChat?.id === id) {
        setActiveChat((prev) => (prev ? { ...prev, title: res.title || trimmed } : null))
      }
    } catch (err) {
      console.error('Failed to rename chat:', err)
    } finally {
      setRenaming(false)
      setEditingChatId(null)
    }
  }

  const handleDeleteChat = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    if (isBusy) return
    try {
      setDeletingChatId(id)
      await chat.delete(id)
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (activeChat?.id === id) {
        setActiveChat(null)
        setMessages([])
      }
    } catch (err) {
      console.error('Failed to delete chat:', err)
    } finally {
      setDeletingChatId(null)
    }
  }

  const handleSignOut = async () => {
    if (isBusy) return
    await logout()
    router.push('/')
  }

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'AM'

  return (
    <main className="chat-app-new">
      <button
        className={open ? 'chat-sidebar-backdrop open' : 'chat-sidebar-backdrop'}
        aria-label="Close navigation"
        onClick={() => setOpen(false)}
      />
      
      <aside className={open ? 'chat-sidebar-new open' : 'chat-sidebar-new'}>
        <div className="chat-brand">
          <span className="brand-mark"><Sparkles size={15}/></span> finmaester
        </div>

        <button
          className="new-chat-new"
          disabled={isBusy}
          style={{ opacity: isBusy ? 0.6 : 1, cursor: isBusy ? 'not-allowed' : 'pointer' }}
          onClick={() => {
            if (isBusy) return
            setActiveChat(null)
            setMessages([])
            setOpen(false)
          }}
        >
          <Plus size={16}/> New chat
        </button>

        <div className="chat-search">
          <Search size={15}/>
          <input
            placeholder="Search chats"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <span className="chat-history-label">Recent</span>

        {loadingHistory ? (
          <div style={{ padding: '12px', fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Loader2 size={14} className="animate-spin" /> Loading chats...
          </div>
        ) : filteredConversations.length === 0 ? (
          <div style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>No recent chats found</div>
        ) : (
          filteredConversations.map((c) => {
            const isEditing = editingChatId === c.id
            const isDeleting = deletingChatId === c.id

            return (
              <div
                className={`chat-history-item ${activeChat?.id === c.id ? 'active' : ''}`}
                key={c.id}
                onClick={() => !isBusy && !isEditing && loadChatDetail(c.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: isBusy && !isDeleting && !isEditing ? 0.7 : 1,
                  cursor: isBusy || isEditing ? 'default' : 'pointer',
                  paddingRight: '6px'
                }}
              >
                {isEditing ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleRenameChat(c.id, editTitleInput)
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, width: '100%' }}
                  >
                    <input
                      autoFocus
                      type="text"
                      value={editTitleInput}
                      onChange={(e) => setEditTitleInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setEditingChatId(null)
                      }}
                      style={{
                        background: '#1e293b',
                        border: '1px solid #3b82f6',
                        color: '#f8fafc',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '13px',
                        fontWeight: 500,
                        width: '100%',
                        outline: 'none',
                        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={renaming}
                      style={{
                        background: '#10b981',
                        border: 'none',
                        color: '#ffffff',
                        borderRadius: '4px',
                        padding: '4px 6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                      title="Save title"
                    >
                      {renaming ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />}
                    </button>
                    <button
                      type="button"
                      disabled={renaming}
                      onClick={() => setEditingChatId(null)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#f87171',
                        borderRadius: '4px',
                        padding: '4px 6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                      title="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </form>
                ) : (
                  <>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'left' }}>
                      {c.title}
                      <small style={{ display: 'block' }}>{c.time}</small>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {/* Rename Icon */}
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!isBusy) {
                            setEditingChatId(c.id)
                            setEditTitleInput(c.title)
                          }
                        }}
                        style={{ opacity: isBusy ? 0.3 : 0.5, cursor: isBusy ? 'not-allowed' : 'pointer' }}
                        title="Rename chat"
                      >
                        <Pencil size={13} />
                      </span>

                      {/* Delete Icon / Spinner */}
                      <span
                        onClick={(e) => !isBusy && handleDeleteChat(e, c.id)}
                        style={{ opacity: isBusy ? 0.3 : 0.5, cursor: isBusy ? 'not-allowed' : 'pointer' }}
                        title="Delete chat"
                      >
                        {isDeleting ? (
                          <Loader2 size={13} className="animate-spin" style={{ color: '#ef4444' }} />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )
          })
        )}

        <div className="chat-sidebar-bottom">
          <Link href="/profile" onClick={() => setOpen(false)}><UserRound size={16}/> Profile</Link>
          <Link href="/settings" onClick={() => setOpen(false)}>Settings</Link>
          <button onClick={handleSignOut} disabled={isBusy} style={{ background: 'none', border: 'none', color: 'inherit', font: 'inherit', cursor: isBusy ? 'not-allowed' : 'pointer', textAlign: 'left', padding: 0 }}>Sign out</button>
        </div>
      </aside>

      <section className="chat-main-new">
        <header className="chat-top-new">
          <button className="chat-menu-new" onClick={() => setOpen(true)} aria-label="Open navigation">
            <Menu size={19}/>
          </button>
          <div>
            <span>FinMaester AI <i/></span>
            <strong>{activeChat?.title || 'Core banking assistant'}</strong>
          </div>
          <Link href="/settings" className="user-avatar-badge" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#3b82f6', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
            {userInitials}
          </Link>
        </header>

        <div className="chat-scroll-new">
          {!messages.length ? (
            <div className="chat-welcome-new">
              <div className="welcome-mark"><Sparkles size={22}/></div>
              <h1>What would you like to know<br/>about core banking?</h1>
              <p>Ask about systems, APIs, payments, operations, and more.</p>
              <div className="chat-suggestions-new">
                {questions.map((q) => (
                  <button key={q} disabled={isBusy} onClick={() => !isBusy && handleSend(q)} style={{ opacity: isBusy ? 0.6 : 1, cursor: isBusy ? 'not-allowed' : 'pointer' }}>
                    {q}<ArrowUp size={14}/>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="chat-thread-new">
              {messages.map((msg, i) => (
                <div key={msg.id || i}>
                  {msg.sender === 'user' ? (
                    <div className="bubble-user-new">{msg.content}</div>
                  ) : (
                    <div className="answer-new">
                      <span className="answer-avatar"><Sparkles size={13}/></span>
                      <div>
                        <b>FinMaester</b>
                        <div className="markdown-content">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                        <div className="answer-actions-new">
                          <button onClick={() => navigator.clipboard.writeText(msg.content)}>Copy</button>
                          <button>Helpful</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {sending && (
                <div className="answer-new">
                  <span className="answer-avatar"><Sparkles size={13}/></span>
                  <div>
                    <b>FinMaester</b>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                      <Loader2 size={16} className="animate-spin" /> Analyzing core banking database...
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="composer-new">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                if (!isBusy) handleSend()
              }
            }}
            placeholder="Ask FinMaester anything about core banking..."
            rows={1}
            disabled={isBusy}
          />
          <button onClick={() => !isBusy && handleSend()} aria-label="Send message" disabled={isBusy}>
            {sending ? <Loader2 size={17} className="animate-spin" /> : <ArrowUp size={17}/>}
          </button>
          <small>FinMaester provides AI-assisted troubleshooting. Always verify critical recommendations.</small>
        </div>
      </section>
    </main>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#090d16', color: '#fff' }}>
        <Loader2 size={24} className="animate-spin" />
      </div>
    }>
      <ChatContent />
    </Suspense>
  )
}
