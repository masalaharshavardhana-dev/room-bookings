import { useState, useEffect } from 'react'
import './App.css'

const url = 'http://localhost:8001'

function App() {
  const [bookings, setBookings] = useState([])
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [status, setStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const bookingsRes = await fetch(`${url}/all-bookings`)
      const bookingsData = await bookingsRes.json()
      setBookings(bookingsData)
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }

  const handleBooking = async (e) => {
    e.preventDefault()
    if (!startTime || !endTime) {
      setStatus({ type: 'error', message: 'Please fill in all fields' })
      return
    }

    setLoading(true)
    setStatus({ type: '', message: '' })

    try {
      const response = await fetch(`${API_BASE}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_time: startTime,
          end_time: endTime,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({ type: 'success', message: 'Room booked successfully!' })
        setStartTime('')
        setEndTime('')
        fetchData()
      } else {
        setStatus({ type: 'error', message: data.message || data.error || 'Booking failed' })
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Network error. Is the backend running?' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container" style={{ maxWidth: '800px' }}>
      <h1>Executive Boardroom Booking</h1>

      {status.message && (
        <div className={`status ${status.type}`}>
          {status.message}
        </div>
      )}

      <div className="dashboard">
        <div className="card">
          <h2 style={{ marginBottom: '15px', fontSize: '1.2rem' }}>New Booking</h2>
          <form onSubmit={handleBooking}>
            <div className="form-group">
              <label>Start Time</label>
              <input 
                type="datetime-local" 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>End Time</label>
              <input 
                type="datetime-local" 
                value={endTime} 
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Book Room Now'}
            </button>
          </form>
        </div>
        <div className="card">
          <h2 style={{ marginBottom: '15px', fontSize: '1.2rem' }}>Scheduled Slots</h2>
          <div className="recent-list">
            <ul style={{ listStyle: 'none', fontSize: '0.85rem' }}>
              {bookings.length === 0 ? (
                <li style={{ color: '#555', textAlign: 'center', marginTop: '20px' }}>No bookings found</li>
              ) : (
                bookings.slice().reverse().slice(0, 8).map((b, i) => (
                  <li key={i} style={{ 
                      marginBottom: '10px', 
                      color: '#ddd', 
                      padding: '10px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '8px',
                      borderLeft: '3px solid #4facfe'
                    }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {new Date(b.start_time).toLocaleDateString([], { month: 'short', day: 'numeric'})}
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                      {new Date(b.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(b.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
