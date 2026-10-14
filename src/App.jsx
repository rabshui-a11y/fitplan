import { useEffect, useState } from 'react'
import './App.css'

const sessions = [
  { day: '월', name: '전신 HIIT', time: '25분', level: 'Growingannanas', videoUrl: 'https://www.youtube.com/results?search_query=%EC%A0%84%EC%8B%A0+HIIT+25%EB%B6%84&sp=CAMSAhAB' },
  { day: '화', name: '팔뚝 탄력', time: '10분', level: 'MadFit', videoUrl: 'https://www.youtube.com/results?search_query=%ED%8C%94%EB%9F%AD+%ED%83%84%EB%A0%A5+%EC%9A%B4%EB%8F%99+10%EB%B6%84&sp=CAMSAhAB' },
  { day: '수', name: '복부 운동', time: '10분', level: 'Pamela Reif', videoUrl: 'https://www.youtube.com/results?search_query=%EB%B3%B5%EB%B6%80+%EC%9A%B4%EB%8F%99+10%EB%B6%84&sp=CAMSAhAB' },
  { day: '목', name: '층간소음 없는 유산소', time: '20분', level: '심으뜸', videoUrl: 'https://www.youtube.com/results?search_query=%EC%B8%B5%EA%B0%84%EC%86%8C%EC%9D%8C+%EC%9C%A0%EC%82%B0%EC%86%8C+%EC%9A%B4%EB%8F%99+20%EB%B6%84&sp=CAMSAhAB' },
  { day: '금', name: '팔 + 복부', time: '20분', level: 'Growingannanas', videoUrl: 'https://www.youtube.com/results?search_query=%ED%8C%8C+%EB%B3%B5%EB%B6%80+%EC%9A%B4%EB%8F%99+20%EB%B6%84&sp=CAMSAhAB' },
  { day: '토', name: '걷기 + 스트레칭', time: '30~40분', level: '가볍게', videoUrl: 'https://www.youtube.com/results?search_query=%EA%B1%B7%EA%B8%B0+%EC%8A%A4%ED%8A%B8%EB%A0%88%EC%B9%AD+30%EB%B6%84&sp=CAMSAhAB' },
  { day: '일', name: '휴식 및 회복', time: '-', level: '산책 권장', videoUrl: 'https://www.youtube.com/results?search_query=%ED%9C%B4%EC%8B%9D+%ED%9A%8C%EB%B3%B5+%EC%82%B0%EC%B1%8C&sp=CAMSAhAB' },
]

const weekDetails = [
  ['기초 다지기', '작은 습관으로 8주 여정을 시작해요.'], ['리듬 만들기', '운동하는 생활에 몸과 마음을 적응시켜요.'], ['꾸준함 쌓기', '완벽하지 않아도 매일의 기록을 이어가요.'], ['변화 느끼기', '조금씩 가벼워지는 몸의 변화를 느껴봐요.'], ['힘 키우기', '나에게 맞는 속도로 운동 강도를 높여요.'], ['집중과 몰입', '팔과 복부에 집중해 탄탄함을 만들어가요.'], ['마지막 스퍼트', '지금까지 쌓아온 습관을 힘껏 이어가요.'], ['완주와 축하', '8주 동안의 나를 충분히 칭찬해주세요.'],
]

const weeks = weekDetails.map(([title, note], index) => ({ week: String(index + 1).padStart(2, '0'), title, note, tone: ['mint', 'blue', 'coral', 'sun'][index % 4], sessions }))

