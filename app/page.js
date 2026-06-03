'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [user, setUser] = useState(null)
  const [bookmarkPostIds, setBookmarkPostIds] = useState(new Set())
  const [authEmail, setAuthEmail] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [bookmarkLoadingId, setBookmarkLoadingId] = useState(null)

  useEffect(() => {
    fetchSession()
    fetchCategories()
    fetchPosts()
  }, [])

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchSession() {
    const {
      data: { session }
    } = await supabase.auth.getSession()
    applySession(session)
  }

  function applySession(session) {
    const currentUser = session?.user || null
    setUser(currentUser)

    if (currentUser) {
      fetchBookmarks(currentUser.id)
    } else {
      setBookmarkPostIds(new Set())
    }
  }

  async function fetchCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('display_order')
    setCategories(data || [])
  }

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          diseases (
            id,
            primary_name,
            synonyms,
            category_id,
            categories (
              name
            )
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchBookmarks(userId) {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('post_id')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching bookmarks:', error)
      return
    }

    setBookmarkPostIds(new Set((data || []).map((item) => item.post_id)))
  }

  async function handleEmailSignIn() {
    if (!authEmail) {
      setAuthMessage('メールアドレスを入力してください。')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail)) {
      setAuthMessage('正しいメールアドレス形式で入力してください。')
      return
    }

    setAuthMessage('')
    const { error } = await supabase.auth.signInWithOtp({
      email: authEmail,
      options: {
        emailRedirectTo: window.location.origin
      }
    })

    if (error) {
      setAuthMessage('ログインメールの送信に失敗しました。')
      return
    }

    setAuthMessage('ログインメールを送信しました。メールをご確認ください。')
  }

  async function handleGoogleSignIn() {
    setAuthMessage('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })

    if (error) {
      setAuthMessage('Googleログインに失敗しました。')
    }
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      setAuthMessage('ログアウトに失敗しました。')
      return
    }
    setUser(null)
    setBookmarkPostIds(new Set())
    setAuthMessage('')
  }

  async function toggleBookmark(postId) {
    if (!user) {
      setAuthMessage('お気に入りを使うにはログインしてください。')
      return
    }

    setBookmarkLoadingId(postId)
    const isBookmarked = bookmarkPostIds.has(postId)

    try {
      if (isBookmarked) {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId)
        if (error) throw error
        setBookmarkPostIds((prev) => {
          const next = new Set(prev)
          next.delete(postId)
          return next
        })
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .insert([{ user_id: user.id, post_id: postId }])
        if (error) throw error
        setBookmarkPostIds((prev) => {
          const next = new Set(prev)
          next.add(postId)
          return next
        })
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      setAuthMessage(
        isBookmarked
          ? 'お気に入りの削除に失敗しました。'
          : 'お気に入りの保存に失敗しました。'
      )
    } finally {
      setBookmarkLoadingId(null)
    }
  }

  const filteredPosts = posts.filter(post => {
    // カテゴリフィルター
    if (selectedCategory && post.diseases?.category_id !== selectedCategory) {
      return false
    }

    // キーワード検索
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const diseaseName = post.diseases?.primary_name?.toLowerCase() || ''
      const synonyms = post.diseases?.synonyms?.join(' ').toLowerCase() || ''
      const content = post.content?.toLowerCase() || ''
      const nickname = post.nickname?.toLowerCase() || ''
      
      return diseaseName.includes(term) || 
             synonyms.includes(term) || 
             content.includes(term) || 
             nickname.includes(term)
    }

    return true
  })

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginTop: 0 }}>お気に入り機能</h2>
        {user ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ color: '#444', fontSize: '14px' }}>ログイン中: {user.email}</span>
            <button
              onClick={handleSignOut}
              style={{
                backgroundColor: 'white',
                color: '#2c5282',
                padding: '8px 16px',
                border: '1px solid #2c5282',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ログアウト
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="メールアドレス"
                style={{
                  flex: 1,
                  minWidth: '220px',
                  padding: '10px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
              <button
                onClick={handleEmailSignIn}
                style={{
                  backgroundColor: '#2c5282',
                  color: 'white',
                  padding: '10px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                メールでログイン
              </button>
              <button
                onClick={handleGoogleSignIn}
                style={{
                  backgroundColor: 'white',
                  color: '#2c5282',
                  padding: '10px 16px',
                  border: '1px solid #2c5282',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Googleログイン
              </button>
            </div>
            <small style={{ color: '#666' }}>
              ログインすると気になる投稿をお気に入り保存できます。
            </small>
          </div>
        )}
        {authMessage && (
          <p style={{ marginBottom: 0, marginTop: '10px', fontSize: '14px', color: '#444' }}>
            {authMessage}
          </p>
        )}
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginTop: 0 }}>投稿を検索</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
            カテゴリで絞り込み
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          >
            <option value="">全てのカテゴリ</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
            キーワード検索
          </label>
          <input
            type="text"
            placeholder="病名、症状、キーワードで検索...（例：膵臓癌、抗がん剤、味覚障害）"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
          <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
            ※「膵臓がん」で検索すると「膵臓癌」「すい臓がん」なども自動的に表示されます
          </small>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: 0 }}>
          投稿一覧 
          {(searchTerm || selectedCategory) && (
            <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#666', marginLeft: '10px' }}>
              （{filteredPosts.length}件）
            </span>
          )}
        </h2>
        <Link href="/post" style={{
          backgroundColor: '#2c5282',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '4px',
          textDecoration: 'none',
          fontWeight: 'bold'
        }}>
          新規投稿
        </Link>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>読み込み中...</p>
      ) : filteredPosts.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {searchTerm || selectedCategory ? (
            <p>検索条件に一致する投稿が見つかりませんでした。</p>
          ) : (
            <p>まだ投稿がありません。最初の投稿者になりませんか？</p>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '10px',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  {post.diseases?.categories && (
                    <span style={{
                      backgroundColor: '#f0f0f0',
                      color: '#555',
                      padding: '3px 10px',
                      borderRadius: '10px',
                      fontSize: '12px'
                    }}>
                      {post.diseases.categories.name}
                    </span>
                  )}
                  <span style={{
                    backgroundColor: '#e6f2ff',
                    color: '#2c5282',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {post.diseases?.primary_name || post.disease_name || '病名未記載'}
                  </span>
                  {post.age_range && (
                    <span style={{ color: '#666', fontSize: '14px' }}>
                      {post.age_range}
                    </span>
                  )}
                  {post.gender && (
                    <span style={{ color: '#666', fontSize: '14px' }}>
                      {post.gender}
                    </span>
                  )}
                </div>
                <span style={{ color: '#999', fontSize: '14px' }}>
                  {new Date(post.created_at).toLocaleDateString('ja-JP')}
                </span>
              </div>
              
              <p style={{ 
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
                margin: '15px 0'
              }}>
                {post.content}
              </p>
              
              <div style={{
                fontSize: '14px',
                color: '#666',
                borderTop: '1px solid #eee',
                paddingTop: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <span>投稿者: {post.nickname || '匿名'}</span>
                <button
                  onClick={() => toggleBookmark(post.id)}
                  disabled={bookmarkLoadingId === post.id}
                  aria-pressed={bookmarkPostIds.has(post.id)}
                  aria-label={
                    bookmarkPostIds.has(post.id)
                      ? 'お気に入りから削除'
                      : 'お気に入りに保存'
                  }
                  style={{
                    backgroundColor: bookmarkPostIds.has(post.id) ? '#ffe9a8' : 'white',
                    color: '#8a6d1d',
                    padding: '6px 12px',
                    border: '1px solid #d7b65a',
                    borderRadius: '4px',
                    cursor: bookmarkLoadingId === post.id ? 'not-allowed' : 'pointer',
                    fontSize: '13px'
                  }}
                >
                  {bookmarkLoadingId === post.id
                    ? '保存中...'
                    : bookmarkPostIds.has(post.id)
                      ? '★ お気に入り済み'
                      : '☆ お気に入りに保存'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
