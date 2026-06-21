import { useState, useRef, useCallback } from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

const LESSONS = [
  { id: 1, text: 'that everyone deserves kindness' },
  { id: 2, text: 'to work hard without complaining' },
  { id: 3, text: 'to stay calm when life gets hard' },
  { id: 4, text: 'that listening matters more than speaking' },
  { id: 5, text: 'to never give up, no matter what' },
  { id: 6, text: 'how to fix things with my own hands' },
  { id: 7, text: 'that family must always come first' },
  { id: 8, text: 'to take care of this body I\'ve been given' },
  { id: 9, text: 'that rest is not weakness' },
  { id: 10, text: 'that small daily habits shape a life' },
  { id: 'custom', text: 'custom' },
]

export default function Home() {
  const [step, setStep] = useState(1)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [customLesson, setCustomLesson] = useState('')
  const [photo, setPhoto] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [consent, setConsent] = useState(false)
  const [cardUrl, setCardUrl] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const cardRef = useRef(null)

  const lessonText = selectedLesson === 'custom'
    ? customLesson
    : LESSONS.find(l => l.id === selectedLesson)?.text || ''

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPhoto(ev.target.result)
    reader.readAsDataURL(file)
    setStep(3)
  }

  const handleDownload = async () => {
    setSubmitting(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      })
      const dataUrl = canvas.toDataURL('image/png')

      // Download locally
      const link = document.createElement('a')
      link.download = 'lessons-from-him-card.png'
      link.href = dataUrl
      link.click()

      // If consented, submit to Google Sheets
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

  const canContinueStep1 = selectedLesson !== null &&
    (selectedLesson !== 'custom' || customLesson.trim().length > 3)

  return (
    <>
      <Head>
        <title>Lessons I Learned From Him — The Yellow Clinic</title>
        <meta name="description" content="Celebrate Father's Day by sharing the lesson your father figure taught you." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.page}>
        {/* Background decoration */}
        <div className={styles.bgDecor1} />
        <div className={styles.bgDecor2} />

        <div className={styles.phoneFrame}>
          {/* Header */}
          <header className={styles.header}>
            <div className={styles.logoArea}>
              <div className={styles.logoIcon}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="13" stroke="#F5C518" strokeWidth="2"/>
                  <path d="M14 7v14M7 14h14" stroke="#F5C518" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M8 14 Q14 8 20 14" stroke="#F5C518" strokeWidth="1.5" fill="none"/>
                </svg>
              </div>
              <div>
                <span className={styles.logoName}>The Yellow Clinic</span>
                <span className={styles.logoTagline}>Excellent Medical &amp; Healthcare Services</span>
              </div>
            </div>
            <div className={styles.stepDots}>
              {[1, 2, 3].map(s => (
                <span key={s} className={`${styles.dot} ${step >= s ? styles.dotActive : ''}`} />
              ))}
            </div>
          </header>

          {/* ── STEP 1: Choose Lesson ── */}
          {step === 1 && (
            <div className={styles.stepContent}>
              <div className={styles.stepLabel}>Step 1 of 3</div>
              <h1 className={styles.title}>
                <span className={styles.titleSmall}>Lessons I</span>
                <span className={styles.titleLarge}>Learned</span>
                <span className={styles.titleAccent}>From Him</span>
              </h1>
              <p className={styles.subtitle}>Choose the important lesson you took from your father figure</p>

              <div className={styles.lessonsGrid}>
                {LESSONS.slice(0, 10).map(lesson => (
                  <button
                    key={lesson.id}
                    className={`${styles.lessonBtn} ${selectedLesson === lesson.id ? styles.lessonBtnActive : ''}`}
                    onClick={() => setSelectedLesson(lesson.id)}
                  >
                    <span className={styles.lessonQuote}>"</span>
                    {lesson.text}
                  </button>
                ))}

                <button
                  className={`${styles.lessonBtn} ${styles.lessonBtnCustom} ${selectedLesson === 'custom' ? styles.lessonBtnActive : ''}`}
                  onClick={() => setSelectedLesson('custom')}
                >
                  <span className={styles.lessonQuote}>"</span>
                  or tell us your own lesson...
                </button>
              </div>

              {selectedLesson === 'custom' && (
                <div className={styles.customInputWrap}>
                  <input
                    type="text"
                    className={styles.customInput}
                    placeholder='e.g. "that honesty is always the best path"'
                    value={customLesson}
                    onChange={e => setCustomLesson(e.target.value)}
                    maxLength={80}
                    autoFocus
                  />
                  <span className={styles.charCount}>{customLesson.length}/80</span>
                </div>
              )}

              <button
                className={`${styles.ctaBtn} ${!canContinueStep1 ? styles.ctaBtnDisabled : ''}`}
                onClick={() => canContinueStep1 && setStep(2)}
                disabled={!canContinueStep1}
              >
                Continue
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{marginLeft: 6}}>
                  <path d="M4 9h10M10 5l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}

          {/* ── STEP 2: Upload Photo ── */}
          {step === 2 && (
            <div className={styles.stepContent}>
              <div className={styles.stepLabel}>Step 2 of 3</div>
              <div className={styles.selectedLessonPreview}>
                <span className={styles.previewQuote}>"</span>
                <span>He taught me {lessonText}</span>
                <span className={styles.previewQuote}>"</span>
              </div>

              <h2 className={styles.stepTitle}>Add a photo of your hero</h2>
              <p className={styles.stepDesc}>Upload a photo of your father or father figure to create your personalised card</p>

              <div className={styles.photoOptions}>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={handlePhotoSelect}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhotoSelect}
                />

                <button
                  className={styles.photoBtn}
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  Open Camera
                </button>

                <button
                  className={styles.photoBtn}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  Choose From Gallery
                </button>
              </div>

              <button className={styles.backBtn} onClick={() => setStep(1)}>
                ← Back
              </button>
            </div>
          )}

          {/* ── STEP 3: Card Preview & Download ── */}
          {step === 3 && (
            <div className={styles.stepContent}>
              <div className={styles.stepLabel}>Step 3 of 3</div>
              <h2 className={styles.stepTitle}>Your card is ready!</h2>
              <p className={styles.stepDesc}>Download and share to celebrate your hero this Father's Day</p>

              {/* THE DIGITAL CARD */}
              <div className={styles.cardWrapper}>
                <div ref={cardRef} className={styles.digitalCard}>
                  {/* Card background decoration */}
                  <div className={styles.cardBgTop} />
                  <div className={styles.cardBgBottom} />

                  {/* Card logo */}
                  <div className={styles.cardHeader}>
                    <div className={styles.cardLogoIcon}>
                      <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                        <circle cx="14" cy="14" r="13" stroke="#F5C518" strokeWidth="2"/>
                        <path d="M14 7v14M7 14h14" stroke="#F5C518" strokeWidth="2.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <span className={styles.cardLogoText}>The Yellow Clinic</span>
                  </div>

                  {/* Photo */}
                  {photo && (
                    <div className={styles.cardPhotoFrame}>
                      <img src={photo} alt="Father figure" className={styles.cardPhoto} />
                      <div className={styles.cardPhotoOverlay} />
                    </div>
                  )}

                  {/* Campaign title */}
                  <div className={styles.cardTitleBlock}>
                    <p className={styles.cardTitleSmall}>Lessons I</p>
                    <p className={styles.cardTitleLarge}>Learned From Him</p>
                  </div>

                  {/* The lesson */}
                  <div className={styles.cardLessonBlock}>
                    <div className={styles.cardLessonLine} />
                    <p className={styles.cardLessonText}>
                      He taught me
                    </p>
                    <p className={styles.cardLessonQuote}>
                      "{lessonText}"
                    </p>
                    <div className={styles.cardLessonLine} />
                  </div>

                  {/* Father's Day tag */}
                  <div className={styles.cardFooterTag}>
                    <span>Happy Father's Day</span>
                    <span className={styles.cardTagDot}>•</span>
                    <span>2025</span>
                  </div>
                </div>
              </div>

              {/* Consent */}
              <label className={styles.consentLabel}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={e => setConsent(e.target.checked)}
                  className={styles.consentCheck}
                />
                <span className={styles.consentText}>
                  I give The Yellow Clinic permission to use my card for communications and promotional purposes.
                </span>
              </label>

              {/* Actions */}
              <button
                className={`${styles.ctaBtn} ${submitting ? styles.ctaBtnLoading : ''}`}
                onClick={handleDownload}
                disabled={submitting}
              >
                {submitting ? 'Preparing...' : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{marginRight: 6}}>
                      <path d="M9 2v10M5 8l4 4 4-4M3 15h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Download My Card
                  </>
                )}
              </button>

              {submitted && (
                <p className={styles.submittedNote}>
                  ✓ Your card has been shared with The Yellow Clinic. Thank you!
                </p>
              )}

              <div className={styles.bottomActions}>
                <button className={styles.backBtn} onClick={() => setStep(2)}>← Change Photo</button>
                <button className={styles.backBtn} onClick={() => {
                  setStep(1); setSelectedLesson(null); setCustomLesson('');
                  setPhoto(null); setPhotoFile(null); setConsent(false);
                  setCardUrl(null); setSubmitted(false);
                }}>↺ Start Again</button>
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className={styles.footer}>
            <p>The Yellow Clinic · Excellent Medical &amp; Healthcare Services</p>
          </footer>
        </div>
      </div>
    </>
  )
}
