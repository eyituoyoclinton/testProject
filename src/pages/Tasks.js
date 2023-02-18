import React, { useEffect, useRef, useState } from 'react';
import '../App.css';

const defaultTaskBoard = [
   {
      name: "Foundation",
      activity: [
         { name: "Setup virtual office", done: false },
         { name: "Setup mission & vision", done: false },
         { name: "Select business name", done: false },
         { name: "Buy domains", done: false }
      ],
   },
   {
      name: "Discovery",
      activity: [
         { name: "Created roadmap", done: false },
         { name: "Competitors analysis", done: false }
      ]
   },
   {
      name: "Delivery",
      activity: [
         { name: "Release marketing website", done: false },
         { name: "Release mvp", done: false }
      ]
   }
];


const TaskUIRow = ({ taskActivity = [], taskBoardName = '', taskNumber = 1, isCompleted = false, handleCheckedBox }) => (
   <div className="task3">
      <h4> <span className="myNumber">{taskNumber}</span>{taskBoardName} {isCompleted && <span>✔️</span>}</h4>
      {taskActivity.map((activityList, index) => (
         <label key={index} style={{ display: 'block' }}>
            <input checked={activityList.done} onChange={() => handleCheckedBox(taskNumber - 1, index, !activityList.done)}
               type="checkbox" style={{ marginRight: 7 }} />
            <span>{activityList.name}</span>
         </label>
      )
      )}
   </div>
)

const Tasks = () => {
   const [taskUpdated, setTaskUpdated] = useState(false);
   const [fetchText, setfetchText] = useState('');
   //get already stored tasks from the local storage
   let TaskBoard = useRef([])
   useEffect(() => {
      let getSavedTask = localStorage.getItem('storeTask');
      TaskBoard.current = typeof getSavedTask === 'string' ? JSON.parse(getSavedTask) : defaultTaskBoard
      // TaskBoard = typeof getSavedTask === 'object' ? getSavedTask : defaultTaskBoard;
      //update the component to reflect the new chamge
      setTaskUpdated(!taskUpdated);
   }, [])

   //this is the function that handles the click on the check boxes
   const handleCheckedBox = async (taskBoardIndex, activityIndex, checked = false) => {
      //if there is no index referencing activity and the board item, return
      if (isNaN(taskBoardIndex) || isNaN(activityIndex)) return;
      //if the checked param is not a boolean return
      if (typeof checked !== 'boolean') return;
      //if the index does not exist in the array return
      if ((TaskBoard.current.length < taskBoardIndex) || TaskBoard.current[taskBoardIndex].activity.length < activityIndex) return;
      //check if the next task exist and has any sub tasks active
      if (TaskBoard.current[taskBoardIndex + 1] && handleTaskBoardDone(TaskBoard.current[taskBoardIndex + 1].activity).checked) {
         //check if the task is not the last TaskBoard task
         if ((taskBoardIndex + 1) !== TaskBoard.current.length) {
            let PromptMessage = 'This action will reopen the other tasks after this current phase. Click okay to continue else click cancel';
            //if the user confirm changes, reopen all task after this tab
            if (window.confirm(PromptMessage)) {
               let startIndex = taskBoardIndex + 1
               let taskLength = TaskBoard.current.length
               for (let i = startIndex; i < taskLength; i++) {
                  let activityLength = TaskBoard.current[i].activity.length;
                  for (let j = 0; j < activityLength; j++) {
                     TaskBoard.current[i].activity[j].done = false;
                  }
               }
            } else {
               //if the user click cancel confirmation, stop code from running
               return
            }
         }
      }
      //check if previous task have been completed before moving to another one
      if (taskBoardIndex !== 0) {
         if (!handleTaskBoardDone(TaskBoard.current[taskBoardIndex - 1].activity).status) {
            return alert('Please complete the previous task(s)')
         }
      }

      //set the task item to the checked status
      TaskBoard.current[taskBoardIndex].activity[activityIndex].done = checked;
      //display ramdom text from remote API
      if ((taskBoardIndex + 1) === TaskBoard.current.length && handleTaskBoardDone(TaskBoard.current[taskBoardIndex].activity).status) {
         fetch('https://uselessfacts.jsph.pl/random.json').then(res => res.json()).then(resolve => {
            setfetchText(resolve.text)
         });
      }
      setfetchText('')
      //update the component to reflect the new chamge
      setTaskUpdated(!taskUpdated);
      localStorage.setItem('storeTask', JSON.stringify(TaskBoard.current))
   }
   //this is the function that handles task completed
   const handleTaskBoardDone = (activity = []) => {
      //if activity is empty return false;
      if (activity.length === 0) return false;
      //get all done activity
      let doneActivity = activity.filter(taskRow => taskRow.done === true);
      return { status: doneActivity.length === activity.length, checked: doneActivity.length };
   }

   return (
      <div className="App">
         <div className="my-container">
            <div className="">
               <h5>My startup progress</h5>
            </div>
            {TaskBoard.current.map((eachTask, index) => <TaskUIRow key={index} handleCheckedBox={handleCheckedBox} taskNumber={index + 1} taskBoardName={eachTask.name} taskActivity={eachTask.activity} isCompleted={handleTaskBoardDone(eachTask.activity).status} />)}
            <h5>{fetchText}</h5>
         </div>
      </div>
   );
}

export default Tasks;
