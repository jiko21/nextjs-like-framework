import { Context } from "hono";
import { useEffect } from "react";

const App: React.FC = (props) => {
  useEffect(() => {
    console.log(props);
    console.log('aaaa');
  }, []);
  return (
    <div>
    <p>fuga/hoge/id</p>
  </div>
  )
}

export function getServersideProps(context: Context) {
  console.log(context.req.param()['id'])
  return {
    props: {
      id: context.req.param()['id'],
      hoge: 'fuga'
    }
  }
}

export default App;
