import { useState, useRef } from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

const LESSONS = [
  { id: 1,  text: 'that everyone deserves kindness' },
  { id: 2,  text: 'to work hard without complaining' },
  { id: 3,  text: 'to stay calm when life gets hard' },
  { id: 4,  text: 'that listening matters more than speaking' },
  { id: 5,  text: 'to never give up, no matter what' },
  { id: 6,  text: 'how to fix things with my own hands' },
  { id: 7,  text: 'that family must always come first' },
  { id: 8,  text: 'to take care of this body I\'ve been given' },
  { id: 9,  text: 'that rest is not weakness' },
  { id: 10, text: 'that small daily habits shape a life' },
  { id: 'custom', text: 'custom' },
]

export default function Home() {
  const [step, setStep]                     = useState(1)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [customLesson, setCustomLesson]     = useState('')
  const [photo, setPhoto]                   = useState(null)
  const [consent, setConsent]               = useState(false)
  const [submitting, setSubmitting]         = useState(false)
  const [submitted, setSubmitted]           = useState(false)

  const fileInputRef   = useRef(null)
  const cameraInputRef = useRef(null)
  const cardRef        = useRef(null)

  const lessonText = selectedLesson === 'custom'
    ? customLesson
    : LESSONS.find(l => l.id === selectedLesson)?.text || ''

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => { setPhoto(ev.target.result); setStep(3) }
    reader.readAsDataURL(file)
  }

  const handleDownload = async () => {
    setSubmitting(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#0a2747',
        logging: false,
      })
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = 'lessons-from-him-card.png'
      link.href = dataUrl
      link.click()

      if (consent && !submitted) {
        await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lesson: lessonText,
            cardDataUrl: dataUrl,
            timestamp: new Date().toISOString(),
            consented: true,
          }),
        })
        setSubmitted(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const canContinue = selectedLesson !== null &&
    (selectedLesson !== 'custom' || customLesson.trim().length > 3)

  const resetAll = () => {
    setStep(1); setSelectedLesson(null); setCustomLesson('')
    setPhoto(null); setConsent(false); setSubmitted(false)
  }

  return (
    <>
      <Head>
        <title>Lessons I Learned From Him — The Yellow Brand</title>
        <meta name="description" content="Share the lesson your father figure taught you." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#0a2747" />
      </Head>

      <div className={styles.page}>
        <div className={styles.card}>

          {/* ══ TOP ACCENT STRIP ══ */}
          <div className={styles.borderTop} />

          {/* ══ HEADER ══ */}
          <div className={styles.header}>
            <div className={styles.brandName}>The Yellow Brand</div>
            <div className={styles.stepDots}>
              {[1,2,3].map(s => (
                <span key={s} className={`${styles.dot} ${step >= s ? styles.dotActive : ''}`} />
              ))}
            </div>
          </div>

          {/* ══ STEP 1 ══ */}
          {step === 1 && (
            <div className={styles.body}>
              <div className={styles.heroBlock}>
                <p className={styles.heroEyebrow}>My</p>
                <h1 className={styles.heroTitle}>
                  <span className={styles.heroTitleYellow}>LESSON</span>
                  <span className={styles.heroTitleIs}> is...</span>
                </h1>
                <p className={styles.heroSub}>Choose the important lesson you took from your father or father figure</p>
              </div>

              <div className={styles.grid}>
                {LESSONS.slice(0,10).map(l => (
                  <button
                    key={l.id}
                    className={`${styles.pill} ${selectedLesson === l.id ? styles.pillActive : ''}`}
                    onClick={() => setSelectedLesson(l.id)}
                  >
                    {l.text}
                  </button>
                ))}
                <button
                  className={`${styles.pill} ${styles.pillCustom} ${selectedLesson === 'custom' ? styles.pillActive : ''}`}
                  onClick={() => setSelectedLesson('custom')}
                >
                  or tell us your own lesson...
                </button>
              </div>

              {selectedLesson === 'custom' && (
                <div className={styles.customWrap}>
                  <input
                    className={styles.customInput}
                    type="text"
                    placeholder="e.g. that honesty is always the best path"
                    value={customLesson}
                    onChange={e => setCustomLesson(e.target.value)}
                    maxLength={80}
                    autoFocus
                  />
                  <span className={styles.charCount}>{customLesson.length}/80</span>
                </div>
              )}

              <button
                className={`${styles.cta} ${!canContinue ? styles.ctaDisabled : ''}`}
                onClick={() => canContinue && setStep(2)}
                disabled={!canContinue}
              >
                Continue
              </button>
            </div>
          )}

          {/* ══ STEP 2 ══ */}
          {step === 2 && (
            <div className={styles.body}>
              <div className={styles.lessonPill}>
                He taught me <strong>{lessonText}</strong>
              </div>

              <div className={styles.heroBlock}>
                <h2 className={styles.stepHeading}>Take Your Photo</h2>
                <p className={styles.heroSub}>Add a photo of your father or father figure to create your personalised card</p>
              </div>

              <div className={styles.photoBtns}>
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment"
                  style={{display:'none'}} onChange={handlePhotoSelect} />
                <input ref={fileInputRef} type="file" accept="image/*"
                  style={{display:'none'}} onChange={handlePhotoSelect} />

                <button className={styles.photoBtn} onClick={() => cameraInputRef.current?.click()}>
                  <CameraIcon /> Open Camera
                </button>
                <button className={styles.photoBtn} onClick={() => fileInputRef.current?.click()}>
                  <GalleryIcon /> Choose From Gallery
                </button>
              </div>

              <button className={styles.backBtn} onClick={() => setStep(1)}>Back</button>
            </div>
          )}

          {/* ══ STEP 3 ══ */}
          {step === 3 && (
            <div className={styles.body}>
              <div className={styles.heroBlock}>
                <h2 className={styles.stepHeading}>Your Photo Is Ready!</h2>
                <p className={styles.heroSub}>Download and share to celebrate your hero</p>
              </div>

              {/* THE DIGITAL CARD */}
              <div className={styles.cardPreviewWrap}>
                <div ref={cardRef} className={styles.digitalCard}>
                  <div className={styles.dcBorderTop} />
                  <div className={styles.dcBorderBottom} />

                  {/* corner accents */}
                  <div className={styles.dcCornerTL} />
                  <div className={styles.dcCornerBR} />

                  <div className={styles.dcBrand}>The Yellow Brand</div>

                  {photo && (
                    <div className={styles.dcPhotoRing}>
                      <img src={photo} alt="Father" className={styles.dcPhoto} />
                    </div>
                  )}

                  <div className={styles.dcTitleWrap}>
                    <p className={styles.dcTitleSmall}>Lessons I</p>
                    <p className={styles.dcTitleBig}>Learned From Him</p>
                  </div>

                  <div className={styles.dcDivider} />

                  <p className={styles.dcHeTaught}>He taught me</p>
                  <p className={styles.dcLesson}>{lessonText}</p>

                  <div className={styles.dcDivider} />

                  <div className={styles.dcFooter}>
                    <span>Happy Father's Day</span>
                    <span className={styles.dcDot}>·</span>
                    <span>2026</span>
                  </div>
                </div>
              </div>

              <label className={styles.consent}>
                <input type="checkbox" checked={consent}
                  onChange={e => setConsent(e.target.checked)} />
                <span>I give The Yellow Brand permission to use my image for communications purposes.</span>
              </label>

              <p className={styles.readyText}>Your photo is ready to download and share.</p>

              <button
                className={`${styles.cta} ${submitting ? styles.ctaLoading : ''}`}
                onClick={handleDownload} disabled={submitting}
              >
                {submitting ? 'Preparing...' : 'Download'}
              </button>

              {submitted && (
                <p className={styles.thankYou}>✓ Shared with The Yellow Brand. Thank you!</p>
              )}

              <div className={styles.twoButtons}>
                <button className={styles.backBtn} onClick={() => setStep(2)}>Back</button>
                <button className={styles.backBtn} onClick={resetAll}>Start Again</button>
              </div>
            </div>
          )}

          {/* ══ BOTTOM ACCENT STRIP ══ */}
          <div className={styles.borderBottom} />

        </div>
      </div>
    </>
  )
}

function CameraIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:8}}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  )
}

function GalleryIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:8}}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  )
}
