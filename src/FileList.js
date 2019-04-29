import React from 'react';
import {observer} from "mobx-react/index";
import List from 'antd/lib/list';
import Card from 'antd/lib/card';
import Icon from 'antd/lib/icon';

class FileList extends React.Component {
  constructor(props) {
    super(props);
    this.treeDataModel = this.props.treeDataModel;
  }

  clickDirCard = (name) => {
    console.log(name);
    const selectedValue = this.treeDataModel.selectedValue;
    const fullValue = selectedValue + name + '/';
    this.treeDataModel.setSelectedValue(fullValue);
  };

  render() {
    return (
      <List
        grid={{
          gutter: 16, xs: 1, sm: 2, md: 4, lg: 4, xl: 6, xxl: 6,
        }}
        itemLayout="horizontal"
        dataSource={this.treeDataModel.listData}
        renderItem={item => {
          return (
            <List.Item>
              {
                !item.IsDir ? <Card title={item.Name}>{"文件大小：" + (item.Size / 1024).toFixed(2) + " KB"}</Card> :
                  <Card title={item.Name} onClick={() => {
                    this.clickDirCard(item.Name)
                  }}>
                    <Icon type="folder" style={{fontSize: '20px'}} theme="filled"/>
                  </Card>
              }
            </List.Item>
          );
        }}
      />
    );
  }
}

observer(FileList);

export default FileList;