import React, { Component, useState } from "react";
import "./App.css";

const Controls = ({ turned, turn, next, answer, cards }) => {
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

const FlashCard = ({ turned, card }) => (
  <div id="flashcard">
    <div className={turned ? "showFront" : "showBack"}>
      <div className="front">
        <span>{card && card.front}</span>
      </div>
      <div className="back">
        <span>{card && card.back}</span>
      </div>
    </div>
  </div>
);

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

const ConfigPanel = ({ toggleConfig, cards }) => {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  const addCard = () => {
    if (front === "" || back === "") return;
    const newCard = { front, back };
    const newCards = [...cards, newCard];
    localStorage.setItem("lpfaucon.flashcards.cards", JSON.stringify(newCards));
    toggleConfig();
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
    const randIndex = Math.floor(Math.random() * cards.length);
    this.setState({
      cards,
      card: cards[randIndex]
    });
  }

  next = () =>
    this.setState(s => {
      const randIndex = Math.floor(Math.random() * s.cards.length);
      setTimeout(() => this.setState({ card: s.cards[randIndex] }), 500);
      return {
        turned: false,
        card: undefined,
        answered: false
      };
    });

  turn = () => this.setState(s => ({ turned: !s.turned }));
  toggleConfig = () => this.setState(s => ({ configOpen: !s.configOpen }));

  render() {
    const { configOpen } = this.state;
    return (
      <div className="App">
        <Header openConfig={this.toggleConfig} />
        {!configOpen && <FlashCard {...this.state} />}
        {!configOpen && (
          <Controls
            {...this.state}
            turn={this.turn}
            next={this.next}
            answer={wasCorrect => {}}
          />
        )}
        {configOpen && (
          <ConfigPanel {...this.state} toggleConfig={this.toggleConfig} />
        )}
      </div>
    );
  }
}

export default App;
