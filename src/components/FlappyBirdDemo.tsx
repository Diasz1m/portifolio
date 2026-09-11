import { useEffect, useRef } from 'react'

const W = 480
const H = 720
const GRAVITY = 1450
const JUMP = -420
const MAX_FALL = 720
const BIRD_X = 128
const BIRD_R = 18
const BIRD_START_Y = 320
const GROUND_H = 96
const SKY_H = H - GROUND_H
const PIPE_W = 74
const PIPE_GAP = 168
const PIPE_SPEED = 185
const PIPE_SPACING = 250
const PIPE_CAP_H = 28
const PIPE_CAP_EXTRA = 8
const MIN_GAP_Y = 110
const MAX_GAP_Y = SKY_H - 110
const HIGH_SCORE_KEY = 'flappy-bird-highscore'

type State = 'menu' | 'playing' | 'gameover'

type Pipe = { x: number; gapY: number; scored: boolean }
type Bird = { x: number; y: number; v: number; rotation: number; wing: number }

function loadHighScore() {
  const raw = Number(localStorage.getItem(HIGH_SCORE_KEY) ?? 0)
  return Number.isFinite(raw) ? raw : 0
}

function circleRect(cx: number, cy: number, r: number, x: number, y: number, w: number, h: number) {
  const closestX = Math.max(x, Math.min(cx, x + w))
  const closestY = Math.max(y, Math.min(cy, y + h))
  const dx = cx - closestX
  const dy = cy - closestY
  return dx * dx + dy * dy < r * r
}

function playTone(audioCtx: AudioContext, frequency: number, seconds: number) {
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = 'sine'
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + seconds)
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.start()
  osc.stop(audioCtx.currentTime + seconds)
}

