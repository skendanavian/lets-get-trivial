import Panel from "./Panel";
import './PanelList.scss'
import classNames from 'classnames'

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
function PanelList({infoArray}) {
  // replace answersObj with props

  // determines if this is a question panel or and answer panel based on the keys the object
  const questionPanel = infoArray[0].questionString ? true : false;
  const answerPanel = infoArray[0].answerString ? true : false;
  
  const className = classNames("box", {"box__answer": answerPanel}, {"box__question": questionPanel});
  
  const list = infoArray.map(info => {
    return (<Panel info={info} />)
  });

  

  return (
    <div className={className}>
     {list}
    </div>
   
  );
}

export default PanelList