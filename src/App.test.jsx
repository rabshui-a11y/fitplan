import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App weight tracking', () => {
  it('lets a user save today\'s body weight', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /전신 HIIT/i }))

    const input = screen.getByLabelText(/몸무게/i)
    await user.clear(input)
    await user.type(input, '63.5')
    await user.click(screen.getByRole('button', { name: /몸무게 저장/i }))

    expect(screen.getByText(/저장된 몸무게/i)).toHaveTextContent('63.5kg')
  })

  it('starts and pauses the workout from the same button while opening the video button', () => {
    vi.useFakeTimers()
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /전신 HIIT/i }))
    const timerButton = screen.getByRole('button', { name: /운동 시작/i })
    fireEvent.click(timerButton)
    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByRole('button', { name: /00:00:02/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /일시정지/i })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /00:00:02/i }))
    expect(screen.getByRole('button', { name: /운동 재개/i })).toBeInTheDocument()
    expect(screen.getByText(/운동 시간/i)).toHaveTextContent('00:00:02')

    fireEvent.click(screen.getByRole('button', { name: /유튜브 영상 보기/i }))
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('search_query=%EC%A0%84%EC%8B%A0+HIIT+25%EB%B6%84'),
      '_blank',
      'noopener,noreferrer',
    )
    vi.useRealTimers()
  })

  it('opens a YouTube result page that matches the selected workout name', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /전신 HIIT/i }))
    fireEvent.click(screen.getByRole('button', { name: /유튜브 영상 보기/i }))

    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('search_query=%EC%A0%84%EC%8B%A0+HIIT+25%EB%B6%84'),
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('saves the final workout duration when the session is completed', () => {
    vi.useFakeTimers()
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /전신 HIIT/i }))
    fireEvent.click(screen.getByRole('button', { name: /운동 시작/i }))
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    fireEvent.click(screen.getByRole('button', { name: /오늘 기록 완료하기/i }))

    expect(screen.getByText(/운동 시간/i)).toHaveTextContent('00:00:05')
    expect(screen.getByRole('button', { name: /운동 재개/i })).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('shows the saved workout duration on the session list card', () => {
    vi.useFakeTimers()
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /전신 HIIT/i }))
    fireEvent.click(screen.getByRole('button', { name: /운동 시작/i }))
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    fireEvent.click(screen.getByRole('button', { name: /오늘 기록 완료하기/i }))
    fireEvent.click(screen.getByRole('button', { name: /주차 목록으로 돌아가기/i }))

    expect(screen.getAllByText('00:00:05').length).toBeGreaterThan(0)
    vi.useRealTimers()
  })

  it('shows the total weekly workout time on the home summary', () => {
    vi.useFakeTimers()
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /전신 HIIT/i }))
    fireEvent.click(screen.getByRole('button', { name: /운동 시작/i }))
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    fireEvent.click(screen.getByRole('button', { name: /오늘 기록 완료하기/i }))
    fireEvent.click(screen.getByRole('button', { name: /주차 목록으로 돌아가기/i }))

    const weeklySummary = screen.getByText(/이번 주 운동 시간/i).closest('.weekly-summary')
    expect(weeklySummary).toHaveTextContent('00:00:05')
    vi.useRealTimers()
  })

  it('shows the weekly stat summary with completion and average workout time', () => {
    vi.useFakeTimers()
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /전신 HIIT/i }))
    fireEvent.click(screen.getByRole('button', { name: /운동 시작/i }))
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    fireEvent.click(screen.getByRole('button', { name: /오늘 기록 완료하기/i }))
    fireEvent.click(screen.getByRole('button', { name: /주차 목록으로 돌아가기/i }))

    expect(screen.getByText(/완료 세션/i)).toBeInTheDocument()
    expect(screen.getByText(/평균 운동 시간/i)).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('shows the goal badge and monthly chart on the home screen, with the install shortcut in the header', () => {
    render(<App />)

    expect(screen.getByText(/목표 달성 배지/i)).toBeInTheDocument()
    expect(screen.getByText(/월별 통계/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /홈 화면에 추가/i })).toBeInTheDocument()
  })

  it('explains browser-level install instructions when the app cannot trigger the install prompt', async () => {
    const user = userEvent.setup()
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    render(<App />)

    await user.click(screen.getByRole('button', { name: /홈 화면에 추가/i }))

    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('브라우저 메뉴'))
    alertSpy.mockRestore()
  })

  it('opens a settings panel and accepts a weekly goal input', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /프로필 열기/i }))

    expect(screen.getByText(/설정/i)).toBeInTheDocument()
    const goalInput = screen.getByLabelText(/주간 목표 시간/i)
    await user.clear(goalInput)
    await user.type(goalInput, '180')
    await user.click(screen.getByRole('button', { name: /저장/i }))

    expect(screen.getByText(/180분/i)).toBeInTheDocument()
  })
})
