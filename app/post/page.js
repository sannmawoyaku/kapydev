'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function PostPage() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [diseases, setDiseases] = useState([])
  const [filteredDiseases, setFilteredDiseases] = useState([])
  const [formData, setFormData] = useState({
    category_id: '',
    disease_id: '',
    standpoint: '',
    stage: '',
    difficulties: '',
    tips: '',
    message_to_others: '',
    nickname: '',
    age_range: '',
    gender: '',
    email: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchDiseases()
  }, [])

  useEffect(() => {
    if (formData.category_id) {
      const filtered = diseases.filter(d => d.category_id === formData.category_id)
      setFilteredDiseases(filtered)
    } else {
      setFilteredDiseases([])
    }
  }, [formData.category_id, diseases])

  async function fetchCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('display_order')
    setCategories(data || [])
  }

  async function fetchDiseases() {
    const { data } = await supabase
      .from('diseases')
      .select('*')
    setDiseases(data || [])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
 if (!formData.disease_id || !formData.standpoint) {
      setMessage('病名と立場は必須です')
      return
    }

    // 少なくとも1つの記述項目が入力されているか確認
    if (!formData.difficulties && !formData.tips && !formData.message_to_others) {
      setMessage('困りごと、工夫、メッセージのいずれか1つは入力してください')
      return
    }

    if (!agreedToTerms) {
      setMessage('免責事項に同意してください')
      return
    }

    setSubmitting(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('posts')
        .insert([{
          disease_id: formData.disease_id,
          content: formData.content,
          nickname: formData.nickname || '匿名',
          age_range: formData.age_range || null,
          gender: formData.gender || null,
          email: formData.email || null
        }])

      if (error) throw error

      setMessage('投稿が完了しました！')
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (error) {
      console.error('Error submitting post:', error)
      setMessage('投稿に失敗しました。もう一度お試しください。')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // カテゴリが変更されたら病名選択をリセット
    if (name === 'category_id') {
      setFormData(prev => ({ ...prev, disease_id: '' }))
    }
  }

  return (
    <main style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginTop: 0 }}>新規投稿</h2>
        
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          padding: '15px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          <strong>免責事項：</strong>
          この掲示板は患者の体験談を共有する場です。医学的アドバイスではありません。
          治療の判断は必ず医師と相談してください。
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              病気のカテゴリ <span style={{ color: 'red' }}>*必須</span>
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            >
              <option value="">カテゴリを選択してください</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              病名 <span style={{ color: 'red' }}>*必須</span>
            </label>
            <select
              name="disease_id"
              value={formData.disease_id}
              onChange={handleChange}
              required
              disabled={!formData.category_id}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
                backgroundColor: !formData.category_id ? '#f5f5f5' : 'white'
              }}
            >
              <option value="">
                {formData.category_id ? '病名を選択してください' : 'まずカテゴリを選択してください'}
              </option>
              {filteredDiseases.map(disease => (
                <option key={disease.id} value={disease.id}>
                  {disease.primary_name}
                  {disease.synonyms && disease.synonyms.length > 0 && 
                    ` (${disease.synonyms.slice(0, 2).join(', ')})`
                  }
                </option>
              ))}
            </select>
            <small style={{ color: '#666', fontSize: '12px' }}>
              ※同義語も検索で自動的にヒットします（例：「膵臓がん」で検索すると「膵臓癌」「すい臓がん」も表示）
            </small>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              投稿内容 <span style={{ color: 'red' }}>*必須</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="症状、治療内容、副作用、日常生活での工夫など、あなたの体験を自由に記載してください"
              required
              rows="10"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              ニックネーム（任意）
            </label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              placeholder="未入力の場合は「匿名」と表示されます"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                年齢層（任意）
              </label>
              <select
                name="age_range"
                value={formData.age_range}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">選択しない</option>
                <option value="10代以下">10代以下</option>
                <option value="20代">20代</option>
                <option value="30代">30代</option>
                <option value="40代">40代</option>
                <option value="50代">50代</option>
                <option value="60代">60代</option>
                <option value="70代以上">70代以上</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                性別（任意）
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">選択しない</option>
                <option value="男性">男性</option>
                <option value="女性">女性</option>
                <option value="回答しない">回答しない</option>
              </select>
            </div>
          </div>

          <div style={{
            backgroundColor: '#fff3cd',
            border: '2px solid #ffc107',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              cursor: 'pointer',
              fontSize: '14px',
              lineHeight: '1.6'
            }}>
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={{
                  marginRight: '10px',
                  marginTop: '3px',
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              />
              <span>
                <strong style={{ color: '#d63031' }}>【必読・同意必須】</strong><br/>
                本サイトの情報は個人の体験であり、医学的なアドバイスではありません。治療に関する決定は必ず主治医に相談してください。また、特定の治療法やサプリメント等の推奨・販売誘導、個人や医療機関を特定できる情報の投稿を行わないことに同意します。
              </span>
            </label>
          </div>

          {message && (
            <div style={{
              padding: '10px',
              marginBottom: '15px',
              borderRadius: '4px',
              backgroundColor: message.includes('失敗') ? '#f8d7da' : '#d4edda',
              color: message.includes('失敗') ? '#721c24' : '#155724',
              border: `1px solid ${message.includes('失敗') ? '#f5c6cb' : '#c3e6cb'}`
            }}>
              {message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: submitting ? '#ccc' : '#2c5282',
                color: 'white',
                padding: '12px 30px',
                fontSize: '16px',
                border: 'none',
                borderRadius: '4px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {submitting ? '投稿中...' : '投稿する'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              style={{
                backgroundColor: 'white',
                color: '#2c5282',
                padding: '12px 30px',
                fontSize: '16px',
                border: '1px solid #2c5282',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
