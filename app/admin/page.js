'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)

  // 簡易パスワード認証（後でより安全な方法に変更可能）
  const ADMIN_PASSWORD = 'admin2026' // 後で変更してください

  useEffect(() => {
    if (authenticated) {
      fetchPosts()
    }
  }, [authenticated, filter])

  async function fetchPosts() {
    setLoading(true)
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          diseases (
            primary_name,
            categories (name)
          ),
          reports (count)
        `)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updatePostStatus(postId, newStatus) {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ 
          status: newStatus,
          approved_at: newStatus === 'approved' ? new Date().toISOString() : null,
          approved_by: 'admin'
        })
        .eq('id', postId)

      if (error) throw error
      
      alert(`投稿を${newStatus === 'approved' ? '承認' : newStatus === 'rejected' ? '却下' : '削除'}しました`)
      fetchPosts()
    } catch (error) {
      console.error('Error updating post:', error)
      alert('エラーが発生しました')
    }
  }

  async function deletePost(postId) {
    if (!confirm('本当にこの投稿を削除しますか？')) return

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) throw error
      
      alert('投稿を削除しました')
      fetchPosts()
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('エラーが発生しました')
    }
  }

  if (!authenticated) {
    return (
      <main style={{ maxWidth: '500px', margin: '100px auto', padding: '20px' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginTop: 0, textAlign: 'center' }}>管理者ログイン</h2>
          <form onSubmit={(e) => {
            e.preventDefault()
            if (password === ADMIN_PASSWORD) {
              setAuthenticated(true)
            } else {
              alert('パスワードが間違っています')
            }
          }}>
            <input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '15px',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="submit"
              style={{
                width: '100%',
                backgroundColor: '#2c5282',
                color: 'white',
                padding: '12px',
                fontSize: '16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ログイン
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1 style={{ margin: 0 }}>管理画面</h1>
        
          href="/"
          style={{
            color: '#2c5282',
            textDecoration: 'none',
            fontSize: '14px'
          }}
        >
          ← サイトに戻る
        </a>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('pending')}
            style={{
              padding: '10px 20px',
              backgroundColor: filter === 'pending' ? '#2c5282' : 'white',
              color: filter === 'pending' ? 'white' : '#2c5282',
              border: '1px solid #2c5282',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            承認待ち
          </button>
          <button
            onClick={() => setFilter('approved')}
            style={{
              padding: '10px 20px',
              backgroundColor: filter === 'approved' ? '#2c5282' : 'white',
              color: filter === 'approved' ? 'white' : '#2c5282',
              border: '1px solid #2c5282',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            承認済み
          </button>
          <button
            onClick={() => setFilter('rejected')}
            style={{
              padding: '10px 20px',
              backgroundColor: filter === 'rejected' ? '#2c5282' : 'white',
              color: filter === 'rejected' ? 'white' : '#2c5282',
              border: '1px solid #2c5282',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            却下済み
          </button>
          <button
            onClick={() => setFilter('reported')}
            style={{
              padding: '10px 20px',
              backgroundColor: filter === 'reported' ? '#dc3545' : 'white',
              color: filter === 'reported' ? 'white' : '#dc3545',
              border: '1px solid #dc3545',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            通報あり
          </button>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '10px 20px',
              backgroundColor: filter === 'all' ? '#2c5282' : 'white',
              color: filter === 'all' ? 'white' : '#2c5282',
              border: '1px solid #2c5282',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            全て
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>読み込み中...</p>
      ) : posts.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <p>該当する投稿がありません</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: post.status === 'reported' ? '2px solid #dc3545' : 'none'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '10px',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{
                    backgroundColor: 
                      post.status === 'pending' ? '#ffc107' :
                      post.status === 'approved' ? '#28a745' :
                      post.status === 'rejected' ? '#6c757d' :
                      '#dc3545',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {post.status === 'pending' ? '承認待ち' :
                     post.status === 'approved' ? '承認済み' :
                     post.status === 'rejected' ? '却下' :
                     '通報あり'}
                  </span>
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
                    {post.diseases?.primary_name || '病名未記載'}
                  </span>
                </div>
                <span style={{ color: '#999', fontSize: '14px' }}>
                  {new Date(post.created_at).toLocaleDateString('ja-JP')} {new Date(post.created_at).toLocaleTimeString('ja-JP')}
                </span>
              </div>

              <p style={{
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
                margin: '15px 0',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px'
              }}>
                {post.content}
              </p>

              <div style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '15px',
                paddingBottom: '15px',
                borderBottom: '1px solid #eee'
              }}>
                <div>投稿者: {post.nickname || '匿名'}</div>
                {post.age_range && <div>年齢層: {post.age_range}</div>}
                {post.gender && <div>性別: {post.gender}</div>}
                {post.email && <div>メール: {post.email}</div>}
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {post.status !== 'approved' && (
                  <button
                    onClick={() => updatePostStatus(post.id, 'approved')}
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    承認
                  </button>
                )}
                {post.status !== 'rejected' && (
                  <button
                    onClick={() => updatePostStatus(post.id, 'rejected')}
                    style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    却下
                  </button>
                )}
                <button
                  onClick={() => deletePost(post.id)}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
