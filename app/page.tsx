"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Type for leaderboard entry
type LeaderboardEntry = {
  id?: number;
  name: string;
  score: number;
};

// Initial leaderboard data (fallback)
const initialData: LeaderboardEntry[] = [];

export default function Home() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(initialData);
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [newScore, setNewScore] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch leaderboard data from Supabase
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('sit-leaderboard')
        .select('*')
        .order('score', { ascending: false });

      if (error) {
        console.error('Error fetching leaderboard:', error);
        // Keep initial data if there's an error
      } else if (data && data.length > 0) {
        setLeaderboardData(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Secret keyboard shortcut: Ctrl+Shift+E
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        setEditMode(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const addPlayer = async () => {
    if (newName.trim() && newScore.trim()) {
      const score = parseInt(newScore);
      if (!isNaN(score)) {
        const newPlayer = { name: newName.trim(), score };
        
        // Insert into Supabase
        const { data, error } = await supabase
          .from('sit-leaderboard')
          .insert([newPlayer])
          .select();

        if (error) {
          console.error('Error adding player:', error);
          // Fallback to local state
          const updatedData = [...leaderboardData, newPlayer].sort((a, b) => b.score - a.score);
          setLeaderboardData(updatedData);
        } else {
          // Refresh from database
          fetchLeaderboard();
        }
        
        setNewName('');
        setNewScore('');
      }
    }
  };

  const removePlayer = async (index: number) => {
    const player = leaderboardData[index];
    
    if (player.id) {
      // Delete from Supabase
      const { error } = await supabase
        .from('sit-leaderboard')
        .delete()
        .eq('id', player.id);

      if (error) {
        console.error('Error removing player:', error);
      }
    }
    
    // Update local state
    const updatedData = leaderboardData.filter((_, i) => i !== index);
    setLeaderboardData(updatedData);
  };

  const updateScore = async (index: number, newScore: number) => {
    const player = leaderboardData[index];
    
    if (player.id) {
      // Update in Supabase
      const { error } = await supabase
        .from('sit-leaderboard')
        .update({ score: newScore })
        .eq('id', player.id);

      if (error) {
        console.error('Error updating score:', error);
      }
    }
    
    // Update local state
    const updatedData = [...leaderboardData];
    updatedData[index].score = newScore;
    updatedData.sort((a, b) => b.score - a.score);
    setLeaderboardData(updatedData);
  };

  const updateName = async (index: number, newName: string) => {
    const player = leaderboardData[index];
    
    if (player.id) {
      // Update in Supabase
      const { error } = await supabase
        .from('sit-leaderboard')
        .update({ name: newName })
        .eq('id', player.id);

      if (error) {
        console.error('Error updating name:', error);
      }
    }
    
    // Update local state
    const updatedData = [...leaderboardData];
    updatedData[index].name = newName;
    setLeaderboardData(updatedData);
  };
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(45deg, #000066 0%, #0000CC 50%, #000066 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 10s ease infinite',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Centered container - classic 90s style */}
      <div style={{ textAlign: 'center' }}>
        <table 
          width="800" 
          border={0}
          cellPadding={0}
          cellSpacing={0}
          style={{
            margin: '20px auto',
            backgroundColor: '#C0C0C0',
            border: '4px outset #FFFFFF'
          }}
        >
          <tbody>
            {/* Header with marquee */}
            <tr>
              <td 
                colSpan={3}
                style={{
                  background: 'linear-gradient(180deg, #000080 0%, #0000FF 100%)',
                  padding: '20px',
                  borderBottom: '4px ridge #FFD700'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'Comic Sans MS, cursive',
                    fontSize: '42px',
                    color: '#FFFF00',
                    fontWeight: 'bold',
                    textShadow: '3px 3px 0px #000000, 6px 6px 0px #FF0000'
                  }}>
                    ⭐ Monkey Type Leaderboard ⭐
                  </div>
                  <br />
                  <div style={{
                    fontFamily: 'Arial',
                    fontSize: '24px',
                    color: '#00FF00',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}>
                    🔥 TOP 10 FASTEST TYPISTS 🔥
                  </div>
                  <br />
                  <img 
                    src="data:image/gif;base64,R0lGODlhEAAQAMQAAP///wAAAP8AAP//AP8A/wD//wD/AP///////////////////////////////yH5BAEKABAALAAAAAAQABAAAAVVICSOZGmeaKqubOu+cCzPdG3feK7vfO//wKBwSCwaj8ikcslsOp/QqHRKrVqv2Kx2y+16v+CweEwum8/otHrNbrvf8Lh8Tq/b7/i8fs/v+/+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w"
                    alt="star"
                    width="16"
                    height="16"
                    style={{ margin: '0 5px' }}
                  />
                  <div style={{
                    fontFamily: 'Times New Roman',
                    fontSize: '14px',
                    color: '#FFFFFF'
                  }}>
                    Last Updated: {new Date().toLocaleDateString()}
                  </div>
                </div>
              </td>
            </tr>

            {/* Table Header Row */}
            <tr>
              <td 
                width="100"
                align="center"
                style={{
                  backgroundColor: '#008080',
                  border: '3px ridge #FFFFFF',
                  padding: '10px',
                  fontWeight: 'bold',
                  color: '#FFFF00',
                  fontFamily: 'Arial Black, Arial, sans-serif',
                  fontSize: '20px'
                }}
              >
                RANK
              </td>
              <td 
                style={{
                  backgroundColor: '#008080',
                  border: '3px ridge #FFFFFF',
                  padding: '10px',
                  fontWeight: 'bold',
                  color: '#FFFF00',
                  fontFamily: 'Arial Black, Arial, sans-serif',
                  fontSize: '20px'
                }}
              >
                NAME
              </td>
              <td 
                width="150"
                align="center"
                style={{
                  backgroundColor: '#008080',
                  border: '3px ridge #FFFFFF',
                  padding: '10px',
                  fontWeight: 'bold',
                  color: '#FFFF00',
                  fontFamily: 'Arial Black, Arial, sans-serif',
                  fontSize: '20px'
                }}
              >
                SCORE (WPM)
              </td>
              {editMode && (
                <td 
                  width="120"
                  align="center"
                  style={{
                    backgroundColor: '#FF0000',
                    border: '3px ridge #FFFFFF',
                    padding: '10px',
                    fontWeight: 'bold',
                    color: '#FFFF00',
                    fontFamily: 'Arial Black, Arial, sans-serif',
                    fontSize: '20px'
                  }}
                >
                  ACTIONS
                </td>
              )}
            </tr>

            {/* Leaderboard Entries */}
            {leaderboardData.map((player, index) => {
              // Web-safe colors for different ranks
              const rankColor = index === 0 ? '#FF0000' : index === 1 ? '#FF6600' : index === 2 ? '#FFCC00' : '#000000';
              const bgColor = index % 2 === 0 ? '#FFFFFF' : '#CCCCCC';
              
              return (
                <tr key={index}>
                  <td 
                    align="center"
                    style={{
                      backgroundColor: bgColor,
                      border: '2px inset #999999',
                      padding: '12px 8px',
                      fontFamily: 'Arial Black, Arial, sans-serif',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: rankColor
                    }}
                  >
                    #{index + 1}
                    {index < 3 && (
                      <span style={{ marginLeft: '5px' }}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    )}
                  </td>
                  <td 
                    style={{
                      backgroundColor: bgColor,
                      border: '2px inset #999999',
                      padding: '12px 15px',
                      fontFamily: 'Courier New, monospace',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: index < 3 ? '#CC0000' : '#000080'
                    }}
                  >
                    {editMode ? (
                      <input
                        type="text"
                        value={player.name}
                        onChange={(e) => updateName(index, e.target.value)}
                        style={{
                          width: '100%',
                          fontFamily: 'Courier New, monospace',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          border: '2px inset #999999',
                          padding: '4px',
                          backgroundColor: '#FFFFCC'
                        }}
                      />
                    ) : (
                      player.name
                    )}
                  </td>
                  <td 
                    align="center"
                    style={{
                      backgroundColor: bgColor,
                      border: '2px inset #999999',
                      padding: '12px 8px',
                      fontFamily: 'Arial Black, Arial, sans-serif',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#FF0000'
                    }}
                  >
                    {editMode ? (
                      <input
                        type="number"
                        value={player.score}
                        onChange={(e) => updateScore(index, parseInt(e.target.value) || 0)}
                        style={{
                          width: '80px',
                          fontFamily: 'Arial Black, Arial, sans-serif',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          border: '2px inset #999999',
                          padding: '4px',
                          textAlign: 'center',
                          backgroundColor: '#FFFFCC'
                        }}
                      />
                    ) : (
                      player.score
                    )}
                  </td>
                  {editMode && (
                    <td 
                      align="center"
                      style={{
                        backgroundColor: bgColor,
                        border: '2px inset #999999',
                        padding: '8px'
                      }}
                    >
                      <button
                        onClick={() => removePlayer(index)}
                        style={{
                          backgroundColor: '#FF0000',
                          color: '#FFFFFF',
                          border: '3px outset #FF6666',
                          padding: '5px 10px',
                          fontFamily: 'Arial Black, Arial, sans-serif',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          boxShadow: '2px 2px 0px #000000'
                        }}
                      >
                        DELETE
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}

            {/* Add New Player Row - Only in Edit Mode */}
            {editMode && (
              <tr>
                <td 
                  align="center"
                  style={{
                    backgroundColor: '#CCFFCC',
                    border: '2px inset #999999',
                    padding: '12px 8px',
                    fontFamily: 'Arial Black, Arial, sans-serif',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#00CC00'
                  }}
                >
                  NEW
                </td>
                <td 
                  style={{
                    backgroundColor: '#CCFFCC',
                    border: '2px inset #999999',
                    padding: '12px 15px'
                  }}
                >
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter name..."
                    style={{
                      width: '100%',
                      fontFamily: 'Courier New, monospace',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      border: '2px inset #999999',
                      padding: '4px',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                </td>
                <td 
                  align="center"
                  style={{
                    backgroundColor: '#CCFFCC',
                    border: '2px inset #999999',
                    padding: '12px 8px'
                  }}
                >
                  <input
                    type="number"
                    value={newScore}
                    onChange={(e) => setNewScore(e.target.value)}
                    placeholder="Score"
                    style={{
                      width: '80px',
                      fontFamily: 'Arial Black, Arial, sans-serif',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      border: '2px inset #999999',
                      padding: '4px',
                      textAlign: 'center',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                </td>
                <td 
                  align="center"
                  style={{
                    backgroundColor: '#CCFFCC',
                    border: '2px inset #999999',
                    padding: '8px'
                  }}
                >
                  <button
                    onClick={addPlayer}
                    style={{
                      backgroundColor: '#00CC00',
                      color: '#FFFFFF',
                      border: '3px outset #66FF66',
                      padding: '5px 10px',
                      fontFamily: 'Arial Black, Arial, sans-serif',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '2px 2px 0px #000000'
                    }}
                  >
                    ADD
                  </button>
                </td>
              </tr>
            )}

            {/* Footer */}
            <tr>
              <td 
                colSpan={3}
                style={{
                  backgroundColor: '#000080',
                  padding: '15px',
                  borderTop: '4px ridge #FFD700'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    fontFamily: 'Arial',
                    fontSize: '14px',
                    color: '#00FF00'
                  }}>
                    ✨ Visitors: 
                  </span>
                  <span style={{
                    fontFamily: 'Courier New',
                    fontSize: '18px',
                    color: '#FFFFFF',
                    backgroundColor: '#000000',
                    padding: '2px 8px',
                    border: '2px inset #666666',
                    marginLeft: '5px',
                    marginRight: '10px',
                    display: 'inline-block'
                  }}>
                    001337
                  </span>
                  <br />
                  <br />
                  <img 
                    src="data:image/gif;base64,R0lGODlhEAAQAMQAAP///wAAAP8AAP//AP8A/wD//wD/AP///////////////////////////////yH5BAEKABAALAAAAAAQABAAAAVVICSOZGmeaKqubOu+cCzPdG3feK7vfO//wKBwSCwaj8ikcslsOp/QqHRKrVqv2Kx2y+16v+CweEwum8/otHrNbrvf8Lh8Tq/b7/i8fs/v+/+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w"
                    alt="Best viewed"
                    width="16"
                    height="16"
                    style={{ marginRight: '5px', verticalAlign: 'middle' }}
                  />
                  <span style={{
                    fontFamily: 'Comic Sans MS',
                    fontSize: '14px',
                    color: '#FFFF00'
                  }}>
                    Best Viewed in Internet Explorer 6.0+ or Netscape Navigator
                  </span>
                  <br />
                  <span style={{
                    fontFamily: 'Arial',
                    fontSize: '11px',
                    color: '#CCCCCC'
                  }}>
                    © 2000 Monkey Type Inc. All Rights Reserved.
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Edit Mode Indicator */}
      {editMode && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          backgroundColor: '#FF00FF',
          border: '4px outset #FF66FF',
          padding: '15px',
          fontFamily: 'Arial Black, Arial, sans-serif',
          fontWeight: 'bold',
          color: '#FFFF00',
          fontSize: '14px',
          boxShadow: '5px 5px 0px #000000',
          zIndex: 1000
        }}>
          <div style={{ animation: 'blink 1s infinite' }}>
            ✏️ EDIT MODE ACTIVE ✏️
          </div>
          <div style={{ 
            fontSize: '11px', 
            color: '#FFFFFF',
            marginTop: '5px',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'normal'
          }}>
            Press Ctrl+Shift+E to exit
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes marquee {
          0% { transform: translateX(-20%); }
          100% { transform: translateX(20%); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
