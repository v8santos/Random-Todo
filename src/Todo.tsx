import { useState } from "react";

interface ITodo {
  accessibility: string,
  activity: string,
  key: string,
  participants: number,
  price: number,
  type: string,
  checked: boolean,
  text: string,
}

interface Props {
  type?: string
}

export default function Todo({ type }: Props) {
  const [todoItems, setTodoItems] = useState<ITodo[]>([]);
  const [generating, setGenerating] = useState<boolean>(false);

  function getTodoItemsOnLocalStorage(): ITodo[] {
    return JSON.parse(window.localStorage.getItem('todo_items') || '[]');
  }

  function setTodoItemsOnLocalStorage(data: ITodo[]) {
    window.localStorage.setItem('todo_items', JSON.stringify(data));
  }

  function initializeTodo() {
    setTodoItems(getTodoItemsOnLocalStorage());
  }

  function generateTask(lap: number = 0) {
    setGenerating(true);
    const storageData = getTodoItemsOnLocalStorage();
    fetch('https://www.boredapi.com/api/activity')
      .then(res => res.json())
      .then(data => {
        for (let item of todoItems) {
          if (item.key === data.key) {
            return lap <= 1 ? generateTask(lap+1) : null;
          }
        };

        storageData.push({
          ...data,
          checked: false,
          text: ''
        });

        setTodoItems(storageData);
        setTodoItemsOnLocalStorage(storageData);
      })
      .finally(() => setGenerating(false));
  }

  function toggleCheckbox(taskId: string) {
    const updatedTodoItems = todoItems.map(item => {
      if (item.key === taskId) {
        return {
          ...item,
          checked: !item.checked
        }
      }

      return item;
    });

    setTodoItems(updatedTodoItems);
    setTodoItemsOnLocalStorage(updatedTodoItems);
  }

  function deleteTask(taskId: string) {
    const updatedTodoItems = todoItems.filter(item => item.key !== taskId);

    setTodoItems(updatedTodoItems);
    setTodoItemsOnLocalStorage(updatedTodoItems);
  }

  window.addEventListener('load', function () {
    initializeTodo();
  })

  return (
    <div className='todo'>
      <ul className='todo-list'>
        {todoItems.map((item, index) => {
          return (
            <li className="todo-list-item" key={item.key}>
              <span className="todo-list-item-clickable" onClick={() => toggleCheckbox(item.key)}>
                <input className='checkbox' type='checkbox' checked={item.checked} readOnly/>
                <span className={'todo-list-item-text ' + (item.checked ? 'text-muted' : '')}>{item.activity}</span>
              </span>
              <div className="todo-list-item-delete" onClick={() => deleteTask(item.key)}>
                <svg fill='currentColor' width='20' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/>
                </svg>
              </div>
            </li>
          )
        })}
      </ul>
      <div className="text-center">
        <button className='btn btn-primary' onClick={() => generateTask()}>{ generating ? 'Generating...' : '+ Generate' }</button>
      </div>
    </div>
  );
}