function App() {
  const [activeWeek, setActiveWeek] = useState(0)
  const [selectedSession, setSelectedSession] = useState(null)
  const [completed, setCompleted] = useState([])
  const [dailyChecks, setDailyChecks] = useState({})
  const [weights, setWeights] = useState({})
  const [weightInput, setWeightInput] = useState('')
  const [timerStartedAt, setTimerStartedAt] = useState(null)
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(0)
  const [timerNow, setTimerNow] = useState(Date.now())
  const [sessionDurations, setSessionDurations] = useState({})
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [profileName, setProfileName] = useState('지')
  const [goalMinutes, setGoalMinutes] = useState(120)
  const currentWeek = weeks[activeWeek]
  const totalWeeklySeconds = currentWeek.sessions.reduce((total, _, index) => total + (sessionDurations[`${activeWeek}-${index}`] || 0), 0)
  const completedCount = completed.filter((item) => item.startsWith(`${activeWeek}-`)).length
  const averageWorkoutSeconds = completedCount > 0 ? Math.round(totalWeeklySeconds / completedCount) : 0
  const progress = Math.round((completedCount / currentWeek.sessions.length) * 100)
  const weeklyGoalSeconds = goalMinutes * 60
  const goalBadge = totalWeeklySeconds >= weeklyGoalSeconds ? '목표 달성' : progress >= 50 ? '좋은 흐름' : '시작 단계'
  const monthlyStats = weeks.slice(0, 4).map((week, index) => {
    const total = week.sessions.reduce((sum, _, sessionIndex) => sum + (sessionDurations[`${index}-${sessionIndex}`] || 0), 0)
    return { label: `${index + 1}주`, total }
  })
  const maxMonthlyValue = Math.max(...monthlyStats.map((item) => item.total), 1)

  const toggleSession = (sessionIndex) => {
    const id = `${activeWeek}-${sessionIndex}`
    setCompleted((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])
  }

  const openSession = (sessionIndex) => setSelectedSession({ weekIndex: activeWeek, sessionIndex })
  const closeSession = () => setSelectedSession(null)
  const detail = selectedSession ? weeks[selectedSession.weekIndex].sessions[selectedSession.sessionIndex] : null
  const detailKey = selectedSession ? `${selectedSession.weekIndex}-${selectedSession.sessionIndex}` : ''
  const checklist = detail?.day === '일' ? ['휴식하기', '가볍게 산책하기', '오늘의 컨디션 기록'] : ['운동 완료', `${detail?.name} 따라하기`, '마무리 스트레칭', '물 2L 마시기']
  const checked = dailyChecks[detailKey] || []
  const detailProgress = Math.round((checked.length / checklist.length) * 100)
  const toggleCheck = (index) => setDailyChecks((items) => ({ ...items, [detailKey]: checked.includes(index) ? checked.filter((item) => item !== index) : [...checked, index] }))
  const savedWeight = weights[detailKey]
  const openYoutubeVideo = (url) => {
    if (!url) return
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const saveWeight = () => {
    const nextValue = weightInput.trim()
    if (!nextValue) return
    setWeights((items) => ({ ...items, [detailKey]: nextValue }))
  }

  const currentElapsedSeconds = timerStartedAt
    ? accumulatedSeconds + Math.floor((timerNow - timerStartedAt) / 1000)
    : accumulatedSeconds
  const displayDuration = sessionDurations[detailKey] ?? currentElapsedSeconds

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
  }

  const startWorkoutTimer = () => {
    if (timerStartedAt) return
    setTimerStartedAt(Date.now())
    setTimerNow(Date.now())
  }

  const pauseWorkoutTimer = () => {
    if (!timerStartedAt) return
    const nextElapsed = accumulatedSeconds + Math.floor((timerNow - timerStartedAt) / 1000)
    setAccumulatedSeconds(nextElapsed)
    setTimerStartedAt(null)
  }

  const handleTimerToggle = () => {
    if (timerStartedAt) {
      pauseWorkoutTimer()
      return
    }

    if (accumulatedSeconds > 0) {
      startWorkoutTimer()
      return
    }

    toggleCheck(0)
    startWorkoutTimer()
  }

  const sessionDuration = sessionDurations[detailKey] ?? 0

  useEffect(() => {
    if (!timerStartedAt) return

    const timer = window.setInterval(() => {
      setTimerNow(Date.now())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [timerStartedAt])

  useEffect(() => {
    const saved = localStorage.getItem('fitplan-state')
    if (!saved) return

    try {
      const parsed = JSON.parse(saved)
      if (parsed.completed) setCompleted(parsed.completed)
      if (parsed.dailyChecks) setDailyChecks(parsed.dailyChecks)
      if (parsed.weights) setWeights(parsed.weights)
      if (parsed.sessionDurations) setSessionDurations(parsed.sessionDurations)
      if (parsed.profileName) setProfileName(parsed.profileName)
      if (parsed.goalMinutes) setGoalMinutes(parsed.goalMinutes)
    } catch (error) {
      console.warn('Failed to restore fitplan state', error)
    }
  }, [])

  useEffect(() => {
    const payload = { completed, dailyChecks, weights, sessionDurations, profileName, goalMinutes }
    localStorage.setItem('fitplan-state', JSON.stringify(payload))
  }, [completed, dailyChecks, weights, sessionDurations, profileName, goalMinutes])

  useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }

    const onAppInstalled = () => setInstallPrompt(null)

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) {
      window.alert('이 브라우저는 자동 설치를 지원하지 않습니다.\n\n브라우저 메뉴에서 “홈 화면에 추가”를 선택해 주세요.\n• Chrome 안드로이드: 메뉴 > 홈 화면에 추가\n• Safari iPhone: 공유 버튼 > 홈 화면에 추가')
      return
    }

    installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  const handleGoalSave = () => {
    setGoalMinutes(Number(goalMinutes) || 0)
  }

  if (selectedSession) {
    return (
      <main className="app-shell detail-page">
        <header className="topbar"><button className="back-button" onClick={closeSession} aria-label="주차 목록으로 돌아가기">←</button><div className="brand"><span className="brand-mark">F</span><span>fitplan</span></div><button className="avatar" aria-label="프로필 열기">지</button></header>
        <section className="day-hero"><span className="day-number">{detail.day}</span><div><p className="eyebrow">WEEK {weeks[selectedSession.weekIndex].week} · TODAY'S PLAN</p><h1>오늘의 <em>{detail.name}</em></h1><p>{detail.time} · {detail.level}</p></div></section>
        <section className="today-card"><div className="today-heading"><span>🔥 오늘의 운동</span><strong>{detailProgress}%</strong></div><div className="detail-progress-track"><span style={{ width: `${detailProgress}%` }} /></div><div className="check-list">{checklist.map((item, index) => <button className={`check-row ${checked.includes(index) ? 'checked' : ''}`} key={item} onClick={() => toggleCheck(index)}><span className="check-box">{checked.includes(index) ? '✓' : '□'}</span><span>{item}</span></button>)}</div><div className="detail-divider" /><div className="start-area"><p>오늘도 나를 위한 시간을<br />천천히 시작해볼까요?</p><div className="start-actions"><button className="start-button" onClick={handleTimerToggle}>{timerStartedAt ? formatTime(currentElapsedSeconds) : accumulatedSeconds > 0 ? '운동 재개' : '운동 시작'} <span>→</span></button><button className="youtube-button" onClick={() => openYoutubeVideo(detail?.videoUrl)}>유튜브 영상 보기</button></div></div></section>
        <section className="record-card"><div className="record-title">📊 오늘 진행률 <strong>{detailProgress}%</strong></div><div className="record-bar"><span style={{ width: `${detailProgress}%` }} /></div><p>{displayDuration > 0 ? `운동 시간 ${formatTime(displayDuration)}` : checked.length === checklist.length ? '오늘의 루틴을 모두 완료했어요.' : '체크리스트를 하나씩 완성해보세요.'}</p></section>
        <section className="weight-card">
          <div className="weight-title">⚖️ 몸무게 기록</div>
          <div className="weight-row">
            <label className="weight-label" htmlFor="weight-input">몸무게</label>
            <input id="weight-input" className="weight-input" type="number" step="0.1" min="0" value={weightInput} onChange={(event) => setWeightInput(event.target.value)} placeholder="예: 63.5" />
            <button className="weight-save-button" onClick={saveWeight}>몸무게 저장</button>
          </div>
          <p className="weight-summary">{savedWeight ? <>저장된 몸무게 <strong>{savedWeight}kg</strong></> : '오늘의 몸무게를 기록해보세요.'}</p>
        </section>
        <button className="complete-day-button" onClick={() => {
          const finalDuration = currentElapsedSeconds || sessionDuration
          setSessionDurations((items) => ({ ...items, [detailKey]: finalDuration }))
          if (timerStartedAt) {
            setAccumulatedSeconds(finalDuration)
            setTimerStartedAt(null)
          }
          setDailyChecks((items) => ({ ...items, [detailKey]: checklist.map((_, index) => index) }))
          if (!completed.includes(detailKey)) toggleSession(selectedSession.sessionIndex)
        }}>오늘 기록 완료하기</button>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="topbar"><div className="brand"><span className="brand-mark">F</span><span>fitplan</span></div><div className="topbar-meta"><span className="streak"><span className="flame">✦</span> 3일 연속</span><button className="install-icon-button" type="button" aria-label="홈 화면에 추가" onClick={handleInstall}>{installPrompt ? '앱' : '＋'}</button><button className="avatar" aria-label="프로필 열기" onClick={() => setShowSettings(true)}>{profileName}</button></div></header>
      <section className="intro"><div><p className="eyebrow">PREMIUM HOME TRAINING</p><h1>나를 위한 8주,<br /><em>오늘도 가볍게.</em></h1><p className="intro-copy">작은 움직임이 만드는 확실한 변화.<br />하루 한 번, 내 몸에 집중하는 시간입니다.</p></div><div className="week-badge"><strong>8</strong><span>주<br />플랜</span></div></section>
      <section className="progress-card"><div className="progress-head"><div><span className="section-kicker">CURRENT PROGRESS</span><strong>{progress}% <small>완료</small></strong></div><span className="progress-caption">{completedCount} / {currentWeek.sessions.length}회 완료</span></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><div className="goal-badge"><span>목표 달성 배지</span><strong>{goalBadge}</strong></div><div className="weekly-summary"><span>이번 주 운동 시간</span><strong>{formatTime(totalWeeklySeconds)}</strong></div><div className="weekly-stats"><div className="stat-chip"><span>완료 세션</span><strong>{completedCount}</strong></div><div className="stat-chip"><span>평균 운동 시간</span><strong>{formatTime(averageWorkoutSeconds)}</strong></div></div><div className="goal-row"><span>주간 목표</span><strong>{goalMinutes}분</strong></div><p>이번 주도 좋은 흐름이에요. <b>금요일</b>까지 이어가 볼까요?</p></section>
      <section className="month-card"><div className="month-head"><span className="section-kicker">MONTHLY STATS</span><h3>월별 통계</h3></div><div className="bars">{monthlyStats.map((item) => <div className="bar-group" key={item.label}><span className="bar-label">{item.label}</span><div className="bar-track"><span style={{ height: `${Math.max(12, (item.total / maxMonthlyValue) * 100)}%` }} /></div><strong>{formatTime(item.total)}</strong></div>)}</div></section>
      {showSettings ? <section className="settings-overlay"><div className="settings-panel"><div className="settings-header"><div><span className="section-kicker">PROFILE</span><h3>설정</h3></div><button className="close-button" onClick={() => setShowSettings(false)} aria-label="설정 닫기">×</button></div><div className="settings-field"><label htmlFor="profile-name">닉네임</label><input id="profile-name" value={profileName} onFocus={(event) => event.target.select()} onChange={(event) => setProfileName(event.target.value || '지')} /></div><div className="settings-field"><label htmlFor="weekly-goal">주간 목표 시간</label><input id="weekly-goal" type="number" min="0" value={goalMinutes} onChange={(event) => setGoalMinutes(Number(event.target.value) || 0)} /></div><div className="settings-preview"><span>현재 목표</span><strong>{goalMinutes}분</strong></div><button className="save-settings" onClick={() => { handleGoalSave(); setShowSettings(false) }}>저장</button></div></section> : null}
      <section className="planner-section"><div className="section-title"><div><span className="section-kicker">YOUR JOURNEY</span><h2>8주 플랜</h2></div><span className="calendar-icon">▦</span></div><div className="week-tabs" role="tablist">{weeks.map((week, index) => <button key={week.week} className={`${index === activeWeek ? 'active' : ''} tone-${week.tone}`} onClick={() => setActiveWeek(index)} role="tab" aria-selected={index === activeWeek}><span>WEEK</span><strong>{week.week}</strong></button>)}</div><div className={`week-detail tone-${currentWeek.tone}`}><div className="detail-heading"><div><span className="detail-label">WEEK {currentWeek.week}</span><h3>{currentWeek.title}</h3><p>{currentWeek.note}</p></div><div className="sun">☼</div></div><div className="session-list">{currentWeek.sessions.map((session, index) => { const isDone = completed.includes(`${activeWeek}-${index}`); const savedDuration = sessionDurations[`${activeWeek}-${index}`]; return <button className={`session ${isDone ? 'done' : ''}`} key={session.name} onClick={() => openSession(index)}><span className="day">{session.day}<small>요일</small></span><span className="session-info"><strong>{session.name}</strong><span>{session.time} · {session.level}</span>{savedDuration ? <small className="session-duration">{formatTime(savedDuration)}</small> : null}</span><span className="check">{isDone ? '✓' : '→'}</span></button> })}</div></div></section>
      <footer><span>요일을 눌러 오늘의 기록을 시작하세요</span></footer>
    </main>
  )
}

export default App