export default function FlappyBirdDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const maybe = canvas.getContext('2d')
    if (!maybe) return
    const gfx: CanvasRenderingContext2D = maybe

    let state: State = 'menu'
    let score = 0
    let highScore = loadHighScore()
    let pipes: Pipe[] = []
    let groundOffset = 0
    let cloudOffset = 0
    let restartDelay = 0
    let audio: AudioContext | null = null
    let last = performance.now()
    let frame = 0

    const bird: Bird = { x: BIRD_X, y: BIRD_START_Y, v: 0, rotation: 0, wing: 0 }

    function resetBird() {
      bird.x = BIRD_X
      bird.y = BIRD_START_Y
      bird.v = 0
      bird.rotation = 0
      bird.wing = 0
    }

    function ensureAudio() {
      if (!audio) {
        const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        if (Ctx) audio = new Ctx()
      }
      void audio?.resume()
    }

    function tone(freq: number, seconds: number) {
      if (audio) playTone(audio, freq, seconds)
    }

    function startRun() {
      resetBird()
      pipes = []
      score = 0
      state = 'playing'
      bird.v = JUMP
      bird.wing = 0
      ensureAudio()
      tone(620, 0.09)
    }

    function spawnPipe() {
      const gapY = MIN_GAP_Y + Math.random() * (MAX_GAP_Y - MIN_GAP_Y)
      pipes.push({ x: W + 20, gapY, scored: false })
    }

    function hit() {
      state = 'gameover'
      restartDelay = 0.45
      if (score > highScore) {
        highScore = score
        localStorage.setItem(HIGH_SCORE_KEY, String(highScore))
      }
      tone(180, 0.22)
    }

    function flapOrStart() {
      if (state === 'menu') {
        startRun()
        return
      }
      if (state === 'playing') {
        bird.v = JUMP
        ensureAudio()
        tone(620, 0.09)
        return
      }
      if (state === 'gameover' && restartDelay <= 0) {
        startRun()
      }
    }

    function topRect(pipe: Pipe) {
      return { x: pipe.x, y: 0, w: PIPE_W, h: pipe.gapY - PIPE_GAP * 0.5 }
    }

    function bottomRect(pipe: Pipe) {
      const gapBottom = pipe.gapY + PIPE_GAP * 0.5
      return { x: pipe.x, y: gapBottom, w: PIPE_W, h: SKY_H - gapBottom }
    }

    function update(dt: number) {
      const moving = state !== 'gameover'
      if (moving) {
        groundOffset += PIPE_SPEED * dt
        cloudOffset += PIPE_SPEED * 0.25 * dt
      }

      bird.wing += dt
      if (state === 'playing') {
        bird.v = Math.min(bird.v + GRAVITY * dt, MAX_FALL)
        bird.y += bird.v * dt
        bird.rotation = Math.max(-28, Math.min(90, bird.v * 0.12))
      } else if (state === 'menu') {
        bird.y = BIRD_START_Y + Math.sin(bird.wing * 3.2) * 10
        bird.rotation = Math.sin(bird.wing * 3.2) * 8
        bird.v = 0
      }

      if (state === 'playing') {
        if (pipes.length === 0 || pipes[pipes.length - 1].x < W - PIPE_SPACING) {
          spawnPipe()
        }
        for (const pipe of pipes) {
          pipe.x -= PIPE_SPEED * dt
          if (!pipe.scored && pipe.x + PIPE_W < BIRD_X) {
            pipe.scored = true
            score += 1
            tone(880, 0.12)
          }
        }
        pipes = pipes.filter((pipe) => pipe.x + PIPE_W + PIPE_CAP_EXTRA >= 0)

        const radius = BIRD_R * 0.82
        if (bird.y + radius >= SKY_H || bird.y - radius <= 0) {
          hit()
        } else {
          for (const pipe of pipes) {
            const top = topRect(pipe)
            const bot = bottomRect(pipe)
            if (
              circleRect(bird.x, bird.y, radius, top.x, top.y, top.w, top.h) ||
              circleRect(bird.x, bird.y, radius, bot.x, bot.y, bot.w, bot.h)
            ) {
              hit()
              break
            }
          }
        }
      }

      if (state === 'gameover' && restartDelay > 0) restartDelay -= dt
    }

    function roundRect(x: number, y: number, w: number, h: number, r: number) {
      gfx.beginPath()
      if (typeof gfx.roundRect === 'function') {
        gfx.roundRect(x, y, w, h, r)
      } else {
        gfx.rect(x, y, w, h)
      }
      gfx.fill()
      gfx.stroke()
    }

    function drawPipe(body: { x: number; y: number; w: number; h: number }, capAtBottom: boolean) {
      gfx.fillStyle = '#52c43d'
      gfx.fillRect(body.x, body.y, body.w, body.h)
      gfx.fillStyle = '#369628'
      gfx.fillRect(body.x + body.w - 16, body.y, 16, body.h)
      gfx.fillStyle = '#a4e660'
      gfx.fillRect(body.x + 6, body.y, 8, body.h)
      gfx.strokeStyle = '#145a18'
      gfx.lineWidth = 2
      gfx.strokeRect(body.x, body.y, body.w, body.h)

      const cap = {
        x: body.x - PIPE_CAP_EXTRA,
        y: capAtBottom ? body.y + body.h - PIPE_CAP_H : body.y,
        w: body.w + PIPE_CAP_EXTRA * 2,
        h: PIPE_CAP_H,
      }
      gfx.fillStyle = '#52c43d'
      gfx.fillRect(cap.x, cap.y, cap.w, cap.h)
      gfx.fillStyle = '#369628'
      gfx.fillRect(cap.x + cap.w - 18, cap.y, 18, cap.h)
      gfx.strokeStyle = '#145a18'
      gfx.lineWidth = 2.5
      gfx.strokeRect(cap.x, cap.y, cap.w, cap.h)
    }

    function drawBird() {
      const { x, y, rotation } = bird
      gfx.save()
      gfx.translate(x, y)

      gfx.fillStyle = 'rgba(0,0,0,0.16)'
      gfx.beginPath()
      gfx.ellipse(3, 8, BIRD_R * 1.05, BIRD_R * 0.55, 0, 0, Math.PI * 2)
      gfx.fill()

      gfx.fillStyle = '#e8b020'
      gfx.beginPath()
      gfx.arc(0, 0, BIRD_R + 1.5, 0, Math.PI * 2)
      gfx.fill()
      gfx.fillStyle = '#ffd640'
      gfx.beginPath()
      gfx.arc(0, 0, BIRD_R, 0, Math.PI * 2)
      gfx.fill()
      gfx.fillStyle = '#ffec96'
      gfx.beginPath()
      gfx.arc(-3, 5, BIRD_R * 0.55, 0, Math.PI * 2)
      gfx.fill()

      const wingAngle = (Math.sin(bird.wing * 18) * 28 + rotation * 0.3) * (Math.PI / 180)
      gfx.fillStyle = '#f5f5f5'
      gfx.strokeStyle = '#c8c8c8'
      gfx.lineWidth = 1
      gfx.beginPath()
      gfx.ellipse(-4 + Math.cos(wingAngle) * 2, 2 + Math.sin(wingAngle) * 6, 12, 8, 0, 0, Math.PI * 2)
      gfx.fill()
      gfx.stroke()

      const rot = rotation * (Math.PI / 180)
      gfx.fillStyle = '#ff8a2a'
      gfx.beginPath()
      gfx.moveTo(Math.cos(rot) * (BIRD_R + 10), Math.sin(rot) * (BIRD_R + 10) + 2)
      gfx.lineTo(Math.cos(rot - 0.55) * (BIRD_R - 2), Math.sin(rot - 0.55) * (BIRD_R - 2))
      gfx.lineTo(Math.cos(rot + 0.55) * (BIRD_R - 2), Math.sin(rot + 0.55) * (BIRD_R - 2))
      gfx.closePath()
      gfx.fill()

      gfx.fillStyle = '#fff'
      gfx.beginPath()
      gfx.arc(6, -5, 6.5, 0, Math.PI * 2)
      gfx.fill()
      gfx.fillStyle = '#000'
      gfx.beginPath()
      gfx.arc(8, -5, 3.2, 0, Math.PI * 2)
      gfx.fill()
      gfx.fillStyle = '#fff'
      gfx.beginPath()
      gfx.arc(9.2, -6.4, 1.2, 0, Math.PI * 2)
      gfx.fill()

      gfx.restore()
    }

    function centerText(text: string, y: number, size: number, color: string) {
      gfx.fillStyle = color
      gfx.font = `700 ${size}px Outfit, system-ui, sans-serif`
      gfx.textAlign = 'center'
      gfx.fillText(text, W / 2, y)
    }

    function draw() {
      const sky = gfx.createLinearGradient(0, 0, 0, H)
      sky.addColorStop(0, '#70c5ce')
      sky.addColorStop(1, '#b0e2e8')
      gfx.fillStyle = sky
      gfx.fillRect(0, 0, W, H)

      const wrap = W + 160
      const cloudX = (base: number) => {
        let x = (base - cloudOffset) % wrap
        if (x < 0) x += wrap
        return x
      }
      gfx.fillStyle = 'rgba(255,255,255,0.82)'
      const clouds = [
        [80, 90, 46, 22],
        [110, 90, 32, 18],
        [280, 150, 52, 24],
        [320, 150, 36, 18],
        [430, 70, 40, 18],
      ] as const
      for (const [bx, cy, rx, ry] of clouds) {
        gfx.beginPath()
        gfx.ellipse(cloudX(bx), cy, rx, ry, 0, 0, Math.PI * 2)
        gfx.fill()
      }

      for (const pipe of pipes) {
        drawPipe(topRect(pipe), true)
        drawPipe(bottomRect(pipe), false)
      }

      gfx.fillStyle = '#ded895'
      gfx.fillRect(0, SKY_H, W, GROUND_H)
      gfx.fillStyle = '#74bf2e'
      gfx.fillRect(0, SKY_H, W, 18)
      gfx.fillStyle = '#549420'
      gfx.fillRect(0, SKY_H + 18, W, 6)
      const tile = 24
      const offset = Math.floor(groundOffset) % tile
      gfx.fillStyle = 'rgba(140,210,64,0.7)'
      for (let x = -tile; x < W + tile; x += tile) {
        gfx.fillRect(x - offset, SKY_H + 4, 12, 8)
      }
      gfx.fillStyle = '#c4b06e'
      gfx.fillRect(0, H - 18, W, 18)

      drawBird()

      if (state === 'playing' || state === 'gameover') {
        gfx.textAlign = 'center'
        gfx.font = '700 48px Outfit, system-ui, sans-serif'
        gfx.fillStyle = 'rgba(0,0,0,0.35)'
        gfx.fillText(String(score), W / 2 + 3, 78)
        gfx.fillStyle = '#fff'
        gfx.fillText(String(score), W / 2, 75)
      }

      if (state === 'menu') {
        gfx.fillStyle = 'rgba(0,0,0,0.16)'
        gfx.fillRect(0, 0, W, H)
        centerText('FLAPPY BIRD', 168, 42, '#ffd640')
        centerText('Espaço, seta ou clique para voar', 450, 20, '#fff')
        if (highScore > 0) centerText(`Recorde: ${highScore}`, 500, 22, '#ffec96')
      }

      if (state === 'gameover') {
        gfx.fillStyle = 'rgba(0,0,0,0.31)'
        gfx.fillRect(0, 0, W, H)
        gfx.fillStyle = 'rgba(250,245,220,0.94)'
        gfx.strokeStyle = '#5a461e'
        gfx.lineWidth = 2
        roundRect(70, 180, W - 140, 260, 18)
        centerText('FIM DE JOGO', 230, 28, '#b44628')
        centerText(`Pontos: ${score}`, 290, 26, '#323232')
        centerText(`Recorde: ${highScore}`, 330, 24, '#5a5a5a')
        centerText('Espaço para reiniciar', 400, 18, '#505050')
      }
    }

    function loop(now: number) {
      const dt = Math.min((now - last) / 1000, 0.033)
      last = now
      update(dt)
      draw()
      frame = requestAnimationFrame(loop)
    }

    function onKey(event: KeyboardEvent) {
      if (event.key !== ' ' && event.key !== 'ArrowUp') return
      if (document.activeElement !== wrapRef.current && document.activeElement !== canvas) return
      event.preventDefault()
      if (event.repeat) return
      flapOrStart()
    }

    function onPointer() {
      wrapRef.current?.focus()
      flapOrStart()
    }

    wrap.addEventListener('click', onPointer)
    window.addEventListener('keydown', onKey)
    frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      wrap.removeEventListener('click', onPointer)
      window.removeEventListener('keydown', onKey)
      void audio?.close()
    }
  }, [])

  return (
    <article className="panel flappy-demo" id="demo-flappy">
      <div className="bancada-head">
        <div>
          <h3>Flappy Bird</h3>
          <p className="hint">
            Port para o navegador do clone em C++17 + raylib{' '}
            <a href="https://github.com/Diasz1m/flapy-bird" target="_blank" rel="noreferrer">
              flapy-bird
            </a>
            : mesma gravidade, canos e colisão. Gráficos e som gerados no código, sem sprites.
          </p>
        </div>
        <div className="socket-meta">
          <span className="chip">C++17</span>
          <span className="chip">raylib</span>
          <span className="chip">480×720</span>
        </div>
      </div>
      <div
        className="flappy-stage"
        ref={wrapRef}
        tabIndex={0}
        aria-label="Jogo Flappy Bird. Espaço, seta para cima ou clique para voar."
      >
        <canvas ref={canvasRef} width={W} height={H} className="flappy-canvas" />
      </div>
    </article>
  )
}
