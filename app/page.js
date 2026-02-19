'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter(post => 
    post.disease_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginTop: 0 }}>投稿を検索</h2>
        <input
          type="text"
          placeholder="病名、症状、キーワードで検索..."
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
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: 0 }}>投稿一覧</h2>
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
          <p>まだ投稿がありません。最初の投稿者になりませんか？</p>
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
                <div>
                  <span style={{
                    backgroundColor: '#e6f2ff',
                    color: '#2c5282',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {post.disease_name || '病名未記載'}
                  </span>
                  {post.age_range && (
                    <span style={{ marginLeft: '10px', color: '#666', fontSize: '14px' }}>
                      {post.age_range}
                    </span>
                  )}
                  {post.gender && (
                    <span style={{ marginLeft: '10px', color: '#666', fontSize: '14px' }}>
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
                paddingTop: '10px'
              }}>
                投稿者: {post.nickname || '匿名'}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
