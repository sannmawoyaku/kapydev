'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase' // パスはご自身の環境に合わせてください
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
          standpoint: formData.standpoint,
          stage: formData.stage || null,
          difficulties: formData.difficulties || null,
          tips: formData.tips || null,
          message_to_others: formData.message_to_others || null,
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
    
    if (name === 'category_id') {
      setFormData(prev => ({ ...prev, disease_id: '' }))
    }
  }

  // 共通の入力スタイル（Tailwind CSS）
  const inputClass = "w-full p-4 text-base border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all";
  const labelClass = "block mb-2 font-bold text-slate-700";

  return (
    <main className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* ヘッダー部分 */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">体験を投稿する</h2>
          <p className="text-slate-600 text-sm md:text-base">
            あなたの経験や工夫が、今同じように悩んでいる誰かの希望になります。
          </p>
        </div>

        {/* 免責事項（トップに配置） */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-r-xl mb-8 shadow-sm">
          <p className="text-sm text-amber-800 leading-relaxed">
            <strong className="font-bold">免責事項：</strong>
            この掲示板は患者やご家族の体験談を共有する場であり、医学的アドバイスではありません。治療の判断は必ず主治医とご相談ください。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* セクション1：基本情報 */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-blue-800 border-b-2 border-blue-100 pb-2 mb-6">
              1. あなたと病気について
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className={labelClass}>病気のカテゴリ <span className="text-red-500 ml-1 text-sm">*</span></label>
                <select name="category_id" value={formData.category_id} onChange={handleChange} required className={inputClass}>
                  <option value="">選択してください</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>病名 <span className="text-red-500 ml-1 text-sm">*</span></label>
                <select name="disease_id" value={formData.disease_id} onChange={handleChange} required disabled={!formData.category_id} className={`${inputClass} ${!formData.category_id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <option value="">{formData.category_id ? '選択してください' : '先にカテゴリを選択してください'}</option>
                  {filteredDiseases.map(disease => (
                    <option key={disease.id} value={disease.id}>
                      {disease.primary_name}
                      {disease.synonyms && disease.synonyms.length > 0 && ` (${disease.synonyms.slice(0, 2).join(', ')})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>あなたの立場 <span className="text-red-500 ml-1 text-sm">*</span></label>
                  <select name="standpoint" value={formData.standpoint} onChange={handleChange} required className={inputClass}>
                    <option value="">選択してください</option>
                    <option value="患者本人">患者本人</option>
                    <option value="家族">家族</option>
                    <option value="友人・知人">友人・知人</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>時期（任意）</label>
                  <select name="stage" value={formData.stage} onChange={handleChange} className={inputClass}>
                    <option value="">選択しない</option>
                    <option value="診断直後">診断直後</option>
                    <option value="治療中">治療中</option>
                    <option value="寛解・経過観察">寛解・経過観察</option>
                    <option value="終末期">終末期</option>
                    <option value="その他">その他</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* セクション2：体験の共有 */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-emerald-700 border-b-2 border-emerald-100 pb-2 mb-2">
              2. 体験を共有する
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              ※以下の3つのうち、<strong className="text-emerald-600">最低1つ</strong>はご記入ください。箇条書きでも、短い一言でも構いません。
            </p>

            <div className="space-y-6">
              <div>
                <label className={labelClass}>直面した困りごと・辛かったこと</label>
                <textarea name="difficulties" value={formData.difficulties} onChange={handleChange} rows="4" className={inputClass} placeholder="例：抗がん剤のあと、水すら苦く感じて何も食べられなくなった。夜が来るのが不安だった。"/>
              </div>

              <div>
                <label className={labelClass}>やってみて良かった工夫・準備</label>
                <textarea name="tips" value={formData.tips} onChange={handleChange} rows="4" className={inputClass} placeholder="例：氷を舐めたり、冷やしたゼリーなら喉を通った。家族が無理に食べさせず、横にいてくれたのが救いだった。"/>
              </div>

              <div>
                <label className={labelClass}>同じ境遇の人へ一言</label>
                <textarea name="message_to_others" value={formData.message_to_others} onChange={handleChange} rows="3" className={inputClass} placeholder="例：一人じゃないです。辛い時は無理せず、周りを頼ってください。"/>
              </div>
            </div>
          </section>

          {/* セクション3：プロフィール */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-700 border-b-2 border-slate-100 pb-2 mb-6">
              3. プロフィール（すべて任意）
            </h3>

            <div className="space-y-6">
              <div>
                <label className={labelClass}>ニックネーム</label>
                <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} className={inputClass} placeholder="未入力の場合は「匿名」となります" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>年代</label>
                  <select name="age_range" value={formData.age_range} onChange={handleChange} className={inputClass}>
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
                  <label className={labelClass}>性別</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                    <option value="">選択しない</option>
                    <option value="男性">男性</option>
                    <option value="女性">女性</option>
                    <option value="回答しない">回答しない</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* 同意と送信 */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
            <label className="flex items-start cursor-pointer group">
              <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-1 w-6 h-6 text-blue-600 rounded border-slate-300 focus:ring-blue-500 transition-all cursor-pointer"/>
              <span className="ml-4 text-sm text-slate-600 leading-relaxed group-hover:text-slate-800 transition-colors">
                <strong className="text-red-500 font-bold block mb-1">【同意必須】</strong>
                本サイトの情報は個人の体験であり、医学的なアドバイスではありません。特定の治療法の推奨や、個人を特定できる情報の投稿を行わないことに同意します。
              </span>
            </label>
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-center font-bold ${message.includes('失敗') ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
              {message}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button type="submit" disabled={submitting} className={`flex-1 py-4 text-lg font-bold rounded-xl text-white transition-all shadow-md hover:shadow-lg ${submitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}>
              {submitting ? '送信中...' : 'この内容で投稿する'}
            </button>
            <button type="button" onClick={() => router.push('/')} className="px-8 py-4 text-lg font-bold rounded-xl text-slate-600 bg-white border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95">
              キャンセル
            </button>
          </div>

        </form>
      </div>
    </main>
  )
}
