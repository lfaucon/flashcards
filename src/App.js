import React, { Component, useState } from "react";
import "./App.css";

const importance = (date, count) => {
  const x = (new Date() - new Date(date)) / 1.5 ** count;
  return Number.isNaN(x) ? 1e6 : x;
};

const Controls = ({ turned, turn, next, answer, cards, cardIndex }) => {
  if (!cards || cards.length === 0) {
    return (
      <div id="controls">
        <button className="button">You have no card yet</button>
      </div>
    );
  }
  return (
    <div id="controls">
      {!turned && (
        <button className="button" onClick={turn}>
          SHOW
        </button>
      )}
      {turned && (
        <button
          className="button"
          style={{ backgroundColor: "green" }}
          onClick={() => answer(true) || next()}
        >
          I KNEW
        </button>
      )}
      {turned && (
        <button
          className="button"
          style={{ backgroundColor: "red" }}
          onClick={() => answer(false) || next()}
        >
          I FORGOT
        </button>
      )}
    </div>
  );
};

const FlashCard = ({ turned, card }) => {
  const [front, back] = (card && [card.front, card.back]) || ["", ""];
  const reverse = card && new Date(card.lastSeenAt).getSeconds() % 2 > 0.5;
  const [f, b] = reverse ? [front, back] : [back, front];
  return (
    <div id="flashcard">
      <div className={turned ? "showFront" : "showBack"}>
        <div className="front">
          <span>{f}</span>
        </div>
        <div className="back">
          <span>{b}</span>
        </div>
      </div>
    </div>
  );
};

const Header = ({ openConfig }) => (
  <div id="header">
    <span>Flashcards</span>
    <i className="fas fa-plus" onClick={openConfig} />
  </div>
);

const getCards = config => {
  try {
    const cards = localStorage.getItem("lpfaucon.flashcards.cards");
    return cards ? JSON.parse(cards) : [];
  } catch {
    return [];
  }
};

const ConfigPanel = ({ toggleConfig, cards, setCards }) => {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  const addCard = () => {
    if (front === "" || back === "") return;
    const newCard = { front, back, lastSeenAt: new Date(), count: 1 };
    const newCards = [...cards, newCard];
    localStorage.setItem("lpfaucon.flashcards.cards", JSON.stringify(newCards));
    toggleConfig();
    setCards(newCards);
  };

  return (
    <div id="config">
      <span>Front:</span>
      <textarea value={front} onChange={e => setFront(e.target.value)} />
      <span>Back:</span>
      <textarea value={back} onChange={e => setBack(e.target.value)} />
      <button
        className="button"
        style={{ marginTop: "16px" }}
        onClick={addCard}
      >
        ADD
      </button>
    </div>
  );
};

class App extends Component {
  state = {
    turned: false,
    configOpen: false
  };

  componentDidMount() {
    const cards = getCards();
    const cardIndex = Math.floor(Math.random() * cards.length);
    this.setState({ cards, cardIndex });
  }

  next = () =>
    this.setState(s => {
      const { cards } = s;
      const cardIndex = cards.reduce((_max, c, idx) => {
        const { lastSeenAt, count } = c;
        const { lastSeenAt: da, count: co } = cards[_max];
        const better = importance(lastSeenAt, count) > importance(da, co);
        return better ? idx : _max;
      }, 0);
      setTimeout(() => this.setState({ cardIndex }), 500);
      return {
        turned: false,
        cardIndex: undefined
      };
    });

  handleRecall = wasCorrect => {
    const { cards, cardIndex } = this.state;
    const newCards = [...cards];
    if (!newCards[cardIndex]) return;
    newCards[cardIndex].lastSeenAt = new Date();
    if (wasCorrect) {
      newCards[cardIndex].count = (newCards[cardIndex].count || 1) + 1;
    } else {
      newCards[cardIndex].count = 1;
    }
    localStorage.setItem("lpfaucon.flashcards.cards", JSON.stringify(newCards));
    this.setState({ cards: newCards });
  };

  turn = () => this.setState(s => ({ turned: !s.turned }));
  toggleConfig = () => this.setState(s => ({ configOpen: !s.configOpen }));

  render() {
    const { configOpen, cards, cardIndex, turned } = this.state;
    return (
      <div className="App">
        <Header openConfig={this.toggleConfig} />
        {!configOpen && (
          <FlashCard turned={turned} card={cards && cards[cardIndex]} />
        )}
        {!configOpen && (
          <Controls
            {...this.state}
            turn={this.turn}
            next={this.next}
            answer={this.handleRecall}
          />
        )}
        {configOpen && (
          <ConfigPanel
            {...this.state}
            toggleConfig={this.toggleConfig}
            setCards={c => this.setState({ cards: c })}
          />
        )}
      </div>
    );
  }
}

export default App;
