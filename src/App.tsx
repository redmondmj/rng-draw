import { useState, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import Confetti from 'react-confetti';
import './App.css';

interface Ticket {
  name: string;
  seller: string;
  ticketNumber: string;
}

interface Winner extends Ticket {
  prize: string;
}

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]); // Current pool for $50 draws
  const [fullPool, setFullPool] = useState<Ticket[]>([]); // Master pool for Grand Prize
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDisplay, setCurrentDisplay] = useState<Ticket | null>(null);
  const [lastWinner, setLastWinner] = useState<Winner | null>(null);
  const [remainingPrizes, setRemainingPrizes] = useState<number>(7);
  const [grandPrizeAvailable, setGrandPrizeAvailable] = useState<boolean>(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  
  const drawInterval = useRef<number | null>(null);

  // Helper to map data correctly
  const mapData = (data: any[]) => {
    return data.map(row => {
      const guestName = row['Guest name']?.trim();
      const buyerName = row['Buyer name']?.trim();
      const sellerPlayer = row['Which player are you supporting?']?.trim();
      const tNum = row['Ticket number'] || row['Ticket #'] || row.TicketNumber || "";
      
      return {
        name: guestName || buyerName || Object.values(row)[0],
        seller: sellerPlayer || Object.values(row)[5] || "Unknown",
        ticketNumber: tNum.toString()
      };
    }).filter(t => t.name && t.name !== 'Guest name' && t.name !== 'Name');
  };

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    
    // Auto-load tickets from public/tickets.csv
    fetch('/tickets.csv')
      .then(response => response.text())
      .then(csvData => {
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const formatted = mapData(results.data as any[]);
            setTickets(formatted);
            setFullPool(formatted);
            setGrandPrizeAvailable(formatted.length > 0);
          }
        });
      })
      .catch(err => console.error("Error loading tickets.csv:", err));

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const formatted = mapData(results.data as any[]);
          setTickets(formatted);
          setFullPool(formatted);
          setWinners([]);
          setRemainingPrizes(7);
          setGrandPrizeAvailable(formatted.length > 0);
          setLastWinner(null);
          setShowConfetti(false);
        }
      });
    }
  };

  const startDraw = (prize: string) => {
    // Decide which pool to use:
    // $50 draws use the 'tickets' pool (which shrinks)
    // $810 draw uses the 'fullPool' (everyone)
    const activePool = prize === "$810" ? fullPool : tickets;

    if (activePool.length === 0 || isDrawing) return;
    
    setIsDrawing(true);
    setLastWinner(null);
    setShowConfetti(false);
    
    let count = 0;
    const maxCount = 30;
    
    drawInterval.current = window.setInterval(() => {
      const randomIndex = Math.floor(Math.random() * activePool.length);
      setCurrentDisplay(activePool[randomIndex]);
      
      count++;
      if (count >= maxCount) {
        if (drawInterval.current) clearInterval(drawInterval.current);
        
        const finalIndex = Math.floor(Math.random() * activePool.length);
        const winner = activePool[finalIndex];
        const newWinner = { ...winner, prize };
        
        setWinners(prev => [newWinner, ...prev]);
        setLastWinner(newWinner);
        
        setIsDrawing(false);
        if (prize === "$50") {
          // Remove from $50 pool
          const newTickets = [...tickets];
          // We must find the index in the 'tickets' array specifically
          const indexInTickets = tickets.findIndex(t => t.ticketNumber === winner.ticketNumber);
          if (indexInTickets !== -1) {
            newTickets.splice(indexInTickets, 1);
          }
          setTickets(newTickets);
          setRemainingPrizes(prev => prev - 1);
        } else {
          setGrandPrizeAvailable(false);
          setShowConfetti(true);
        }
      }
    }, 100);
  };

  // Background clovers
  const clovers = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    rotate: `${Math.random() * 360}deg`,
    size: `${1 + Math.random() * 2}rem`
  }));

  return (
    <div className="app-container">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          colors={['#009a44', '#ffcc00', '#ffffff']}
          numberOfPieces={400}
          recycle={false}
        />
      )}
      {clovers.map(c => (
        <div key={c.id} className="clover" style={{ 
          top: c.top, 
          left: c.left, 
          transform: `rotate(${c.rotate})`,
          fontSize: c.size
        }}>☘️</div>
      ))}

      <header>
        <h1>St. Paddy's Day Draw</h1>
        <p className="subtitle">Luck of the Irish RNG</p>
      </header>

      {fullPool.length === 0 ? (
        <div className="upload-section">
          <h2>Upload Tickets CSV</h2>
          <p>CSV should have columns for Name, Seller, and Ticket number</p>
          <label className="custom-file-upload">
            <input type="file" accept=".csv" onChange={handleFileUpload} className="file-input" />
            📁 Choose CSV File
          </label>
        </div>
      ) : (
        <>
          <div className="stats">
            🎟️ {fullPool.length} Total Tickets | {tickets.length} Available for $50 Draws
          </div>

          <div className="draw-controls">
            <button 
              className="btn-draw"
              onClick={() => startDraw("$50")}
              disabled={isDrawing || remainingPrizes <= 0}
            >
              Draw $50 ({remainingPrizes} left)
            </button>
            <button 
              className="btn-grand"
              onClick={() => startDraw("$810")}
              disabled={isDrawing || remainingPrizes > 0 || !grandPrizeAvailable}
            >
              💰 GRAND PRIZE DRAW ($810)
            </button>
          </div>

          {(isDrawing || lastWinner) && (
            <div className="drawing-display">
              {isDrawing ? (
                <div style={{ textAlign: 'center' }}>
                  <div className="spinning-name">{currentDisplay?.name}</div>
                  <div style={{ fontSize: '1.2rem', color: '#666' }}>#{currentDisplay?.ticketNumber}</div>
                </div>
              ) : lastWinner ? (
                <div className="winner-card">
                  <div className="winner-prize">WINNER OF {lastWinner.prize}!</div>
                  <div className="winner-name">🍀 {lastWinner.name} 🍀</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>Ticket #{lastWinner.ticketNumber}</div>
                  <div className="winner-seller">Sold by: {lastWinner.seller}</div>
                </div>
              ) : null}
            </div>
          )}

          {winners.length > 0 && (
            <div className="winners-list">
              <h2>Winner History</h2>
              {winners.map((w, i) => (
                <div key={i} className="winner-row">
                  <span className="prize-col">{w.prize}</span>
                  <span><strong>{w.name}</strong> (#{w.ticketNumber})</span>
                  <span style={{ opacity: 0.7 }}>Sold by: {w.seller}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '2rem' }}>
            <button onClick={() => { setTickets([]); setFullPool([]); }} style={{ background: 'transparent', color: 'white', border: '1px solid white', fontSize: '0.8rem', padding: '5px 10px' }}>
              Reset & Upload New File
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
