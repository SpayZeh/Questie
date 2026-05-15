import React, { useState } from 'react';
import Header from './components/Header.jsx';
import QuestCard from './components/QuestCard.jsx';
import FeedPost from './components/FeedPost.jsx';
import { getTodaysQuest, getNextQuest, getPastQuests } from './data/quests.js';
import { feedPosts } from './data/posts.js';

const todaysQuest = getTodaysQuest();
const nextQuest = getNextQuest();
const pastQuests = getPastQuests();

export default function App() {
  const [questCompleted, setQuestCompleted] = useState(false);

  return (
    <div className="app">
      <div className="app-inner">
        <Header questColor={todaysQuest.color} />

        <main className="main">
          {/* Today's quest */}
          <section className="quest-section">
            <QuestCard
              quest={todaysQuest}
              nextQuest={nextQuest}
              onComplete={() => setQuestCompleted(true)}
            />
          </section>

          {/* Feed label */}
          <div className="feed-header">
            <h3 className="feed-title">Quest Feed</h3>
            <span className="feed-subtitle">See how everyone's doing it</span>
          </div>

          {/* Completed confirmation banner */}
          {questCompleted && (
            <div className="completion-banner" style={{ borderColor: todaysQuest.color, background: todaysQuest.colorLight }}>
              <span className="completion-banner-icon">🎉</span>
              <div>
                <p className="completion-banner-title">You're in the feed!</p>
                <p className="completion-banner-sub">Others can see and react to your post</p>
              </div>
            </div>
          )}

          {/* Feed */}
          <section className="feed">
            {feedPosts.map((post) => (
              <FeedPost
                key={post.id}
                post={post}
                questColor={todaysQuest.color}
              />
            ))}
          </section>

          {/* Past quests */}
          <div className="past-quests-section">
            <h3 className="past-quests-title">Past Quests</h3>
            <div className="past-quests-list">
              {pastQuests.map((q) => (
                <div key={q.id} className="past-quest-item">
                  <span className="past-quest-emoji">{q.emoji}</span>
                  <div className="past-quest-info">
                    <span className="past-quest-name">{q.title}</span>
                    <span className="past-quest-completions">
                      {(q.completions / 1000).toFixed(1)}k completions
                    </span>
                  </div>
                  <span className="past-quest-done">Done</span>
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer className="footer">
          <p>Questie · A new quest every day 🗺️</p>
        </footer>
      </div>
    </div>
  );
}
