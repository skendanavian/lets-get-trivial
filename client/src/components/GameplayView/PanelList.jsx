import { useState, useContext, useEffect } from "react";
import Panel from "./Panel";
import "./PanelList.scss";
import classNames from "classnames";

import ConnectionContext from "../../ConnectionContext";
import { LAG_BEFORE_SEND_ANSWER } from "../../constants";

// pass infoArray as an array of objects as formatted below:
// [{questionString: 'is this thing on?'}]
// or
//  [
//   { answerString: "Herman Melville", selected: false, correct: false },
//   { answerString: "William Golding", selected: false, correct: false },
//   { answerString: "William Shakespeare", selected: false, correct: false },
//   { answerString: "J.R.R. Tolkein", selected: true, correct: false },
// ];

// basically just mapping an array into a list of panels and
// rendering them within a div
function PanelList({ infoArray, pickAnswer }) {
  const [selected, setSelected] = useState("");
  // replace answersObj with props
  // determines if this is a question panel or an answer panel based on the keys the object
  const questionPanel = infoArray[0].questionString ? true : false;
  const answerPanel = infoArray[0].answerString ? true : false;

  const className = classNames(
    "box",
    { box__answer: answerPanel },
    { box__question: questionPanel }
  );

  const connection = useContext(ConnectionContext);

  useEffect(() => {
    connection.current.on("next_question", () => {
      setSelected("");
      // const timer = await setTimeout(() => {
      //   setSelected("");
      //   clearTimeout(timer);
      // }, LAG_BEFORE_SEND_ANSWER);
    });
    // const oldConnection = connection.current;
    // return () => {
    //   oldConnection.removeAllListeners("next_question");
    // };
  }, [connection]);

  useEffect(() => {
    console.log("selected changed to: ", selected);
  }, [selected]);

  const clickHandler = (id) => {
    console.log("click id: ", id);
    console.log("selected: ", selected);

    if (!selected) {
      pickAnswer(infoArray[id - 1].correct);
      setSelected(id);
    }
  };

  const list = infoArray.map((info, index) => {
    return (
      <Panel
        key={index + 1}
        id={index + 1}
        info={info}
        selected={index + 1 === selected}
        somethingSelected={selected ? true : false}
        setSelected={clickHandler}
      />
    );
  });

  return <div className={className}>{list}</div>;
}

export default PanelList;
