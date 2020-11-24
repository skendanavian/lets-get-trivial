import { useState } from "react";
import "./Panel.scss";
import classNames from "classnames";

function Panel(props) {
  // replace answerObj with props
  // const [correctSelected, setCorrectSelected] = useState(false);
  // const [incorrectSelected, setIncorrectSelected] = useState(false);
  const { id, info, selected, setSelected, somethingSelected } = props;

  //pass down checkAnswer
  // get rid of 'selected' in the data digester in question.jsx
  const { questionString, answerString, correct } = info;


  const className = classNames(
    "panel",
    {
      "panel__answer--selectedTrue": selected && correct === true,
    },
    {
      "panel__answer--selectedTrue": somethingSelected && correct === true,
    },
    {
      "panel__answer--selectedFalse": selected && correct === false,
    },
    { panel__answer: answerString },
    { panel__question: questionString }
  );

 
  return (
    <>
    {answerString && 
    <div className={className} onClick={() => setSelected(id)}>
      <p>{answerString }</p>
    </div>
    }
    {questionString && 
    <div className={className}>
      <p>{questionString}</p>
    </div>
    }
    </>
    
  );
}

export default Panel;
