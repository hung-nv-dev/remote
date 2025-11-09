import { Button, Card } from 'antd';
import type { FC } from 'react';

const RemoteButton: FC = () => {
  const handleClick = () => {
    alert('Button clicked from Remote App!');
  };

  return (
    <Card title="Remote Component" style={{ margin: '20px' }}>
      <p>This component is from the Remote Microfrontend</p>
      <Button type="primary" onClick={handleClick}>
        Click Me (Remote Button)
      </Button>
    </Card>
  );
};

export default RemoteButton;
