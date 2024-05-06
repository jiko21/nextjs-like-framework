import { useState } from "react";

type PropsType = ReturnType<typeof getServersideProps>['props'];

const App = (props: PropsType) => {
  console.log(props);
  const [value, setValue] = useState(0);
  const onClick= () => {
    console.log('test')
  }
  return (
    <div>
      <p>{props.msg}</p>
      {value}
      <button onClick={() => setValue(value + 1)}>button1</button>
      <button onClick={onClick}>button2</button>
    </div>
  )
}

export function getServersideProps() {
  return {
    props: {
      msg: 'hello'
    }
  }
}

export default App;
