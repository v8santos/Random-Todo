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

  window.addEventListener('load', function () {
    initializeTodo();
  })

  return (
    <div className='todo'>
      <ul className='todo-list'>
        {todoItems.map((item, index) => {
          return (
            <li key={item.key} onClick={() => toggleCheckbox(item.key)}>
              <input className='checkbox' type='checkbox' checked={item.checked} readOnly/>
              <span className={item.checked ? 'text-muted' : ''}>{item.activity}</span>
              <hr />
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